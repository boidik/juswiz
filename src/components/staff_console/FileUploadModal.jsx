import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, FileText, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !customDesc) return;

    setIsUploading(true);

    const fileToUpload = file || new File(
      [new Blob(['Litigation filing content'], { type: 'application/pdf' })], 
      `${cleanDesc}.pdf`, 
      { type: 'application/pdf' }
    );

    try {
      await uploadDocument({
        caseId: targetCaseId,
        originalFile: fileToUpload,
        category,
        folder,
        party,
        customDesc
      });
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl sm:rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-2 sm:my-8 max-h-[94vh] sm:max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-7 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-warm-obsidian font-display tracking-tight">
              Upload Litigation Document
            </h2>
            <p className="text-xs text-warm-muted mt-0.5">
              Automated standard renaming & Google Drive folder filing
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-4 overflow-y-auto flex-1">
          
          {/* File Dropzone (Warm minimalist aesthetic) */}
          <div className="border-2 border-dashed border-warm-borderSubtle hover:border-terracotta rounded-3xl p-6 text-center bg-white/50 hover:bg-white/80 transition-all cursor-pointer">
            <input
              type="file"
              id="doc-upload-input"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="doc-upload-input" className="cursor-pointer space-y-1 block">
              <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center mx-auto shadow-amber-glow">
                <UploadCloud className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-warm-obsidian pt-1">
                {file ? file.name : 'Click to select legal document file'}
              </p>
              <p className="text-[11px] text-warm-muted">
                Supports PDF, DOCX, court filings up to 50MB
              </p>
            </label>
          </div>

          {/* Classification & Folder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Classification *
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full capsule-input text-xs"
              >
                <option value="Client Document">Client Document / Evidence</option>
                <option value="Opposite Party Pleadings">Opposite Party Pleading</option>
                <option value="Draft Pleadings">Draft Pleadings (Collaborative)</option>
                <option value="Final Court Filing">Final Signed & E-Filed</option>
                <option value="Court Order">Court Order / Judgment</option>
                <option value="Conference Brief">Compiled Senior Brief</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Drive Subdirectory
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full capsule-input text-xs"
              >
                {systemConfig.driveFolderTemplate?.map(f => (
                  <option key={f.id} value={f.name}>📁 {f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Party & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Originating Party
              </label>
              <select
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="w-full capsule-input text-xs"
              >
                <option value="Petitioner">Petitioner / Client</option>
                <option value="Respondent">Respondent / State</option>
                <option value="OppositeParty">Opposite Party</option>
                <option value="Court">Hon'ble Bench / Registrar</option>
                <option value="ThirdParty">Intervener / Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Description Tag
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="e.g. SupplementaryAffidavit"
                className="w-full capsule-input text-xs"
              />
            </div>
          </div>

          {/* Automated Renaming Live Preview (Pinterest minimal box) */}
          <div className="p-3.5 bg-white/80 rounded-2xl border border-warm-borderSubtle space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-terracotta">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              Automated Standard Renaming Formula
            </div>
            <p className="font-mono text-xs text-warm-obsidian font-semibold break-all bg-warm-sand/30 p-2 rounded-xl border border-warm-borderSubtle">
              {autoRenamedPreview}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-warm-borderSubtle/60">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-warm-muted hover:text-warm-obsidian font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="capsule-btn-dark text-xs disabled:opacity-50"
            >
              <span>{isUploading ? 'Uploading...' : 'Save & Index to Drive'}</span>
              <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
