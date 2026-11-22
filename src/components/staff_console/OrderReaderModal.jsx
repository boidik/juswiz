import React, { useState } from 'react';
import { 
  X, 
  Gavel, 
  FileText, 
  ExternalLink, 
  Copy, 
  Printer, 
  Download, 
  Globe, 
  Building2, 
  Maximize2,
  FileCheck,
  ShieldCheck,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getExactFileDriveUrl, extractDriveFileId } from '../../services/googleWorkspace';

export const OrderReaderModal = ({ isOpen, onClose, order, caseData, onOpenIngest }) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('VIEWER'); // 'VIEWER' | 'TRANSCRIPT' | 'DRIVE'

  if (!isOpen || !order) return null;

  const effectiveCourtName = order.courtName || caseData?.courtName || 'Commercial Court, Rajarhat';
  const effectiveCaseNumber = order.caseNumber || caseData?.caseNumber || 'T.S. (COM) 14 of 2026';
  const effectiveTitle = order.caseTitle || caseData?.title || 'Metravi v. Meterdi (Aulimet)';
  const effectiveBench = order.bench || caseData?.bench || 'Commercial Division';
  const effectiveCnr = caseData?.cnrNumber || 'WBNP190000502026';
  const effectiveSummary = order.summary || order.orderText || caseData?.lastOrder || '';
  const effectiveHearingDate = order.hearingDate || caseData?.lastHearingDate || 'Recent Hearing';
  const effectiveNextDate = caseData?.nextHearingDate || 'Pending Listing';
  const effectiveDocName = order.name || order.fileName || order.originalName || 'Court_Order_Sheet.pdf';

  // Check if we have an exact Google Drive file ID
  const driveFileId = order.driveFileId || extractDriveFileId(order.driveUrl);
  const exactFileDriveUrl = getExactFileDriveUrl(order);
  const hasExactFile = Boolean(driveFileId || order.blobUrl);

  const handleCopyTranscript = () => {
    if (!effectiveSummary) {
      showToast('No bench transcript text recorded for this order.', 'info');
      return;
    }
    const textToCopy = `[COURT ORDER]\nCourt: ${effectiveCourtName}\nBench: ${effectiveBench}\nCase: ${effectiveCaseNumber} (${effectiveTitle})\nCNR: ${effectiveCnr}\nHearing Date: ${effectiveHearingDate}\nNext Listing: ${effectiveNextDate}\n\nOperative Directives:\n"${effectiveSummary}"`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Order details copied to clipboard!');
  };

  const handleCopyCnr = () => {
    navigator.clipboard.writeText(effectiveCnr);
    showToast(`CNR Number ${effectiveCnr} copied!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(160,140,120,0.4)] overflow-hidden my-3 sm:my-6 bg-warm-sand/95 flex flex-col max-h-[92vh]">
        
        {/* Amber Sunset Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full sun-gradient-circle opacity-50 blur-md pointer-events-none -mr-20 -mt-20" />

        {/* Top Header */}
        <div className="relative z-10 px-5 sm:px-7 pt-5 pb-4 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  Judicial Order Sheet
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-pill border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Court Database Record
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian tracking-tight mt-0.5">
                {effectiveCourtName}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={exactFileDriveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title="Open exact file in Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5 text-terracotta" />
              <span>Exact File in Drive</span>
            </a>

            <button
              onClick={handleCopyCnr}
              className="px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1 transition-all font-mono"
            >
              <Copy className="w-3 h-3 text-terracotta" /> {effectiveCnr}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-warm-sand/80 hover:bg-warm-sand flex items-center justify-center text-warm-graphite hover:text-warm-obsidian transition-colors shadow-xs ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case Metadata Strip */}
        <div className="relative z-10 px-5 sm:px-7 py-3 bg-white/40 border-b border-warm-borderSubtle/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap font-mono">
            <span className="font-bold text-warm-obsidian bg-white px-2.5 py-1 rounded-pill border border-warm-borderSubtle">
              {effectiveCaseNumber}
            </span>
            <span className="text-warm-muted">CNR: <strong className="text-warm-obsidian">{effectiveCnr}</strong></span>
            <span className="text-warm-muted">Cause: <strong className="text-warm-obsidian">{effectiveTitle}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-warm-graphite">
            <span>Hearing Date: <strong className="text-warm-obsidian">{effectiveHearingDate}</strong></span>
            {effectiveNextDate && (
              <span>Next Listing: <strong className="text-terracotta font-bold">{effectiveNextDate}</strong></span>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 px-5 sm:px-7 pt-3 flex items-center gap-2 border-b border-warm-borderSubtle/60 bg-white/20">
          <button
            onClick={() => setActiveTab('VIEWER')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'VIEWER'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Court Order PDF Document</span>
          </button>

          {effectiveSummary && (
            <button
              onClick={() => setActiveTab('TRANSCRIPT')}
              className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
                activeTab === 'TRANSCRIPT'
                  ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                  : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Bench Directives & Notes</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('DRIVE')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'DRIVE'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Court Portals & Drive Linking</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 bg-white/60">
          
          {/* TAB 1: PDF VIEWER */}
          {activeTab === 'VIEWER' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-warm-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className={`w-2 h-2 rounded-full ${hasExactFile ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {hasExactFile ? 'Verified Court File Archived' : 'Awaiting Signed PDF Upload'}
                </span>
                <span className="font-mono text-[11px] text-warm-graphite">
                  {effectiveDocName}
                </span>
              </div>

              {driveFileId ? (
                <div className="w-full rounded-2xl overflow-hidden border border-warm-borderSubtle shadow-inner bg-stone-100">
                  <iframe
                    src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                    title="Authentic Court Order PDF Viewer"
                    className="w-full h-[520px] sm:h-[580px] border-0"
                  />
                </div>
              ) : order.blobUrl ? (
                <div className="w-full rounded-2xl overflow-hidden border border-warm-borderSubtle shadow-inner bg-stone-100">
                  <iframe
                    src={order.blobUrl}
                    title="Authentic Court Order PDF Viewer"
                    className="w-full h-[520px] sm:h-[580px] border-0"
                  />
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-warm-borderSubtle space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 text-terracotta flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-warm-obsidian">
                      Official Court Order Sheet Not Ingested Yet
                    </h3>
                    <p className="text-xs text-warm-muted max-w-md mx-auto mt-1 leading-relaxed">
                      Per NIC eCourts regulations, digitally signed order sheets require human verification (CAPTCHA) on the judicial portal. Query the live database and attach the genuine signed PDF.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href="https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index"
                      target="_blank"
                      rel="noreferrer"
                      className="capsule-btn-dark text-xs"
                    >
                      <span>Query eCourts Portal (CNR: {effectiveCnr})</span>
                      <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                    </a>

                    <a
                      href="https://calcuttahighcourt.gov.in/"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-terracotta" /> Calcutta High Court
                    </a>

                    {onOpenIngest && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenIngest();
                        }}
                        className="px-4 py-2 rounded-pill bg-terracotta text-white hover:bg-terracotta/90 text-xs font-semibold shadow-xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Attach Signed Court PDF
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TRANSCRIPT NOTES */}
          {activeTab === 'TRANSCRIPT' && effectiveSummary && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3 font-sans text-xs leading-relaxed text-warm-obsidian">
                <div className="flex items-center justify-between border-b border-warm-borderSubtle pb-2">
                  <span className="font-bold text-terracotta uppercase tracking-wider text-[11px]">
                    Bench Directives Recorded by Counsel
                  </span>
                  <button
                    onClick={handleCopyTranscript}
                    className="px-3 py-1 rounded-pill bg-warm-sand/60 hover:bg-warm-sand text-warm-obsidian text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3 text-terracotta" /> Copy
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 italic text-warm-graphite text-sm">
                  "{effectiveSummary}"
                </div>

                <div className="pt-1 text-warm-muted space-y-1">
                  <p>Hearing Date: <strong className="text-warm-obsidian">{effectiveHearingDate}</strong></p>
                  <p>Bench: <strong className="text-warm-obsidian">{effectiveBench}</strong></p>
                  {effectiveNextDate && (
                    <p>Next Listing: <strong className="text-terracotta">{effectiveNextDate}</strong></p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DRIVE & PORTALS */}
          {activeTab === 'DRIVE' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-warm-obsidian">
                  Direct Google Drive & Official Judicial Portals
                </h4>
                <p className="text-xs text-warm-graphite leading-relaxed">
                  Every legal document in your practice is stored with its exact Google Drive link. When you click the file link, Google Drive opens that specific document directly.
                </p>

                <div className="p-4 rounded-2xl bg-warm-sand/50 border border-warm-borderSubtle font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">File Target:</span>
                    <span className="font-bold text-warm-obsidian">{effectiveDocName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">Exact Drive URL:</span>
                    <span className="text-terracotta font-semibold truncate max-w-sm sm:max-w-md">
                      {exactFileDriveUrl}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">File Status:</span>
                    <span className="font-bold text-emerald-700">
                      {driveFileId ? 'Direct File ID Active' : 'Drive Exact File Search Active'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={exactFileDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="capsule-btn-dark text-xs"
                  >
                    <span>Open Exact File in Google Drive</span>
                    <div className="knob"><ExternalLink className="w-3 h-3 text-white" /></div>
                  </a>

                  <a
                    href="https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-terracotta" />
                    <span>eCourts National Portal</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="relative z-10 px-5 sm:px-7 py-3.5 border-t border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-2">
            <a
              href="https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-terracotta" />
              <span>Query eCourts Portal</span>
            </a>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-warm-graphite" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="capsule-btn-dark text-xs"
          >
            <span>Close</span>
            <div className="knob"><X className="w-3 h-3 text-white" /></div>
          </button>
        </div>

      </div>
    </div>
  );
};
