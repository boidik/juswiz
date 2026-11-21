import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FolderPlus, CheckCircle2, Building2, User, Link2, ArrowRight, FolderTree, ExternalLink, Sparkles } from 'lucide-react';

export const CaseRegistrationModal = ({ isOpen, onClose }) => {
  const { systemConfig, users, createCase, isGoogleConnected, connectGoogleWorkspace } = useApp();

  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [courtCode, setCourtCode] = useState((systemConfig.courts || [])[0]?.code || 'CAL_HC_AS');
  const [bench, setBench] = useState('');
  const [caseType, setCaseType] = useState((systemConfig.caseTypes || [])[0] || 'WPA');
  const [stage, setStage] = useState((systemConfig.caseStages || [])[0] || 'Initial Pleadings / Registration');
  const [cnrNumber, setCnrNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [oppositeParty, setOppositeParty] = useState('');
  const [seniorAdvocate, setSeniorAdvocate] = useState('');
  const [leadCounsel, setLeadCounsel] = useState('');
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [urgency, setUrgency] = useState('MEDIUM');
  const [briefSummary, setBriefSummary] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [isProvisioningDrive, setIsProvisioningDrive] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProvisioningDrive(true);

    setTimeout(async () => {
      await createCase({
        caseNumber,
        title,
        courtCode,
        bench,
        caseType,
        stage,
        cnrNumber,
        clientName,
        clientEmail,
        clientPhone,
        oppositeParty,
        seniorAdvocate,
        leadCounsel,
        assignedStaff,
        urgency,
        briefSummary,
        driveFolderUrl
      });

      setIsProvisioningDrive(false);
      setProvisionSuccess(true);

      setTimeout(() => {
        setProvisionSuccess(false);
        onClose();
      }, 1400);
    }, 800);
  };

  const toggleStaff = (userId) => {
    setAssignedStaff(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
                Register Case Docket & Link Google Drive
              </h2>
              <p className="text-xs text-warm-muted mt-0.5">
                Software Admin • Provisions case records with verified cloud storage links
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4 overflow-y-auto flex-1">
          {provisionSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 sun-gradient-circle text-white rounded-full flex items-center justify-center mx-auto shadow-amber-glow animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-warm-obsidian font-display">Case Registered in Firebase!</h3>
              <p className="text-xs text-warm-muted max-w-md mx-auto">
                Matter indexed and linked to Google Drive. Visible in Master Cases board and assigned staff consoles.
              </p>
            </div>
          ) : (
            <>
              {/* Primary Case Identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Case Number / Filing Ref *
                  </label>
                  <input
                    type="text"
                    required
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="e.g. WPA/14820/2026 or CS/412/2026"
                    className="w-full capsule-input text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Forum / Adjudicating Body (All Future Added Forums Included) *
                  </label>
                  <select
                    value={courtCode}
                    onChange={(e) => setCourtCode(e.target.value)}
                    className="w-full capsule-input text-xs font-medium"
                  >
                    {(systemConfig.courts || []).map(c => (
                      <option key={c.id || c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Matter Title (Petitioner vs Respondent) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. M/s Bengal Infra Corp vs. State of West Bengal & Ors."
                  className="w-full capsule-input text-xs font-semibold"
                />
              </div>

              {/* Court Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Classification / Type
                  </label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    {(systemConfig.caseTypes || []).map((ct, idx) => (
                      <option key={idx} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Bench / Court Room
                  </label>
                  <input
                    type="text"
                    value={bench}
                    onChange={(e) => setBench(e.target.value)}
                    placeholder="e.g. Single Bench (Court 13)"
                    className="w-full capsule-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    eCourts CNR / Diary Number
                  </label>
                  <input
                    type="text"
                    value={cnrNumber}
                    onChange={(e) => setCnrNumber(e.target.value)}
                    placeholder="e.g. WBHC01-014820-2026"
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Stage & Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Litigation Stage (From Custom Presets)
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    {(systemConfig.caseStages || []).map((stg, idx) => (
                      <option key={idx} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    {(systemConfig.caseUrgencies || [
                      { key: 'CRITICAL', label: 'Critical (Stay / Injunction / Ad-Interim)' },
                      { key: 'HIGH', label: 'High Priority (Listing Scheduled)' },
                      { key: 'MEDIUM', label: 'Standard Litigation Cadence' },
                      { key: 'LOW', label: 'Routine / Periodic Review' }
                    ]).map((urg, idx) => (
                      <option key={idx} value={urg.key || urg}>{urg.label || urg.key || urg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Google Drive Integration & Folder Provisioning */}
              <div className="p-4 bg-white/90 rounded-3xl border border-warm-borderSubtle space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-terracotta" />
                    Google Drive Cloud Storage Provisioning
                  </label>
                  {isGoogleConnected ? (
                    <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Drive API Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={connectGoogleWorkspace}
                      className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta-soft text-terracotta border border-terracotta/20 hover:bg-terracotta hover:text-white transition-colors"
                    >
                      Authorize Drive API
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/YOUR_FOLDER_ID (Leave blank for automatic provisioning)"
                  className="w-full capsule-input text-xs font-mono"
                />

                <div className="flex flex-wrap items-center justify-between text-[11px] text-warm-muted gap-2 pt-0.5">
                  <span>
                    {isGoogleConnected 
                      ? "✓ Auto-creates parent case directory & 6 subfolders in your Google Drive on submission."
                      : "Leave blank to auto-generate a valid Drive search link or click Authorize to create real folders."}
                  </span>
                  <a
                    href="https://drive.google.com/drive/my-drive"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-terracotta hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open My Drive
                  </a>
                </div>
              </div>

              {/* Client & Opposite Party Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white/70 rounded-3xl border border-warm-borderSubtle">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-terracotta" /> Client Information
                  </p>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name / Corporation *"
                    className="w-full capsule-input text-xs"
                  />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Contact Email"
                    className="w-full capsule-input text-xs"
                  />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Client Phone / WhatsApp"
                    className="w-full capsule-input text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-warm-graphite" /> Opposite Party & Counsel
                  </p>
                  <input
                    type="text"
                    required
                    value={oppositeParty}
                    onChange={(e) => setOppositeParty(e.target.value)}
                    placeholder="Opposite Party / State Department *"
                    className="w-full capsule-input text-xs"
                  />
                  <input
                    type="text"
                    value={seniorAdvocate}
                    onChange={(e) => setSeniorAdvocate(e.target.value)}
                    placeholder="Designated Senior Advocate (if briefed)"
                    className="w-full capsule-input text-xs"
                  />
                  <input
                    type="text"
                    value={leadCounsel}
                    onChange={(e) => setLeadCounsel(e.target.value)}
                    placeholder="Lead Associate / Arguing Counsel"
                    className="w-full capsule-input text-xs"
                  />
                </div>
              </div>

              {/* Staff Assignment */}
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                  Assign Litigation Staff (Visible in their respective Staff Consoles)
                </label>
                <div className="flex flex-wrap gap-2">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleStaff(u.id)}
                      className={`px-3.5 py-1.5 rounded-pill text-xs font-semibold border transition-all ${
                        assignedStaff.includes(u.id)
                          ? 'bg-warm-obsidian text-white border-warm-obsidian shadow-xs'
                          : 'bg-white/80 text-warm-graphite border-warm-borderSubtle hover:bg-white'
                      }`}
                    >
                      {u.name} ({u.role?.replace('_', ' ') || 'Staff'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief Summary */}
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Brief Synopsis of Case
                </label>
                <textarea
                  rows="2"
                  value={briefSummary}
                  onChange={(e) => setBriefSummary(e.target.value)}
                  placeholder="Summary of prayers, interim reliefs, and main arguments..."
                  className="w-full rounded-2xl p-3 text-xs bg-white/80 border border-warm-borderSubtle focus:outline-none focus:border-terracotta"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-warm-borderSubtle/60 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-warm-muted hover:text-warm-obsidian font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioningDrive}
                  className="capsule-btn-dark text-xs disabled:opacity-50"
                >
                  <span>{isProvisioningDrive ? 'Registering...' : 'Register Matter & Save'}</span>
                  <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </>
          )}
        </form>

      </div>
    </div>
  );
};
