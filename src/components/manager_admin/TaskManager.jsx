import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Trash2,
  Layers,
  List,
  Kanban
} from 'lucide-react';
import { TaskCreateModal } from './TaskCreateModal';

export const TaskManager = () => {
  const { tasks, updateTaskStatus, deleteTask, users, systemConfig } = useApp();

  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' | 'LIST'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTasks = tasks.filter(t => {
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    const matchesAssignee = filterAssignee === 'ALL' || t.assignedTo.includes(filterAssignee);
    return matchesCategory && matchesAssignee;
  });

  const columns = [
    { key: 'TODO', label: 'To Do', color: 'border-neutral-300 text-neutral-700 bg-neutral-100' },
    { key: 'IN_PROGRESS', label: 'In Progress (Drafting & Research)', color: 'border-blue-400 text-blue-700 bg-blue-50' },
    { key: 'REVIEW', label: 'Senior Advocate / Partner Review', color: 'border-amber-400 text-amber-700 bg-amber-50' },
    { key: 'COMPLETED', label: 'Completed & Filed', color: 'border-emerald-400 text-emerald-700 bg-emerald-50' }
  ];

  const getAssigneeUsers = (assignedIds) => {
    return users.filter(u => assignedIds.includes(u.id));
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action & Filter Bar */}
      <div className="bg-white p-4 rounded-m3-xl shadow-m3-1 border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: View Mode Toggle & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-neutral-100 rounded-m3-full border border-neutral-200">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-m3-full text-xs font-medium transition-all ${
                viewMode === 'KANBAN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban Board
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-m3-full text-xs font-medium transition-all ${
                viewMode === 'LIST' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List View
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
            Total {filteredTasks.length} task(s) active
          </span>
        </div>

        {/* Right: Filters & Create Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-700"
          >
            <option value="ALL">All Categories</option>
            {systemConfig.taskCategories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-700"
          >
            <option value="ALL">All Staff</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-m3-full shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Delegate Task
          </button>
        </div>

      </div>

      {/* Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);

            return (
              <div key={col.key} className="bg-neutral-100/70 rounded-m3-xl p-3 border border-neutral-200/80 min-h-[500px] flex flex-col">
                
                {/* Column Header */}
                <div className={`p-2.5 rounded-m3-lg border mb-3 flex items-center justify-between font-semibold text-xs ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="w-5 h-5 rounded-full bg-white/80 text-neutral-800 text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks List in Column */}
                <div className="space-y-3 flex-1">
                  {colTasks.map(t => {
                    const assignees = getAssigneeUsers(t.assignedTo);

                    return (
                      <div
                        key={t.id}
                        className="bg-white p-3.5 rounded-m3-lg border border-neutral-200 shadow-xs hover:border-emerald-300 hover:shadow-m3-1 transition-all space-y-2.5"
                      >
                        {/* Scope & Priority */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 truncate max-w-[140px]">
                            {t.caseNumber}
                          </span>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug">
                          {t.title}
                        </h4>

                        {/* Category & Description snippet */}
                        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                          {t.description || t.caseTitle}
                        </p>

                        <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium inline-block">
                          🏷️ {t.category}
                        </div>

                        {/* Multi-Assignee & Deadline Footer */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          
                          {/* Avatars */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {assignees.map(a => (
                              <div
                                key={a.id}
                                className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white"
                                title={`${a.name} (${a.designation})`}
                              >
                                {a.name.charAt(0)}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-600">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>Due: {t.dueDate}</span>
                          </div>

                        </div>

                        {/* Quick Status Mover */}
                        <div className="pt-2 flex items-center justify-between gap-1 border-t border-neutral-100 text-[10px]">
                          <select
                            value={t.status}
                            onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded px-1.5 py-0.5 text-[10px] text-neutral-700"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>

                          <button
                            onClick={() => deleteTask(t.id)}
                            className="text-neutral-400 hover:text-rose-600 p-0.5"
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
        <div className="bg-white rounded-m3-xl shadow-m3-1 border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          {filteredTasks.map(t => {
            const assignees = getAssigneeUsers(t.assignedTo);

            return (
              <div key={t.id} className="p-4 hover:bg-neutral-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                      {t.caseNumber}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {t.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-900">{t.title}</h4>
                  <p className="text-xs text-neutral-500">{t.description || t.caseTitle}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {assignees.map(a => (
                      <span key={a.id} className="text-xs font-medium bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-700">
                        {a.name}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-mono text-neutral-600">Due: {t.dueDate}</span>

                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-300 rounded-m3-sm px-2 py-1"
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
