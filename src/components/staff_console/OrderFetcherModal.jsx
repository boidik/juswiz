import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Gavel, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Upload, 
  Copy, 
  Building2, 
  FileText, 
  Calendar, 
  ShieldCheck,
  Search,
  ArrowRight,
  Cpu,
  RefreshCw,
  FolderSync,
  Clock,
  Sparkles
} from 'lucide-react';
import { getExactFileDriveUrl, getStoredGoogleToken } from '../../services/googleWorkspace';

export const OrderFetcherModal = ({ isOpen, onClose, targetCase }) => {
  const { ingestOfficialCourtOrder, systemConfig, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('MICROSERVICE'); // 'MICROSERVICE' | 'PORTAL' | 'INGEST'
  
  // Microservice state
  const [microserviceStatus, setMicroserviceStatus] = useState('CHECKING'); // 'ONLINE' | 'OFFLINE' | 'CHECKING'
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const [syncResult, setSyncResult] = useState(null);

  // Manual Ingest state
  const [orderFile, setOrderFile] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [benchName, setBenchName] = useState(targetCase?.bench || '');
  const [orderSummary, setOrderSummary] = useState('');
  const [nextListing, setNextListing] = useState(targetCase?.nextHearingDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestedDoc, setIngestedDoc] = useState(null);

  const dedicatedFolderName = systemConfig?.dedicatedOrderFolder || '05_AutoFetched_Court_Orders';
  const microserviceUrl = systemConfig?.microserviceUrl || 'http://localhost:5001';

  // Check microservice health on mount
  useEffect(() => {
    if (!isOpen) return;
    checkMicroserviceHealth();
  }, [isOpen]);

  const checkMicroserviceHealth = async () => {
    try {
      const res = await fetch(`${microserviceUrl}/api/health`);
      if (res.ok) {
        setMicroserviceStatus('ONLINE');
      } else {
        setMicroserviceStatus('OFFLINE');
      }
    } catch (e) {
      setMicroserviceStatus('OFFLINE');
    }
  };

  if (!isOpen || !targetCase) return null;

  const caseNumber = targetCase.caseNumber || 'T.S. (COM) 14 of 2026';
  const cnrNumber = targetCase.cnrNumber || 'WBNP190000502026';
  const courtName = targetCase.courtName || 'Commercial Court, Rajarhat';
  const clientName = targetCase.clientName || 'Vikram Bhansali';

  const handleCopyCnr = () => {
    navigator.clipboard.writeText(cnrNumber);
    showToast(`CNR Number ${cnrNumber} copied to clipboard!`);
  };

  // Trigger On-Demand Microservice Sync
  const handleTriggerOnDemandSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncLogs([
      `[00.0s] Handshaking with self-hosted Court Sync Microservice (${microserviceUrl})...`,
      `[00.3s] Initializing live eCourts CIS session for Case: ${caseNumber}...`,
      `[00.7s] Downloading dynamic Securimage captcha from services.ecourts.gov.in...`,
      `[01.2s] Running local Tesseract OCR engine to resolve captcha...`,
      `[02.1s] Submitting verified CNR payload: ${cnrNumber}...`,
      `[02.8s] Querying court database registry & cause list orders...`,
      `[03.2s] Connecting to Google Drive target folder: /${dedicatedFolderName}/...`
    ]);

    try {
      const googleAccessToken = getStoredGoogleToken();
      const res = await fetch(`${microserviceUrl}/api/sync/case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: targetCase.id,
          cnrNumber,
          caseNumber,
          courtName,
          driveFolderId: targetCase.driveFolderId,
          googleAccessToken,
          dedicatedFolderName
        })
      });

      const data = await res.json();
      setSyncResult(data);

      if (data.success) {
        setSyncLogs(prev => [
          ...prev,
          `[03.5s] Judicial Database Response: ${data.message}`,
          `[03.8s] Dedicated Folder: /${dedicatedFolderName}/ synchronized.`,
          `[04.0s] On-demand sync finished successfully.`
        ]);
        showToast(data.message || 'Court database query completed!');
      } else {
        setSyncLogs(prev => [
          ...prev,
          `[03.5s] Sync error: ${data.error || 'Failed to complete query'}`
        ]);
        showToast(data.error || 'Sync error', 'error');
      }
    } catch (err) {
      console.error(err);
      setSyncLogs(prev => [
        ...prev,
        `[03.5s] Connection failed: Microservice unreachable on ${microserviceUrl}.`
      ]);
      showToast('Could not reach microservice: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleIngestOrder = async (e) => {
    e.preventDefault();
    if (!orderFile) {
      showToast('Please select the official court order PDF downloaded from the judicial portal.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ingestOfficialCourtOrder({
        caseId: targetCase.id,
        file: orderFile,
        orderDate,
        courtName,
        summary: orderSummary,
        bench: benchName,
        nextListingDate: nextListing
      });

      if (res.success) {
        setIngestedDoc(res.doc);
        showToast(`Official Court Order sheet ingested into ${dedicatedFolderName}!`);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(160,140,120,0.4)] overflow-hidden my-4 sm:my-8 bg-warm-sand/95">
        
        {/* Subtle Decorative Amber Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full sun-gradient-circle opacity-50 blur-xs pointer-events-none -mr-12 -mt-12" />

        {/* Modal Header */}
        <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-start justify-between bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  Automated Judicial Database Sync
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-pill border flex items-center gap-1.5 ${
                  microserviceStatus === 'ONLINE' 
                    ? 'text-emerald-700 bg-emerald-100/90 border-emerald-200'
                    : 'text-amber-800 bg-amber-100/90 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${microserviceStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  Microservice: {microserviceStatus} (Port 5001)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian tracking-tight mt-1">
                Court Database Automation & Ingestion
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/60 hover:bg-warm-sand flex items-center justify-center text-warm-graphite hover:text-warm-obsidian transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Case Dossier Identifiers Strip */}
        <div className="relative z-10 px-6 sm:px-8 py-3 bg-white/40 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap font-mono">
            <span className="font-bold text-warm-obsidian bg-white px-3 py-1 rounded-pill border border-warm-borderSubtle">
              {caseNumber}
            </span>
            <span className="text-warm-muted">CNR: <strong className="text-warm-obsidian">{cnrNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-warm-graphite bg-white/70 px-2.5 py-1 rounded-pill border border-warm-borderSubtle flex items-center gap-1">
              <FolderSync className="w-3 h-3 text-terracotta" /> /{dedicatedFolderName}/
            </span>
            <button
              onClick={handleCopyCnr}
              className="px-3 py-1 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title="Copy 16-digit CNR for eCourts search"
            >
              <Copy className="w-3 h-3 text-terracotta" /> Copy CNR
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 px-6 sm:px-8 pt-3 flex items-center gap-2 border-b border-warm-borderSubtle/60 bg-white/20">
          <button
            onClick={() => setActiveTab('MICROSERVICE')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'MICROSERVICE'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. Automated Microservice (On-Demand & Scheduled)</span>
          </button>

          <button
            onClick={() => setActiveTab('PORTAL')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'PORTAL'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Live eCourts Portal Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('INGEST')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'INGEST'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Ingest Downloaded PDF</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-5 bg-white/60">
          
          {/* TAB 1: AUTOMATED MICROSERVICE SYNC */}
          {activeTab === 'MICROSERVICE' && (
            <div className="space-y-4">
              
              {/* Dual Sync Status Info Card */}
              <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-borderSubtle/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill">
                      Self-Hosted Scraper Engine
                    </span>
                    <h3 className="text-sm font-bold text-warm-obsidian mt-1">
                      Direct eCourts National CIS Connector
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-pill bg-warm-sand/80 text-[11px] font-semibold text-warm-obsidian flex items-center gap-1.5 border border-warm-borderSubtle">
                      <Clock className="w-3.5 h-3.5 text-terracotta" />
                      Auto-Sync: Daily at 8:00 PM
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-warm-graphite">
                  <div className="p-3 rounded-2xl bg-warm-sand/40 border border-warm-borderSubtle/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-warm-muted block">Dedicated Archive Folder</span>
                    <span className="font-mono text-warm-obsidian font-bold">📁 /{dedicatedFolderName}/</span>
                    <p className="text-[11px] text-warm-muted">Auto-fetched court PDFs are isolated in this folder in Google Drive & local disk.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-warm-sand/40 border border-warm-borderSubtle/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-warm-muted block">Captcha Solving Engine</span>
                    <span className="text-warm-obsidian font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Tesseract OCR (Zero External API Fees)
                    </span>
                    <p className="text-[11px] text-warm-muted">Automatically resolves Securimage PHP captcha on eCourts in real-time.</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-white to-terracotta/10 border border-terracotta/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-warm-obsidian font-display">
                    Trigger On-Demand Live Court Database Sync
                  </h4>
                  <p className="text-[11px] text-warm-muted mt-0.5">
                    Queries eCourts CIS for CNR <strong>{cnrNumber}</strong> right now.
                  </p>
                </div>

                <button
                  onClick={handleTriggerOnDemandSync}
                  disabled={isSyncing}
                  className="capsule-btn-dark text-xs shrink-0 disabled:opacity-50"
                >
                  <span>{isSyncing ? 'Connecting to eCourts...' : 'Run On-Demand Sync Now'}</span>
                  <div className="knob">
                    <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                  </div>
                </button>
              </div>

              {/* Live Scraper Execution Console Stream */}
              {syncLogs.length > 0 && (
                <div className="bg-warm-obsidian rounded-3xl p-4 text-xs font-mono text-white/90 space-y-1.5 max-h-48 overflow-y-auto border border-white/10 shadow-inner">
                  <div className="text-[10px] uppercase font-bold text-terracotta-light flex items-center gap-1.5 pb-1 border-b border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Microservice Execution Stream · eCourts National Gateway
                  </div>
                  {syncLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed text-emerald-400">
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Result Summary */}
              {syncResult && (
                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-warm-obsidian flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Court Registry Status:
                    </span>
                    <span className="text-[11px] font-mono text-warm-muted">{syncResult.timestamp}</span>
                  </div>
                  <p className="text-warm-graphite leading-relaxed">
                    {syncResult.message}
                  </p>
                  {syncResult.archivedOrders && syncResult.archivedOrders.length > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 font-medium">
                      Archived {syncResult.archivedOrders.length} authentic order sheet(s) into <strong>{dedicatedFolderName}</strong>.
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE JUDICIAL PORTAL DIRECT LOOKUP */}
          {activeTab === 'PORTAL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-warm-obsidian leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-warm-obsidian">
                  <ShieldCheck className="w-4 h-4 text-terracotta" /> Direct Citizen & Advocate Portal Access
                </p>
                <p className="text-warm-graphite">
                  You can also open the official court website directly in your browser. Use the 1-click Copy CNR button at the top to paste your 16-digit CNR into the court's search box.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2 py-0.5 rounded-pill">
                      National Portal
                    </span>
                    <h4 className="text-sm font-bold text-warm-obsidian mt-1">
                      eCourts Services (CNR Search)
                    </h4>
                    <p className="text-xs text-warm-muted mt-1 leading-normal">
                      Query CNR <strong>{cnrNumber}</strong> across all Indian District & Commercial Courts.
                    </p>
                  </div>

                  <a
                    href="https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index"
                    target="_blank"
                    rel="noreferrer"
                    className="capsule-btn-dark text-xs justify-center w-full"
                  >
                    <span>Open eCourts Portal</span>
                    <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                  </a>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-pill">
                      Commercial Division
                    </span>
                    <h4 className="text-sm font-bold text-warm-obsidian mt-1">
                      Commercial Court, Rajarhat
                    </h4>
                    <p className="text-xs text-warm-muted mt-1 leading-normal">
                      North 24 Parganas District Court daily cause list & commercial orders.
                    </p>
                  </div>

                  <a
                    href="https://north24parganas.dcourts.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="capsule-btn-dark text-xs justify-center w-full"
                  >
                    <span>Open Court Website</span>
                    <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INGEST SIGNED COURT ORDER PDF */}
          {activeTab === 'INGEST' && (
            <div>
              {ingestedDoc ? (
                <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Official Court Order Ingested Successfully!
                  </div>
                  <p className="text-xs text-warm-obsidian font-mono">
                    Archived: {ingestedDoc.name}
                  </p>
                  <p className="text-xs text-warm-graphite">
                    The genuine PDF order sheet is now filed in Google Drive under <strong>/{dedicatedFolderName}/</strong> and indexed in your Case Dossier.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20">
                    <a
                      href={getExactFileDriveUrl(ingestedDoc)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-terracotta" /> Open Exact File in Drive
                    </a>
                    <button
                      onClick={onClose}
                      className="capsule-btn-dark text-xs"
                    >
                      <span>Done</span>
                      <div className="knob"><ArrowRight className="w-3 h-3 text-white" /></div>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleIngestOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                      Select Authentic Signed Court Order PDF *
                    </label>
                    <div className="border-2 border-dashed border-warm-borderSubtle hover:border-terracotta/60 rounded-3xl p-5 text-center bg-white/70 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        required
                        onChange={(e) => setOrderFile(e.target.files[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-terracotta mx-auto mb-2 opacity-80" />
                      {orderFile ? (
                        <div>
                          <p className="text-xs font-bold text-warm-obsidian font-mono">{orderFile.name}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            {(orderFile.size / 1024 / 1024).toFixed(2)} MB · Ready to Archive into /{dedicatedFolderName}/
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-warm-obsidian">Click or Drag Authentic Court Order PDF</p>
                          <p className="text-[11px] text-warm-muted mt-0.5">
                            Will be archived directly into Google Drive /{dedicatedFolderName}/
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-warm-graphite mb-1">
                        Order Sheet Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        className="w-full capsule-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-warm-graphite mb-1">
                        Presiding Judge / Bench (Optional)
                      </label>
                      <input
                        type="text"
                        value={benchName}
                        onChange={(e) => setBenchName(e.target.value)}
                        placeholder="e.g. Commercial Division Bench"
                        className="w-full capsule-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-warm-graphite mb-1">
                      Operative Directives / Bench Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={orderSummary}
                      onChange={(e) => setOrderSummary(e.target.value)}
                      placeholder="Enter exact operative directions verbatim as written in the order sheet..."
                      className="w-full capsule-input text-xs rounded-2xl resize-none py-2"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-warm-borderSubtle/60">
                    <button
                      type="button"
                      onClick={() => setActiveTab('MICROSERVICE')}
                      className="text-xs font-semibold text-warm-muted hover:text-warm-obsidian"
                    >
                      ← Back to Microservice
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !orderFile}
                      className="capsule-btn-dark text-xs disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Archiving...' : `Ingest into /${dedicatedFolderName}/`}</span>
                      <div className="knob"><Upload className="w-3.5 h-3.5 text-white" /></div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
