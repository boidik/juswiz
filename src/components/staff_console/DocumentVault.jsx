import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderTree, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  ArrowUpDown, 
  DownloadCloud, 
  Sparkles,
  Share2,
  Edit3,
  Gavel,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { OrderReaderModal } from './OrderReaderModal';
import { getExactFileDriveUrl } from '../../services/googleWorkspace';

export const DocumentVault = ({ 
  caseId, 
  targetCaseId, 
  driveFolderUrl, 
  onOpenUpload, 
  onOpenShareBrief,
  onOpenOrderFetcher 
}) => {
  const { documents, systemConfig, cases, showToast } = useApp();

  const activeCaseId = targetCaseId || caseId;
  const caseDocs = documents.filter(d => d.caseId === activeCaseId);
  const targetCase = cases.find(c => c.id === activeCaseId);

  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DATE');
  const [readingOrder, setReadingOrder] = useState(null);

  const filteredDocs = caseDocs
    .filter(doc => {
      const matchesFolder = selectedFolder === 'ALL' || doc.folder === selectedFolder;
      const matchesSearch = 
        (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.originalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFolder && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'DATE') {
        return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }
      if (sortBy === 'RELEVANCE') {
        return (b.relevance || 0) - (a.relevance || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });

  const copyDocLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast('File link copied to clipboard!');
  };

  const orderDocs = caseDocs.filter(d => 
    d.folder === '05_Orders_and_Judgments' || 
    d.category === 'Court Order' || 
    (d.tags && (d.tags.includes('Auto-Fetched') || d.tags.includes('Verified Bench Order')))
  );

  return (
    <div className="space-y-4">

      {/* Auto-Fetched Court Orders Quick Panel */}
      {orderDocs.length > 0 && (
        <div className="glass-panel-elevated rounded-3xl p-5 border border-terracotta/30 bg-gradient-to-r from-amber-500/10 via-white/85 to-terracotta/10 shadow-glass space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-warm-obsidian font-display tracking-tight">
                    Official Bench Orders & Judgments
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta text-white shadow-xs">
                    {orderDocs.length} Auto-Fetched
                  </span>
                </div>
                <p className="text-xs text-warm-muted mt-0.5">
                  Synchronized with official eCourts / High Court cause list records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFolder('05_Orders_and_Judgments')}
                className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 ${
                  selectedFolder === '05_Orders_and_Judgments'
                    ? 'bg-warm-obsidian text-white'
                    : 'bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-terracotta" />
                <span>Filter to Orders ({orderDocs.length})</span>
              </button>

              <button
                onClick={() => setReadingOrder(orderDocs[0])}
                className="px-3.5 py-1.5 rounded-pill bg-terracotta text-white hover:bg-terracotta/90 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Latest Order</span>
              </button>
            </div>
          </div>

          {/* Latest Order Preview */}
          {orderDocs[0] && (
            <div 
              onClick={() => setReadingOrder(orderDocs[0])}
              className="p-3.5 rounded-2xl bg-white/95 border border-terracotta/20 text-xs text-warm-obsidian cursor-pointer hover:border-terracotta transition-all shadow-xs"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-warm-muted mb-1">
                <span className="font-bold text-warm-obsidian">{orderDocs[0].name}</span>
                <span>Hearing: {orderDocs[0].hearingDate || 'Recent'}</span>
              </div>
              <p className="italic font-sans text-warm-graphite font-medium">
                "{orderDocs[0].summary || orderDocs[0].orderText || targetCase?.lastOrder}"
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Top Filter & Search Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Capsule Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-warm-muted absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search indexed files, tags, uploader..."
              className="w-full pl-9 pr-3 py-1.5 text-xs capsule-input"
            />
          </div>

          {/* Sort & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="capsule-input py-1.5 text-xs text-warm-graphite font-medium cursor-pointer"
            >
              <option value="DATE">Date (Latest)</option>
              <option value="RELEVANCE">Relevance Score</option>
              <option value="NAME">File Name</option>
            </select>

            <button
              onClick={onOpenUpload}
              className="capsule-btn-dark text-xs"
            >
              <span>Upload Document</span>
              <div className="knob"><DownloadCloud className="w-3.5 h-3.5 text-white" /></div>
            </button>

            {onOpenOrderFetcher && (
              <button
                onClick={onOpenOrderFetcher}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-warm-sand/80 hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
                title="Open Judicial Database Gateway & Order Ingestion"
              >
                <Gavel className="w-3.5 h-3.5 text-terracotta" /> Court Database & Ingest
              </button>
            )}

            <a
              href={targetCase?.driveFolderUrl || driveFolderUrl || 'https://drive.google.com/drive/my-drive'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-white hover:bg-warm-sand/50 text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
              title="Open Case Google Drive Folder"
            >
              <FolderTree className="w-3.5 h-3.5 text-terracotta" /> Open in Drive
            </a>

            <button
              onClick={onOpenShareBrief}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white hover:bg-warm-sand/40 text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-terracotta" /> Share Brief
            </button>
          </div>

        </div>

        {/* Folder Pills Bar (from Google Drive template) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-warm-borderSubtle/60">
          <button
            onClick={() => setSelectedFolder('ALL')}
            className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFolder === 'ALL'
                ? 'bg-warm-obsidian text-white shadow-xs'
                : 'bg-white/70 text-warm-graphite hover:bg-white'
            }`}
          >
            All Folders ({caseDocs.length})
          </button>

          {orderDocs.length > 0 && (
            <button
              onClick={() => setSelectedFolder('05_Orders_and_Judgments')}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedFolder === '05_Orders_and_Judgments'
                  ? 'bg-terracotta text-white shadow-xs'
                  : 'bg-terracotta-soft text-terracotta hover:bg-terracotta/20 border border-terracotta/30'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>⚖️ Auto-Fetched Orders</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedFolder === '05_Orders_and_Judgments' ? 'bg-white text-terracotta' : 'bg-terracotta text-white'
              }`}>
                {orderDocs.length}
              </span>
            </button>
          )}

          {systemConfig.driveFolderTemplate?.map(f => {
            const count = caseDocs.filter(d => d.folder === f.name).length;
            const isOrdersFolder = f.name === '05_Orders_and_Judgments';

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.name)}
                className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFolder === f.name
                    ? 'bg-warm-obsidian text-white shadow-xs'
                    : isOrdersFolder && count > 0
                    ? 'bg-terracotta-soft text-terracotta hover:bg-terracotta/20 border border-terracotta/30'
                    : 'bg-white/70 text-warm-graphite hover:bg-white'
                }`}
              >
                {isOrdersFolder && <Gavel className="w-3 h-3 text-terracotta" />}
                <span>{f.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedFolder === f.name ? 'bg-white/20 text-white' : 'bg-warm-sand text-warm-obsidian'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Items List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="glass-panel rounded-4xl p-12 text-center text-warm-muted space-y-3">
            {selectedFolder === '05_Orders_and_Judgments' ? (
              <>
                <Gavel className="w-12 h-12 mx-auto stroke-1 text-terracotta animate-pulse" />
                <p className="text-sm font-semibold text-warm-obsidian font-display">No Bench Orders in this Dossier Yet</p>
                <p className="text-xs text-warm-muted max-w-md mx-auto">
                  Automatically query and ingest daily cause lists and signed orders directly from the court portal.
                </p>
                {onOpenOrderFetcher && (
                  <div className="pt-2">
                    <button
                      onClick={onOpenOrderFetcher}
                      className="capsule-btn-dark text-xs inline-flex"
                    >
                      <span>Fetch Live Court Order Now</span>
                      <div className="knob"><Gavel className="w-3.5 h-3.5 text-white" /></div>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <FileText className="w-10 h-10 mx-auto stroke-1 text-warm-sand" />
                <p className="text-sm font-semibold text-warm-obsidian font-display">No files in this folder</p>
                <p className="text-xs">Upload new client pleadings, evidence, or draft petitions.</p>
              </>
            )}
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isCourtOrder = 
              doc.category === 'Court Order' || 
              doc.folder === '05_Orders_and_Judgments' || 
              (doc.tags && (doc.tags.includes('Auto-Fetched') || doc.tags.includes('Verified Bench Order')));
            const orderSnippet = doc.summary || doc.orderText || (isCourtOrder ? targetCase?.lastOrder : null);

            return (
              <div
                key={doc.id}
                className={`rounded-3xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  isCourtOrder 
                    ? 'glass-panel-elevated border-l-4 border-l-terracotta bg-white/85 shadow-glass' 
                    : 'glass-panel hover:glass-panel-elevated'
                }`}
              >
                
                {/* File Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isCourtOrder && (
                      <span className="text-[10px] font-bold bg-terracotta text-white px-2.5 py-0.5 rounded-pill flex items-center gap-1 shadow-xs">
                        <Gavel className="w-3 h-3 text-white" /> Bench Order Sheet
                      </span>
                    )}
                    <span 
                      onClick={() => isCourtOrder && setReadingOrder(doc)}
                      className={`font-mono text-xs font-bold text-warm-obsidian break-all cursor-pointer ${
                        isCourtOrder ? 'hover:text-terracotta underline decoration-terracotta/40' : 'hover:text-terracotta'
                      }`}
                    >
                      {doc.name || doc.fileName || doc.originalName || 'Document.pdf'}
                    </span>
                    <span className="text-[10px] font-medium bg-warm-sand/50 text-warm-graphite px-2.5 py-0.5 rounded-pill">
                      {doc.fileSize || '1.4 MB'}
                    </span>
                    <span className="text-[10px] font-semibold bg-terracotta-soft text-terracotta border border-terracotta/20 px-2.5 py-0.5 rounded-pill">
                      {doc.category || 'Court Order'}
                    </span>
                  </div>

                  {/* Order Synopsis Snippet if court order */}
                  {orderSnippet && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-warm-obsidian italic font-sans leading-relaxed">
                      "{orderSnippet}"
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-warm-muted">
                    <span className="font-mono text-[11px] text-warm-graphite">
                      📁 {targetCase?.driveFolderPath || '/Dossier'}/{doc.folder || '05_Orders_and_Judgments'}/
                    </span>
                    <span>•</span>
                    <span>Ingested by: <strong className="text-warm-obsidian">{doc.uploadedBy || 'Intelligent Fetcher'}</strong></span>
                    <span>•</span>
                    <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {doc.tags?.map((t, i) => (
                      <span key={i} className="text-[10px] font-medium bg-white/80 text-warm-graphite px-2.5 py-0.5 rounded-pill border border-warm-borderSubtle">
                        #{t}
                      </span>
                    ))}
                    {doc.relevance && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> {doc.relevance}% Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  
                  {/* Read Order Synopsis Button */}
                  {isCourtOrder && (
                    <button
                      onClick={() => setReadingOrder(doc)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-terracotta text-white hover:bg-terracotta/90 text-xs font-semibold transition-all shadow-xs"
                      title="Read full Bench Order Sheet & Directions"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Order</span>
                    </button>
                  )}

                  {/* Live Co-Edit Google Docs */}
                  {doc.coEditUrl && (
                    <a
                      href={doc.coEditUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-terracotta-soft hover:bg-terracotta text-terracotta hover:text-white border border-terracotta/30 text-xs font-semibold transition-all shadow-xs"
                      title="Open live Google Doc for team co-editing"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Live Co-Edit</span>
                    </a>
                  )}

                  {/* Direct Exact File in Google Drive */}
                  <a
                    href={getExactFileDriveUrl(doc)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-pill border border-warm-borderSubtle hover:bg-white text-xs font-semibold text-warm-graphite flex items-center gap-1.5 transition-colors shadow-xs"
                    title={`Open exact file in Google Drive: ${doc.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-terracotta" />
                    <span>Exact File in Drive</span>
                  </a>

                  <button
                    onClick={() => copyDocLink(getExactFileDriveUrl(doc))}
                    className="p-2 rounded-full border border-warm-borderSubtle hover:bg-white text-warm-muted hover:text-warm-obsidian transition-colors"
                    title="Copy Exact File Share Link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* In-App Order Reader Modal */}
      <OrderReaderModal
        isOpen={Boolean(readingOrder)}
        onClose={() => setReadingOrder(null)}
        order={readingOrder}
        caseData={targetCase}
        onOpenIngest={onOpenOrderFetcher}
      />

    </div>
  );
};
