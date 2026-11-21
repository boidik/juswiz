import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckSquare, Calendar, User, AlertCircle, Plus } from 'lucide-react';

export const TaskCreateModal = ({ isOpen, onClose }) => {
  const { cases, users, systemConfig, createTask } = useApp();

  const [taskScope, setTaskScope] = useState('CASE_LINKED'); // 'CASE_LINKED' | 'FIRM_LEVEL'
  const [caseId, setCaseId] = useState(cases[0]?.id || '');
  const [customCaseRef, setCustomCaseRef] = useState('');
  const [customCaseTitle, setCustomCaseTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [category, setCategory] = useState(systemConfig.taskCategories[0] || 'Drafting');
  const [priority, setPriority] = useState('HIGH');
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
    if (!title) return;

    createTask({
      caseId: taskScope === 'CASE_LINKED' ? caseId : null,
      customCaseRef: taskScope === 'FIRM_LEVEL' ? customCaseRef : undefined,
      customCaseTitle: taskScope === 'FIRM_LEVEL' ? customCaseTitle : undefined,
      title,
      description,
      assignedTo: assignedTo.length > 0 ? assignedTo : [users[0].id],
      category,
      priority,
      dueDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-emerald-600 text-white shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Delegate & Assign Litigation Task</h2>
              <p className="text-xs text-neutral-500">
                Manager Admin Console • Assign case-specific or firm-level tasks to advocates & clerks
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Task Scope: Case-linked vs Standalone */}
          <div className="p-3 bg-neutral-50 rounded-m3-lg border border-neutral-200">
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Task Association Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTaskScope('CASE_LINKED')}
                className={`p-2.5 rounded-m3-md text-xs font-medium text-left border transition-all ${
                  taskScope === 'CASE_LINKED'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold">Case-Linked Task</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Tied to an active High Court, SCI, or Tribunal matter</div>
              </button>

              <button
                type="button"
                onClick={() => setTaskScope('FIRM_LEVEL')}
                className={`p-2.5 rounded-m3-md text-xs font-medium text-left border transition-all ${
                  taskScope === 'FIRM_LEVEL'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold">Standalone / Administrative Task</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Bar subscription, compliance, general office administrative action</div>
              </button>
            </div>
          </div>

          {/* Conditional Case Selector */}
          {taskScope === 'CASE_LINKED' ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Ongoing Case *
              </label>
              <select
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title} ({c.courtName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Custom Task Reference / Code
                </label>
                <input
                  type="text"
                  value={customCaseRef}
                  onChange={(e) => setCustomCaseRef(e.target.value)}
                  placeholder="e.g. FIRM-ADMIN-12"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Task Heading / Project
                </label>
                <input
                  type="text"
                  value={customCaseTitle}
                  onChange={(e) => setCustomCaseTitle(e.target.value)}
                  placeholder="e.g. Bar Library Club Compliance"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Task Action Item *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Draft Affidavit-in-Opposition focusing on limitation period..."
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Priority & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category (From Admin Master)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              >
                {systemConfig.taskCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Hearing Approaching)</option>
                <option value="CRITICAL">Critical (Urgent Listing / Stay)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Deadline Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md"
              />
            </div>
          </div>

          {/* Multi-Person Assignment */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center justify-between">
              <span>Engage Personnel (Select Multiple Advocates & Clerks) *</span>
              <span className="text-[11px] text-neutral-500">{assignedTo.length} selected</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleAssignee(u.id)}
                  className={`p-2 rounded-m3-md text-left text-xs border transition-all flex items-center gap-2 ${
                    assignedTo.includes(u.id)
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    assignedTo.includes(u.id) ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {u.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold truncate">{u.name}</p>
                    <p className="text-[9px] text-neutral-500 uppercase">{u.role.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Instructions */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Instructions & Research Directives
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify precedents to research, key annexures, or conference requirements..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-m3-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-m3-full shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Delegate Task
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
