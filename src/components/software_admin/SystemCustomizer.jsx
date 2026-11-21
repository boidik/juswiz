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
  Sparkles
} from 'lucide-react';
import { initialSystemConfig } from '../../mockData';

export const SystemCustomizer = () => {
  const { systemConfig, setSystemConfig, showToast } = useApp();

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

  const handleSave = () => {
    setSystemConfig(config);
    setSavedSuccess(true);
    showToast('System configuration & UI branding saved successfully!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all system settings and branding to original defaults?')) {
      setConfig(initialSystemConfig);
      setSystemConfig(initialSystemConfig);
      showToast('Settings reset to defaults.');
    }
  };

  // Courts Master helpers
  const handleAddCourt = (e) => {
    e.preventDefault();
    if (!newCourtName || !newCourtCode) return;
    const newCourt = {
      id: `c-${Date.now()}`,
      code: newCourtCode.toUpperCase().replace(/\s+/g, '_'),
      name: newCourtName,
      forumType: newCourtType,
      state: 'West Bengal',
      benches: ['Bench 1', 'Division Bench']
    };
    setConfig(prev => ({ ...prev, courts: [...prev.courts, newCourt] }));
    setNewCourtName('');
    setNewCourtCode('');
  };

  const handleDeleteCourt = (id) => {
    setConfig(prev => ({ ...prev, courts: prev.courts.filter(c => c.id !== id) }));
  };

  // Case Types helpers
  const handleAddCaseType = (e) => {
    e.preventDefault();
    if (!newCaseType) return;
    setConfig(prev => ({ ...prev, caseTypes: [...prev.caseTypes, newCaseType] }));
    setNewCaseType('');
  };

  const handleDeleteCaseType = (typeToRemove) => {
    setConfig(prev => ({ ...prev, caseTypes: prev.caseTypes.filter(ct => ct !== typeToRemove) }));
  };

  // Task Categories helpers
  const handleAddTaskCategory = (e) => {
    e.preventDefault();
    if (!newTaskCategory) return;
    setConfig(prev => ({ ...prev, taskCategories: [...prev.taskCategories, newTaskCategory] }));
    setNewTaskCategory('');
  };

  const handleDeleteTaskCategory = (catToRemove) => {
    setConfig(prev => ({ ...prev, taskCategories: prev.taskCategories.filter(cat => cat !== catToRemove) }));
  };

  // Folder Template helpers
  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    const newFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName.replace(/[^a-zA-Z0-9_-]/g, '_'),
      description: newFolderDesc || 'Directory for litigation documents'
    };
    setConfig(prev => ({ ...prev, driveFolderTemplate: [...prev.driveFolderTemplate, newFolder] }));
    setNewFolderName('');
    setNewFolderDesc('');
  };

  const handleDeleteFolder = (id) => {
    setConfig(prev => ({ ...prev, driveFolderTemplate: prev.driveFolderTemplate.filter(f => f.id !== id) }));
  };

  // Reminder Presets helpers
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
      reminderPresets: [...prev.reminderPresets, newPreset].sort((a, b) => b.daysBefore - a.daysBefore)
    }));
    setNewReminderLabel('');
  };

  const handleDeleteReminder = (id) => {
    setConfig(prev => ({ ...prev, reminderPresets: prev.reminderPresets.filter(r => r.id !== id) }));
  };

  return (
    <div className="bg-white rounded-m3-2xl shadow-m3-1 border border-neutral-200 overflow-hidden">
      
      {/* Top Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-purple-50/20 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900">Zero-Code System Customizer</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-material-primary text-white uppercase tracking-wider">
              Software Admin Only
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Modify UI branding, court masters, task categories, drive folders, and reminders without changing code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-m3-full border border-neutral-300 text-xs text-neutral-600 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings persisted to system memory & applied live across all consoles!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'BRANDING'
              ? 'border-material-primary text-material-primary bg-white font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Palette className="w-4 h-4" /> Branding & UI Appearance
        </button>

        <button
          onClick={() => setActiveTab('COURTS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'COURTS'
              ? 'border-material-primary text-material-primary bg-white font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Building className="w-4 h-4" /> Courts & Tribunals Master
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'TASKS'
              ? 'border-material-primary text-material-primary bg-white font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Task Categories
        </button>

        <button
          onClick={() => setActiveTab('DRIVE')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'DRIVE'
              ? 'border-material-primary text-material-primary bg-white font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Google Drive Folder Templates
        </button>

        <button
          onClick={() => setActiveTab('REMINDERS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'REMINDERS'
              ? 'border-material-primary text-material-primary bg-white font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Hearing Reminder Presets
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* TAB 1: BRANDING */}
        {activeTab === 'BRANDING' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Firm Identity & White-labeling</h3>
              <p className="text-xs text-neutral-500">
                Update the firm name, header tagline, logos, and primary accent palette.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Firm / Chambers Name</label>
                <input
                  type="text"
                  value={config.firmBranding.firmName}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, firmName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Header Subtitle</label>
                <input
                  type="text"
                  value={config.firmBranding.headerSubtitle}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, headerSubtitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Firm Tagline / Jurisdictions</label>
              <input
                type="text"
                value={config.firmBranding.tagline}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  firmBranding: { ...prev.firmBranding, tagline: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Logo URL (PNG / SVG)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={config.firmBranding.logoUrl}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      firmBranding: { ...prev.firmBranding, logoUrl: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                  />
                  <div className="w-9 h-9 border rounded-md p-1 flex items-center justify-center bg-neutral-50">
                    <img src={config.firmBranding.logoUrl} alt="Preview" className="max-w-full max-h-full" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Favicon URL</label>
                <input
                  type="url"
                  value={config.firmBranding.faviconUrl}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    firmBranding: { ...prev.firmBranding, faviconUrl: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                />
              </div>
            </div>

            {/* Color Palette Customizer */}
            <div className="p-4 bg-neutral-50 rounded-m3-xl border border-neutral-200">
              <label className="block text-xs font-bold text-neutral-800 mb-2">
                Primary Brand Color Scheme (Material 3 Theme)
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.firmBranding.primaryColor}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      firmBranding: { ...prev.firmBranding, primaryColor: e.target.value }
                    }))}
                    className="w-10 h-10 rounded-md border border-neutral-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-medium text-neutral-700">
                    {config.firmBranding.primaryColor}
                  </span>
                </div>

                {/* Preset quick colors */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Quick Presets:</span>
                  {[
                    { label: 'Google Blue', hex: '#0b57d0' },
                    { label: 'Oxford Navy', hex: '#002147' },
                    { label: 'Judicial Maroon', hex: '#721c24' },
                    { label: 'High Court Forest', hex: '#1b4332' },
                    { label: 'Slate Charcoal', hex: '#2b2d42' }
                  ].map(p => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        firmBranding: { ...prev.firmBranding, primaryColor: p.hex }
                      }))}
                      className="w-6 h-6 rounded-full border border-neutral-300 shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: p.hex }}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURTS & CASE TYPES */}
        {activeTab === 'COURTS' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Adjudicating Bodies & Forum Master</h3>
              <p className="text-xs text-neutral-500">
                Register High Courts, Tribunals, and District Courts so they appear in case registration and automated scrapers.
              </p>
            </div>

            {/* Add Court Form */}
            <form onSubmit={handleAddCourt} className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200">
              <input
                type="text"
                required
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                placeholder="Court Name (e.g. Bombay High Court)"
                className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
              />
              <input
                type="text"
                required
                value={newCourtCode}
                onChange={(e) => setNewCourtCode(e.target.value)}
                placeholder="Code (e.g. BOM_HC)"
                className="w-32 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
              />
              <select
                value={newCourtType}
                onChange={(e) => setNewCourtType(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
              >
                <option value="High Court">High Court</option>
                <option value="Apex Court">Apex Court (Supreme Court)</option>
                <option value="Tribunal">Tribunal (NCLT/CAT/DRT)</option>
                <option value="District Court">District Court</option>
                <option value="Commission">Consumer Commission</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-material-primary text-white text-xs font-medium rounded-m3-sm flex items-center gap-1 hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Court
              </button>
            </form>

            {/* List of Courts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.courts.map(c => (
                <div key={c.id} className="p-3 rounded-m3-lg border border-neutral-200 flex items-start justify-between bg-neutral-50/40 hover:bg-white transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {c.code}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900">{c.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Type: {c.forumType} • Benches: {c.benches?.join(', ') || 'Standard'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCourt(c.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Case Types Section */}
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900 mb-2">Master Case Classifications / Types</h4>
              
              <form onSubmit={handleAddCaseType} className="flex gap-2 mb-3 max-w-md">
                <input
                  type="text"
                  required
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  placeholder="New Case Type (e.g. Review Petition, Arbitration Appeal)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-m3-sm flex items-center gap-1 hover:bg-neutral-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5">
                {config.caseTypes.map((ct, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 text-neutral-700 border border-neutral-200"
                  >
                    {ct}
                    <button
                      onClick={() => handleDeleteCaseType(ct)}
                      className="text-neutral-400 hover:text-rose-600 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TASK CATEGORIES */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Task Categories Master</h3>
              <p className="text-xs text-neutral-500">
                These categories appear in the Manager Console when delegating tasks to advocates and clerks.
              </p>
            </div>

            <form onSubmit={handleAddTaskCategory} className="flex gap-2">
              <input
                type="text"
                required
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                placeholder="New Category (e.g. Evidence Compilation, Senior Briefing)"
                className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-material-primary text-white text-xs font-medium rounded-m3-md hover:bg-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </form>

            <div className="space-y-2">
              {config.taskCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-material-primary" />
                    <span className="text-xs font-medium text-neutral-800">{cat}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTaskCategory(cat)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GOOGLE DRIVE FOLDER TEMPLATE */}
        {activeTab === 'DRIVE' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Google Drive Automated Folder Taxonomy</h3>
              <p className="text-xs text-neutral-500">
                When a new case is registered, these subdirectories are automatically provisioned inside the case's Google Drive.
              </p>
            </div>

            <form onSubmit={handleAddFolder} className="p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder Name (e.g. 07_Certified_Copies)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-material-primary text-white text-xs font-medium rounded-m3-sm flex items-center gap-1 hover:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Folder
                </button>
              </div>
              <input
                type="text"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Folder Purpose & Usage Description"
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
              />
            </form>

            <div className="space-y-2">
              {config.driveFolderTemplate.map(f => (
                <div
                  key={f.id}
                  className="p-3 bg-blue-50/40 rounded-m3-lg border border-blue-200/60 flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-mono font-bold text-blue-900">{f.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">{f.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteFolder(f.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600"
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
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Hearing Reminder Intervals & Alert Cadence</h3>
              <p className="text-xs text-neutral-500">
                Specify countdown intervals before hearing dates for sending automated reminders across email and in-app alerts.
              </p>
            </div>

            <form onSubmit={handleAddReminder} className="flex gap-2 p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200">
              <input
                type="number"
                min="0"
                max="60"
                value={newReminderDays}
                onChange={(e) => setNewReminderDays(e.target.value)}
                className="w-20 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm font-mono"
              />
              <input
                type="text"
                required
                value={newReminderLabel}
                onChange={(e) => setNewReminderLabel(e.target.value)}
                placeholder="Reminder Description (e.g. 5 Days Before: File Caveat Search)"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-m3-sm"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-material-primary text-white text-xs font-medium rounded-m3-sm flex items-center gap-1 hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Preset
              </button>
            </form>

            <div className="space-y-2">
              {config.reminderPresets.map(r => (
                <div
                  key={r.id}
                  className="p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
                      {r.daysBefore}d
                    </span>
                    <div>
                      <p className="text-xs font-medium text-neutral-900">{r.label}</p>
                      <p className="text-[10px] text-neutral-500">Channel: {r.channel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReminder(r.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600"
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
