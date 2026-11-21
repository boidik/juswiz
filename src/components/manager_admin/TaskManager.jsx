import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Kanban, 
  List, 
  Trash2,
  ArrowRight
} from 'lucide-react';
import { TaskCreateModal } from './TaskCreateModal';

export const TaskManager = () => {
  const { tasks, updateTaskStatus, deleteTask, users, systemConfig } = useApp();

  const [viewMode, setViewMode] = useState('KANBAN');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTasks = tasks.filter(t => {
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesAssignee = filterAssignee === 'ALL' || (t.assignedTo || []).includes(filterAssignee);
    return matchesCategory && matchesAssignee;
  });

  const columns = [
    { key: 'TODO', label: 'To Do', badge: 'bg-warm-sand/80 text-warm-obsidian' },
    { key: 'IN_PROGRESS', label: 'In Drafting & Research', badge: 'bg-terracotta-soft text-terracotta' },
    { key: 'REVIEW', label: 'Senior Counsel Review', badge: 'bg-amber-500/10 text-amber-700' },
    { key: 'COMPLETED', label: 'Completed & Filed', badge: 'bg-emerald-500/10 text-emerald-700' }
  ];

  const getAssigneeUsers = (assignedIds = []) => {
    return users.filter(u => assignedIds.includes(u.id) || assignedIds.includes(u.uid));
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action & Filter Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-warm-sand/50 rounded-pill border border-warm-borderSubtle">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                viewMode === 'KANBAN' ? 'bg-warm-obsidian text-white shadow-xs' : 'text-warm-graphite hover:text-warm-obsidian'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                viewMode === 'LIST' ? 'bg-warm-obsidian text-white shadow-xs' : 'text-warm-graphite hover:text-warm-obsidian'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <span className="text-xs text-warm-muted font-medium hidden sm:inline">
            {filteredTasks.length} task(s) active
          </span>
        </div>

        {/* Filters & Delegate Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="capsule-input py-1.5 text-xs text-warm-graphite font-medium cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {systemConfig.taskCategories?.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="capsule-input py-1.5 text-xs text-warm-graphite font-medium cursor-pointer"
          >
            <option value="ALL">All Staff</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="capsule-btn-dark text-xs"
          >
            <span>Delegate Task</span>
            <div className="knob"><Plus className="w-3.5 h-3.5 text-white" /></div>
          </button>
        </div>

      </div>

      {/* Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);

            return (
              <div key={col.key} className="glass-panel rounded-3xl p-3.5 min-h-[480px] flex flex-col">
                
                {/* Column Header */}
                <div className="p-3 rounded-2xl bg-white/60 border border-warm-borderSubtle mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-warm-obsidian font-display">{col.label}</span>
                  <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1">
                  {colTasks.map(t => {
                    const assignees = getAssigneeUsers(t.assignedTo);

                    return (
                      <div
                        key={t.id}
                        className="bg-white/90 p-4 rounded-3xl border border-warm-borderSubtle shadow-xs hover:shadow-glass hover:border-terracotta/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-pill bg-warm-sand/50 text-warm-obsidian truncate max-w-[140px]">
                            {t.caseNumber}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded-pill text-[9px] font-bold uppercase tracking-wider ${
                            t.priority === 'CRITICAL' ? 'bg-terracotta-soft text-terracotta' :
                            t.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-700' :
                            'bg-warm-sand/40 text-warm-muted'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-warm-obsidian leading-snug font-display">
                          {t.title}
                        </h4>

                        <p className="text-[11px] text-warm-muted line-clamp-2 leading-relaxed">
                          {t.description || t.caseTitle}
                        </p>

                        <div className="text-[10px] text-terracotta bg-terracotta-soft px-2.5 py-0.5 rounded-pill font-semibold inline-block">
                          🏷️ {t.category}
                        </div>

                        {/* Assignee & Due Date */}
                        <div className="pt-2 border-t border-warm-borderSubtle/60 flex items-center justify-between">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {assignees.map(a => (
                              <div
                                key={a.id}
                                className="w-5 h-5 rounded-full bg-warm-obsidian text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white"
                                title={a.name}
                              >
                                {a.name?.charAt(0) || 'U'}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-medium text-warm-muted">
                            <Clock className="w-3 h-3 text-warm-muted" />
                            <span>{t.dueDate}</span>
                          </div>
                        </div>

                        {/* Status Mover */}
                        <div className="pt-2 flex items-center justify-between gap-1 border-t border-warm-borderSubtle/60 text-[10px]">
                          <select
                            value={t.status}
                            onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                            className="capsule-input py-0.5 px-2 text-[10px] text-warm-graphite"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>

                          <button
                            onClick={() => deleteTask(t.id)}
                            className="text-warm-muted hover:text-rose-600 p-1 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'LIST' && (
        <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-warm-borderSubtle/60">
          {filteredTasks.map(t => {
            const assignees = getAssigneeUsers(t.assignedTo);

            return (
              <div key={t.id} className="p-4 sm:p-5 hover:bg-white/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-pill bg-warm-sand/50 text-warm-obsidian">
                      {t.caseNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-pill bg-terracotta-soft text-terracotta">
                      {t.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-warm-obsidian font-display">{t.title}</h4>
                  <p className="text-xs text-warm-muted">{t.description || t.caseTitle}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {assignees.map(a => (
                      <span key={a.id} className="text-xs font-medium bg-white px-2.5 py-0.5 rounded-pill text-warm-graphite border border-warm-borderSubtle">
                        {a.name}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-mono text-warm-muted">Due: {t.dueDate}</span>

                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    className="capsule-input text-xs py-1"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

    </div>
  );
};
