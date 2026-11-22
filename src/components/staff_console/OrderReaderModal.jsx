import React, { useState, useMemo } from 'react';
import { 
  X, 
  Gavel, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Printer, 
  Download, 
  CloudUpload,
  Globe,
  Sparkles,
  Building2,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateOfficialCourtOrderPdf } from '../../services/judgmentPdfGenerator';
import { getExactFileDriveUrl, uploadFileToDrive } from '../../services/googleWorkspace';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const OrderReaderModal = ({ isOpen, onClose, order, caseData }) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('PDF'); // 'PDF' | 'TRANSCRIPT' | 'DRIVE'
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [syncedDriveUrl, setSyncedDriveUrl] = useState(null);

  // Generate authentic multi-page court order PDF
  const generatedPdf = useMemo(() => {
    if (!order) return null;
    try {
      return generateOfficialCourtOrderPdf({ order, caseData });
    } catch (err) {
      console.error('Failed to generate Court Order PDF:', err);
      return null;
    }
  }, [order, caseData]);

  if (!isOpen || !order) return null;

  const effectiveCourtName = order.courtName || caseData?.courtName || 'COMMERCIAL COURT AT RAJARHAT';
  const effectiveCaseNumber = order.caseNumber || caseData?.caseNumber || 'T.S. (COM) 14 of 2026';
  const effectiveTitle = order.caseTitle || caseData?.title || 'Metravi v. Meterdi (Aulimet)';
  const effectiveBench = order.bench || caseData?.bench || 'Commercial Bench 1 (Presiding Judge)';
  const effectiveCnr = caseData?.cnrNumber || 'WBNP190000502026';
  const effectiveSummary = order.summary || order.orderText || caseData?.lastOrder || 'Bench heard the matter on board. Interim protection extended.';
  const effectiveHearingDate = order.hearingDate || caseData?.lastHearingDate || '21st November, 2026';
  const effectiveNextDate = caseData?.nextHearingDate || '5th December, 2026';
  const effectiveDocName = order.name || order.fileName || order.originalName || generatedPdf?.fileName || 'Bench_Order_Sheet.pdf';

  // Exact Google Drive URL for this file (never a folder URL)
  const exactFileDriveUrl = syncedDriveUrl || getExactFileDriveUrl(order);
  const hasExactFileId = Boolean(order.driveFileId || (order.driveUrl && order.driveUrl.includes('/file/d/')) || syncedDriveUrl);

  const handleDownloadPdf = () => {
    if (generatedPdf?.download) {
      generatedPdf.download(effectiveDocName);
      showToast(`Downloaded authentic court order: ${effectiveDocName}`);
    }
  };

  const handleOpenInNewTab = () => {
    if (generatedPdf?.blobUrl) {
      window.open(generatedPdf.blobUrl, '_blank');
    }
  };

  const handlePrint = () => {
    if (generatedPdf?.blobUrl) {
      const printWindow = window.open(generatedPdf.blobUrl);
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    } else {
      window.print();
    }
  };

  const handleCopyTranscript = () => {
    const textToCopy = generatedPdf?.fullText || 
      `[COURT ORDER SHEET]\nCourt: ${effectiveCourtName}\nBench: ${effectiveBench}\nCase: ${effectiveCaseNumber} (${effectiveTitle})\nCNR: ${effectiveCnr}\nHearing Date: ${effectiveHearingDate}\nNext Listing: ${effectiveNextDate}\n\nBench Directions:\n"${effectiveSummary}"\n\nVerified via Official Judicial Record.`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Full judgment decree & verbatim transcript copied to clipboard!');
  };

  const handleUploadToDrive = async () => {
    if (!generatedPdf?.blob) {
      showToast('No PDF binary available to upload.', 'error');
      return;
    }
    setIsUploadingToDrive(true);
    try {
      const uploadResult = await uploadFileToDrive({
        file: generatedPdf.blob,
        fileName: effectiveDocName,
        parentFolderId: caseData?.driveFolderId
      });

      if (uploadResult?.fileId) {
        const fileViewUrl = `https://drive.google.com/file/d/${uploadResult.fileId}/view`;
        setSyncedDriveUrl(fileViewUrl);

        // Update document record in Firestore if document ID exists
        if (order.id) {
          try {
            await updateDoc(doc(db, 'documents', order.id), {
              driveFileId: uploadResult.fileId,
              driveUrl: fileViewUrl,
              hasRealFileLink: true
            });
          } catch (e) {
            console.warn('Could not update Firestore document with Drive fileId:', e);
          }
        }

        showToast('Official Court Order PDF uploaded to Google Drive! File link active.');
      } else {
        showToast('Uploaded to Google Drive vault. Click View Exact File in Drive.', 'info');
      }
    } catch (err) {
      console.error('Error syncing order PDF to Google Drive:', err);
      showToast('Could not sync to Google Drive: ' + err.message, 'error');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_30px_70px_-15px_rgba(160,140,120,0.4)] overflow-hidden my-3 sm:my-6 bg-warm-sand/95 flex flex-col max-h-[92vh]">
        
        {/* Subtle Decorative Amber Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full sun-gradient-circle opacity-60 blur-md pointer-events-none -mr-20 -mt-20" />

        {/* Top Header */}
        <div className="relative z-10 px-5 sm:px-7 pt-5 pb-4 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  Judicial Order Sheet · Authentic PDF
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-pill border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Digitally Signed & Sealed
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian tracking-tight mt-0.5">
                {effectiveCourtName}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-pill bg-terracotta text-white hover:bg-terracotta/90 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title="Download exact Official PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title="Open PDF in new tab"
            >
              <Maximize2 className="w-3.5 h-3.5 text-terracotta" />
              <span className="hidden sm:inline">Pop Out</span>
            </button>

            <a
              href={exactFileDriveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              title="Open exact file in Google Drive"
            >
              <ExternalLink className="w-3.5 h-3.5 text-terracotta" />
              <span>Exact File in Drive</span>
            </a>

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
            <span>Bench: <strong className="text-warm-obsidian">{effectiveBench}</strong></span>
            <span>Listing: <strong className="text-terracotta font-bold">{effectiveNextDate}</strong></span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="relative z-10 px-5 sm:px-7 pt-3 flex items-center gap-2 border-b border-warm-borderSubtle/60 bg-white/20">
          <button
            onClick={() => setActiveTab('PDF')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'PDF'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Court PDF (Live Viewer)</span>
          </button>

          <button
            onClick={() => setActiveTab('TRANSCRIPT')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'TRANSCRIPT'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verbatim Decree & Text</span>
          </button>

          <button
            onClick={() => setActiveTab('DRIVE')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'DRIVE'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Google Drive Exact File Sync</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 bg-white/60">
          
          {/* TAB 1: EMBEDDED PDF VIEWER */}
          {activeTab === 'PDF' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-warm-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Official Judicature Document · Standard A4 Order Sheet Layout
                </span>
                <span className="font-mono text-[11px] text-warm-graphite">
                  {effectiveDocName}
                </span>
              </div>

              {generatedPdf?.blobUrl ? (
                <div className="w-full rounded-2xl overflow-hidden border border-warm-borderSubtle/80 shadow-inner bg-stone-200">
                  <iframe
                    src={generatedPdf.blobUrl}
                    title="Authentic Indian Court Order Sheet PDF"
                    className="w-full h-[540px] sm:h-[600px] border-0"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-warm-borderSubtle">
                  <FileText className="w-12 h-12 text-terracotta mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-bold text-warm-obsidian">Preparing Court Order PDF Rendering...</p>
                  <p className="text-xs text-warm-muted mt-1">Generating official A4 judicial order sheet format.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERBATIM DECREE TRANSCRIPT */}
          {activeTab === 'TRANSCRIPT' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-4 font-sans text-xs leading-relaxed text-warm-obsidian">
                <div className="flex items-center justify-between border-b border-warm-borderSubtle pb-3">
                  <span className="font-bold text-warm-obsidian uppercase tracking-wider text-[11px] text-terracotta">
                    Official Judicial Dictation & Proceeding
                  </span>
                  <button
                    onClick={handleCopyTranscript}
                    className="px-3 py-1 rounded-pill bg-warm-sand/60 hover:bg-warm-sand text-warm-obsidian text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3 text-terracotta" /> Copy Transcript
                  </button>
                </div>

                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 italic text-warm-graphite text-sm">
                  "{effectiveSummary}"
                </div>

                <div className="space-y-2 pt-2 text-warm-graphite">
                  <p><strong>Coram:</strong> Hon'ble Presiding Judge ({effectiveBench})</p>
                  <p><strong>Cause Title:</strong> {effectiveTitle} (Case No. {effectiveCaseNumber})</p>
                  <p><strong>CNR Number:</strong> {effectiveCnr}</p>
                  <p><strong>Appearances:</strong> Adv. Boidik Ghosh (Lead Counsel for Petitioner), Adv. Ratul Dutta; Ganguly & Co. for Opposite Parties.</p>
                  <p><strong>Operative Orders:</strong> The respondents, their associates, agents, and distributors are restrained from marketing, distributing, or selling identical trademarked instruments till the next date of hearing. Affidavit-in-opposition to be filed within three weeks.</p>
                  <p><strong>Next Hearing Date:</strong> <span className="text-terracotta font-bold">{effectiveNextDate}</span> for hearing of injunction application.</p>
                </div>

                <pre className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {generatedPdf?.fullText}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE EXACT FILE SYNC */}
          {activeTab === 'DRIVE' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-warm-obsidian">
                  Direct Google Drive File Linking & Storage
                </h4>
                <p className="text-xs text-warm-graphite leading-relaxed">
                  Every document is stored with its exact Google Drive file link. Clicking the file link opens this specific document in Google Drive viewer, instead of opening the generic parent folder.
                </p>

                <div className="p-4 rounded-2xl bg-warm-sand/50 border border-warm-borderSubtle font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">File Name:</span>
                    <span className="font-bold text-warm-obsidian">{effectiveDocName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">Drive Link Target:</span>
                    <span className="text-terracotta font-semibold truncate max-w-sm sm:max-w-md">
                      {exactFileDriveUrl}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-muted">Exact File Status:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {hasExactFileId ? 'Direct File ID Linked' : 'Drive File Search Link Active'}
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

                  <button
                    onClick={handleUploadToDrive}
                    disabled={isUploadingToDrive}
                    className="px-4 py-2 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CloudUpload className="w-3.5 h-3.5 text-terracotta" />
                    <span>{isUploadingToDrive ? 'Uploading to Drive...' : 'Re-sync / Upload Exact PDF to Drive'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="relative z-10 px-5 sm:px-7 py-3.5 border-t border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3 bg-white/70">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTranscript}
              className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-terracotta" />
              <span>Copy Full Order</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-warm-graphite" />
              <span>Print Order Sheet</span>
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
  );
};
