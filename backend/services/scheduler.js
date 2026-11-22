const cron = require('node-cron');
const { queryEcourtsByCnr } = require('./ecourtsService');

let scheduledTask = null;
let currentSchedule = '0 20 * * *'; // 8:00 PM Daily
let isAutoSyncEnabled = true;
let logs = [];
let lastRunTimestamp = null;

function addLog(message, type = 'INFO') {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message
  };
  logs.unshift(entry);
  if (logs.length > 50) logs.pop();
  console.log(`[Auto-Sync Scheduler] [${type}] ${message}`);
}

/**
 * Initializes the automated nightly/periodic court sync scheduler
 */
function initScheduler(onRunSyncCallback) {
  if (scheduledTask) {
    scheduledTask.stop();
  }

  addLog(`Initializing Automated Court Order Sync Scheduler. Cron: "${currentSchedule}" (Daily 8:00 PM)`);

  scheduledTask = cron.schedule(currentSchedule, async () => {
    if (!isAutoSyncEnabled) {
      addLog('Scheduled trigger skipped (Auto-Sync currently disabled in settings).', 'WARN');
      return;
    }

    lastRunTimestamp = new Date().toISOString();
    addLog(`Automated Court Database Poll triggered at ${lastRunTimestamp}`, 'EXEC');

    if (typeof onRunSyncCallback === 'function') {
      try {
        await onRunSyncCallback(addLog);
      } catch (err) {
        addLog(`Error during automated batch sync: ${err.message}`, 'ERROR');
      }
    }
  });

  return scheduledTask;
}

function updateSchedule(newCronExpression, enabled = true) {
  if (cron.validate(newCronExpression)) {
    currentSchedule = newCronExpression;
    isAutoSyncEnabled = enabled;
    addLog(`Schedule updated to: "${newCronExpression}", Enabled: ${enabled}`);
    return { success: true, schedule: currentSchedule, enabled: isAutoSyncEnabled };
  } else {
    return { success: false, error: 'Invalid cron expression.' };
  }
}

function getSchedulerStatus() {
  return {
    enabled: isAutoSyncEnabled,
    schedule: currentSchedule,
    lastRun: lastRunTimestamp,
    logs: logs.slice(0, 30)
  };
}

module.exports = {
  initScheduler,
  updateSchedule,
  getSchedulerStatus,
  addLog
};
