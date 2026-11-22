process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { 
  queryEcourtsByCnr, 
  createCaptchaSession, 
  submitCnrWithCaptcha 
} = require('./services/ecourtsService');
const {
  isCalcuttaHighCourtCase,
  createCalcuttaHighCourtSession,
  submitCalcuttaHighCourtWithCaptcha,
  queryCalcuttaHighCourtAuto
} = require('./services/calcuttaHighCourtService');
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
    service: 'JusWiz Dual-Engine Court Order Microservice',
    engines: ['Calcutta High Court (calcuttahighcourt.gov.in)', 'eCourts National Gateway (District Courts)'],
    port: PORT,
    timestamp: new Date().toISOString(),
    scheduler: getSchedulerStatus()
  });
});

// --- 2. Live Court Captcha Session Endpoint (Dual Court Engine) ---
app.get('/api/court/captcha-session', async (req, res) => {
  try {
    const { courtCode = '', courtName = '', cnrNumber = '', caseNumber = '' } = req.query;
    const isCalHc = isCalcuttaHighCourtCase({ courtCode, courtName, cnrNumber, caseNumber });

    if (isCalHc) {
      const sessionData = await createCalcuttaHighCourtSession();
      addLog(`[Live Session] Created fresh Calcutta High Court session: ${sessionData.sessionId}`, 'SESSION');
      res.json({
        success: true,
        courtType: 'CALCUTTA_HIGH_COURT',
        portalName: 'Calcutta High Court Official Portal (calcuttahighcourt.gov.in)',
        sessionId: sessionData.sessionId,
        captchaDataUrl: sessionData.captchaDataUrl
      });
    } else {
      const sessionData = await createCaptchaSession();
      addLog(`[Live Session] Created fresh eCourts District Court session: ${sessionData.sessionId}`, 'SESSION');
      res.json({
        success: true,
        courtType: 'ECOURTS_LOWER_COURTS',
        portalName: 'eCourts National Gateway (District Courts)',
        sessionId: sessionData.sessionId,
        captchaDataUrl: sessionData.captchaDataUrl
      });
    }
  } catch (err) {
    addLog(`[Live Session] Error creating court captcha session: ${err.message}`, 'ERROR');
    res.status(500).json({
      success: false,
      error: `Could not connect to court gateway for fresh session: ${err.message}`
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
    const fileName = ord.fileName || `${safeDate}_ORDER_${cleanCaseNo}_${i + 1}.pdf`;
    const localFilePath = ord.filePath || path.join(caseLocalDir, fileName);

    let pdfBuffer = ord.pdfBuffer || null;
    if (!pdfBuffer && fs.existsSync(localFilePath)) {
      try {
        pdfBuffer = fs.readFileSync(localFilePath);
      } catch (readErr) {
        console.warn(`Could not read local file ${localFilePath}:`, readErr.message);
      }
    }

    if (!pdfBuffer && ord.pdfUrl) {
      try {
        const dl = await fetch(ord.pdfUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (dl.ok) {
          pdfBuffer = Buffer.from(await dl.arrayBuffer());
          fs.writeFileSync(localFilePath, pdfBuffer);
        }
      } catch (dlErr) {
        console.warn(`Could not download ${ord.pdfUrl}:`, dlErr.message);
      }
    }

    if (pdfBuffer && !fs.existsSync(localFilePath)) {
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

    const cleanOrderNum = (ord.orderNumber || (i + 1).toString()).replace(/&nbsp;/g, '').trim();
    const cleanSummary = (ord.orderSummary || 'Signed Judicial Order Sheet').replace(/&nbsp;/g, '').trim();

    archivedOrders.push({
      fileName,
      orderNumber: cleanOrderNum,
      orderDate: ord.orderDate,
      coram: ord.coram,
      orderSummary: cleanSummary,
      hasPdf: !!pdfBuffer,
      fileSize: pdfBuffer ? pdfBuffer.length : ord.fileSize,
      localUrl: pdfBuffer ? `http://localhost:${PORT}/storage/autofetched_orders/${cleanCaseNo}/${fileName}` : null,
      driveUrl: driveInfo?.driveUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`,
      driveFileId: driveInfo?.fileId || null,
      dedicatedFolder: dedicatedFolderName
    });
  }

  return archivedOrders;
}

// --- 3. Fetch Orders With Human-Verified Captcha (Dual Engine) ---
app.post('/api/court/fetch-with-captcha', async (req, res) => {
  const {
    sessionId,
    cnrNumber,
    captchaCode,
    caseId,
    caseNumber,
    caseType,
    courtCode,
    courtName,
    courtType,
    driveFolderId,
    googleAccessToken,
    dedicatedFolderName = '05_AutoFetched_Court_Orders'
  } = req.body;

  if (!sessionId || !captchaCode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: sessionId or captchaCode.'
    });
  }

  const isCalHc = courtType === 'CALCUTTA_HIGH_COURT' || 
    isCalcuttaHighCourtCase({ courtCode, courtName, cnrNumber, caseNumber });

  addLog(`[Human-Verified Query] Submitting ${isCalHc ? 'Calcutta High Court' : 'eCourts'} query for: ${caseNumber || cnrNumber} with captcha "${captchaCode}"...`, 'REQUEST');

  try {
    let result;
    if (isCalHc) {
      result = await submitCalcuttaHighCourtWithCaptcha(sessionId, {
        caseNumber,
        caseType,
        cnrNumber,
        courtCode,
        courtName,
        captchaCode
      });
    } else {
      if (!cnrNumber) {
        return res.status(400).json({ success: false, error: 'Missing 16-character CNR Number for lower court query.' });
      }
      result = await submitCnrWithCaptcha(sessionId, cnrNumber, captchaCode);
    }

    if (!result.success) {
      addLog(`[Human-Verified Query] Court portal error: ${result.error}`, 'ERROR');
      return res.json(result);
    }

    if (!result.found) {
      addLog(`[Human-Verified Query] Case valid, but pending listing/orders by registry.`, 'INFO');
      return res.json(result);
    }

    // Archive discovered orders
    const archivedOrders = await archiveOrders({
      orders: result.orders || [],
      caseNumber: caseNumber || result.caseNumber || 'CASE',
      driveFolderId,
      googleAccessToken,
      dedicatedFolderName
    });

    addLog(`[Human-Verified Query] Successfully archived ${archivedOrders.length} genuine court orders for ${caseNumber || cnrNumber}.`, 'SUCCESS');

    return res.json({
      success: true,
      found: true,
      courtType: isCalHc ? 'CALCUTTA_HIGH_COURT' : 'ECOURTS_LOWER_COURTS',
      cino: result.cino,
      cnrNumber: result.cnrNumber || result.cino || cnrNumber,
      caseNumber: result.caseNumber || caseNumber,
      causeTitle: result.causeTitle,
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

// --- 4. On-Demand Single Case Sync (Autonomous Deep-Learning OCR) ---
app.post('/api/sync/case', async (req, res) => {
  const { 
    caseId, 
    cnrNumber, 
    caseNumber, 
    caseType,
    courtCode,
    courtName, 
    driveFolderId, 
    googleAccessToken,
    dedicatedFolderName = '05_AutoFetched_Court_Orders'
  } = req.body;

  const isCalHc = isCalcuttaHighCourtCase({ courtCode, courtName, cnrNumber, caseNumber });

  if (!isCalHc && !cnrNumber) {
    return res.status(400).json({ success: false, error: 'Missing 16-digit CNR Number for lower court case.' });
  }

  addLog(`[On-Demand Sync] Received sync request for Case: ${caseNumber || caseId} (${isCalHc ? 'Calcutta High Court' : 'Lower Court CNR: ' + cnrNumber})`, 'REQUEST');

  try {
    let courtResult;
    if (isCalHc) {
      courtResult = await queryCalcuttaHighCourtAuto({
        caseNumber,
        caseType,
        cnrNumber,
        courtCode,
        courtName
      });
    } else {
      courtResult = await queryEcourtsByCnr(cnrNumber, caseNumber);
    }

    if (!courtResult.success) {
      addLog(`[On-Demand Sync] Automated OCR blocked/failed: ${courtResult.error}`, 'WARN');
      return res.json({
        success: false,
        requiresHumanCaptcha: true,
        courtType: isCalHc ? 'CALCUTTA_HIGH_COURT' : 'ECOURTS_LOWER_COURTS',
        error: courtResult.error,
        message: courtResult.error
      });
    }

    const archivedOrders = await archiveOrders({
      orders: courtResult.orders || [],
      caseNumber: caseNumber || courtResult.caseNumber || 'CASE',
      driveFolderId,
      googleAccessToken,
      dedicatedFolderName
    });

    addLog(`[On-Demand Sync] Completed sync for ${caseNumber || cnrNumber}. Orders found: ${archivedOrders.length}`, 'SUCCESS');

    return res.json({
      success: true,
      caseId,
      courtType: isCalHc ? 'CALCUTTA_HIGH_COURT' : 'ECOURTS_LOWER_COURTS',
      cino: courtResult.cino,
      cnrNumber: courtResult.cnrNumber || courtResult.cino || cnrNumber,
      caseNumber: courtResult.caseNumber || caseNumber,
      causeTitle: courtResult.causeTitle,
      found: courtResult.found || false,
      message: courtResult.message,
      dedicatedFolderName,
      archivedOrders,
      ordersCount: archivedOrders.length,
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

// --- 5. Batch Automated Sync Trigger (Dual Court Engine) ---
app.post('/api/sync/batch', async (req, res) => {
  const { cases = [], googleAccessToken } = req.body;
  addLog(`[Batch Sync] Starting batch sync for ${cases.length} cases...`, 'BATCH');

  const results = [];
  for (const c of cases) {
    try {
      const isCalHc = isCalcuttaHighCourtCase({
        courtCode: c.courtCode,
        courtName: c.courtName,
        cnrNumber: c.cnrNumber,
        caseNumber: c.caseNumber
      });

      let r;
      if (isCalHc) {
        r = await queryCalcuttaHighCourtAuto({
          caseNumber: c.caseNumber,
          caseType: c.caseType,
          cnrNumber: c.cnrNumber,
          courtCode: c.courtCode,
          courtName: c.courtName
        });
      } else if (c.cnrNumber) {
        r = await queryEcourtsByCnr(c.cnrNumber, c.caseNumber);
      } else {
        continue;
      }

      results.push({
        caseNumber: c.caseNumber,
        courtType: isCalHc ? 'CALCUTTA_HIGH_COURT' : 'ECOURTS_LOWER_COURTS',
        found: r.found || false,
        ordersCount: r.orders?.length || 0,
        error: r.error
      });
    } catch (e) {
      results.push({ caseNumber: c.caseNumber, error: e.message });
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
  logger('Executing nightly automated court synchronization across litigation portfolio (High Court & Lower Courts)...', 'AUTO_SYNC');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ JusWiz Court Order Microservice running on port ${PORT}`);
  console.log(`🏛️ Dual Engines: Calcutta High Court + eCourts Lower Courts`);
  console.log(`📁 Dedicated Auto-Fetched PDF Storage: ${LOCAL_STORAGE_DIR}`);
  console.log(`⏰ Automated Daily Court Sync: 8:00 PM (0 20 * * *)`);
  console.log(`=======================================================`);
  addLog(`Dual-engine microservice daemon online on port ${PORT}. Ready for Calcutta High Court & eCourts sync.`);
});
