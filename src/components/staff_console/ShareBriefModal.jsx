import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Mail, Link2, Copy, Check, FileText, CheckCircle2 } from 'lucide-react';

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
    `Respected Senior Counsel,\n\nPlease find attached the comprehensive litigation brief and index of relevant pleadings in the above-captioned matter scheduled for hearing on ${targetCase?.nextHearingDate || 'the upcoming cause list'} before ${targetCase?.bench || 'the Hon\'ble Bench'}.\n\nKey documents enclosed:\n- Writ Petition & Stamped Court Filings\n- Latest Interim Bench Order\n- Chronological List of Dates and Statutory Points\n\nGoogle Drive Secure Case Bundle Access Link:\n${targetCase?.driveFolderUrl}\n\nPlease let us know your availability for a pre-hearing briefing conference on GMeet.\n\nWarm regards,\n${currentUser.name}\n${currentUser.designation}`
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50/80 to-blue-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-purple-700 text-white shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">Share Case Brief & Documents</h2>
              <p className="text-xs text-neutral-500">
                Staff Console • Share selective documents via Gmail or secure Google Drive link
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

        {/* Content */}
        <form onSubmit={handleSendMail} className="p-6 space-y-4">
          
          {/* Recipient Role & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Recipient Role
              </label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              >
                <option value="Senior Advocate">Senior Advocate</option>
                <option value="Client">Client / Corporate Representative</option>
                <option value="Briefing Counsel">Briefing Counsel</option>
                <option value="Opposite Side">Opposite Party Counsel</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Recipient Email Address *
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Document Checklist to Bundle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Select Particular Files to Bundle into Brief ({selectedDocIds.length} of {caseDocuments.length})
              </label>
              <span className="text-[11px] text-neutral-400">Pulls directly from Google Drive</span>
            </div>

            <div className="max-h-36 overflow-y-auto border border-neutral-200 rounded-m3-lg divide-y divide-neutral-100 bg-neutral-50/50 p-1">
              {caseDocuments.map(d => (
                <label
                  key={d.id}
                  className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocIds.includes(d.id)}
                    onChange={() => toggleDoc(d.id)}
                    className="w-3.5 h-3.5 text-purple-600 rounded"
                  />
                  <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-mono text-neutral-800 truncate flex-1">{d.name}</span>
                  <span className="text-[10px] text-neutral-500 font-sans shrink-0">{d.category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Editable Subject */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Subject Line (Fully Editable at All Times) *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Editable Body */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Message Body (Fully Editable at All Times) *
            </label>
            <textarea
              rows="5"
              required
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-sans text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
            ></textarea>
          </div>

          {/* Actions: Send via Mail or Copy Secure Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium rounded-m3-full flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-blue-600" />}
              {copiedLink ? 'Link Copied!' : 'Copy Drive Share Link'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-m3-full"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSent}
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Dispatched!
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Dispatch via Gmail
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
