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
  Sparkles,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { getExactFileDriveUrl, getStoredGoogleToken } from '../../services/googleWorkspace';

export const OrderFetcherModal = ({ isOpen, onClose, targetCase }) => {
  const { ingestOfficialCourtOrder, systemConfig, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('MICROSERVICE'); // 'MICROSERVICE' | 'PORTAL' | 'INGEST'
  
  // Microservice health state
  const [microserviceStatus, setMicroserviceStatus] = useState('CHECKING'); // 'ONLINE' | 'OFFLINE' | 'CHECKING'
  
  // Live Human Captcha Session state
  const [sessionId, setSessionId] = useState(null);
  const [captchaDataUrl, setCaptchaDataUrl] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [isFetchingWithCaptcha, setIsFetchingWithCaptcha] = useState(false);
  const [captchaError, setCaptchaError] = useState(null);
  const [fetchedOrders, setFetchedOrders] = useState([]);

  // Automated sync state
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

  // Quick Portal Paste state
  const [pastedOrderText, setPastedOrderText] = useState('');
  const [isSubmittingPaste, setIsSubmittingPaste] = useState(false);

  const dedicatedFolderName = systemConfig?.dedicatedOrderFolder || '05_AutoFetched_Court_Orders';
  const microserviceUrl = systemConfig?.microserviceUrl || 'http://localhost:5001';

  // Check microservice health & load live court captcha session on mount
  useEffect(() => {
    if (!isOpen) return;
    checkMicroserviceHealth();
    loadLiveCourtCaptcha();
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

  const loadLiveCourtCaptcha = async () => {
    setIsLoadingCaptcha(true);
    setCaptchaError(null);
    try {
      const res = await fetch(`${microserviceUrl}/api/court/captcha-session`);
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setCaptchaDataUrl(data.captchaDataUrl);
        setCaptchaInput('');
      } else {
        setCaptchaError(data.error || 'Could not initialize eCourts session.');
      }
    } catch (err) {
      setCaptchaError(`Could not reach Court Microservice on ${microserviceUrl}. Ensure backend daemon is active.`);
    } finally {
      setIsLoadingCaptcha(false);
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

  // Submit Human Captcha directly to eCourts via Microservice
  const handleFetchWithCaptcha = async (e) => {
    if (e) e.preventDefault();
    if (!captchaInput || captchaInput.trim().length < 3) {
      showToast('Please enter the captcha characters shown in the image.', 'error');
      return;
    }

    setIsFetchingWithCaptcha(true);
    setCaptchaError(null);
    try {
      const googleAccessToken = getStoredGoogleToken();
      const res = await fetch(`${microserviceUrl}/api/court/fetch-with-captcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cnrNumber,
          captchaCode: captchaInput.trim(),
          caseId: targetCase.id,
          caseNumber,
          courtName,
          driveFolderId: targetCase.driveFolderId,
          googleAccessToken,
          dedicatedFolderName
        })
      });

      const data = await res.json();

      if (data.success) {
        setFetchedOrders(data.archivedOrders || []);
        showToast(data.message || `Discovered and archived ${data.ordersCount} court orders!`);

        // Index orders into Case Dossier
        if (data.archivedOrders && data.archivedOrders.length > 0) {
          for (const ord of data.archivedOrders) {
            await ingestOfficialCourtOrder({
              caseId: targetCase.id,
              orderDate: ord.orderDate,
              courtName,
              summary: ord.orderSummary || 'Authentic Signed Court Order',
              bench: targetCase.bench
            });
          }
        }
      } else {
        if (data.isCaptchaError && data.newSessionId) {
          setSessionId(data.newSessionId);
          setCaptchaDataUrl(data.newCaptchaDataUrl);
          setCaptchaInput('');
          setCaptchaError(data.error);
        } else {
          setCaptchaError(data.error || 'Failed to query eCourts database');
        }
        showToast(data.error || 'Failed to fetch court orders', 'error');
      }
    } catch (err) {
      setCaptchaError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsFetchingWithCaptcha(false);
    }
  };

  // Trigger On-Demand Automated Microservice Sync (OCR)
  const handleTriggerOnDemandSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncLogs([
      `[00.0s] Handshaking with self-hosted Court Sync Microservice (${microserviceUrl})...`,
      `[00.3s] Initializing live eCourts CIS session for Case: ${caseNumber}...`,
      `[00.7s] Querying court database registry for CNR: ${cnrNumber}...`
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
        if (data.archivedOrders?.length > 0) {
          setFetchedOrders(data.archivedOrders);
        }
      } else {
        setSyncLogs(prev => [
          ...prev,
          `[03.5s] Notice: ${data.error || 'eCourts security challenge active.'}`
        ]);
        if (data.requiresHumanCaptcha) {
          showToast('eCourts Security Gate active. Please enter the court captcha above to complete fetch.', 'error');
        } else {
          showToast(data.error || 'Sync notice', 'error');
        }
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

  const handleQuickPasteIngest = async (e) => {
    e.preventDefault();
    if (!pastedOrderText || pastedOrderText.trim().length < 5) {
      showToast('Please paste the order text or table from the court portal.', 'error');
      return;
    }

    setIsSubmittingPaste(true);
    try {
      const res = await ingestOfficialCourtOrder({
        caseId: targetCase.id,
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        courtName,
        summary: pastedOrderText.trim(),
        bench: benchName || targetCase.bench
      });

      if (res.success) {
        showToast(`Court order record saved to case dossier & /${dedicatedFolderName}/!`);
        setPastedOrderText('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingPaste(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(160,140,120,0.4)] overflow-hidden my-4 sm:my-8 bg-warm-sand/95">
        
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
                  Judicial Database Sync
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
            <span>1. Court Sync Microservice</span>
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
        <div className="relative z-10 p-6 sm:p-8 space-y-5 bg-white/60 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: COURT SYNC MICROSERVICE */}
          {activeTab === 'MICROSERVICE' && (
            <div className="space-y-4">
              
              {/* PRIMARY: Live Court Captcha Verification Ingest */}
              <div className="p-5 rounded-3xl bg-white border-2 border-terracotta/30 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-borderSubtle/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill">
                      Official Court Database Access
                    </span>
                    <h3 className="text-sm font-bold text-warm-obsidian mt-1">
                      Direct eCourts Session with Human Verification
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-warm-muted">
                    Target: /{dedicatedFolderName}/
                  </span>
                </div>

                <p className="text-xs text-warm-graphite leading-relaxed">
                  The eCourts National Services portal gates automated scrapers with security challenges. Enter the official captcha characters below to execute a verified query directly into the court registry:
                </p>

                {/* Captcha Box */}
                <form onSubmit={handleFetchWithCaptcha} className="p-4 rounded-2xl bg-warm-sand/40 border border-warm-borderSubtle/60 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    
                    {/* Captcha Image */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-warm-borderSubtle shadow-xs shrink-0">
                      {isLoadingCaptcha ? (
                        <div className="h-10 w-32 flex items-center justify-center text-xs text-warm-muted">
                          <RefreshCw className="w-4 h-4 animate-spin text-terracotta mr-1.5" /> Loading...
                        </div>
                      ) : captchaDataUrl ? (
                        <img 
                          src={captchaDataUrl} 
                          alt="eCourts Captcha" 
                          className="h-9 w-auto object-contain rounded select-none" 
                        />
                      ) : (
                        <div className="h-10 w-32 flex items-center justify-center text-[11px] text-amber-800 font-semibold">
                          Captcha Offline
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={loadLiveCourtCaptcha}
                        disabled={isLoadingCaptcha}
                        title="Get Fresh Court Captcha"
                        className="p-1 rounded-lg hover:bg-warm-sand text-warm-graphite hover:text-warm-obsidian transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {/* Captcha Text Input */}
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="Enter 5-6 characters"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="capsule-input text-xs font-mono font-bold uppercase tracking-widest text-center sm:w-44 py-2.5 bg-white"
                    />

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={isFetchingWithCaptcha || !captchaInput || isLoadingCaptcha}
                      className="capsule-btn-dark text-xs w-full sm:w-auto shrink-0 disabled:opacity-50"
                    >
                      <span>{isFetchingWithCaptcha ? 'Connecting to eCourts...' : 'Fetch Court Orders'}</span>
                      <div className="knob">
                        <ArrowRight className={`w-3.5 h-3.5 text-white ${isFetchingWithCaptcha ? 'animate-spin' : ''}`} />
                      </div>
                    </button>
                  </div>

                  {captchaError && (
                    <div className="flex items-start gap-1.5 text-xs text-red-700 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span>{captchaError}</span>
                    </div>
                  )}
                </form>

                {/* Display Fetched Orders */}
                {fetchedOrders.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {fetchedOrders.length} Authentic Court Order(s) Discovered & Archived into /{dedicatedFolderName}/:
                    </h4>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {fetchedOrders.map((ord, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-2xl border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-warm-obsidian font-mono">Order #{ord.orderNumber || (idx + 1)}</span>
                              <span className="px-2 py-0.5 rounded-pill bg-warm-sand text-[10px] font-bold text-terracotta">
                                {ord.orderDate}
                              </span>
                            </div>
                            <p className="text-[11px] text-warm-graphite mt-0.5">{ord.orderSummary}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {ord.driveUrl && (
                              <a
                                href={ord.driveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-pill bg-warm-sand/80 hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-[11px] font-semibold flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 text-terracotta" /> Open in Drive
                              </a>
                            )}
                            {ord.localUrl && (
                              <a
                                href={ord.localUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-pill bg-terracotta text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                              >
                                <Eye className="w-3 h-3" /> View Order PDF
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECONDARY: Automated Scheduler & On-Demand OCR */}
              <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-borderSubtle/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-muted">
                      Automated Scheduler
                    </span>
                    <h3 className="text-xs font-bold text-warm-obsidian mt-0.5">
                      Daily Nightly Court Sync · 8:00 PM (0 20 * * *)
                    </h3>
                  </div>

                  <button
                    onClick={handleTriggerOnDemandSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-pill bg-warm-sand hover:bg-warm-sand/80 text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-terracotta ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Testing...' : 'Test Automated OCR Query'}</span>
                  </button>
                </div>

                {/* Live Scraper Execution Console Stream */}
                {syncLogs.length > 0 && (
                  <div className="bg-warm-obsidian rounded-2xl p-3 text-[11px] font-mono text-white/90 space-y-1 max-h-36 overflow-y-auto border border-white/10 shadow-inner">
                    <div className="text-[10px] uppercase font-bold text-terracotta-light flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Automated Daemon Log Stream
                    </div>
                    {syncLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed text-emerald-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: LIVE JUDICIAL PORTAL DIRECT LOOKUP & INSTANT PASTE */}
          {activeTab === 'PORTAL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-warm-obsidian leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-warm-obsidian">
                  <ShieldCheck className="w-4 h-4 text-terracotta" /> Direct Citizen & Advocate Portal Access
                </p>
                <p className="text-warm-graphite">
                  Use the 1-click Copy CNR button at the top to open the official portal and view all uploaded bench orders. You can also paste the court order text or directives directly below to archive them into <strong>/{dedicatedFolderName}/</strong> immediately.
                </p>
              </div>

              {/* Direct Portal Links */}
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

              {/* Quick Paste Order Text Form */}
              <form onSubmit={handleQuickPasteIngest} className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-terracotta" />
                  Instant Court Order Ingestion (From Portal View)
                </h4>
                <p className="text-[11px] text-warm-muted">
                  If you have already searched the CNR on eCourts and can see the order text/directives, paste them here to update the case dossier & archive into /{dedicatedFolderName}/:
                </p>

                <textarea
                  rows={3}
                  required
                  value={pastedOrderText}
                  onChange={(e) => setPastedOrderText(e.target.value)}
                  placeholder="Paste verbatim order directives from eCourts..."
                  className="w-full capsule-input text-xs rounded-2xl resize-none py-2 font-sans"
                />

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="capsule-input text-xs py-1.5"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingPaste || !pastedOrderText.trim()}
                    className="capsule-btn-primary text-xs disabled:opacity-50"
                  >
                    <span>{isSubmittingPaste ? 'Saving...' : 'Archive Pasted Order'}</span>
                    <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                  </button>
                </div>
              </form>
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
                      <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
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
