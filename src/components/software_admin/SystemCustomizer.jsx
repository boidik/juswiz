import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Palette, 
  Building, 
  FolderTree, 
  CheckSquare, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2,
  Mail,
  Layers,
  Globe,
  Tag,
  ArrowRight,
  ExternalLink,
  Sliders,
  ChevronDown,
  AlertCircle,
  Edit3,
  X,
  Check,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  RefreshCw,
  FolderSync,
  Sparkles
} from 'lucide-react';
import { defaultSystemConfig } from '../../defaultConfig';
import { extractDriveFolderId } from '../../services/googleWorkspace';

export const SystemCustomizer = () => {
  const { systemConfig, updateSystemConfig, deleteAllPracticeData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('BRANDING');
  const [config, setConfig] = useState(systemConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when systemConfig changes from Firestore
  useEffect(() => {
    if (systemConfig) {
      setConfig(systemConfig);
    }
  }, [systemConfig]);

  // Form states for creating new items
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtCode, setNewCourtCode] = useState('');
  const [newCourtType, setNewCourtType] = useState('High Court');
  const [newCourtState, setNewCourtState] = useState('West Bengal');
  const [newCourtPortalUrl, setNewCourtPortalUrl] = useState('');
  const [newCourtQueryEngine, setNewCourtQueryEngine] = useState('HIGH_COURT_DIRECT');
  const [newCourtBenches, setNewCourtBenches] = useState('Single Bench, Division Bench');

  const [newCaseType, setNewCaseType] = useState('');
  const [newCaseStage, setNewCaseStage] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newReminderDays, setNewReminderDays] = useState(5);
  const [newReminderLabel, setNewReminderLabel] = useState('');
  const [newReminderChannel, setNewReminderChannel] = useState('In-App + Email');

  // Edit States for Customisation Options
  const [editingCourt, setEditingCourt] = useState(null);
  const [editingCaseType, setEditingCaseType] = useState(null); // { index, value }
  const [editingCaseStage, setEditingCaseStage] = useState(null); // { index, value }
  const [editingTaskCategory, setEditingTaskCategory] = useState(null); // { index, value }
  const [editingTaskPriority, setEditingTaskPriority] = useState(null); // { index, value }
  const [editingFolder, setEditingFolder] = useState(null); // folder obj
  const [editingReminder, setEditingReminder] = useState(null); // reminder obj

  // Danger Zone confirmation state
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  // Microservice & Auto-Sync state
  const [microserviceLogs, setMicroserviceLogs] = useState([]);
  const [microserviceStatus, setMicroserviceStatus] = useState('UNKNOWN');
  const [isTestingMicroservice, setIsTestingMicroservice] = useState(false);
  const [isBatchSyncing, setIsBatchSyncing] = useState(false);

  const fetchMicroserviceStatus = async () => {
    setIsTestingMicroservice(true);
    try {
      const url = config.microserviceUrl || 'http://localhost:5001';
      const res = await fetch(`${url}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setMicroserviceStatus('ONLINE');
        setMicroserviceLogs(data.scheduler?.logs || []);
        showToast('Microservice is ONLINE and connected to eCourts engine!');
      } else {
        setMicroserviceStatus('OFFLINE');
        showToast('Microservice replied with an error.', 'warn');
      }
    } catch (e) {
      setMicroserviceStatus('OFFLINE');
      showToast('Could not reach microservice on ' + (config.microserviceUrl || 'http://localhost:5001'), 'error');
    } finally {
      setIsTestingMicroservice(false);
    }
  };

  const handleSave = async () => {
    const res = await updateSystemConfig(config);
    if (res?.success !== false) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all system settings, court masters, and branding to factory defaults? Any customized court list will revert.')) {
      setConfig(defaultSystemConfig);
      updateSystemConfig(defaultSystemConfig);
      showToast('Settings reset to system defaults.');
    }
  };

  // --- Master Google Drive Link Change Handler ---
  const handleMasterDriveChange = (val) => {
    const extractedId = extractDriveFolderId(val);
    setConfig(prev => ({
      ...prev,
      firmBranding: {
        ...prev.firmBranding,
        masterDriveUrl: val,
        masterDriveFolderUrl: extractedId ? `https://drive.google.com/drive/folders/${extractedId}` : val,
        masterDriveFolderId: extractedId || null
      }
    }));
  };

  // --- Courts Master Handlers ---
  const handleAddCourt = (e) => {
    e.preventDefault();
    if (!newCourtName || !newCourtCode) return;
    const benchesList = newCourtBenches
      ? newCourtBenches.split(',').map(b => b.trim()).filter(Boolean)
      : ['Single Bench', 'Division Bench'];

    const newCourt = {
      id: `c-${Date.now()}`,
      code: newCourtCode.toUpperCase().replace(/\s+/g, '_'),
      name: newCourtName.trim(),
      forumType: newCourtType,
      state: newCourtState.trim() || 'All India',
      portalUrl: newCourtPortalUrl.trim() || 'https://services.ecourts.gov.in',
      queryEngine: newCourtQueryEngine,
      benches: benchesList
    };

    setConfig(prev => ({ ...prev, courts: [...(prev.courts || []), newCourt] }));
    setNewCourtName('');
    setNewCourtCode('');
    setNewCourtPortalUrl('');
    showToast(`Added ${newCourt.name} to court master`);
  };

  const handleUpdateCourt = (e) => {
    e.preventDefault();
    if (!editingCourt) return;
    const benchesList = typeof editingCourt.benches === 'string'
      ? editingCourt.benches.split(',').map(b => b.trim()).filter(Boolean)
      : editingCourt.benches;

    const updated = {
      ...editingCourt,
      benches: benchesList
    };

    setConfig(prev => ({
      ...prev,
      courts: (prev.courts || []).map(c => c.id === editingCourt.id ? updated : c)
    }));
    setEditingCourt(null);
    showToast(`Updated parameters for ${updated.name}`);
  };

  const handleDeleteCourt = (id) => {
    setConfig(prev => ({ ...prev, courts: (prev.courts || []).filter(c => c.id !== id) }));
    showToast('Court removed from master list.');
  };

  // --- Case Types Handlers ---
  const handleAddCaseType = (e) => {
    e.preventDefault();
    if (!newCaseType.trim()) return;
    setConfig(prev => ({ ...prev, caseTypes: [...(prev.caseTypes || []), newCaseType.trim()] }));
    setNewCaseType('');
  };

  const handleUpdateCaseType = (e) => {
    e.preventDefault();
    if (!editingCaseType) return;
    const updated = [...(config.caseTypes || [])];
    updated[editingCaseType.index] = editingCaseType.value.trim();
    setConfig(prev => ({ ...prev, caseTypes: updated }));
    setEditingCaseType(null);
    showToast('Case type updated.');
  };

  const handleDeleteCaseType = (typeToRemove) => {
    setConfig(prev => ({ ...prev, caseTypes: (prev.caseTypes || []).filter(ct => ct !== typeToRemove) }));
  };

  // --- Case Stages Handlers ---
  const handleAddCaseStage = (e) => {
    e.preventDefault();
    if (!newCaseStage.trim()) return;
    setConfig(prev => ({ ...prev, caseStages: [...(prev.caseStages || []), newCaseStage.trim()] }));
    setNewCaseStage('');
  };

  const handleUpdateCaseStage = (e) => {
    e.preventDefault();
    if (!editingCaseStage) return;
    const updated = [...(config.caseStages || [])];
    updated[editingCaseStage.index] = editingCaseStage.value.trim();
    setConfig(prev => ({ ...prev, caseStages: updated }));
    setEditingCaseStage(null);
    showToast('Case stage updated.');
  };

  const handleDeleteCaseStage = (stageToRemove) => {
    setConfig(prev => ({ ...prev, caseStages: (prev.caseStages || []).filter(s => s !== stageToRemove) }));
  };

  // --- Task Categories Handlers ---
  const handleAddTaskCategory = (e) => {
    e.preventDefault();
    if (!newTaskCategory.trim()) return;
    setConfig(prev => ({ ...prev, taskCategories: [...(prev.taskCategories || []), newTaskCategory.trim()] }));
    setNewTaskCategory('');
  };

  const handleUpdateTaskCategory = (e) => {
    e.preventDefault();
    if (!editingTaskCategory) return;
    const updated = [...(config.taskCategories || [])];
    updated[editingTaskCategory.index] = editingTaskCategory.value.trim();
    setConfig(prev => ({ ...prev, taskCategories: updated }));
    setEditingTaskCategory(null);
    showToast('Task category updated.');
  };

  const handleDeleteTaskCategory = (catToRemove) => {
    setConfig(prev => ({ ...prev, taskCategories: (prev.taskCategories || []).filter(cat => cat !== catToRemove) }));
  };

  // --- Task Priorities Handlers ---
  const handleAddTaskPriority = (e) => {
    e.preventDefault();
    if (!newTaskPriority.trim()) return;
    setConfig(prev => ({ ...prev, taskPriorities: [...(prev.taskPriorities || []), newTaskPriority.trim().toUpperCase()] }));
    setNewTaskPriority('');
  };

  const handleUpdateTaskPriority = (e) => {
    e.preventDefault();
    if (!editingTaskPriority) return;
    const updated = [...(config.taskPriorities || [])];
    updated[editingTaskPriority.index] = editingTaskPriority.value.trim().toUpperCase();
    setConfig(prev => ({ ...prev, taskPriorities: updated }));
    setEditingTaskPriority(null);
    showToast('Task priority updated.');
  };

  const handleDeleteTaskPriority = (priorityToRemove) => {
    setConfig(prev => ({ ...prev, taskPriorities: (prev.taskPriorities || []).filter(p => p !== priorityToRemove) }));
  };

  // --- Folder Templates Handlers ---
  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_'),
      description: newFolderDesc.trim() || 'Directory for litigation documents'
    };
    setConfig(prev => ({ ...prev, driveFolderTemplate: [...(prev.driveFolderTemplate || []), newFolder] }));
    setNewFolderName('');
    setNewFolderDesc('');
  };

  const handleUpdateFolder = (e) => {
    e.preventDefault();
    if (!editingFolder) return;
    setConfig(prev => ({
      ...prev,
      driveFolderTemplate: (prev.driveFolderTemplate || []).map(f => f.id === editingFolder.id ? editingFolder : f)
    }));
    setEditingFolder(null);
    showToast('Folder template updated.');
  };

  const handleDeleteFolder = (id) => {
    setConfig(prev => ({ ...prev, driveFolderTemplate: (prev.driveFolderTemplate || []).filter(f => f.id !== id) }));
  };

  // --- Hearing Reminders Handlers ---
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminderLabel.trim()) return;
    const newPreset = {
      id: `r-${Date.now()}`,
      daysBefore: parseInt(newReminderDays, 10),
      label: newReminderLabel.trim(),
      channel: newReminderChannel,
      active: true
    };
    setConfig(prev => ({
      ...prev,
      reminderPresets: [...(prev.reminderPresets || []), newPreset].sort((a, b) => b.daysBefore - a.daysBefore)
    }));
    setNewReminderLabel('');
  };

  const handleUpdateReminder = (e) => {
    e.preventDefault();
    if (!editingReminder) return;
    setConfig(prev => ({
      ...prev,
      reminderPresets: (prev.reminderPresets || []).map(r => r.id === editingReminder.id ? editingReminder : r)
    }));
    setEditingReminder(null);
    showToast('Reminder interval updated.');
  };

  const handleDeleteReminder = (id) => {
    setConfig(prev => ({ ...prev, reminderPresets: (prev.reminderPresets || []).filter(r => r.id !== id) }));
  };

  // --- Factory Reset / Delete All Practice Data ---
  const handleExecuteDeleteAllData = async () => {
    if (confirmDeleteInput.trim().toUpperCase() !== 'DELETE ALL DATA') {
      showToast('Please type "DELETE ALL DATA" to confirm.', 'error');
      return;
    }
    await deleteAllPracticeData();
    setShowDeleteAllConfirm(false);
    setConfirmDeleteInput('');
  };

  return (
    <div className="glass-panel-elevated rounded-4xl overflow-hidden border border-white/90 shadow-glass">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-7 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
              Universal System Customizer
            </h2>
            <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta text-white uppercase tracking-wider shadow-xs">
              Live Firestore Sync
            </span>
          </div>
          <p className="text-xs text-warm-muted mt-1 max-w-xl">
            Edit and delete any parameter: white-label branding, master Google Drive nesting, judicial forums, case stages, task workflows, and drive folder trees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-pill border border-warm-borderSubtle text-xs font-semibold text-warm-graphite hover:bg-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-warm-muted" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="capsule-btn-dark text-xs"
          >
            <span>Save Configuration</span>
            <div className="knob"><Save className="w-3.5 h-3.5 text-white" /></div>
          </button>
        </div>
      </div>

      {/* Success Notification Bar */}
      {savedSuccess && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          All configuration changes saved and broadcast live to all consoles!
        </div>
      )}

      {/* Responsive Horizontal Tab Bar */}
      <div className="flex border-b border-warm-borderSubtle bg-white/40 overflow-x-auto no-scrollbar px-3 sm:px-6">
        {[
          { key: 'BRANDING', label: 'Branding & Master Drive', icon: Palette },
          { key: 'COURTS', label: 'Courts & Scrapers', icon: Building },
          { key: 'CASE_FIELDS', label: 'Case Forms & Stages', icon: Layers },
          { key: 'TASKS', label: 'Task Workflow', icon: CheckSquare },
          { key: 'DRIVE', label: 'Drive Hierarchy', icon: FolderTree },
          { key: 'REMINDERS', label: 'Hearing Reminders', icon: Clock },
          { key: 'EMAILS', label: 'Email Templates', icon: Mail },
          { key: 'AUTOSYNC', label: 'Court Microservice & Auto-Sync', icon: Cpu },
          { key: 'DANGER', label: 'Data Reset', icon: ShieldAlert, isDanger: true },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? tab.isDanger ? 'border-rose-600 text-rose-600 font-bold' : 'border-terracotta text-terracotta font-bold'
                  : tab.isDanger ? 'border-transparent text-rose-600/70 hover:text-rose-600' : 'border-transparent text-warm-muted hover:text-warm-obsidian'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-7">
        
        {/* TAB 1: BRANDING & MASTER DRIVE */}
        {activeTab === 'BRANDING' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Firm Identity & Master Google Drive</h3>
              <p className="text-xs text-warm-muted">
                Customise the firm title, tagline, logo icon, favicon, and Master Google Drive folder where all cases will reside.
              </p>
            </div>

            {/* Master Google Drive Folder Root */}
            <div className="p-5 bg-white/90 rounded-3xl border border-warm-borderSubtle space-y-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-terracotta" />
                  Master Google Drive Litigation Root Folder
                </label>
                {config.firmBranding?.masterDriveUrl && (
                  <a
                    href={config.firmBranding.masterDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-terracotta hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open Master Folder in Google Drive
                  </a>
                )}
              </div>

              <input
                type="text"
                value={config.firmBranding?.masterDriveUrl || ''}
                onChange={(e) => handleMasterDriveChange(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1w7uR4K8yP... or Folder ID"
                className="w-full capsule-input text-xs font-mono font-medium"
              />

              <div className="flex flex-col gap-1 text-[11px]">
                {extractDriveFolderId(config.firmBranding?.masterDriveUrl) ? (
                  <span className="text-emerald-700 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Master Folder ID Validated: {extractDriveFolderId(config.firmBranding?.masterDriveUrl)}
                  </span>
                ) : (
                  <span className="text-warm-muted">
                    ℹ Paste your Google Drive folder link or folder ID.
                  </span>
                )}
                <span className="text-warm-graphite">
                  ⭐ <strong>Automatic Folder Nesting:</strong> Every newly provisioned litigation case folder and its 6 subdirectories will be created directly <strong>INSIDE</strong> this Master Google Drive folder!
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Firm / Chambers Name</label>
                <input
                  type="text"
                  value={config.firmBranding?.firmName || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, firmName: e.target.value }
                  }))}
                  placeholder="e.g. JurisFlow Practice"
                  className="w-full capsule-input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Header Subtitle</label>
                <input
                  type="text"
                  value={config.firmBranding?.headerSubtitle || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, headerSubtitle: e.target.value }
                  }))}
                  placeholder="e.g. Legal Studio · Advocates & Legal Consultants"
                  className="w-full capsule-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Logo URL (PNG / SVG)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={config.firmBranding?.logoUrl || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      firmBranding: { ...prev.firmBranding, logoUrl: e.target.value }
                    }))}
                    className="flex-1 capsule-input text-xs"
                  />
                  <div className="w-10 h-10 rounded-2xl border border-warm-borderSubtle p-1 flex items-center justify-center bg-white shrink-0 shadow-xs">
                    <img src={config.firmBranding?.logoUrl} alt="Logo" className="max-w-full max-h-full" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Favicon URL</label>
                <input
                  type="url"
                  value={config.firmBranding?.faviconUrl || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, faviconUrl: e.target.value }
                  }))}
                  className="w-full capsule-input text-xs"
                />
              </div>
            </div>

            {/* Pinterest Palette Picker */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-3">
              <label className="block text-xs font-bold text-warm-obsidian">
                Primary Brand Accent Palette
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.firmBranding?.primaryColor || '#FF6F1F'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      firmBranding: { ...prev.firmBranding, primaryColor: e.target.value }
                    }))}
                    className="w-10 h-10 rounded-2xl border border-warm-borderSubtle cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-warm-obsidian">
                    {config.firmBranding?.primaryColor}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-warm-muted">Curated Aesthetics:</span>
                  {[
                    { label: 'Sunset Terracotta', hex: '#FF6F1F' },
                    { label: 'Warm Apricot', hex: '#FF8A3D' },
                    { label: 'Deep Espresso', hex: '#3E2723' },
                    { label: 'Obsidian Jet', hex: '#141416' },
                    { label: 'Heritage Forest', hex: '#1E4620' },
                    { label: 'Imperial Navy', hex: '#1A365D' }
                  ].map(p => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        firmBranding: { ...prev.firmBranding, primaryColor: p.hex }
                      }))}
                      className="w-7 h-7 rounded-full border border-warm-borderSubtle shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: p.hex }}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURTS & ONLINE SCRAPERS */}
        {activeTab === 'COURTS' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">
                Courts & Tribunals Master (Online Scraper Enabled)
              </h3>
              <p className="text-xs text-warm-muted">
                Add, edit, or delete judicial forums. When you add or edit a forum with its official portal and scraper engine, staff can automatically fetch daily orders online.
              </p>
            </div>

            {/* Add Court Card */}
            <form onSubmit={handleAddCourt} className="p-5 bg-white/80 rounded-3xl border border-warm-borderSubtle space-y-3">
              <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-terracotta" /> Add New Judicial Forum / Adjudicating Body
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Forum Name *</label>
                  <input
                    type="text"
                    required
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    placeholder="e.g. Delhi High Court"
                    className="w-full capsule-input text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Court Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourtCode}
                    onChange={(e) => setNewCourtCode(e.target.value)}
                    placeholder="e.g. DHC"
                    className="w-full capsule-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Forum Type</label>
                  <select
                    value={newCourtType}
                    onChange={(e) => setNewCourtType(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    <option value="Apex Court">Apex Court (Supreme Court)</option>
                    <option value="High Court">High Court</option>
                    <option value="Tribunal">Tribunal (NCLT / CAT / DRT / NGT)</option>
                    <option value="District Court">District & Sessions Court</option>
                    <option value="City Civil Court">City Civil Court</option>
                    <option value="Consumer Forum">Consumer Disputes Forum</option>
                    <option value="Arbitration">Arbitration Tribunal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    value={newCourtState}
                    onChange={(e) => setNewCourtState(e.target.value)}
                    placeholder="e.g. Delhi / West Bengal / National"
                    className="w-full capsule-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Official Portal URL (For Online Scraper)</label>
                  <input
                    type="url"
                    value={newCourtPortalUrl}
                    onChange={(e) => setNewCourtPortalUrl(e.target.value)}
                    placeholder="https://delhihighcourt.nic.in"
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Scraper Query Engine</label>
                  <select
                    value={newCourtQueryEngine}
                    onChange={(e) => setNewCourtQueryEngine(e.target.value)}
                    className="w-full capsule-input text-xs"
                  >
                    <option value="HIGH_COURT_DIRECT">High Court Direct Gateway</option>
                    <option value="SUPREME_COURT_DIRECT">Supreme Court Direct (SCI)</option>
                    <option value="ECOURTS_CIS">eCourts CIS & District Portal</option>
                    <option value="TRIBUNAL_PORTAL">Tribunal Gateway (NCLT/CAT/NGT)</option>
                    <option value="CUSTOM_WEB_API">Custom Web API / Portal Scraper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Benches (Comma separated)</label>
                <input
                  type="text"
                  value={newCourtBenches}
                  onChange={(e) => setNewCourtBenches(e.target.value)}
                  placeholder="Single Bench, Division Bench, Commercial Division"
                  className="w-full capsule-input text-xs"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Court to System</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </form>

            {/* Courts Grid with Edit & Delete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(config.courts || []).map(c => (
                <div key={c.id || c.code} className="p-4 rounded-3xl glass-panel flex flex-col justify-between space-y-2 border border-white/80 hover:glass-panel-elevated transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-pill bg-warm-sand/80 text-warm-obsidian">
                          {c.code}
                        </span>
                        <span className="text-xs font-bold text-warm-obsidian font-display">{c.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCourt({
                            ...c,
                            benches: Array.isArray(c.benches) ? c.benches.join(', ') : (c.benches || '')
                          })}
                          className="p-1.5 rounded-full hover:bg-white text-warm-muted hover:text-warm-obsidian transition-colors shadow-xs"
                          title="Edit Court Parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-terracotta" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourt(c.id)}
                          className="p-1.5 rounded-full hover:bg-rose-50 text-warm-muted hover:text-rose-600 transition-colors shadow-xs"
                          title="Delete Court"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-warm-muted">
                      <span className="font-medium text-warm-graphite">{c.forumType}</span>
                      <span>•</span>
                      <span>{c.state || 'National'}</span>
                      <span>•</span>
                      <span className="font-mono text-terracotta text-[10px]">{c.queryEngine || 'DIRECT'}</span>
                    </div>

                    {c.portalUrl && (
                      <p className="text-[10px] font-mono text-warm-muted truncate mt-1">
                        🌐 {c.portalUrl}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-warm-borderSubtle/60 flex flex-wrap gap-1">
                    {(Array.isArray(c.benches) ? c.benches : []).map((b, i) => (
                      <span key={i} className="text-[9px] bg-white px-2 py-0.5 rounded-pill text-warm-graphite border border-warm-borderSubtle">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CASE FORMS & STAGES */}
        {activeTab === 'CASE_FIELDS' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Case Types & Litigation Stages</h3>
              <p className="text-xs text-warm-muted">
                Add, edit, or delete case classification types and litigation milestone stages.
              </p>
            </div>

            {/* Case Types Section */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-3">
              <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-terracotta" /> Case Classification Types
              </h4>

              <form onSubmit={handleAddCaseType} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  placeholder="New Case Type (e.g. Arbitration Petition)"
                  className="flex-1 capsule-input text-xs font-mono"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Type</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {(config.caseTypes || []).map((t, idx) => (
                  <div key={t} className="flex items-center gap-1 px-3 py-1 rounded-pill bg-white text-warm-obsidian text-xs font-mono font-medium border border-warm-borderSubtle shadow-xs">
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => setEditingCaseType({ index: idx, value: t })}
                      className="text-warm-muted hover:text-terracotta ml-1"
                      title="Edit Case Type"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCaseType(t)}
                      className="text-warm-muted hover:text-rose-600 ml-0.5"
                      title="Delete Case Type"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Litigation Stages Section */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-3">
              <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-terracotta" /> Procedural Stages & Milestones
              </h4>

              <form onSubmit={handleAddCaseStage} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCaseStage}
                  onChange={(e) => setNewCaseStage(e.target.value)}
                  placeholder="New Stage (e.g. Arguments on Admission)"
                  className="flex-1 capsule-input text-xs"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Stage</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="space-y-1.5 pt-1">
                {(config.caseStages || []).map((s, idx) => (
                  <div key={s} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-warm-borderSubtle text-xs text-warm-obsidian font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-warm-sand text-warm-obsidian flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{s}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCaseStage({ index: idx, value: s })}
                        className="text-warm-muted hover:text-terracotta p-1"
                        title="Edit Stage"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCaseStage(s)}
                        className="text-warm-muted hover:text-rose-600 p-1"
                        title="Delete Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TASK WORKFLOW */}
        {activeTab === 'TASKS' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Task Categories & Priorities</h3>
              <p className="text-xs text-warm-muted">
                Add, edit, or delete task categories and priority levels delegated to associates and clerks.
              </p>
            </div>

            {/* Task Categories */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-3">
              <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-terracotta" /> Task Workflow Categories
              </h4>

              <form onSubmit={handleAddTaskCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  placeholder="New Category (e.g. Legal Research & Citations)"
                  className="flex-1 capsule-input text-xs"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Category</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {(config.taskCategories || []).map((cat, idx) => (
                  <div key={cat} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white text-warm-obsidian text-xs font-medium border border-warm-borderSubtle shadow-xs">
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => setEditingTaskCategory({ index: idx, value: cat })}
                      className="text-warm-muted hover:text-terracotta ml-1"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTaskCategory(cat)}
                      className="text-warm-muted hover:text-rose-600"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Priorities */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-3">
              <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-terracotta" /> Task Urgency & Priority Levels
              </h4>

              <form onSubmit={handleAddTaskPriority} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  placeholder="New Priority (e.g. SAME_DAY)"
                  className="flex-1 capsule-input text-xs font-mono uppercase"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Priority</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {(config.taskPriorities || []).map((p, idx) => (
                  <div key={p} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white text-warm-obsidian text-xs font-mono font-bold border border-warm-borderSubtle shadow-xs">
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => setEditingTaskPriority({ index: idx, value: p })}
                      className="text-warm-muted hover:text-terracotta ml-1"
                      title="Edit Priority"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTaskPriority(p)}
                      className="text-warm-muted hover:text-rose-600"
                      title="Delete Priority"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DRIVE HIERARCHY */}
        {activeTab === 'DRIVE' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Google Drive Hierarchy & Subdirectories</h3>
              <p className="text-xs text-warm-muted">
                Standard subdirectories automatically created inside every case folder under your Master Google Drive.
              </p>
            </div>

            {/* Master Google Drive Folder Root */}
            <div className="p-5 bg-white/90 rounded-3xl border border-warm-borderSubtle space-y-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-terracotta" />
                  Master Google Drive Litigation Root Folder
                </label>
                {config.firmBranding?.masterDriveUrl && (
                  <a
                    href={config.firmBranding.masterDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-terracotta hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in Drive
                  </a>
                )}
              </div>

              <input
                type="text"
                value={config.firmBranding?.masterDriveUrl || ''}
                onChange={(e) => handleMasterDriveChange(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1w7uR4K8yP... or Folder ID"
                className="w-full capsule-input text-xs font-mono font-medium"
              />

              {extractDriveFolderId(config.firmBranding?.masterDriveUrl) && (
                <p className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Master Folder ID: {extractDriveFolderId(config.firmBranding?.masterDriveUrl)}
                </p>
              )}
            </div>

            <form onSubmit={handleAddFolder} className="p-4 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder Name (e.g. 07_Certified_Decrees)"
                  className="flex-1 capsule-input text-xs font-mono"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Folder</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
              <input
                type="text"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Folder Purpose & Usage Description"
                className="w-full capsule-input text-xs"
              />
            </form>

            <div className="space-y-2">
              {(config.driveFolderTemplate || []).map(f => (
                <div
                  key={f.id}
                  className="p-3.5 bg-white/70 rounded-2xl border border-warm-borderSubtle flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-terracotta" />
                      <span className="text-xs font-mono font-bold text-warm-obsidian">{f.name}</span>
                    </div>
                    <p className="text-[11px] text-warm-muted mt-0.5">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingFolder({ ...f })}
                      className="p-1.5 text-warm-muted hover:text-warm-obsidian"
                      title="Edit Folder"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-terracotta" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(f.id)}
                      className="p-1.5 text-warm-muted hover:text-rose-600"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: HEARING REMINDERS */}
        {activeTab === 'REMINDERS' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Hearing Reminder Presets & Intervals</h3>
              <p className="text-xs text-warm-muted">
                Customise automated alert countdowns before scheduled court hearings.
              </p>
            </div>

            <form onSubmit={handleAddReminder} className="flex flex-wrap gap-2 p-3 bg-white/70 rounded-3xl border border-warm-borderSubtle">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-warm-muted">Days:</span>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={newReminderDays}
                  onChange={(e) => setNewReminderDays(e.target.value)}
                  className="w-16 capsule-input text-xs font-mono"
                />
              </div>

              <input
                type="text"
                required
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
                placeholder="Description (e.g. 10 Days Prior: Written Submissions Audit)"
                className="flex-1 min-w-[220px] capsule-input text-xs"
              />

              <select
                value={newReminderChannel}
                onChange={(e) => setNewReminderChannel(e.target.value)}
                className="capsule-input text-xs"
              >
                <option value="In-App + Email">In-App + Email</option>
                <option value="In-App + Email + SMS">In-App + Email + SMS</option>
                <option value="In-App + WhatsApp">In-App + WhatsApp</option>
                <option value="In-App Only">In-App Only</option>
              </select>

              <button
                type="submit"
                className="capsule-btn-dark text-xs"
              >
                <span>Add</span>
                <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </form>

            <div className="space-y-2">
              {(config.reminderPresets || []).map(r => (
                <div
                  key={r.id}
                  className="p-3.5 bg-white/70 rounded-2xl border border-warm-borderSubtle flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full sun-gradient-circle text-white font-bold text-xs flex items-center justify-center font-mono shadow-xs">
                      {r.daysBefore}d
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-warm-obsidian">{r.label}</p>
                      <p className="text-[10px] text-warm-muted">Alert Channel: {r.channel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingReminder({ ...r })}
                      className="p-1.5 text-warm-muted hover:text-warm-obsidian"
                      title="Edit Reminder"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-terracotta" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(r.id)}
                      className="p-1.5 text-warm-muted hover:text-rose-600"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: EMAIL TEMPLATES */}
        {activeTab === 'EMAILS' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Gmail & Share Brief Templates</h3>
              <p className="text-xs text-warm-muted">
                Customise default subject lines and body text when transmitting briefs to Senior Advocates and clients.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Subject Line Template</label>
                <input
                  type="text"
                  value={config.emailTemplates?.subjectTemplate || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    emailTemplates: { ...(prev.emailTemplates || {}), subjectTemplate: e.target.value }
                  }))}
                  className="w-full capsule-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Email Body Template</label>
                <textarea
                  rows={8}
                  value={config.emailTemplates?.bodyTemplate || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    emailTemplates: { ...(prev.emailTemplates || {}), bodyTemplate: e.target.value }
                  }))}
                  className="w-full p-4 rounded-3xl border border-warm-borderSubtle bg-white/80 text-xs font-mono text-warm-obsidian focus:outline-none focus:ring-2 focus:ring-terracotta/20 leading-relaxed"
                />
              </div>

              <div className="p-4 bg-warm-sand/40 rounded-3xl border border-warm-borderSubtle space-y-2">
                <p className="text-xs font-bold text-warm-obsidian">Available Dynamic Replacement Tokens:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-warm-graphite">
                  <div><code className="text-terracotta font-bold">&#123;case_number&#125;</code>: e.g. WPA 12840 of 2026</div>
                  <div><code className="text-terracotta font-bold">&#123;case_title&#125;</code>: e.g. Tata Steel vs Union of India</div>
                  <div><code className="text-terracotta font-bold">&#123;court_name&#125;</code>: e.g. Calcutta High Court</div>
                  <div><code className="text-terracotta font-bold">&#123;bench_name&#125;</code>: e.g. Single Bench (Court 13)</div>
                  <div><code className="text-terracotta font-bold">&#123;next_date&#125;</code>: e.g. 2026-11-28</div>
                  <div><code className="text-terracotta font-bold">&#123;drive_link&#125;</code>: Google Drive case URL</div>
                  <div><code className="text-terracotta font-bold">&#123;lead_counsel&#125;</code>: Lead Counsel's name</div>
                  <div><code className="text-terracotta font-bold">&#123;firm_name&#125;</code>: Your law firm title</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: AUTONOMOUS COURT MICROSERVICE & SCHEDULED SYNC */}
        {activeTab === 'AUTOSYNC' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-terracotta" />
                <h3 className="text-base font-bold text-warm-obsidian font-display">
                  eCourts Microservice Daemon & Automated Sync
                </h3>
              </div>
              <p className="text-xs text-warm-muted mt-1">
                Configure your self-hosted backend scraper, automated nightly court polling schedule, and dedicated Google Drive order archive folder.
              </p>
            </div>

            {/* Microservice Live Status Card */}
            <div className="p-5 rounded-3xl bg-white border border-warm-borderSubtle shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-borderSubtle/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${microserviceStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <h4 className="text-sm font-bold text-warm-obsidian">
                      Microservice Daemon Status: <span className={microserviceStatus === 'ONLINE' ? 'text-emerald-700' : 'text-amber-700'}>{microserviceStatus}</span>
                    </h4>
                    <span className="text-[11px] font-mono text-warm-muted">
                      {config.microserviceUrl || 'http://localhost:5001'} · Tesseract OCR Engine Ready
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchMicroserviceStatus}
                  disabled={isTestingMicroservice}
                  className="px-3.5 py-1.5 rounded-pill bg-warm-sand/60 hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-terracotta ${isTestingMicroservice ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>

              {/* Setting 1: Dedicated Google Drive Folder */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-warm-graphite">
                  Dedicated Folder for Auto-Fetched Orders (Google Drive & Local Storage) *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FolderSync className="w-4 h-4 text-terracotta absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={config.dedicatedOrderFolder || '05_AutoFetched_Court_Orders'}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dedicatedOrderFolder: e.target.value.trim().replace(/[^a-zA-Z0-9_-]/g, '_')
                      }))}
                      className="w-full pl-9 pr-3 py-2 text-xs capsule-input font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-warm-muted">
                  All court order PDFs pulled programmatically by the microservice are automatically isolated into this dedicated folder in Google Drive (e.g. <code>/{config.dedicatedOrderFolder || '05_AutoFetched_Court_Orders'}/</code>).
                </p>
              </div>

              {/* Setting 2: Automated Nightly Schedule */}
              <div className="pt-2 border-t border-warm-borderSubtle/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-warm-obsidian block">
                      Automated Scheduled Court Sync (Cron Job)
                    </label>
                    <span className="text-[11px] text-warm-muted">
                      Polls eCourts automatically after court rising hours every day.
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoSyncEnabled !== false}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoSyncEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-warm-graphite mb-1">
                      Cron Schedule Expression
                    </label>
                    <input
                      type="text"
                      value={config.autoSyncSchedule || '0 20 * * *'}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoSyncSchedule: e.target.value }))}
                      className="w-full capsule-input text-xs font-mono"
                      placeholder="0 20 * * *"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-warm-graphite mb-1">
                      Schedule Description
                    </label>
                    <div className="p-2 rounded-2xl bg-warm-sand/40 border border-warm-borderSubtle text-xs text-warm-obsidian flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-terracotta" />
                      Daily at 8:00 PM (Court Day Rising Hours)
                    </div>
                  </div>
                </div>
              </div>

              {/* Setting 3: Microservice Backend URL */}
              <div className="pt-2 border-t border-warm-borderSubtle/60 space-y-1.5">
                <label className="block text-xs font-semibold text-warm-graphite">
                  Microservice Server URL
                </label>
                <input
                  type="text"
                  value={config.microserviceUrl || 'http://localhost:5001'}
                  onChange={(e) => setConfig(prev => ({ ...prev, microserviceUrl: e.target.value }))}
                  className="w-full capsule-input text-xs font-mono"
                />
                <p className="text-[11px] text-warm-muted">
                  Runs locally on port 5001 or on your cloud backend (e.g. AWS/GCP/Docker).
                </p>
              </div>

              {/* Action Button: Batch Sync */}
              <div className="pt-3 border-t border-warm-borderSubtle/60 flex items-center justify-between">
                <span className="text-xs text-warm-muted">
                  Want to trigger sync across all active cases right now?
                </span>

                <button
                  type="button"
                  onClick={async () => {
                    setIsBatchSyncing(true);
                    showToast('Initiating firm-wide court database batch sync...');
                    try {
                      const url = config.microserviceUrl || 'http://localhost:5001';
                      const res = await fetch(`${url}/api/sync/batch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cases: [] })
                      });
                      if (res.ok) {
                        showToast('Batch court order sync completed!');
                        fetchMicroserviceStatus();
                      }
                    } catch (e) {
                      showToast('Could not run batch sync: ' + e.message, 'error');
                    } finally {
                      setIsBatchSyncing(false);
                    }
                  }}
                  disabled={isBatchSyncing}
                  className="capsule-btn-dark text-xs disabled:opacity-50"
                >
                  <span>{isBatchSyncing ? 'Syncing Portfolio...' : 'Run Portfolio Batch Sync Now'}</span>
                  <div className="knob"><RefreshCw className={`w-3.5 h-3.5 text-white ${isBatchSyncing ? 'animate-spin' : ''}`} /></div>
                </button>
              </div>
            </div>

            {/* Microservice Live Logs Terminal */}
            {microserviceLogs.length > 0 && (
              <div className="bg-warm-obsidian rounded-3xl p-4 text-xs font-mono text-white/90 space-y-1.5 max-h-56 overflow-y-auto border border-white/10 shadow-inner">
                <div className="text-[10px] uppercase font-bold text-terracotta-light flex items-center gap-1.5 pb-1 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Microservice Execution Audit Log
                </div>
                {microserviceLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-warm-muted text-[10px]">{log.timestamp.slice(11, 19)}</span>
                    <span className="text-terracotta font-bold">[{log.type}]</span>
                    <span className="text-white/80">{log.message}</span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 8: DANGER ZONE & FACTORY RESET */}
        {activeTab === 'DANGER' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-rose-800 font-display">Data Management & Factory Practice Reset</h3>
              </div>
              <p className="text-xs text-warm-muted mt-1">
                Perform administrative data cleanup or completely purge all practice litigation records.
              </p>
            </div>

            <div className="p-6 rounded-4xl bg-rose-500/10 border-2 border-rose-500/30 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 font-display">
                    Delete All Practice Data (Litigation Wipe)
                  </h4>
                  <p className="text-xs text-rose-800/90 leading-relaxed mt-1">
                    Permanently deletes <strong>all cases, uploaded filings, court orders, scheduled conferences, and assigned staff tasks</strong> from Firestore.
                  </p>
                  <p className="text-[11px] text-rose-700/80 mt-1 font-semibold">
                    ✓ Your Software Administrator login account and custom settings will be preserved so you remain in control.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="px-4 py-2 rounded-pill bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Initiate Full Practice Data Wipe</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- MODALS FOR EDITING CUSTOMIZATION ITEMS --- */}

      {/* Edit Court Modal */}
      {editingCourt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-xl glass-panel-elevated rounded-4xl border border-white/95 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-borderSubtle/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full sun-gradient-circle text-white flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-warm-obsidian font-display">Edit Judicial Forum Parameters</h3>
                  <p className="text-xs text-warm-muted">{editingCourt.name} ({editingCourt.code})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCourt(null)}
                className="w-7 h-7 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourt} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Forum Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCourt.name || ''}
                    onChange={(e) => setEditingCourt({ ...editingCourt, name: e.target.value })}
                    className="w-full capsule-input text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Court Code *</label>
                  <input
                    type="text"
                    required
                    value={editingCourt.code || ''}
                    onChange={(e) => setEditingCourt({ ...editingCourt, code: e.target.value.toUpperCase() })}
                    className="w-full capsule-input text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Forum Type</label>
                  <select
                    value={editingCourt.forumType || 'High Court'}
                    onChange={(e) => setEditingCourt({ ...editingCourt, forumType: e.target.value })}
                    className="w-full capsule-input text-xs"
                  >
                    <option value="Apex Court">Apex Court (Supreme Court)</option>
                    <option value="High Court">High Court</option>
                    <option value="Tribunal">Tribunal (NCLT / CAT / DRT / NGT)</option>
                    <option value="District Court">District & Sessions Court</option>
                    <option value="City Civil Court">City Civil Court</option>
                    <option value="Consumer Forum">Consumer Disputes Forum</option>
                    <option value="Arbitration">Arbitration Tribunal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    value={editingCourt.state || ''}
                    onChange={(e) => setEditingCourt({ ...editingCourt, state: e.target.value })}
                    className="w-full capsule-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Official Portal URL</label>
                <input
                  type="url"
                  value={editingCourt.portalUrl || ''}
                  onChange={(e) => setEditingCourt({ ...editingCourt, portalUrl: e.target.value })}
                  className="w-full capsule-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Benches (Comma-separated)</label>
                <input
                  type="text"
                  value={editingCourt.benches || ''}
                  onChange={(e) => setEditingCourt({ ...editingCourt, benches: e.target.value })}
                  className="w-full capsule-input text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-warm-borderSubtle/60">
                <button
                  type="button"
                  onClick={() => setEditingCourt(null)}
                  className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 text-xs font-semibold border border-warm-borderSubtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save Court Changes</span>
                  <div className="knob"><Check className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Case Type Modal */}
      {editingCaseType && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated rounded-4xl border border-white/95 p-6 space-y-4">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Edit Case Type</h3>
            <form onSubmit={handleUpdateCaseType} className="space-y-3">
              <input
                type="text"
                required
                value={editingCaseType.value}
                onChange={(e) => setEditingCaseType({ ...editingCaseType, value: e.target.value })}
                className="w-full capsule-input text-xs font-mono font-bold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCaseType(null)}
                  className="px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Case Stage Modal */}
      {editingCaseStage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated rounded-4xl border border-white/95 p-6 space-y-4">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Edit Procedural Stage</h3>
            <form onSubmit={handleUpdateCaseStage} className="space-y-3">
              <input
                type="text"
                required
                value={editingCaseStage.value}
                onChange={(e) => setEditingCaseStage({ ...editingCaseStage, value: e.target.value })}
                className="w-full capsule-input text-xs font-semibold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCaseStage(null)}
                  className="px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Category Modal */}
      {editingTaskCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm glass-panel-elevated rounded-4xl border border-white/95 p-6 space-y-4">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Edit Task Category</h3>
            <form onSubmit={handleUpdateTaskCategory} className="space-y-3">
              <input
                type="text"
                required
                value={editingTaskCategory.value}
                onChange={(e) => setEditingTaskCategory({ ...editingTaskCategory, value: e.target.value })}
                className="w-full capsule-input text-xs font-semibold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTaskCategory(null)}
                  className="px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Folder Template Modal */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated rounded-4xl border border-white/95 p-6 space-y-4">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Edit Folder Template</h3>
            <form onSubmit={handleUpdateFolder} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={editingFolder.name}
                  onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_') })}
                  className="w-full capsule-input text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Description</label>
                <input
                  type="text"
                  value={editingFolder.description || ''}
                  onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                  className="w-full capsule-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Reminder Preset Modal */}
      {editingReminder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-md glass-panel-elevated rounded-4xl border border-white/95 p-6 space-y-4">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Edit Reminder Preset</h3>
            <form onSubmit={handleUpdateReminder} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Days Before Hearing</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    required
                    value={editingReminder.daysBefore}
                    onChange={(e) => setEditingReminder({ ...editingReminder, daysBefore: parseInt(e.target.value, 10) })}
                    className="w-full capsule-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Alert Channel</label>
                  <select
                    value={editingReminder.channel}
                    onChange={(e) => setEditingReminder({ ...editingReminder, channel: e.target.value })}
                    className="w-full capsule-input text-xs"
                  >
                    <option value="In-App + Email">In-App + Email</option>
                    <option value="In-App + Email + SMS">In-App + Email + SMS</option>
                    <option value="In-App + WhatsApp">In-App + WhatsApp</option>
                    <option value="In-App Only">In-App Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Alert Label</label>
                <input
                  type="text"
                  required
                  value={editingReminder.label}
                  onChange={(e) => setEditingReminder({ ...editingReminder, label: e.target.value })}
                  className="w-full capsule-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReminder(null)}
                  className="px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Practice Data Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel-elevated rounded-4xl border-2 border-rose-500 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4 bg-white/95">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-900 font-display">Permanent Practice Data Wipe</h3>
                <p className="text-xs text-rose-700">Irreversible administrative action</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2 leading-relaxed">
              <p>
                This will immediately delete <strong>all registered cases, uploaded filings, orders, tasks, and scheduled conferences</strong> from Firestore database.
              </p>
              <p className="font-semibold text-rose-950">
                Type <span className="font-mono bg-white px-2 py-0.5 rounded border border-rose-300">DELETE ALL DATA</span> below to confirm:
              </p>
            </div>

            <input
              type="text"
              value={confirmDeleteInput}
              onChange={(e) => setConfirmDeleteInput(e.target.value)}
              placeholder="Type DELETE ALL DATA"
              className="w-full capsule-input text-xs font-mono font-bold tracking-wider text-rose-800"
            />

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-warm-borderSubtle/60">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAllConfirm(false);
                  setConfirmDeleteInput('');
                }}
                className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 text-xs font-semibold border border-warm-borderSubtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteAllData}
                disabled={confirmDeleteInput.trim().toUpperCase() !== 'DELETE ALL DATA'}
                className="px-4 py-2 rounded-pill bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Permanent Data Erase</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
