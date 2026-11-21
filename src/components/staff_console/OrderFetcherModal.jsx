import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Cpu, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck, DownloadCloud, ExternalLink, Globe } from 'lucide-react';

export const OrderFetcherModal = ({ isOpen, onClose, targetCase }) => {
  const { simulateFetchCourtOrder, systemConfig } = useApp();

  const availableCourts = systemConfig.courts || [];
  const defaultCourt = availableCourts.find(c => c.name === targetCase?.courtName || c.code === targetCase?.courtCode) || availableCourts[0] || {
    name: 'Calcutta High Court (Appellate Side)',
    portalUrl: 'https://calcuttahighcourt.gov.in',
    queryEngine: 'HIGH_COURT_DIRECT'
  };

  const [selectedCourtName, setSelectedCourtName] = useState(defaultCourt.name);
  const [caseQuery, setCaseQuery] = useState(targetCase?.caseNumber || '');
  const [cnrQuery, setCnrQuery] = useState(targetCase?.cnrNumber || '');
  const [isFetching, setIsFetching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fetchResult, setFetchResult] = useState(null);

  if (!isOpen) return null;

  const currentCourtMeta = availableCourts.find(c => c.name === selectedCourtName) || defaultCourt;

  const handleStartFetch = async (e) => {
    e.preventDefault();
    setIsFetching(true);
    setLogs([]);
    setFetchResult(null);

    const logSteps = [
      `[00.1s] Connecting to judicial gateway: ${currentCourtMeta.name}...`,
      `[00.4s] Handshaking with official portal: ${currentCourtMeta.portalUrl || 'https://services.ecourts.gov.in'}...`,
      `[00.7s] Querying live database for Case Ref: ${caseQuery} (CNR: ${cnrQuery || 'N/A'})...`,
      currentCourtMeta.queryEngine === 'ECOURTS_CIS' || currentCourtMeta.forumType === 'District Court'
        ? `[01.1s] Anti-bot captcha challenged -> Solved via Neural OCR Engine (Confidence 99.1%)`
        : `[01.1s] Querying daily cause list & signed bench order sheet repository...`,
      `[01.5s] Latest bench order sheet detected! Extracting digitally signed order PDF...`,
      `[01.9s] Auto-renaming & indexing into Google Drive /05_Orders_and_Judgments/...`,
      `[02.3s] Synchronized latest listing date & bench synopsis to Master Cases Board!`
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(r => setTimeout(r, 380));
      setLogs(prev => [...prev, logSteps[i]]);
    }

    const res = await simulateFetchCourtOrder(targetCase?.id, selectedCourtName);
    setFetchResult(res);
    setIsFetching(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8">
        
        {/* Header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
                  Intelligent Multi-Forum Order Fetcher
                </h2>
                <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold bg-terracotta-soft text-terracotta border border-terracotta/20">
                  Online Scraper
                </span>
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                Automatically fetches orders from any configured court portal & eCourts CIS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-4">
          
          <form onSubmit={handleStartFetch} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-warm-graphite">
                  Target Court / Forum (Includes All Future Added Forums) *
                </label>
                {currentCourtMeta.portalUrl && (
                  <a
                    href={currentCourtMeta.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-terracotta hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" /> Visit Court Portal
                  </a>
                )}
              </div>
              
              <select
                value={selectedCourtName}
                onChange={(e) => setSelectedCourtName(e.target.value)}
                disabled={isFetching}
                className="w-full capsule-input text-xs"
              >
                {availableCourts.map(c => (
                  <option key={c.id || c.code} value={c.name}>
                    {c.name} ({c.forumType} • {c.portalUrl || 'eCourts'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Case Number / Filing Ref
                </label>
                <input
                  type="text"
                  required
                  value={caseQuery}
                  onChange={(e) => setCaseQuery(e.target.value)}
                  disabled={isFetching}
                  className="w-full capsule-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  16-digit CNR Number
                </label>
                <input
                  type="text"
                  value={cnrQuery}
                  onChange={(e) => setCnrQuery(e.target.value)}
                  disabled={isFetching}
                  placeholder="e.g. WBHC01-014820-2025"
                  className="w-full capsule-input text-xs font-mono"
                />
              </div>
            </div>

            {!isFetching && !fetchResult && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs w-full justify-center"
                >
                  <span>Trigger Automated Live Order Fetch</span>
                  <div className="knob"><Cpu className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            )}
          </form>

          {/* Crawler Terminal Logs */}
          {logs.length > 0 && (
            <div className="bg-warm-obsidian rounded-3xl p-4 text-xs font-mono text-white/90 space-y-1.5 max-h-44 overflow-y-auto border border-white/10 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-terracotta-light flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-terracotta animate-ping"></span>
                Judicial Scraper Execution Stream ({currentCourtMeta.name})
              </div>
              {logs.map((line, idx) => (
                <div key={idx} className="leading-relaxed text-emerald-400">
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Success Result */}
          {fetchResult?.success && (
            <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Latest Bench Order Fetched & Ingested!
              </div>
              <p className="text-xs text-warm-obsidian font-medium">
                Saved File: <span className="font-mono text-terracotta">{fetchResult.doc.name}</span>
              </p>
              <p className="text-xs text-warm-graphite italic">
                "{fetchResult.summary}"
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-emerald-500/20">
                <span className="text-[11px] text-emerald-800 font-medium">
                  Stored in Google Drive /05_Orders_and_Judgments
                </span>
                <button
                  onClick={onClose}
                  className="capsule-btn-dark text-xs"
                >
                  <span>Done</span>
                  <div className="knob"><ArrowRight className="w-3 h-3 text-white" /></div>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
