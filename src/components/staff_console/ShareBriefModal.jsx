import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Mail, Link2, Copy, Check, FileText, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export const ShareBriefModal = ({ isOpen, onClose, targetCase, caseDocuments }) => {
  const { showToast, currentUser, systemConfig } = useApp();

  const [recipientRole, setRecipientRole] = useState('Senior Advocate');
  const [recipientEmail, setRecipientEmail] = useState(
    targetCase?.seniorAdvocate?.includes('@') ? targetCase.seniorAdvocate : targetCase?.clientEmail || 'senior.counsel@bar.in'
  );
  const [selectedDocIds, setSelectedDocIds] = useState(
    (caseDocuments || []).map(d => d.id)
  );

  // Use dynamic template from system config
  const defaultSubject = (systemConfig.emailTemplates?.subjectTemplate || "Brief for Consultation: {case_number} ({case_title}) before {court_name}")
    .replace('{case_number}', targetCase?.caseNumber || '')
    .replace('{case_title}', targetCase?.title || '')
    .replace('{court_name}', targetCase?.courtName || '');

  const [subject, setSubject] = useState(defaultSubject);

  const defaultBody = (systemConfig.emailTemplates?.bodyTemplate || `Respected Senior Counsel / Client,\n\nPlease find enclosed the litigation brief and indexed pleadings in the matter scheduled for hearing on {next_date} before {bench_name}.\n\nGoogle Drive Case Dossier Access Link:\n{drive_link}\n\nPlease let us know your availability for a pre-hearing briefing conference on Google Meet.\n\nWarm regards,\n{lead_counsel}\n{firm_name}`)
    .replace('{next_date}', targetCase?.nextHearingDate || 'the upcoming cause list')
    .replace('{bench_name}', targetCase?.bench || 'the Hon\'ble Bench')
    .replace('{drive_link}', targetCase?.driveFolderUrl || 'Google Drive Folder')
    .replace('{lead_counsel}', currentUser?.name || targetCase?.leadCounsel || 'Litigation Counsel')
    .replace('{firm_name}', systemConfig.firmBranding?.firmName || 'JurisFlow Practice');

  const [mailBody, setMailBody] = useState(defaultBody);

  const [isSent, setIsSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const toggleDoc = (docId) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  // Build Real Gmail Web Compose URL
  const buildGmailComposeUrl = () => {
    const baseUrl = "https://mail.google.com/mail/?view=cm&fs=1";
    const toParam = `&to=${encodeURIComponent(recipientEmail)}`;
    const suParam = `&su=${encodeURIComponent(subject)}`;
    const bodyParam = `&body=${encodeURIComponent(mailBody)}`;
    return `${baseUrl}${toParam}${suParam}${bodyParam}`;
  };

  // Build Native Mailto URL
  const buildMailtoUrl = () => {
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
  };

  const handleSendViaGmail = (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      showToast('Please specify a recipient email address.', 'error');
      return;
    }

    const gmailUrl = buildGmailComposeUrl();
    
    // Open Gmail web composer directly in new tab
    const newWindow = window.open(gmailUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback to mailto if popup blocker triggered
      window.location.href = buildMailtoUrl();
    }

    setIsSent(true);
    showToast(`Gmail composer opened with pre-filled case brief for ${recipientEmail}!`);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1500);
  };

  const handleCopyLink = () => {
    const bundleLink = targetCase?.driveFolderUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(targetCase?.caseNumber || '')}`;
    navigator.clipboard.writeText(bundleLink);
    setCopiedLink(true);
    showToast('Google Drive case brief link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-warm-obsidian font-display tracking-tight">
              Share Case Brief & Pleadings
            </h2>
            <p className="text-xs text-warm-muted mt-0.5">
              Dispatches directly via Google Gmail Web, Mailto, or Google Drive Link
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
        <form onSubmit={handleSendViaGmail} className="p-5 sm:p-7 space-y-4 overflow-y-auto flex-1">
          
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
                placeholder="senior.counsel@bar.in"
                className="w-full capsule-input text-xs font-medium"
              />
            </div>
          </div>

          {/* Checklist of files */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-warm-graphite">
                Select Particular Files to Bundle into Brief ({selectedDocIds.length} of {(caseDocuments || []).length})
              </label>
              <span className="text-[11px] text-warm-muted">From Case Drive</span>
            </div>

            <div className="max-h-32 overflow-y-auto border border-warm-borderSubtle rounded-2xl divide-y divide-warm-borderSubtle/50 bg-white/60 p-1">
              {(caseDocuments || []).length === 0 ? (
                <p className="p-3 text-center text-xs text-warm-muted">No documents uploaded to this case yet.</p>
              ) : (
                caseDocuments.map(d => (
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
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1">
              Email Subject Line (Fully Editable) *
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
              Email Message Body (Fully Editable) *
            </label>
            <textarea
              rows="4"
              required
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              className="w-full rounded-2xl p-3 text-xs bg-white/80 border border-warm-borderSubtle text-warm-graphite focus:outline-none focus:border-terracotta leading-relaxed"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-warm-borderSubtle/60 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-white hover:bg-warm-sand/40 border border-warm-borderSubtle text-xs font-medium text-warm-graphite transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-terracotta" />}
              {copiedLink ? 'Link Copied!' : 'Copy Drive Link'}
            </button>

            <div className="flex items-center gap-2">
              <a
                href={buildMailtoUrl()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-pill border border-warm-borderSubtle hover:bg-white text-xs font-medium text-warm-graphite transition-colors"
                title="Send using default desktop mail app"
              >
                <Mail className="w-3.5 h-3.5" /> Mail App
              </a>

              <button
                type="submit"
                disabled={isSent}
                className="capsule-btn-dark text-xs disabled:opacity-50"
              >
                <span>{isSent ? 'Dispatched' : 'Open in Gmail Web'}</span>
                <div className="knob"><ExternalLink className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
