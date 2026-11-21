import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderTree, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Users2, 
  Tag, 
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
  const [sortBy, setSortBy] = useState('DATE'); // 'DATE' | 'RELEVANCE' | 'NAME'

  const filteredDocs = caseDocs
    .filter(doc => {
      const matchesFolder = selectedFolder === 'ALL' || doc.folder === selectedFolder;
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFolder && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'DATE') {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
      if (sortBy === 'RELEVANCE') {
        return (b.relevance || 0) - (a.relevance || 0);
      }
      return a.name.localeCompare(b.name);
    });

  const copyDocLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast('File link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Search Bar */}
      <div className="bg-white p-4 rounded-m3-xl shadow-m3-1 border border-neutral-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search indexed files by keyword, tag, or uploader..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary transition-all"
            />
          </div>

          {/* Sort & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-700"
            >
              <option value="DATE">Date (Latest First)</option>
              <option value="RELEVANCE">Relevance & Match Score</option>
              <option value="NAME">File Name</option>
            </select>

            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 bg-material-primary hover:bg-blue-700 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1 transition-all"
            >
              <DownloadCloud className="w-3.5 h-3.5" /> Upload File
            </button>
            <button
              onClick={onOpenShareBrief}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Brief
            </button>
          </div>

        </div>

        {/* Folder Pills Bar (from Google Drive template) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-neutral-100">
          <button
            onClick={() => setSelectedFolder('ALL')}
            className={`px-3 py-1 rounded-m3-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedFolder === 'ALL'
                ? 'bg-material-primary text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Folders ({caseDocs.length})
          </button>

          {systemConfig.driveFolderTemplate.map(f => {
            const count = caseDocs.filter(d => d.folder === f.name).length;

            return (
              <button
                key={f.id}
                onClick={() => setSelectedFolder(f.name)}
                className={`px-3 py-1 rounded-m3-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFolder === f.name
                    ? 'bg-material-primary text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <span>{f.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedFolder === f.name ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
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
          <div className="bg-white p-12 text-center rounded-m3-xl border border-neutral-200 text-neutral-400">
            <FileText className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">No documents in this folder</p>
            <p className="text-xs">Upload new client documents, pleadings, or draft petitions.</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-m3-xl border border-neutral-200 p-4 hover:border-blue-300 hover:shadow-m3-1 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              {/* File Metadata */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 break-all hover:text-material-primary cursor-pointer">
                    {doc.name}
                  </span>
                  <span className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                    {doc.fileSize}
                  </span>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {doc.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                  <span className="font-mono text-[11px] text-neutral-600">
                    📁 {targetCase?.driveFolderPath}/{doc.folder}/
                  </span>
                  <span>•</span>
                  <span>Uploaded by: <strong className="text-neutral-700">{doc.uploadedBy}</strong></span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {doc.tags?.map((t, i) => (
                    <span key={i} className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                  {doc.relevance && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" /> {doc.relevance}% Relevance
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                
                {/* Live Co-editing Button for Google Docs */}
                {doc.coEditUrl && (
                  <a
                    href={doc.coEditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-m3-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                    title="Open live Google Doc for simultaneous co-editing"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Live Co-Edit</span>
                  </a>
                )}

                <a
                  href={doc.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-m3-md border border-neutral-300 hover:bg-neutral-100 text-xs font-medium text-neutral-700 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> View in Drive
                </a>

                <button
                  onClick={() => copyDocLink(doc.driveUrl)}
                  className="p-1.5 rounded-m3-md border border-neutral-200 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                  title="Copy Direct Share Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
