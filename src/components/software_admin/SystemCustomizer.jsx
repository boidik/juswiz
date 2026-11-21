import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { defaultSystemConfig } from '../../defaultConfig';

export const SystemCustomizer = () => {
  const { systemConfig, updateSystemConfig, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('BRANDING');
  const [config, setConfig] = useState(systemConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New item draft states
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtCode, setNewCourtCode] = useState('');
  const [newCourtType, setNewCourtType] = useState('High Court');
  const [newCaseType, setNewCaseType] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newReminderDays, setNewReminderDays] = useState(5);
  const [newReminderLabel, setNewReminderLabel] = useState('');

  const handleSave = async () => {
    const res = await updateSystemConfig(config);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all system settings and branding to original defaults?')) {
      setConfig(defaultSystemConfig);
      updateSystemConfig(defaultSystemConfig);
      showToast('Settings reset to defaults.');
    }
  };

  const handleAddCourt = (e) => {
    e.preventDefault();
    if (!newCourtName || !newCourtCode) return;
    const newCourt = {
      id: `c-${Date.now()}`,
      code: newCourtCode.toUpperCase().replace(/\s+/g, '_'),
      name: newCourtName,
      forumType: newCourtType,
      state: 'West Bengal',
      benches: ['Single Bench', 'Division Bench']
    };
    setConfig(prev => ({ ...prev, courts: [...(prev.courts || []), newCourt] }));
    setNewCourtName('');
    setNewCourtCode('');
  };

  const handleDeleteCourt = (id) => {
    setConfig(prev => ({ ...prev, courts: prev.courts.filter(c => c.id !== id) }));
  };

  const handleAddCaseType = (e) => {
    e.preventDefault();
    if (!newCaseType) return;
    setConfig(prev => ({ ...prev, caseTypes: [...(prev.caseTypes || []), newCaseType] }));
    setNewCaseType('');
  };

  const handleDeleteCaseType = (typeToRemove) => {
    setConfig(prev => ({ ...prev, caseTypes: prev.caseTypes.filter(ct => ct !== typeToRemove) }));
  };

  const handleAddTaskCategory = (e) => {
    e.preventDefault();
    if (!newTaskCategory) return;
    setConfig(prev => ({ ...prev, taskCategories: [...(prev.taskCategories || []), newTaskCategory] }));
    setNewTaskCategory('');
  };

  const handleDeleteTaskCategory = (catToRemove) => {
    setConfig(prev => ({ ...prev, taskCategories: prev.taskCategories.filter(cat => cat !== catToRemove) }));
  };

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    const newFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName.replace(/[^a-zA-Z0-9_-]/g, '_'),
      description: newFolderDesc || 'Directory for litigation documents'
    };
    setConfig(prev => ({ ...prev, driveFolderTemplate: [...(prev.driveFolderTemplate || []), newFolder] }));
    setNewFolderName('');
    setNewFolderDesc('');
  };

  const handleDeleteFolder = (id) => {
    setConfig(prev => ({ ...prev, driveFolderTemplate: prev.driveFolderTemplate.filter(f => f.id !== id) }));
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminderLabel) return;
    const newPreset = {
      id: `r-${Date.now()}`,
      daysBefore: parseInt(newReminderDays, 10),
      label: newReminderLabel,
      channel: 'In-App + Email',
      active: true
    };
    setConfig(prev => ({
      ...prev,
      reminderPresets: [...(prev.reminderPresets || []), newPreset].sort((a, b) => b.daysBefore - a.daysBefore)
    }));
    setNewReminderLabel('');
  };

  const handleDeleteReminder = (id) => {
    setConfig(prev => ({ ...prev, reminderPresets: prev.reminderPresets.filter(r => r.id !== id) }));
  };

  return (
    <div className="glass-panel rounded-4xl overflow-hidden">
      
      {/* Top Banner */}
      <div className="p-6 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-warm-obsidian font-display">Zero-Code System Customizer</h2>
            <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta text-white uppercase tracking-wider">
              Firebase Synced
            </span>
          </div>
          <p className="text-xs text-warm-muted mt-0.5">
            Modify UI aesthetics, court taxonomies, task categories, and drive templates without editing code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-pill border border-warm-borderSubtle text-xs text-warm-graphite hover:bg-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>
          <button
            onClick={handleSave}
            className="capsule-btn-dark text-xs"
          >
            <span>Save to Firebase</span>
            <div className="knob"><Save className="w-3.5 h-3.5 text-white" /></div>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Configuration persisted to Firebase Firestore and updated live across all consoles!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-warm-borderSubtle bg-white/40 overflow-x-auto px-4">
        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'BRANDING'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Palette className="w-4 h-4" /> Branding & Theme
        </button>

        <button
          onClick={() => setActiveTab('COURTS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'COURTS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Building className="w-4 h-4" /> Courts & Tribunals Master
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'TASKS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Task Categories
        </button>

        <button
          onClick={() => setActiveTab('DRIVE')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'DRIVE'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Drive Folder Templates
        </button>

        <button
          onClick={() => setActiveTab('REMINDERS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'REMINDERS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Clock className="w-4 h-4" /> Reminder Presets
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* TAB 1: BRANDING */}
        {activeTab === 'BRANDING' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Firm Identity & White-labeling</h3>
              <p className="text-xs text-warm-muted">
                Update the firm name, header tagline, logos, and primary brand palette.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">Firm / Chambers Name</label>
                <input
                  type="text"
                  value={config.firmBranding?.firmName || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, firmName: e.target.value }
                  }))}
                  className="w-full capsule-input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">Header Subtitle</label>
                <input
                  type="text"
                  value={config.firmBranding?.headerSubtitle || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, headerSubtitle: e.target.value }
                  }))}
                  className="w-full capsule-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1">Tagline / Jurisdictions</label>
              <input
                type="text"
                value={config.firmBranding?.tagline || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  firmBranding: { ...prev.firmBranding, tagline: e.target.value }
                }))}
                className="w-full capsule-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">Logo URL (PNG / SVG)</label>
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
                  <div className="w-10 h-10 rounded-2xl border border-warm-borderSubtle p-1 flex items-center justify-center bg-white shrink-0">
                    <img src={config.firmBranding?.logoUrl} alt="Preview" className="max-w-full max-h-full" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">Favicon URL</label>
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

            {/* Color Palette Selector */}
            <div className="p-5 bg-white/70 rounded-3xl border border-warm-borderSubtle">
              <label className="block text-xs font-bold text-warm-obsidian mb-2">
                Primary Brand Accent Color
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
                  <span className="text-xs font-mono font-medium text-warm-obsidian">
                    {config.firmBranding?.primaryColor}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-warm-muted">Pinterest Curated Palettes:</span>
                  {[
                    { label: 'Radiant Terracotta', hex: '#FF6F1F' },
                    { label: 'Apricot Amber', hex: '#FF8A3D' },
                    { label: 'Warm Espresso', hex: '#3E2723' },
                    { label: 'Obsidian Black', hex: '#141416' },
                    { label: 'High Court Sage', hex: '#2E7D32' }
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

        {/* TAB 2: COURTS */}
        {activeTab === 'COURTS' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Courts & Tribunals Master</h3>
              <p className="text-xs text-warm-muted">
                Add or edit adjudicating bodies (High Courts, Supreme Court, Tribunals, District Courts).
              </p>
            </div>

            <form onSubmit={handleAddCourt} className="flex flex-wrap gap-2 p-3 bg-white/70 rounded-3xl border border-warm-borderSubtle">
              <input
                type="text"
                required
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                placeholder="Court Name (e.g. Bombay High Court)"
                className="flex-1 min-w-[200px] capsule-input text-xs"
              />
              <input
                type="text"
                required
                value={newCourtCode}
                onChange={(e) => setNewCourtCode(e.target.value)}
                placeholder="Code (e.g. BOM_HC)"
                className="w-32 capsule-input text-xs"
              />
              <select
                value={newCourtType}
                onChange={(e) => setNewCourtType(e.target.value)}
                className="capsule-input text-xs"
              >
                <option value="High Court">High Court</option>
                <option value="Apex Court">Apex Court</option>
                <option value="Tribunal">Tribunal</option>
                <option value="District Court">District Court</option>
              </select>
              <button
                type="submit"
                className="capsule-btn-dark text-xs"
              >
                <span>Add Court</span>
                <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.courts?.map(c => (
                <div key={c.id} className="p-4 rounded-3xl glass-panel flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-pill bg-warm-sand/60 text-warm-obsidian">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-warm-obsidian font-display">{c.name}</span>
                    </div>
                    <p className="text-[11px] text-warm-muted mt-1">
                      {c.forumType} • Benches: {c.benches?.join(', ') || 'Standard'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCourt(c.id)}
                    className="p-1 text-warm-muted hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TASKS */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Task Categories Master</h3>
              <p className="text-xs text-warm-muted">
                These categories appear in Manager Admin when delegating work to advocates and clerks.
              </p>
            </div>

            <form onSubmit={handleAddTaskCategory} className="flex gap-2">
              <input
                type="text"
                required
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                placeholder="New Category (e.g. Injunction Argument Notes)"
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

            <div className="space-y-2">
              {config.taskCategories?.map((cat, idx) => (
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
        )}

        {/* TAB 4: DRIVE */}
        {activeTab === 'DRIVE' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Google Drive Folder Taxonomy</h3>
              <p className="text-xs text-warm-muted">
                Subdirectories automatically provisioned inside the case's Google Drive.
              </p>
            </div>

            <form onSubmit={handleAddFolder} className="p-4 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder Name (e.g. 07_Certified_Copies)"
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
              {config.driveFolderTemplate?.map(f => (
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

        {/* TAB 5: REMINDERS */}
        {activeTab === 'REMINDERS' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display mb-1">Hearing Reminder Presets</h3>
              <p className="text-xs text-warm-muted">
                Specify countdown intervals before hearing dates for automated notification alerts.
              </p>
            </div>

            <form onSubmit={handleAddReminder} className="flex gap-2 p-3 bg-white/70 rounded-3xl border border-warm-borderSubtle">
              <input
                type="number"
                min="0"
                max="60"
                value={newReminderDays}
                onChange={(e) => setNewReminderDays(e.target.value)}
                className="w-20 capsule-input text-xs font-mono"
              />
              <input
                type="text"
                required
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
                placeholder="Reminder Description (e.g. 5 Days Prior: List of Dates)"
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

            <div className="space-y-2">
              {config.reminderPresets?.map(r => (
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
                      <p className="text-[10px] text-warm-muted">Channel: {r.channel}</p>
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

      </div>
    </div>
  );
};
