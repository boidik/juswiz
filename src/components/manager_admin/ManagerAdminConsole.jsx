import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, CheckSquare, Calendar, AlertTriangle, Layers, Plus } from 'lucide-react';
import { MasterCasesBoard } from './MasterCasesBoard';
import { TaskManager } from './TaskManager';

export const ManagerAdminConsole = () => {
  const { cases, tasks } = useApp();

  const [activeTab, setActiveTab] = useState('MASTER_CASES'); // 'MASTER_CASES' | 'TASKS'

  // Calculate quick metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingHearings = cases.filter(c => {
    if (!c.nextHearingDate) return false;
    const target = new Date(c.nextHearingDate);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const criticalCases = cases.filter(c => c.urgency === 'CRITICAL');
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-m3-md bg-emerald-100 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Manager Admin Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Master litigation board, cause list tracking, hearing calendars, and team task delegation.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-neutral-200/60 rounded-m3-full border border-neutral-300/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('MASTER_CASES')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-m3-full text-xs font-semibold transition-all ${
              activeTab === 'MASTER_CASES'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Master Cases Board
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-m3-full text-xs font-semibold transition-all ${
              activeTab === 'TASKS'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Task Delegation ({pendingTasks.length})
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Ongoing Litigation</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">{cases.length}</p>
          <span className="text-[10px] text-blue-600 font-medium mt-1 block">Active across all benches</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Hearings This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{upcomingHearings.length}</p>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">Within next 7 days</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Critical Matters</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">{criticalCases.length}</p>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 block">Stay / Contempt / Ad-interim</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Active Tasks</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{pendingTasks.length}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Assigned across staff</span>
        </div>
      </div>

      {/* View Display */}
      {activeTab === 'MASTER_CASES' && <MasterCasesBoard />}
      {activeTab === 'TASKS' && <TaskManager />}

    </div>
  );
};
