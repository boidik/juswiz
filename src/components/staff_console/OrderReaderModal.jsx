import React from 'react';
import { 
  X, 
  Gavel, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Printer, 
  Share2, 
  DownloadCloud, 
  Globe,
  Sparkles,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OrderReaderModal = ({ isOpen, onClose, order, caseData }) => {
  const { showToast } = useApp();

  if (!isOpen || !order) return null;

  const effectiveCourtName = order.courtName || caseData?.courtName || 'Adjudicating Forum';
  const effectiveCaseNumber = order.caseNumber || caseData?.caseNumber || 'Case Record';
  const effectiveTitle = order.caseTitle || caseData?.title || 'Litigation Dossier';
  const effectiveBench = order.bench || caseData?.bench || 'Standard Bench';
  const effectiveCnr = caseData?.cnrNumber || 'N/A';
  const effectiveSummary = order.summary || order.orderText || caseData?.lastOrder || 'Bench order recorded.';
  const effectiveHearingDate = order.hearingDate || caseData?.lastHearingDate || 'Recent Hearing';
  const effectiveNextDate = caseData?.nextHearingDate || 'Pending Listing';
  const effectiveDocName = order.name || order.fileName || order.originalName || 'Bench_Order_Sheet.pdf';
  const effectiveDriveUrl = order.driveUrl || caseData?.driveFolderUrl || 'https://drive.google.com/drive/my-drive';

  const handleCopySynopsis = () => {
    const textToCopy = `[COURT ORDER SHEET]\nCourt: ${effectiveCourtName}\nBench: ${effectiveBench}\nCase: ${effectiveCaseNumber} (${effectiveTitle})\nCNR: ${effectiveCnr}\nHearing Date: ${effectiveHearingDate}\nNext Listing: ${effectiveNextDate}\n\nBench Directions:\n"${effectiveSummary}"\n\nVerified via JurisFlow Intelligent Case Management.`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Order transcript & bench details copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8 bg-warm-sand/90">
        
        {/* Amber Sunset Orb */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full sun-gradient-circle opacity-80 blur-xs pointer-events-none -mr-12 -mt-12" />

        {/* Header */}
        <div className="relative z-10 px-6 sm:px-8 pt-7 pb-5 border-b border-warm-borderSubtle/60 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  Judicial Order Sheet
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-pill border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Daily Order
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-warm-obsidian font-display tracking-tight mt-1">
                {effectiveCourtName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-warm-sand/60 hover:bg-warm-sand flex items-center justify-center text-warm-graphite hover:text-warm-obsidian transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* Case Metadata Box */}
          <div className="p-4 rounded-3xl bg-white/80 border border-warm-borderSubtle/80 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-borderSubtle/50 pb-2">
              <span className="font-mono text-xs font-bold text-warm-obsidian bg-warm-sand/60 px-3 py-1 rounded-pill">
                {effectiveCaseNumber}
              </span>
              <span className="text-xs font-mono text-warm-muted">
                CNR: {effectiveCnr}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-warm-obsidian font-display leading-snug">
              {effectiveTitle}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-warm-graphite font-medium">
              <div>
                <span className="text-[10px] uppercase text-warm-muted block font-semibold">Coram / Bench</span>
                <span className="text-warm-obsidian font-semibold">{effectiveBench}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-warm-muted block font-semibold">Order Date</span>
                <span className="text-warm-obsidian font-semibold">{effectiveHearingDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-warm-muted block font-semibold">Next Listing</span>
                <span className="text-terracotta font-bold">{effectiveNextDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-warm-muted block font-semibold">Dossier Folder</span>
                <span className="font-mono text-[11px] text-warm-obsidian">05_Orders</span>
              </div>
            </div>
          </div>

          {/* Transcript / Bench Directions Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warm-obsidian uppercase tracking-wider font-display flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-terracotta" /> Bench Order Dictation & Synopsis
              </span>
              <span className="text-[11px] text-warm-muted font-mono">
                Digitally Ingested from Judicial Portal
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white/95 border border-warm-borderSubtle shadow-inner relative leading-relaxed text-sm text-warm-obsidian font-sans space-y-3">
              <div className="text-2xl text-terracotta/30 font-serif leading-none select-none">“</div>
              <p className="italic text-warm-graphite -mt-2">
                {effectiveSummary}
              </p>
              <div className="text-2xl text-terracotta/30 font-serif leading-none text-right select-none">”</div>
            </div>
          </div>

          {/* Document Ingestion & Storage Details */}
          <div className="p-3.5 rounded-2xl bg-warm-sand/50 border border-warm-borderSubtle/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-terracotta shrink-0" />
              <div className="min-w-0">
                <span className="font-mono font-bold text-warm-obsidian block truncate max-w-xs sm:max-w-md">
                  {effectiveDocName}
                </span>
                <span className="text-[11px] text-warm-muted">
                  Indexed into Google Drive · Size: {order.fileSize || '1.4 MB'}
                </span>
              </div>
            </div>

            <a
              href={effectiveDriveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-white text-warm-obsidian hover:bg-warm-sand border border-warm-borderSubtle font-semibold shadow-xs shrink-0 self-start sm:self-auto"
            >
              <ExternalLink className="w-3 h-3 text-terracotta" /> View in Drive
            </a>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-warm-borderSubtle/60">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySynopsis}
                className="px-3.5 py-2 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-terracotta" /> Copy Transcript
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-warm-graphite" /> Print
              </button>
            </div>

            <button
              onClick={onClose}
              className="capsule-btn-dark text-xs"
            >
              <span>Close Dossier</span>
              <div className="knob"><X className="w-3 h-3 text-white" /></div>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
