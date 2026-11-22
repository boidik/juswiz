const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { 
  queryEcourtsByCnr, 
  createCaptchaSession, 
  submitCnrWithCaptcha 
} = require('./services/ecourtsService');
const { uploadToDedicatedDriveFolder } = require('./services/driveService');
const { initScheduler, updateSchedule, getSchedulerStatus, addLog } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Ensure local dedicated storage directory exists
const LOCAL_STORAGE_DIR = path.join(__dirname, 'storage', 'autofetched_orders');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

// Serve locally stored authentic court PDFs
app.use('/storage/autofetched_orders', express.static(LOCAL_STORAGE_DIR));

// --- 1. Healthcheck Endpoint ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'JusWiz eCourts Auto-Sync Microservice',
    port: PORT,
    timestamp: new Date().toISOString(),
    scheduler: getSchedulerStatus()
  });
});

// --- 2. Live Court Captcha Session Endpoint ---
app.get('/api/court/captcha-session', async (req, res) => {
  try {
    const sessionData = await createCaptchaSession();
    addLog(`[Live Session] Created fresh eCourts captcha session: ${sessionData.sessionId}`, 'SESSION');
    res.json({
      success: true,
      sessionId: sessionData.sessionId,
      captchaDataUrl: sessionData.captchaDataUrl
    });
  } catch (err) {
    addLog(`[Live Session] Error creating captcha session: ${err.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      error: `Could not connect to eCourts for fresh session: ${err.message}`
    });
  }
});

// Helper to archive downloaded orders into local disk and Google Drive
async function archiveOrders({ orders, caseNumber, driveFolderId, googleAccessToken, dedicatedFolderName }) {
  const cleanCaseNo = (caseNumber || 'CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const caseLocalDir = path.join(LOCAL_STORAGE_DIR, cleanCaseNo);
  if (!fs.existsSync(caseLocalDir)) {
    fs.mkdirSync(caseLocalDir, { recursive: true });
  }

  const archivedOrders = [];

  for (let i = 0; i < orders.length; i++) {
    const ord = orders[i];
    const safeDate = (ord.orderDate || new Date().toISOString().split('T')[0]).replace(/[/\\:]/g, '-');
    const fileName = `${safeDate}_ORDER_${cleanCaseNo}_${i + 1}.pdf`;
    const localFilePath = path.join(caseLocalDir, fileName);

    let pdfBuffer = ord.pdfBuffer || null;

    if (!pdfBuffer && ord.pdfUrl) {
      try {
        const dl = await fetch(ord.pdfUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (dl.ok) {
          pdfBuffer = Buffer.from(await dl.arrayBuffer());
        }
      } catch (dlErr) {
        console.warn(`Could not download ${ord.pdfUrl}:`, dlErr.message);
      }
    }

    if (pdfBuffer) {
      fs.writeFileSync(localFilePath, pdfBuffer);
      addLog(`[Archived] Saved genuine court order to disk: ${fileName} (${pdfBuffer.length} bytes)`, 'ARCHIVE');
    }

    let driveInfo = null;
    if (pdfBuffer && googleAccessToken) {
      driveInfo = await uploadToDedicatedDriveFolder({
        fileBuffer: pdfBuffer,
        fileName,
        parentFolderId: driveFolderId,
        accessToken: googleAccessToken,
        dedicatedFolderName
      });
    }

    archivedOrders.push({
      fileName,
      orderNumber: ord.orderNumber || (i + 1).toString(),
      orderDate: ord.orderDate,
      orderSummary: ord.orderSummary || 'Signed Judicial Order Sheet',
      hasPdf: !!pdfBuffer,
      localUrl: pdfBuffer ? `http://localhost:${PORT}/storage/autofetched_orders/${cleanCaseNo}/${fileName}` : null,
      driveUrl: driveInfo?.driveUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`,
      driveFileId: driveInfo?.fileId || null,
      dedicatedFolder: dedicatedFolderName
    });
  }

  return archivedOrders;
}

// --- 3. Fetch Orders With Human-Verified Captcha ---
app.post('/api/court/fetch-with-captcha', async (req, res) => {
  const {
    sessionId,
    cnrNumber,
    captchaCode,
    caseId,
    caseNumber,
    driveFolderId,
    googleAccessToken,
    dedicatedFolderName = '05_AutoFetched_Court_Orders'
  } = req.body;

  if (!sessionId || !cnrNumber || !captchaCode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: sessionId, cnrNumber, or captchaCode.'
    });
  }

  addLog(`[Human-Verified Query] Submitting CNR: ${cnrNumber} with captcha code "${captchaCode}"...`, 'REQUEST');

  try {
    const result = await submitCnrWithCaptcha(sessionId, cnrNumber, captchaCode);

    if (!result.success) {
      addLog(`[Human-Verified Query] eCourts error: ${result.error}`, 'ERROR');
      return res.json(result);
    }

    if (!result.found) {
      addLog(`[Human-Verified Query] CNR ${cnrNumber} valid, but pending upload by registry.`, 'INFO');
      return res.json(result);
    }

    // Archive discovered orders
    const archivedOrders = await archiveOrders({
      orders: result.orders || [],
      caseNumber,
      driveFolderId,
      googleAccessToken,
      dedicatedFolderName
    });

    addLog(`[Human-Verified Query] Successfully archived ${archivedOrders.length} genuine court orders for ${cnrNumber}.`, 'SUCCESS');

    return res.json({
      success: true,
      found: true,
      cnrNumber: result.cnrNumber,
      message: result.message,
      dedicatedFolderName,
      archivedOrders,
      ordersCount: archivedOrders.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    addLog(`[Human-Verified Query] Fatal error: ${err.message}`, 'ERROR');
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --- 4. On-Demand Single Case Sync (Automated OCR) ---
app.post('/api/sync/case', async (req, res) => {
  const { 
    caseId, 
    cnrNumber, 
    caseNumber, 
    courtName, 
    driveFolderId, 
    googleAccessToken,
    dedicatedFolderName = '05_AutoFetched_Court_Orders'
  } = req.body;

  if (!cnrNumber) {
    return res.status(400).json({ success: false, error: 'Missing 16-digit CNR Number.' });
  }

  addLog(`[On-Demand Sync] Received sync request for Case: ${caseNumber || caseId} (CNR: ${cnrNumber})`, 'REQUEST');

  try {
    const ecourtsResult = await queryEcourtsByCnr(cnrNumber);

    if (!ecourtsResult.success) {
      addLog(`[On-Demand Sync] Automated OCR blocked: ${ecourtsResult.error}`, 'WARN');
      return res.json({
        success: false,
        requiresHumanCaptcha: true,
        error: ecourtsResult.error,
        message: ecourtsResult.error
      });
    }

    const archivedOrders = await archiveOrders({
      orders: ecourtsResult.orders || [],
      caseNumber,
      driveFolderId,
      googleAccessToken,
      dedicatedFolderName
    });

    addLog(`[On-Demand Sync] Completed sync for CNR ${cnrNumber}. Orders found: ${archivedOrders.length}`, 'SUCCESS');

    return res.json({
      success: true,
      caseId,
      cnrNumber,
      found: ecourtsResult.found || false,
      message: ecourtsResult.message,
      dedicatedFolderName,
      archivedOrders,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    addLog(`[On-Demand Sync] Fatal error during sync: ${err.message}`, 'ERROR');
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// --- 5. Batch Automated Sync Trigger ---
app.post('/api/sync/batch', async (req, res) => {
  const { cases = [], googleAccessToken } = req.body;
  addLog(`[Batch Sync] Starting batch sync for ${cases.length} cases...`, 'BATCH');

  const results = [];
  for (const c of cases) {
    if (c.cnrNumber) {
      try {
        const r = await queryEcourtsByCnr(c.cnrNumber);
        results.push({ caseNumber: c.caseNumber, cnr: c.cnrNumber, found: r.found || false, error: r.error });
      } catch (e) {
        results.push({ caseNumber: c.caseNumber, cnr: c.cnrNumber, error: e.message });
      }
    }
  }

  return res.json({
    success: true,
    totalProcessed: results.length,
    results
  });
});

// --- 6. Scheduler Status & Execution Logs ---
app.get('/api/sync/status', (req, res) => {
  res.json(getSchedulerStatus());
});

// --- 7. Update Schedule / Settings ---
app.post('/api/sync/config', (req, res) => {
  const { cronExpression, enabled } = req.body;
  const updateRes = updateSchedule(cronExpression || '0 20 * * *', enabled !== false);
  res.json(updateRes);
});

// --- Initialize Background Cron Scheduler ---
initScheduler(async (logger) => {
  logger('Executing nightly automated court synchronization across litigation portfolio...', 'AUTO_SYNC');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ JusWiz Court Order Microservice running on port ${PORT}`);
  console.log(`📁 Dedicated Auto-Fetched PDF Storage: ${LOCAL_STORAGE_DIR}`);
  console.log(`⏰ Automated Daily Court Sync: 8:00 PM (0 20 * * *)`);
  console.log(`=======================================================`);
  addLog(`Microservice daemon online on port ${PORT}. Ready for on-demand & scheduled sync.`);
});
