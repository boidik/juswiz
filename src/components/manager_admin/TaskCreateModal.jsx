import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckSquare, Calendar, User, AlertCircle, Plus, Briefcase, FileText } from 'lucide-react';

export const TaskCreateModal = ({ isOpen, onClose }) => {
  const { cases, users, systemConfig, createTask } = useApp();

  const [taskScope, setTaskScope] = useState('CASE_LINKED'); // 'CASE_LINKED' | 'FIRM_LEVEL'
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [customCaseRef, setCustomCaseRef] = useState('');
  const [customCaseTitle, setCustomCaseTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [category, setCategory] = useState(systemConfig.taskCategories?.[0] || 'Drafting - Writ / Plaint / Petition');
  const [priority, setPriority] = useState(systemConfig.taskPriorities?.[0] || 'HIGH');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const toggleAssignee = (userId) => {
    setAssignedTo(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      caseId: taskScope === 'CASE_LINKED' ? caseId : null,
      customCaseRef: taskScope === 'FIRM_LEVEL' ? customCaseRef : undefined,
      customCaseTitle: taskScope === 'FIRM_LEVEL' ? customCaseTitle : undefined,
      title: title.trim(),
      description: description.trim(),
      assignedTo: assignedTo.length > 0 ? assignedTo : [users[0]?.id].filter(Boolean),
      category,
      priority,
      dueDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-4xl border border-white/95 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-warm-borderSubtle/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-warm-obsidian font-display tracking-tight">
                Delegate & Assign Litigation Task
              </h2>
              <p className="text-xs text-warm-muted mt-0.5">
                Manager Admin Console • Assign case-specific or firm-level tasks to advocates & clerks
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
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1">
          
          {/* Task Scope: Case-linked vs Standalone */}
          <div className="p-3.5 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-2">
            <label className="block text-xs font-bold text-warm-obsidian">
              Task Association Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaskScope('CASE_LINKED')}
                className={`p-3 rounded-2xl text-left text-xs transition-all border ${
                  taskScope === 'CASE_LINKED'
                    ? 'bg-white border-terracotta text-warm-obsidian shadow-xs ring-2 ring-terracotta/20 font-bold'
                    : 'bg-warm-sand/40 border-warm-borderSubtle text-warm-muted hover:text-warm-obsidian'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-warm-obsidian">
                  <Briefcase className="w-3.5 h-3.5 text-terracotta" />
                  <span>Case-Linked Task</span>
                </div>
                <div className="text-[10px] text-warm-muted mt-0.5">Tied to an ongoing court or tribunal docket</div>
              </button>

              <button
                type="button"
                onClick={() => setTaskScope('FIRM_LEVEL')}
                className={`p-3 rounded-2xl text-left text-xs transition-all border ${
                  taskScope === 'FIRM_LEVEL'
                    ? 'bg-white border-terracotta text-warm-obsidian shadow-xs ring-2 ring-terracotta/20 font-bold'
                    : 'bg-warm-sand/40 border-warm-borderSubtle text-warm-muted hover:text-warm-obsidian'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-warm-obsidian">
                  <FileText className="w-3.5 h-3.5 text-terracotta" />
                  <span>Chambers Administrative</span>
                </div>
                <div className="text-[10px] text-warm-muted mt-0.5">Bar membership, office compliance, general research</div>
              </button>
            </div>
          </div>

          {/* Conditional Case Selector */}
          {taskScope === 'CASE_LINKED' ? (
            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                Select Ongoing Case Docket *
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full capsule-input text-xs"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title} ({c.courtName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                  Custom Task Reference / Code
                </label>
                <input
                  type="text"
                  value={customCaseRef}
                  onChange={(e) => setCustomCaseRef(e.target.value)}
                  placeholder="e.g. CHAMBERS-ADMIN-04"
                  className="w-full capsule-input text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                  Task Heading / Project
                </label>
                <input
                  type="text"
                  value={customCaseTitle}
                  onChange={(e) => setCustomCaseTitle(e.target.value)}
                  placeholder="e.g. Bar Library Club Compliance"
                  className="w-full capsule-input text-xs"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
              Task Action Item *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Draft Affidavit-in-Opposition focusing on limitation period..."
              className="w-full capsule-input text-xs font-medium"
            />
          </div>

          {/* Category & Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                Category (From Custom Master)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full capsule-input text-xs"
              >
                {(systemConfig.taskCategories || []).map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full capsule-input text-xs font-bold"
              >
                {(systemConfig.taskPriorities || ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                Target Deadline *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full capsule-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Multi-Person Assignment */}
          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1.5 flex items-center justify-between">
              <span>Engage Advocates & Clerks (Multi-Select) *</span>
              <span className="text-[11px] text-terracotta font-semibold">{assignedTo.length} selected</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {users.map(u => {
                const isSelected = assignedTo.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleAssignee(u.id)}
                    className={`p-2.5 rounded-2xl text-left text-xs border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white border-terracotta text-warm-obsidian shadow-xs ring-2 ring-terracotta/20 font-bold'
                        : 'bg-white/60 border-warm-borderSubtle text-warm-graphite hover:bg-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'sun-gradient-circle text-white shadow-xs' : 'bg-warm-sand text-warm-graphite'
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="truncate min-w-0">
                      <p className="font-semibold text-warm-obsidian truncate">{u.name}</p>
                      <p className="text-[9px] text-warm-muted uppercase tracking-wider">{u.role?.replace('_', ' ')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Instructions */}
          <div>
            <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
              Directives, Precedents & Legal Scope
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify precedents, key annexures, prayer amendments, or conference notes..."
              className="w-full p-3 rounded-3xl border border-warm-borderSubtle bg-white/80 text-xs text-warm-obsidian focus:outline-none focus:ring-2 focus:ring-terracotta/20 leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-borderSubtle/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-warm-graphite hover:bg-white rounded-pill transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="capsule-btn-dark text-xs"
            >
              <span>Delegate Task</span>
              <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
