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

  const caseNumber = targetCase?.caseNumber || 'T.S. (COM) 14 of 2026';
  const cnrNumber = targetCase?.cnrNumber || 'WBNP190000502026';
  const courtName = targetCase?.courtName || 'Commercial Court, Rajarhat';
  const clientName = targetCase?.clientName || 'Vikram Bhansali';

  const isCalHc = Boolean(
    targetCase?.courtCode?.includes('CAL_HC') || 
    courtName?.toLowerCase().includes('calcutta high court') ||
    courtName?.toLowerCase().includes('calcutta hc') ||
    cnrNumber?.toUpperCase().startsWith('WBHC') ||
    cnrNumber?.toUpperCase().startsWith('WBCH')
  );

  // Check microservice health & load live court captcha session on mount
  useEffect(() => {
    if (!isOpen) return;
    checkMicroserviceHealth();
    loadLiveCourtCaptcha();
  }, [isOpen, targetCase?.id]);

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
      const params = new URLSearchParams({
        courtCode: targetCase?.courtCode || '',
        courtName: courtName || '',
        cnrNumber: cnrNumber || '',
        caseNumber: caseNumber || '',
        caseType: targetCase?.caseType || ''
      });
      const res = await fetch(`${microserviceUrl}/api/court/captcha-session?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setCaptchaDataUrl(data.captchaDataUrl);
        setCaptchaInput('');
      } else {
        setCaptchaError(data.error || 'Could not initialize court gateway session.');
      }
    } catch (err) {
      setCaptchaError(`Could not reach Court Microservice on ${microserviceUrl}. Ensure backend daemon is active.`);
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  if (!isOpen || !targetCase) return null;

  const handleCopyCnr = () => {
    const textToCopy = isCalHc ? caseNumber : cnrNumber;
    navigator.clipboard.writeText(textToCopy);
    showToast(`${isCalHc ? 'Case Number' : 'CNR Number'} ${textToCopy} copied to clipboard!`);
  };

  // Submit Human Captcha directly to Court Gateway via Microservice
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
          caseType: targetCase.caseType,
          courtCode: targetCase.courtCode,
          courtName,
          courtType: isCalHc ? 'CALCUTTA_HIGH_COURT' : 'ECOURTS_LOWER_COURTS',
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
              fileName: ord.fileName,
              orderDate: ord.orderDate,
              courtName,
              summary: ord.orderSummary || 'Authentic Signed Court Order',
              bench: ord.coram || targetCase.bench,
              localUrl: ord.localUrl,
              driveUrl: ord.driveUrl,
              driveFileId: ord.driveFileId,
              fileSize: ord.fileSize
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
          setCaptchaError(data.error || 'Failed to query court database');
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
  const handleTriggerOnDemandSync = async (customOverrides = null) => {
    setIsSyncing(true);
    setSyncResult(null);

    const queryCaseNumber = customOverrides?.caseNumber || caseNumber;
    const queryCnrNumber = customOverrides?.cnrNumber || cnrNumber;
    const queryCourtCode = customOverrides?.courtCode || targetCase.courtCode;
    const queryCourtName = customOverrides?.courtName || courtName;
    const queryCaseType = customOverrides?.caseType || targetCase.caseType;
    const queryIsCalHc = isCalHc || Boolean(customOverrides?.isCalHc);

    setSyncLogs([
      `[00.0s] Handshaking with self-hosted Court Sync Microservice (${microserviceUrl})...`,
      `[00.3s] Initializing live ${queryIsCalHc ? 'Calcutta High Court (calcuttahighcourt.gov.in)' : 'eCourts CIS'} session for Case: ${queryCaseNumber}...`,
      `[00.7s] Querying court database registry for ${queryIsCalHc ? queryCaseNumber : 'CNR: ' + queryCnrNumber}...`
    ]);

    try {
      const googleAccessToken = getStoredGoogleToken();
      const res = await fetch(`${microserviceUrl}/api/sync/case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: targetCase.id,
          cnrNumber: queryCnrNumber,
          caseNumber: queryCaseNumber,
          caseType: queryCaseType,
          courtCode: queryCourtCode,
          courtName: queryCourtName,
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
          `[02.5s] Judicial Database Response: ${data.message}`,
          `[03.0s] Dedicated Folder: /${dedicatedFolderName}/ synchronized.`,
          `[03.5s] Successfully discovered and archived ${data.ordersCount || data.archivedOrders?.length || 0} genuine court orders!`
        ]);
        showToast(data.message || `Discovered ${data.ordersCount || 0} authentic court orders!`);
        if (data.archivedOrders?.length > 0) {
          setFetchedOrders(data.archivedOrders);
          for (const ord of data.archivedOrders) {
            await ingestOfficialCourtOrder({
              caseId: targetCase.id,
              fileName: ord.fileName,
              orderDate: ord.orderDate,
              courtName: queryCourtName,
              summary: ord.orderSummary || 'Authentic Signed Court Order',
              bench: ord.coram || targetCase.bench,
              localUrl: ord.localUrl,
              driveUrl: ord.driveUrl,
              driveFileId: ord.driveFileId,
              fileSize: ord.fileSize
            });
          }
        }
      } else {
        setSyncLogs(prev => [
          ...prev,
          `[03.5s] Notice: ${data.error || 'Court security challenge active.'}`
        ]);
        if (data.requiresHumanCaptcha) {
          showToast('Court Security Gate active. Please enter the court captcha above to complete fetch.', 'error');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-3xl sm:rounded-4xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(160,140,120,0.4)] overflow-hidden my-2 sm:my-8 bg-warm-sand/95 flex flex-col max-h-[94vh] sm:max-h-[92vh]">
        
        {/* Subtle Decorative Amber Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full sun-gradient-circle opacity-50 blur-xs pointer-events-none -mr-12 -mt-12" />

        {/* Modal Header */}
        <div className="relative z-10 px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-warm-borderSubtle/60 flex items-start justify-between bg-white/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  {isCalHc ? 'Calcutta High Court Gateway' : 'Judicial Database Sync'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill border flex items-center gap-1.5 ${
                  microserviceStatus === 'ONLINE' 
                    ? 'text-emerald-700 bg-emerald-100/90 border-emerald-200'
                    : 'text-amber-800 bg-amber-100/90 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${microserviceStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  Microservice: {microserviceStatus} (Dual Engine)
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-warm-obsidian tracking-tight mt-0.5 sm:mt-1">
                {isCalHc ? 'Calcutta High Court Order Fetching & Ingestion' : 'Court Database Automation & Ingestion'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-warm-sand/60 hover:bg-warm-sand flex items-center justify-center text-warm-graphite hover:text-warm-obsidian transition-colors shadow-xs shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Case Dossier Identifiers Strip */}
        <div className="relative z-10 px-4 sm:px-8 py-2.5 sm:py-3 bg-white/40 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-mono">
            <span className="font-bold text-warm-obsidian bg-white px-2.5 sm:px-3 py-1 rounded-pill border border-warm-borderSubtle">
              {caseNumber}
            </span>
            <span className="text-warm-muted">{isCalHc ? 'Court: ' : 'CNR: '}<strong className="text-warm-obsidian">{isCalHc ? courtName : cnrNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-mono text-warm-graphite bg-white/70 px-2.5 py-1 rounded-pill border border-warm-borderSubtle flex items-center gap-1">
              <FolderSync className="w-3 h-3 text-terracotta" /> /{dedicatedFolderName}/
            </span>
            <button
              onClick={handleCopyCnr}
              className="px-2.5 sm:px-3 py-1 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title={isCalHc ? "Copy Case Number" : "Copy 16-digit CNR for eCourts search"}
            >
              <Copy className="w-3 h-3 text-terracotta" /> {isCalHc ? 'Copy Case No' : 'Copy CNR'}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 px-4 sm:px-8 pt-2.5 sm:pt-3 flex items-center gap-1.5 sm:gap-2 border-b border-warm-borderSubtle/60 bg-white/20 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('MICROSERVICE')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r whitespace-nowrap ${
              activeTab === 'MICROSERVICE'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. {isCalHc ? 'Calcutta HC Sync Microservice' : 'Court Sync Microservice'}</span>
          </button>

          <button
            onClick={() => setActiveTab('PORTAL')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r whitespace-nowrap ${
              activeTab === 'PORTAL'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. {isCalHc ? 'Live Calcutta HC Portal Gateway' : 'Live eCourts Portal Gateway'}</span>
          </button>

          <button
            onClick={() => setActiveTab('INGEST')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r whitespace-nowrap ${
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
        <div className="relative z-10 p-4 sm:p-8 space-y-5 bg-white/60 flex-1 overflow-y-auto">
          
          {/* TAB 1: COURT SYNC MICROSERVICE */}
          {activeTab === 'MICROSERVICE' && (
            <div className="space-y-4">
              
              {/* PRIMARY: 1-Click Fully Autonomous Sync (Zero Human Intervention) */}
              <div className="p-5 rounded-3xl bg-white border-2 border-terracotta/30 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-warm-borderSubtle/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill">
                      {isCalHc ? 'Calcutta High Court Autonomous AI Sync · Dual-Side Engine' : '100% Autonomous AI Sync · Zero Human Intervention'}
                    </span>
                    <h3 className="text-sm font-bold text-warm-obsidian mt-1">
                      {isCalHc ? 'Direct Calcutta High Court Portal Integration (calcuttahighcourt.gov.in)' : 'Direct eCourts National Database Integration'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-warm-muted">
                    Target: /{dedicatedFolderName}/
                  </span>
                </div>

                <p className="text-xs text-warm-graphite leading-relaxed">
                  {isCalHc ? (
                    <>Direct automated query against the official Calcutta High Court portal (Appellate & Original Side). Negotiates Laravel CSRF security tokens, uses deep-learning neural OCR (ddddocr) to solve High Court captchas in ~0.1s, downloads signed judicial PDF orders directly from <strong>calcuttahighcourt.gov.in/show_pdf</strong>, and archives them into <strong>/{dedicatedFolderName}/</strong>.</>
                  ) : (
                    <>Queries eCourts CIS autonomously using deep-learning neural OCR and dynamic anti-bot header negotiation. Automatically discovers all signed judicial orders, streams the official PDFs, and archives them into <strong>/{dedicatedFolderName}/</strong> without requiring manual captcha entry.</>
                  )}
                </p>

                {/* Big Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    onClick={() => handleTriggerOnDemandSync()}
                    disabled={isSyncing}
                    className="capsule-btn-dark text-xs w-full sm:w-auto shrink-0 shadow-md py-3 px-6 flex items-center justify-between gap-3 disabled:opacity-50"
                  >
                    <span className="font-bold text-sm tracking-wide">
                      {isSyncing ? 'Fetching Authentic Court Orders...' : `Sync ${isCalHc ? 'Calcutta HC Orders' : 'Court Orders'} Now (100% Automated)`}
                    </span>
                    <div className="knob">
                      <RefreshCw className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                  </button>

                  <div className="text-[11px] text-warm-muted flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-terracotta" />
                    <span>Nightly Auto-Sync: 8:00 PM (0 20 * * *)</span>
                  </div>
                </div>

                {isCalHc && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-terracotta shrink-0" />
                      <span>Calcutta HC Live Verification: Test on verified court matter <strong>WPA 1 of 2024</strong> (10 signed orders)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTriggerOnDemandSync({
                        caseNumber: 'WPA 1 of 2024',
                        cnrNumber: 'WBCHCA0000012024',
                        courtCode: 'CAL_HC_AS',
                        courtName: 'Calcutta High Court (Appellate Side)',
                        caseType: 'WPA',
                        isCalHc: true
                      })}
                      disabled={isSyncing}
                      className="px-3 py-1 rounded-pill bg-terracotta hover:bg-terracotta/90 text-white font-bold text-[11px] shadow-xs shrink-0 flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Fetch WPA 1/2024</span>
                    </button>
                  </div>
                )}

                {/* Live Daemon Log Stream */}
                {syncLogs.length > 0 && (
                  <div className="bg-warm-obsidian rounded-2xl p-3.5 text-[11px] font-mono text-white/90 space-y-1.5 max-h-40 overflow-y-auto border border-white/10 shadow-inner">
                    <div className="text-[10px] uppercase font-bold text-terracotta-light flex items-center gap-1.5 pb-1 border-b border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Autonomous Sync Progress Console
                    </div>
                    {syncLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed text-emerald-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* Display Fetched Orders */}
                {fetchedOrders.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-warm-borderSubtle/60">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {fetchedOrders.length} Authentic Court Order(s) Discovered & Archived into /{dedicatedFolderName}/:
                    </h4>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
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

              {/* SECONDARY: Manual Live Session (Fallback) */}
              <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-borderSubtle/60 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-muted">
                      Manual Fallback Session
                    </span>
                    <h3 className="text-xs font-bold text-warm-obsidian mt-0.5">
                      Live Human Verification ({isCalHc ? 'Calcutta HC Gateway' : 'eCourts Gateway'})
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-warm-graphite leading-relaxed">
                  {isCalHc
                    ? 'If you prefer to verify or solve the Calcutta High Court security challenge manually, use the live session gateway below (case-sensitive alphanumeric):'
                    : 'If you prefer to verify or solve a specific captcha challenge manually, use the live session gateway below (mixed-case alphanumeric supported):'}
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
                          alt={isCalHc ? "Calcutta High Court Captcha" : "eCourts Captcha"} 
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

                    {/* Captcha Text Input - Case-sensitive, NO uppercase CSS constraint */}
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter characters exactly"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      className="capsule-input text-xs font-mono font-bold tracking-widest text-center sm:w-44 py-2.5 bg-white"
                    />

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={isFetchingWithCaptcha || !captchaInput || isLoadingCaptcha}
                      className="capsule-btn-dark text-xs w-full sm:w-auto shrink-0 disabled:opacity-50"
                    >
                      <span>{isFetchingWithCaptcha ? 'Connecting...' : 'Fetch via Manual Captcha'}</span>
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
                  {isCalHc
                    ? <>Search directly on the official Calcutta High Court portal (Appellate & Original Side) for <strong>{caseNumber}</strong>. You can view all bench orders or paste order directives below to archive them into <strong>/{dedicatedFolderName}/</strong> immediately.</>
                    : <>Use the 1-click Copy CNR button at the top to open the official portal and view all uploaded bench orders. You can also paste the court order text or directives directly below to archive them into <strong>/{dedicatedFolderName}/</strong> immediately.</>}
                </p>
              </div>

              {/* Direct Portal Links */}
              {isCalHc ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2 py-0.5 rounded-pill">
                        High Court Orders
                      </span>
                      <h4 className="text-sm font-bold text-warm-obsidian mt-1">
                        Calcutta HC Order & Judgment Search
                      </h4>
                      <p className="text-xs text-warm-muted mt-1 leading-normal">
                        Query official signed decrees for <strong>{caseNumber}</strong> on calcuttahighcourt.gov.in.
                      </p>
                    </div>

                    <a
                      href="https://www.calcuttahighcourt.gov.in/order_judgment_search"
                      target="_blank"
                      rel="noreferrer"
                      className="capsule-btn-dark text-xs justify-center w-full"
                    >
                      <span>Open Calcutta HC Orders</span>
                      <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                    </a>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-pill">
                        Main Portal
                      </span>
                      <h4 className="text-sm font-bold text-warm-obsidian mt-1">
                        High Court of Calcutta Portal
                      </h4>
                      <p className="text-xs text-warm-muted mt-1 leading-normal">
                        Daily cause lists, notices, and registry rosters for Appellate and Original Sides.
                      </p>
                    </div>

                    <a
                      href="https://www.calcuttahighcourt.gov.in/"
                      target="_blank"
                      rel="noreferrer"
                      className="capsule-btn-dark text-xs justify-center w-full"
                    >
                      <span>Open Calcutta HC Portal</span>
                      <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                    </a>
                  </div>
                </div>
              ) : (
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
              )}

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
