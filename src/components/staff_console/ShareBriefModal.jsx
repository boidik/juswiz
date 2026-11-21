import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Mail, Link2, Copy, Check, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const ShareBriefModal = ({ isOpen, onClose, targetCase, caseDocuments }) => {
  const { showToast, currentUser } = useApp();

  const [recipientRole, setRecipientRole] = useState('Senior Advocate');
  const [recipientEmail, setRecipientEmail] = useState(
    targetCase?.seniorAdvocate?.includes('@') ? targetCase.seniorAdvocate : targetCase?.clientEmail || 'senior.counsel@calbar.in'
  );
  const [selectedDocIds, setSelectedDocIds] = useState(
    caseDocuments.map(d => d.id)
  );

  const [subject, setSubject] = useState(
    `Brief for Consultation & Opinion: ${targetCase?.caseNumber} (${targetCase?.title}) before ${targetCase?.courtName}`
  );

  const [mailBody, setMailBody] = useState(
    `Respected Senior Counsel,\n\nPlease find attached the comprehensive litigation brief and index of relevant pleadings in the above-captioned matter scheduled for hearing on ${targetCase?.nextHearingDate || 'the upcoming cause list'} before ${targetCase?.bench || 'the Hon\'ble Bench'}.\n\nKey documents enclosed:\n- Writ Petition & Stamped Court Filings\n- Latest Interim Bench Order\n- Chronological List of Dates and Statutory Points\n\nGoogle Drive Secure Case Bundle Access Link:\n${targetCase?.driveFolderUrl}\n\nPlease let us know your availability for a pre-hearing briefing conference on GMeet.\n\nWarm regards,\n${currentUser?.name || 'Litigation Counsel'}\n${currentUser?.designation || 'Associate'}`
  );

  const [isSent, setIsSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const toggleDoc = (docId) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSendMail = (e) => {
    e.preventDefault();
    setIsSent(true);
    showToast(`Brief package dispatched via Gmail to ${recipientEmail}!`);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  const handleCopyLink = () => {
    const bundleLink = `${targetCase?.driveFolderUrl}?brief_auth=token_${Date.now()}`;
    navigator.clipboard.writeText(bundleLink);
    setCopiedLink(true);
    showToast('Secure Google Drive case brief link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-warm-obsidian font-display tracking-tight">
              Share Case Brief & Pleadings
            </h2>
            <p className="text-xs text-warm-muted mt-0.5">
              Bundle selective Drive files and dispatch via Gmail or copyable link
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendMail} className="p-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Recipient Role
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full capsule-input text-xs"
              >
                <option value="Senior Advocate">Senior Advocate</option>
                <option value="Client">Client / Corporate MD</option>
                <option value="Briefing Counsel">Briefing Counsel</option>
                <option value="Opposite Side">Opposite Counsel</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-warm-graphite mb-1">
                Recipient Email Address *
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full capsule-input text-xs font-medium"
              />
            </div>
          </div>

          {/* Checklist of files */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-warm-graphite">
                Select Particular Files to Bundle into Brief ({selectedDocIds.length} of {caseDocuments.length})
              </label>
              <span className="text-[11px] text-warm-muted">Direct from Google Drive</span>
            </div>

            <div className="max-h-36 overflow-y-auto border border-warm-borderSubtle rounded-2xl divide-y divide-warm-borderSubtle/50 bg-white/60 p-1">
              {caseDocuments.map(d => (
                <label
                  key={d.id}
                  className="flex items-center gap-2 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocIds.includes(d.id)}
                    onChange={() => toggleDoc(d.id)}
                    className="w-3.5 h-3.5 text-terracotta rounded accent-terracotta"
                  />
                  <FileText className="w-3.5 h-3.5 text-warm-muted shrink-0" />
                  <span className="font-mono text-warm-obsidian truncate flex-1">{d.name}</span>
                  <span className="text-[10px] text-warm-muted shrink-0">{d.category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1">
              Email Subject Line (Editable at All Times) *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full capsule-input text-xs font-semibold text-warm-obsidian"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1">
              Email Message Body (Editable at All Times) *
            </label>
            <textarea
              rows="5"
              required
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              className="w-full rounded-2xl p-3 text-xs bg-white/80 border border-warm-borderSubtle text-warm-graphite focus:outline-none focus:border-terracotta leading-relaxed"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-warm-borderSubtle/60">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white hover:bg-warm-sand/40 border border-warm-borderSubtle text-xs font-medium text-warm-graphite transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-terracotta" />}
              {copiedLink ? 'Link Copied!' : 'Copy Drive Share Link'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-warm-muted hover:text-warm-obsidian font-medium px-3"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSent}
                className="capsule-btn-dark text-xs disabled:opacity-50"
              >
                <span>{isSent ? 'Dispatched' : 'Dispatch via Gmail'}</span>
                <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
