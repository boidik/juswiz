import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { getExactFileDriveUrl } from '../../services/googleWorkspace';

export const OrderFetcherModal = ({ isOpen, onClose, targetCase }) => {
  const { ingestOfficialCourtOrder, systemConfig, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('PORTAL'); // 'PORTAL' | 'INGEST'
  const [orderFile, setOrderFile] = useState(null);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [benchName, setBenchName] = useState(targetCase?.bench || '');
  const [orderSummary, setOrderSummary] = useState('');
  const [nextListing, setNextListing] = useState(targetCase?.nextHearingDate || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestedDoc, setIngestedDoc] = useState(null);

  if (!isOpen || !targetCase) return null;

  const caseNumber = targetCase.caseNumber || 'T.S. (COM) 14 of 2026';
  const cnrNumber = targetCase.cnrNumber || 'WBNP190000502026';
  const courtName = targetCase.courtName || 'Commercial Court, Rajarhat';
  const clientName = targetCase.clientName || 'Vikram Bhansali';

  const handleCopyCnr = () => {
    navigator.clipboard.writeText(cnrNumber);
    showToast(`CNR Number ${cnrNumber} copied to clipboard!`);
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
        showToast('Official Court Order sheet ingested and saved to Google Drive!');
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
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill border border-terracotta/20">
                  Judicial Portal Gateway
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-pill border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Official Court Records
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian tracking-tight mt-1">
                Court Database & Order Sheet Ingestion
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
            onClick={() => setActiveTab('PORTAL')}
            className={`px-4 py-2 rounded-t-2xl text-xs font-bold transition-all flex items-center gap-2 border-t border-l border-r ${
              activeTab === 'PORTAL'
                ? 'bg-white text-terracotta border-warm-borderSubtle shadow-xs'
                : 'bg-transparent text-warm-graphite border-transparent hover:text-warm-obsidian'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Query Live Court Database</span>
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
            <span>2. Ingest Signed Court Order PDF</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-5 bg-white/60">
          
          {/* TAB 1: LIVE JUDICIAL PORTAL DIRECT LOOKUP */}
          {activeTab === 'PORTAL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-warm-obsidian leading-relaxed space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-warm-obsidian">
                  <ShieldCheck className="w-4 h-4 text-terracotta" /> National Informatics Centre (NIC) Security Verification
                </p>
                <p className="text-warm-graphite">
                  Per official rules of the Supreme Court eCommittee, digitally signed Court Order Sheets on official court servers require a human security CAPTCHA on the official portal. Click below to look up this case in the national database, then download and attach the signed order sheet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Option A: eCourts National Portal */}
                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-terracotta bg-terracotta-soft px-2 py-0.5 rounded-pill">
                        National Portal
                      </span>
                      <Globe className="w-4 h-4 text-warm-muted" />
                    </div>
                    <h4 className="text-sm font-bold text-warm-obsidian">
                      eCourts Services (CNR Search)
                    </h4>
                    <p className="text-xs text-warm-muted mt-1 leading-normal">
                      Search by CNR <strong>{cnrNumber}</strong> across all Indian District & Commercial Courts.
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

                {/* Option B: North 24 Parganas District / Commercial Court */}
                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-pill">
                        Local Commercial Division
                      </span>
                      <Building2 className="w-4 h-4 text-warm-muted" />
                    </div>
                    <h4 className="text-sm font-bold text-warm-obsidian">
                      Commercial Court, Rajarhat
                    </h4>
                    <p className="text-xs text-warm-muted mt-1 leading-normal">
                      North 24 Parganas District Court daily cause list & commercial orders repository.
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

                {/* Option C: Calcutta High Court */}
                <div className="p-4 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs flex flex-col justify-between space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-warm-obsidian bg-warm-sand/80 px-2.5 py-0.5 rounded-pill">
                        Appellate & High Court Division
                      </span>
                      <h4 className="text-sm font-bold text-warm-obsidian mt-1">
                        High Court at Calcutta (Judgments & Daily Orders Portal)
                      </h4>
                      <p className="text-xs text-warm-muted mt-0.5">
                        Access official signed orders, appeal status, and caveat notices.
                      </p>
                    </div>

                    <a
                      href="https://calcuttahighcourt.gov.in/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-warm-obsidian text-white text-xs font-semibold shadow-xs hover:bg-warm-obsidian/90"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open High Court
                    </a>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('INGEST')}
                  className="capsule-btn-dark text-xs"
                >
                  <span>Proceed to Ingest Order PDF</span>
                  <div className="knob"><ArrowRight className="w-3 h-3 text-white" /></div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INGEST SIGNED COURT ORDER PDF */}
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
                    The genuine PDF order sheet is now filed in Google Drive under <strong>05_Orders_and_Judgments</strong> and available in the Case Dossier viewer.
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
                  
                  {/* File Upload Box */}
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
                            {(orderFile.size / 1024 / 1024).toFixed(2)} MB · Ready to Archive
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-warm-obsidian">Click or Drag Authentic Court Order PDF</p>
                          <p className="text-[11px] text-warm-muted mt-0.5">
                            Upload the exact signed order sheet downloaded from eCourts / High Court
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

                  <div>
                    <label className="block text-xs font-semibold text-warm-graphite mb-1">
                      Next Listing Date (Optional, to update Case Board)
                    </label>
                    <input
                      type="date"
                      value={nextListing}
                      onChange={(e) => setNextListing(e.target.value)}
                      className="w-full capsule-input text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-warm-borderSubtle/60">
                    <button
                      type="button"
                      onClick={() => setActiveTab('PORTAL')}
                      className="text-xs font-semibold text-warm-muted hover:text-warm-obsidian"
                    >
                      ← Back to Court Portals
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !orderFile}
                      className="capsule-btn-dark text-xs disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Archiving to Drive...' : 'Ingest Genuine Court Order'}</span>
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
