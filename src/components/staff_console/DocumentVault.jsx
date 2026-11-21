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
  Edit3
} from 'lucide-react';

export const DocumentVault = ({ targetCaseId, onOpenUpload, onOpenShareBrief }) => {
  const { documents, systemConfig, cases, showToast } = useApp();

  const caseDocs = documents.filter(d => d.caseId === targetCaseId);
  const targetCase = cases.find(c => c.id === targetCaseId);

  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DATE');

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

  return (
    <div className="space-y-4">
      
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

          {systemConfig.driveFolderTemplate?.map(f => {
            const count = caseDocs.filter(d => d.folder === f.name).length;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.name)}
                className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFolder === f.name
                    ? 'bg-warm-obsidian text-white shadow-xs'
                    : 'bg-white/70 text-warm-graphite hover:bg-white'
                }`}
              >
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
          <div className="glass-panel rounded-4xl p-12 text-center text-warm-muted space-y-1">
            <FileText className="w-10 h-10 mx-auto stroke-1 text-warm-sand" />
            <p className="text-sm font-semibold text-warm-obsidian font-display">No files in this folder</p>
            <p className="text-xs">Upload new client pleadings, evidence, or draft petitions.</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="glass-panel hover:glass-panel-elevated rounded-3xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              {/* File Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-warm-obsidian break-all hover:text-terracotta cursor-pointer">
                    {doc.name}
                  </span>
                  <span className="text-[10px] font-medium bg-warm-sand/50 text-warm-graphite px-2.5 py-0.5 rounded-pill">
                    {doc.fileSize}
                  </span>
                  <span className="text-[10px] font-semibold bg-terracotta-soft text-terracotta border border-terracotta/20 px-2.5 py-0.5 rounded-pill">
                    {doc.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-warm-muted">
                  <span className="font-mono text-[11px] text-warm-graphite">
                    📁 {targetCase?.driveFolderPath}/{doc.folder}/
                  </span>
                  <span>•</span>
                  <span>Uploaded by: <strong className="text-warm-obsidian">{doc.uploadedBy}</strong></span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
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
              <div className="flex items-center gap-2 shrink-0">
                
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

                <a
                  href={doc.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-pill border border-warm-borderSubtle hover:bg-white text-xs font-medium text-warm-graphite flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-terracotta" /> View in Drive
                </a>

                <button
                  onClick={() => copyDocLink(doc.driveUrl)}
                  className="p-2 rounded-full border border-warm-borderSubtle hover:bg-white text-warm-muted hover:text-warm-obsidian transition-colors"
                  title="Copy Direct Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
