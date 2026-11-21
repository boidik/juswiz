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
  AlertCircle
} from 'lucide-react';
import { defaultSystemConfig } from '../../defaultConfig';

export const SystemCustomizer = () => {
  const { systemConfig, updateSystemConfig, showToast } = useApp();

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

  // Courts Master Handlers
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

  const handleDeleteCourt = (id) => {
    setConfig(prev => ({ ...prev, courts: (prev.courts || []).filter(c => c.id !== id) }));
  };

  // Case Types & Stages Handlers
  const handleAddCaseType = (e) => {
    e.preventDefault();
    if (!newCaseType.trim()) return;
    setConfig(prev => ({ ...prev, caseTypes: [...(prev.caseTypes || []), newCaseType.trim()] }));
    setNewCaseType('');
  };

  const handleDeleteCaseType = (typeToRemove) => {
    setConfig(prev => ({ ...prev, caseTypes: (prev.caseTypes || []).filter(ct => ct !== typeToRemove) }));
  };

  const handleAddCaseStage = (e) => {
    e.preventDefault();
    if (!newCaseStage.trim()) return;
    setConfig(prev => ({ ...prev, caseStages: [...(prev.caseStages || []), newCaseStage.trim()] }));
    setNewCaseStage('');
  };

  const handleDeleteCaseStage = (stageToRemove) => {
    setConfig(prev => ({ ...prev, caseStages: (prev.caseStages || []).filter(s => s !== stageToRemove) }));
  };

  // Task Categories & Priorities Handlers
  const handleAddTaskCategory = (e) => {
    e.preventDefault();
    if (!newTaskCategory.trim()) return;
    setConfig(prev => ({ ...prev, taskCategories: [...(prev.taskCategories || []), newTaskCategory.trim()] }));
    setNewTaskCategory('');
  };

  const handleDeleteTaskCategory = (catToRemove) => {
    setConfig(prev => ({ ...prev, taskCategories: (prev.taskCategories || []).filter(cat => cat !== catToRemove) }));
  };

  const handleAddTaskPriority = (e) => {
    e.preventDefault();
    if (!newTaskPriority.trim()) return;
    setConfig(prev => ({ ...prev, taskPriorities: [...(prev.taskPriorities || []), newTaskPriority.trim().toUpperCase()] }));
    setNewTaskPriority('');
  };

  const handleDeleteTaskPriority = (priorityToRemove) => {
    setConfig(prev => ({ ...prev, taskPriorities: (prev.taskPriorities || []).filter(p => p !== priorityToRemove) }));
  };

  // Folder Templates Handlers
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

  const handleDeleteFolder = (id) => {
    setConfig(prev => ({ ...prev, driveFolderTemplate: (prev.driveFolderTemplate || []).filter(f => f.id !== id) }));
  };

  // Hearing Reminders Handlers
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

  const handleDeleteReminder = (id) => {
    setConfig(prev => ({ ...prev, reminderPresets: (prev.reminderPresets || []).filter(r => r.id !== id) }));
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
            Configure every aspect without writing code: white-label branding, courts, online scraper endpoints, case stages, task workflows, Drive templates, and email templates.
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
            <span>Save All to Firebase</span>
            <div className="knob"><Save className="w-3.5 h-3.5 text-white" /></div>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          All configuration changes saved and broadcast live to all consoles!
        </div>
      )}

      {/* Responsive Horizontal Tab Bar */}
      <div className="flex border-b border-warm-borderSubtle bg-white/40 overflow-x-auto no-scrollbar px-3 sm:px-6">
        {[
          { key: 'BRANDING', label: 'Branding & Theme', icon: Palette },
          { key: 'COURTS', label: 'Courts & Scrapers', icon: Building },
          { key: 'CASE_FIELDS', label: 'Case Forms & Stages', icon: Layers },
          { key: 'TASKS', label: 'Task Workflow', icon: CheckSquare },
          { key: 'DRIVE', label: 'Drive Templates', icon: FolderTree },
          { key: 'REMINDERS', label: 'Hearing Reminders', icon: Clock },
          { key: 'EMAILS', label: 'Email Templates', icon: Mail },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-terracotta text-terracotta font-bold'
                  : 'border-transparent text-warm-muted hover:text-warm-obsidian'
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
        
        {/* TAB 1: BRANDING & THEME */}
        {activeTab === 'BRANDING' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Firm Identity & White-labeling</h3>
              <p className="text-xs text-warm-muted">
                Customise the firm title, tagline, logo icon, favicon, and master cloud drive.
              </p>
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
                  placeholder="e.g. Warm Minimalist Legal Practice Suite"
                  className="w-full capsule-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1.5">Jurisdiction Tagline</label>
              <input
                type="text"
                value={config.firmBranding?.tagline || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  firmBranding: { ...prev.firmBranding, tagline: e.target.value }
                }))}
                placeholder="e.g. Advocates & Legal Consultants • High Court at Calcutta & Supreme Court"
                className="w-full capsule-input text-xs"
              />
            </div>

            {/* Master Google Drive URL */}
            <div className="p-4 bg-white/80 rounded-3xl border border-warm-borderSubtle space-y-2">
              <label className="block text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-terracotta" />
                Master Google Drive Root URL
              </label>
              <input
                type="url"
                value={config.firmBranding?.masterDriveUrl || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  firmBranding: { ...prev.firmBranding, masterDriveUrl: e.target.value }
                }))}
                placeholder="https://drive.google.com/drive/folders/YOUR_CHAMBERS_MASTER_ROOT_ID"
                className="w-full capsule-input text-xs font-mono"
              />
              <p className="text-[11px] text-warm-muted">
                This root drive opens when staff or managers click the Master Cloud Drive in the header or workspace.
              </p>
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
                Add any judicial forum (Supreme Court, High Courts, NCLT, CAT, District Courts, Tribunals). When you add a new forum with its official portal and scraper engine, staff can automatically fetch daily orders online.
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
                    className="w-full capsule-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-warm-graphite mb-1">Court Code *</label>
                  <input
                    type="text"
                    required
                    value={newCourtCode}
                    onChange={(e) => setNewCourtCode(e.target.value)}
                    placeholder="e.g. DEL_HC"
                    className="w-full capsule-input text-xs font-mono uppercase"
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

            {/* Courts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(config.courts || []).map(c => (
                <div key={c.id || c.code} className="p-4 rounded-3xl glass-panel flex flex-col justify-between space-y-2 border border-white/80">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-pill bg-warm-sand/80 text-warm-obsidian">
                          {c.code}
                        </span>
                        <span className="text-xs font-bold text-warm-obsidian font-display">{c.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCourt(c.id)}
                        className="p-1 text-warm-muted hover:text-rose-600 transition-colors"
                        title="Remove Court"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-warm-muted">
                      <span className="font-medium text-warm-graphite">{c.forumType}</span>
                      <span>•</span>
                      <span>{c.state || 'National'}</span>
                      <span>•</span>
                      <span className="font-mono text-terracotta text-[10px]">{c.queryEngine || 'DIRECT'}</span>
                    </div>

                    {c.portalUrl && (
                      <div className="mt-2">
                        <a
                          href={c.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[280px]">{c.portalUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-warm-borderSubtle/50 text-[11px] text-warm-muted truncate">
                    Benches: {Array.isArray(c.benches) ? c.benches.join(', ') : 'Standard'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CASE FORMS & STAGES */}
        {activeTab === 'CASE_FIELDS' && (
          <div className="space-y-8 max-w-3xl">
            {/* Case Types Master */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Litigation Matter Types</h3>
                <p className="text-xs text-warm-muted">
                  Customise case categories (Writ Petitions, Civil Suits, Appeals, Company Petitions).
                </p>
              </div>

              <form onSubmit={handleAddCaseType} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  placeholder="New Matter Type (e.g. Commercial Suit / Summary Suit)"
                  className="flex-1 capsule-input text-xs"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add Type</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(config.caseTypes || []).map((ct, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white/70 rounded-2xl border border-warm-borderSubtle"
                  >
                    <span className="text-xs font-semibold text-warm-obsidian truncate">{ct}</span>
                    <button
                      onClick={() => handleDeleteCaseType(ct)}
                      className="text-warm-muted hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Stages Master */}
            <div className="space-y-4 pt-4 border-t border-warm-borderSubtle">
              <div>
                <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Litigation Stages & Procedural Lifecycle</h3>
                <p className="text-xs text-warm-muted">
                  The sequential milestones of a lawsuit, from initial registration to final decree execution.
                </p>
              </div>

              <form onSubmit={handleAddCaseStage} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCaseStage}
                  onChange={(e) => setNewCaseStage(e.target.value)}
                  placeholder="New Case Stage (e.g. Cross Examination of Plaintiff Witness)"
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

              <div className="space-y-2">
                {(config.caseStages || []).map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white/70 rounded-2xl border border-warm-borderSubtle"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-warm-sand flex items-center justify-center font-mono text-[10px] font-bold text-warm-graphite">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-warm-obsidian">{stage}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCaseStage(stage)}
                      className="text-warm-muted hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TASK WORKFLOW */}
        {activeTab === 'TASKS' && (
          <div className="space-y-8 max-w-3xl">
            {/* Task Categories */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Task Categories Master</h3>
                <p className="text-xs text-warm-muted">
                  Categories available in Manager Admin when delegating briefs, research, and filing tasks.
                </p>
              </div>

              <form onSubmit={handleAddTaskCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  placeholder="New Category (e.g. Caveat Search & Service Verification)"
                  className="flex-1 capsule-input text-xs"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(config.taskCategories || []).map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white/70 rounded-2xl border border-warm-borderSubtle"
                  >
                    <span className="text-xs font-semibold text-warm-obsidian">{cat}</span>
                    <button
                      onClick={() => handleDeleteTaskCategory(cat)}
                      className="text-warm-muted hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Priorities */}
            <div className="space-y-4 pt-4 border-t border-warm-borderSubtle">
              <div>
                <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Task Priority Levels</h3>
                <p className="text-xs text-warm-muted">
                  Configure urgency levels for delegated work.
                </p>
              </div>

              <form onSubmit={handleAddTaskPriority} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  placeholder="New Priority Level (e.g. EMERGENCY)"
                  className="flex-1 capsule-input text-xs font-mono uppercase"
                />
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Add</span>
                  <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {(config.taskPriorities || []).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white border border-warm-borderSubtle shadow-xs"
                  >
                    <span className="text-xs font-mono font-bold text-warm-obsidian">{p}</span>
                    <button
                      onClick={() => handleDeleteTaskPriority(p)}
                      className="text-warm-muted hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DRIVE TEMPLATES */}
        {activeTab === 'DRIVE' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Google Drive Folder Taxonomy</h3>
              <p className="text-xs text-warm-muted">
                Standard subdirectories automatically provisioned for every case folder in Google Drive.
              </p>
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
                  <button
                    onClick={() => handleDeleteFolder(f.id)}
                    className="p-1 text-warm-muted hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="p-1 text-warm-muted hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: EMAIL & BRIEF TEMPLATES */}
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

              {/* Dynamic Tokens Guide */}
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

      </div>
    </div>
  );
};
