import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  FolderPlus, 
  CheckCircle2, 
  Building2, 
  User, 
  Link2, 
  ArrowRight, 
  FolderTree, 
  ExternalLink, 
  Sparkles,
  Trash2,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { extractDriveFolderId } from '../../services/googleWorkspace';

export const CaseRegistrationModal = ({ isOpen, onClose, caseToEdit = null }) => {
  const { systemConfig, users, createCase, updateCase, deleteCase, isGoogleConnected, connectGoogleWorkspace } = useApp();

  const isEditMode = Boolean(caseToEdit);

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (caseToEdit) {
      setCaseNumber(caseToEdit.caseNumber || '');
      setTitle(caseToEdit.title || '');
      setCourtCode(caseToEdit.courtCode || (systemConfig.courts || [])[0]?.code || 'CAL_HC_AS');
      setBench(caseToEdit.bench || '');
      setCaseType(caseToEdit.caseType || (systemConfig.caseTypes || [])[0] || 'WPA');
      setStage(caseToEdit.stage || (systemConfig.caseStages || [])[0] || 'Initial Pleadings / Registration');
      setCnrNumber(caseToEdit.cnrNumber || '');
      setClientName(caseToEdit.clientName || '');
      setClientEmail(caseToEdit.clientEmail || '');
      setClientPhone(caseToEdit.clientPhone || '');
      setOppositeParty(caseToEdit.oppositeParty || '');
      setSeniorAdvocate(caseToEdit.seniorAdvocate || '');
      setLeadCounsel(caseToEdit.leadCounsel || '');
      setAssignedStaff(caseToEdit.assignedStaff || []);
      setUrgency(caseToEdit.urgency || 'MEDIUM');
      setBriefSummary(caseToEdit.briefSummary || '');
      setDriveFolderUrl(caseToEdit.driveFolderUrl || '');
    } else {
      setCaseNumber('');
      setTitle('');
      setCourtCode((systemConfig.courts || [])[0]?.code || 'CAL_HC_AS');
      setBench('');
      setCaseType((systemConfig.caseTypes || [])[0] || 'WPA');
      setStage((systemConfig.caseStages || [])[0] || 'Initial Pleadings / Registration');
      setCnrNumber('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setOppositeParty('');
      setSeniorAdvocate('');
      setLeadCounsel('');
      setAssignedStaff([]);
      setUrgency('MEDIUM');
      setBriefSummary('');
      setDriveFolderUrl('');
    }
    setShowDeleteConfirm(false);
  }, [caseToEdit, isOpen, systemConfig]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProvisioningDrive(true);

    const court = (systemConfig.courts || []).find(c => c.code === courtCode) || { name: 'Court' };
    const folderId = extractDriveFolderId(driveFolderUrl);

    try {
      if (isEditMode) {
        await updateCase(caseToEdit.id, {
          caseNumber,
          title,
          courtCode,
          courtName: court.name,
          bench: bench || 'Standard Bench',
          caseType,
          stage,
          cnrNumber,
          clientName,
          clientEmail,
          clientPhone,
          oppositeParty,
          seniorAdvocate: seniorAdvocate || 'None',
          leadCounsel: leadCounsel || 'Arguing Counsel',
          assignedStaff,
          urgency,
          briefSummary,
          driveFolderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : (driveFolderUrl || caseToEdit.driveFolderUrl),
          driveFolderId: folderId || caseToEdit.driveFolderId || null
        });
      } else {
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
      }

      setIsProvisioningDrive(false);
      setProvisionSuccess(true);

      setTimeout(() => {
        setProvisionSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsProvisioningDrive(false);
    }
  };

  const handleDelete = async () => {
    if (!caseToEdit) return;
    await deleteCase(caseToEdit.id);
    setShowDeleteConfirm(false);
    onClose();
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
              {isEditMode ? <Edit3 className="w-5 h-5 text-white" /> : <FolderPlus className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
                {isEditMode ? `Edit Litigation Docket: ${caseToEdit.caseNumber}` : 'Register Case Docket & Link Google Drive'}
              </h2>
              <p className="text-xs text-warm-muted mt-0.5">
                {isEditMode ? 'Modify case parameters, client details, counsel assignments, and folder links' : 'Software Admin • Provisions case records with verified cloud storage links'}
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
              <h3 className="text-lg font-bold text-warm-obsidian font-display">
                {isEditMode ? 'Case Docket Updated!' : 'Case Registered in Firebase!'}
              </h3>
              <p className="text-xs text-warm-muted max-w-md mx-auto">
                {isEditMode 
                  ? 'Changes synced across Master Cases board and assigned staff workspaces.' 
                  : 'Matter indexed and linked to Google Drive. Visible in Master Cases board and assigned staff consoles.'}
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
                    placeholder="e.g. WPA 14820 of 2025"
                    className="w-full capsule-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    16-Digit CNR Number
                  </label>
                  <input
                    type="text"
                    value={cnrNumber}
                    onChange={(e) => setCnrNumber(e.target.value)}
                    placeholder="e.g. WBHC01-014820-2025"
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Full Cause Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ABC Infra Projects Ltd. vs. State of West Bengal & Ors."
                  className="w-full capsule-input text-xs font-bold"
                />
              </div>

              {/* Forum, Bench, Stage & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Forum / Court *
                  </label>
                  <select
                    value={courtCode}
                    onChange={(e) => setCourtCode(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    {(systemConfig.courts || []).map(c => (
                      <option key={c.id || c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Court / Bench
                  </label>
                  <input
                    type="text"
                    value={bench}
                    onChange={(e) => setBench(e.target.value)}
                    placeholder="e.g. Court 5 / Division Bench"
                    className="w-full capsule-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-graphite mb-1">
                    Case Type *
                  </label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="w-full capsule-input text-xs font-mono"
                  >
                    {(systemConfig.caseTypes || []).map(t => (
                      <option key={t} value={t}>{t}</option>
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
                    className="w-full capsule-input text-xs font-semibold"
                  >
                    <option value="CRITICAL">Critical (Stay / Injunction)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Standard Matter</option>
                  </select>
                </div>
              </div>

              {/* Stage */}
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Litigation Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full capsule-input text-xs"
                >
                  {(systemConfig.caseStages || []).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Google Drive Folder Link & Coordination */}
              <div className="p-4 rounded-3xl bg-warm-sand/50 border border-warm-borderSubtle space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-terracotta" />
                    <span className="text-xs font-bold text-warm-obsidian font-display">
                      Google Drive Dossier Coordination
                    </span>
                  </div>
                  {isGoogleConnected ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-pill border border-emerald-200">
                      Google Workspace Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={connectGoogleWorkspace}
                      className="text-[10px] font-bold text-terracotta hover:underline"
                    >
                      Connect Google Workspace
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1w7uR4K8yP... or folder ID (Leave blank to nest in Master Folder)"
                  className="w-full capsule-input text-xs font-mono"
                />
                {driveFolderUrl && (
                  <p className="text-[11px] text-warm-muted font-mono">
                    {extractDriveFolderId(driveFolderUrl) 
                      ? `✓ Valid Google Drive Folder ID: ${extractDriveFolderId(driveFolderUrl)}` 
                      : 'ℹ Paste a link with an authentic Google Drive folder ID'}
                  </p>
                )}
                <p className="text-[11px] text-warm-muted">
                  {systemConfig.firmBranding?.masterDriveFolderId 
                    ? `✓ Nested under Master Folder: ${systemConfig.firmBranding.masterDriveFolderId}` 
                    : 'Created in connected Google Drive. Standard subdirectories (01_Client_Documents, 05_Orders, etc.) are provisioned automatically.'}
                </p>
              </div>

              {/* Client & Opposite Party Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-warm-graphite" /> Client Information
                  </p>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Legal Entity / Individual *"
                    className="w-full capsule-input text-xs font-semibold"
                  />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Contact Email (for brief dispatch)"
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

              {/* Actions & Delete Confirmation */}
              {showDeleteConfirm ? (
                <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Are you sure you want to delete this case docket permanently?
                  </div>
                  <p className="text-[11px] text-rose-700">
                    This will delete <strong>{caseToEdit?.caseNumber}</strong> and all linked documents, tasks, and conference records from Firestore.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-1.5 rounded-pill bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Yes, Permanently Delete Case
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3.5 py-1.5 rounded-pill bg-white text-warm-graphite text-xs font-semibold border border-warm-borderSubtle hover:bg-warm-sand/50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-warm-borderSubtle/60 shrink-0">
                  <div>
                    {isEditMode ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-3.5 py-1.5 rounded-pill bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete Case</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-warm-muted hover:text-warm-obsidian font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 border border-warm-borderSubtle text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isProvisioningDrive}
                      className="capsule-btn-dark text-xs disabled:opacity-50"
                    >
                      <span>{isProvisioningDrive ? 'Saving...' : (isEditMode ? 'Save Changes to Docket' : 'Register Matter & Save')}</span>
                      <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </form>

      </div>
    </div>
  );
};
