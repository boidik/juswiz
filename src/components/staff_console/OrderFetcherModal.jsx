import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Cpu, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck, DownloadCloud } from 'lucide-react';

export const OrderFetcherModal = ({ isOpen, onClose, targetCase }) => {
  const { simulateFetchCourtOrder, systemConfig } = useApp();

  const [courtSource, setCourtSource] = useState(targetCase?.courtName || 'Calcutta High Court');
  const [caseQuery, setCaseQuery] = useState(targetCase?.caseNumber || '');
  const [cnrQuery, setCnrQuery] = useState(targetCase?.cnrNumber || '');
  const [isFetching, setIsFetching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fetchResult, setFetchResult] = useState(null);

  if (!isOpen) return null;

  const handleStartFetch = async (e) => {
    e.preventDefault();
    setIsFetching(true);
    setLogs([]);
    setFetchResult(null);

    const logSteps = [
      `[00.1s] Connecting to judicial portal gateway: ${courtSource}...`,
      `[00.4s] Initiating headless browser session & TLS handshake...`,
      `[00.8s] Submitting query for Case Ref: ${caseQuery} (CNR: ${cnrQuery})...`,
      courtSource.includes('District') || courtSource.includes('eCourts') 
        ? `[01.2s] Detecting eCourts audio/visual captcha -> Solving via Tesseract OCR... Success (Confidence 98.4%)`
        : `[01.2s] Querying cause list and daily bench proceedings table...`,
      `[01.6s] Latest daily bench order detected! Extracting digitally signed PDF...`,
      `[02.1s] Uploading to linked Google Drive /05_Orders_and_Judgments/...`,
      `[02.4s] Parsing bench synopsis and updating Master Cases board!`
    ];

    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setLogs(prev => [...prev, logSteps[i]]);
    }

    const res = await simulateFetchCourtOrder(targetCase.id, courtSource);
    setFetchResult(res);
    setIsFetching(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-blue-600/60 text-white shadow-xs border border-white/20">
              <Cpu className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Intelligent Multi-Court Order Fetcher</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                  Automated OCR
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Pulls daily orders across Calcutta HC, Supreme Court, District Courts & Tribunals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <form onSubmit={handleStartFetch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Target Adjudicating Body / Portal *
              </label>
              <select
                value={courtSource}
                onChange={(e) => setCourtSource(e.target.value)}
                disabled={isFetching}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white"
              >
                <option value="Calcutta High Court (Appellate Side)">Calcutta High Court (Appellate Side)</option>
                <option value="Calcutta High Court (Original Side)">Calcutta High Court (Original Side)</option>
                <option value="Supreme Court of India (SCI Portal)">Supreme Court of India (SCI Portal)</option>
                <option value="District Court (eCourts CIS Engine)">District Court (eCourts CIS Engine with Captcha OCR)</option>
                <option value="NCLT Kolkata Bench">NCLT Kolkata Bench (Tribunal Portal)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Case Number / Filing Ref
                </label>
                <input
                  type="text"
                  required
                  value={caseQuery}
                  onChange={(e) => setCaseQuery(e.target.value)}
                  disabled={isFetching}
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  16-digit CNR Number
                </label>
                <input
                  type="text"
                  value={cnrQuery}
                  onChange={(e) => setCnrQuery(e.target.value)}
                  disabled={isFetching}
                  placeholder="e.g. WBHC01-014820-2025"
                  className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-mono"
                />
              </div>
            </div>

            {!isFetching && !fetchResult && (
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Cpu className="w-4 h-4" /> Trigger Automated Live Order Fetch
              </button>
            )}
          </form>

          {/* Real-time Crawler Execution Terminal */}
          {logs.length > 0 && (
            <div className="bg-neutral-900 rounded-m3-xl p-3.5 text-xs font-mono text-neutral-200 space-y-1.5 max-h-48 overflow-y-auto border border-neutral-800 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1.5 pb-1 border-b border-neutral-800">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                Crawler Pipeline Log Console
              </div>
              {logs.map((line, idx) => (
                <div key={idx} className="leading-relaxed text-emerald-400">
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Success State */}
          {fetchResult?.success && (
            <div className="p-4 bg-emerald-50 rounded-m3-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Latest Bench Order Fetched & Ingested!
              </div>
              <p className="text-xs text-neutral-700 font-medium">
                Saved File: <span className="font-mono text-blue-900">{fetchResult.doc.name}</span>
              </p>
              <p className="text-xs text-neutral-600 italic">
                Summary: "{fetchResult.summary}"
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-emerald-200">
                <span className="text-[11px] text-emerald-700 font-medium">
                  Stored in Google Drive /05_Orders_and_Judgments
                </span>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-medium hover:bg-emerald-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
