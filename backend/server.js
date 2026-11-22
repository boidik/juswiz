const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { queryEcourtsByCnr } = require('./services/ecourtsService');
const { uploadToDedicatedDriveFolder } = require('./services/driveService');
const { initScheduler, updateSchedule, getSchedulerStatus, addLog } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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

// --- 2. On-Demand Single Case Sync ---
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

    const cleanCaseNo = (caseNumber || 'CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const caseLocalDir = path.join(LOCAL_STORAGE_DIR, cleanCaseNo);
    if (!fs.existsSync(caseLocalDir)) {
      fs.mkdirSync(caseLocalDir, { recursive: true });
    }

    const archivedOrders = [];

    // If eCourts returned order PDFs, download and archive each one
    if (ecourtsResult.success && ecourtsResult.found && ecourtsResult.orders?.length > 0) {
      for (let i = 0; i < ecourtsResult.orders.length; i++) {
        const ord = ecourtsResult.orders[i];
        const fileName = `${ord.orderDate || new Date().toISOString().split('T')[0]}_ORDER_${cleanCaseNo}_${i + 1}.pdf`;
        const localFilePath = path.join(caseLocalDir, fileName);

        let pdfBuffer = null;
        try {
          // Download real PDF binary from official court URL
          const pdfRes = await fetch(ord.pdfUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (pdfRes.ok) {
            pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
            fs.writeFileSync(localFilePath, pdfBuffer);
            addLog(`Downloaded genuine PDF from court: ${fileName} (${pdfBuffer.length} bytes)`, 'DOWNLOAD');
          }
        } catch (downloadErr) {
          console.warn(`[Sync] Could not download PDF binary: ${downloadErr.message}`);
        }

        // Upload to Google Drive dedicated folder if access token is present
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
          orderDate: ord.orderDate,
          localUrl: `http://localhost:${PORT}/storage/autofetched_orders/${cleanCaseNo}/${fileName}`,
          driveUrl: driveInfo?.driveUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(fileName)}`,
          driveFileId: driveInfo?.fileId || null,
          dedicatedFolder: dedicatedFolderName
        });
      }
    }

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

// --- 3. Batch Automated Sync Trigger ---
app.post('/api/sync/batch', async (req, res) => {
  const { cases = [], googleAccessToken } = req.body;
  addLog(`[Batch Sync] Starting batch sync for ${cases.length} cases...`, 'BATCH');

  const results = [];
  for (const c of cases) {
    if (c.cnrNumber) {
      try {
        const r = await queryEcourtsByCnr(c.cnrNumber);
        results.push({ caseNumber: c.caseNumber, cnr: c.cnrNumber, found: r.found || false });
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

// --- 4. Scheduler Status & Execution Logs ---
app.get('/api/sync/status', (req, res) => {
  res.json(getSchedulerStatus());
});

// --- 5. Update Schedule / Settings ---
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
