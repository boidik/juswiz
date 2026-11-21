import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, FileText, CheckCircle2, Tag, Sparkles, FolderOpen } from 'lucide-react';

export const FileUploadModal = ({ isOpen, onClose, targetCaseId }) => {
  const { systemConfig, uploadDocument } = useApp();

  const [file, setFile] = useState(null);
  const [folder, setFolder] = useState('01_Client_Documents');
  const [category, setCategory] = useState('Client Document');
  const [party, setParty] = useState('Petitioner');
  const [customDesc, setCustomDesc] = useState('');
  const [enableCoEdit, setEnableCoEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Compute live auto-renamed preview
  const datePrefix = new Date().toISOString().split('T')[0];
  const extension = file ? file.name.split('.').pop() : 'pdf';
  const cleanDesc = (customDesc || (file ? file.name.split('.')[0] : 'DocumentName')).replace(/[^a-zA-Z0-9_-]/g, '_');
  const categoryTag = category.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
  const autoRenamedPreview = `${datePrefix}_${categoryTag}_${party}_${cleanDesc}_v1.${extension}`;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!customDesc) {
        setCustomDesc(selected.name.split('.')[0].slice(0, 30));
      }
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    if (val.includes('Client')) setFolder('01_Client_Documents');
    else if (val.includes('Opposite') || val.includes('Pleading')) setFolder('02_Opposite_Party_Pleadings');
    else if (val.includes('Draft')) {
      setFolder('03_Drafts_In_Progress');
      setEnableCoEdit(true);
    }
    else if (val.includes('Final') || val.includes('Filing')) setFolder('04_Final_Court_Filings');
    else if (val.includes('Order') || val.includes('Judgment')) setFolder('05_Orders_and_Judgments');
    else if (val.includes('Brief')) setFolder('06_Conference_Briefs');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file && !customDesc) return;

    setIsUploading(true);

    const dummyFile = file || {
      name: `${cleanDesc}.pdf`,
      size: 1024 * 1024 * 2.4,
      type: 'application/pdf'
    };

    setTimeout(() => {
      uploadDocument({
        caseId: targetCaseId,
        originalFile: dummyFile,
        category,
        folder,
        party,
        customDesc
      });

      setIsUploading(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-sky-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-material-primary text-white shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">Upload Litigation Document</h2>
              <p className="text-xs text-neutral-500">
                Staff Console • Automatic intelligent renaming, classification, and Google Drive indexing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-200/60 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Select Document File (PDF, DOCX, Scanned Evidence) *
            </label>
            <div className="border-2 border-dashed border-neutral-300 rounded-m3-lg p-5 text-center hover:border-material-primary hover:bg-blue-50/30 transition-all cursor-pointer">
              <input
                type="file"
                id="doc-upload-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="doc-upload-input" className="cursor-pointer space-y-1 block">
                <UploadCloud className="w-8 h-8 text-material-primary mx-auto stroke-1" />
                <p className="text-xs font-semibold text-neutral-800">
                  {file ? file.name : 'Click to browse or drop document here'}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Supports PDF, DOCX, Google Docs formats up to 50MB
                </p>
              </label>
            </div>
          </div>

          {/* Classification & Folder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Document Classification *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
              >
                <option value="Client Document">Client Document / Evidence</option>
                <option value="Opposite Party Pleadings">Opposite Party Pleading / Notice</option>
                <option value="Draft Pleadings">Draft Pleadings (Collaborative Doc)</option>
                <option value="Final Court Filing">Final Signed & E-Filed Petition</option>
                <option value="Court Order">Court Order / Judgment</option>
                <option value="Conference Brief">Compiled Senior Brief</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Target Google Drive Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
              >
                {systemConfig.driveFolderTemplate.map(f => (
                  <option key={f.id} value={f.name}>📁 {f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Party & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Originating Party
              </label>
              <select
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              >
                <option value="Petitioner">Petitioner / Client</option>
                <option value="Respondent">Respondent / State</option>
                <option value="OppositeParty">Opposite Party</option>
                <option value="Court">Hon'ble Bench / Registrar</option>
                <option value="ThirdParty">Intervener / Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Short Description / Tag
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="e.g. SupplementaryAffidavit"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              />
            </div>
          </div>

          {/* Co-Editing Google Doc Toggle */}
          <div className="p-3 bg-neutral-50 rounded-m3-md border border-neutral-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-800">
                Coordinated Live Co-Editing (Google Docs)
              </p>
              <p className="text-[11px] text-neutral-500">
                Generate real-time editing link for multiple team members to draft simultaneously.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enableCoEdit}
              onChange={(e) => setEnableCoEdit(e.target.checked)}
              className="w-4 h-4 text-material-primary rounded cursor-pointer"
            />
          </div>

          {/* Automated Renaming Live Preview */}
          <div className="p-3 bg-blue-50/70 rounded-m3-lg border border-blue-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Automated Standard Naming Formula Preview
            </div>
            <p className="font-mono text-xs text-blue-950 font-semibold break-all bg-white p-2 rounded border border-blue-200">
              {autoRenamedPreview}
            </p>
            <p className="text-[10px] text-blue-700 mt-1">
              Formula: [YYYY-MM-DD]_[Category]_[Party]_[Description]_v1.[ext] • Fully indexed for instant search.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-m3-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 bg-material-primary hover:bg-blue-700 text-white text-xs font-medium rounded-m3-full shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isUploading ? 'Uploading & Indexing...' : 'Upload & Rename Automatically'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
