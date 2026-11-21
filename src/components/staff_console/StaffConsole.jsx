import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Layers, FileText, CheckSquare, Calendar, Video, ArrowUpRight } from 'lucide-react';
import { CaseWorkspace } from './CaseWorkspace';
import { MasterCasesBoard } from '../manager_admin/MasterCasesBoard';

export const StaffConsole = () => {
  const { cases, staffAssignedCases, documents, tasks, currentUser } = useApp();

  // Sub-view toggle: 'TRACK_BOARD' | 'WORKSPACE'
  const [activeStaffView, setActiveStaffView] = useState('TRACK_BOARD');

  const myTasks = tasks.filter(t => 
    t.assignedTo?.includes(currentUser?.uid) || 
    t.assignedTo?.includes(currentUser?.id)
  );
  const pendingTasks = myTasks.filter(t => t.status !== 'COMPLETED');
  const coEditDocs = documents.filter(d => !!d.coEditUrl);

  return (
    <div className="space-y-6">
      
      {/* Top Console Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-m3-md bg-purple-100 text-purple-700">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Staff Console (Advocates & Clerks)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Track your assigned cases, upload client pleadings, co-edit draft petitions, schedule GMeets, and dispatch briefs.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center p-1 bg-neutral-200/60 rounded-m3-full border border-neutral-300/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveStaffView('TRACK_BOARD')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-m3-full text-xs font-semibold transition-all ${
              activeStaffView === 'TRACK_BOARD'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" /> My Cases Track Board ({staffAssignedCases.length})
          </button>

          <button
            onClick={() => setActiveStaffView('WORKSPACE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-m3-full text-xs font-semibold transition-all ${
              activeStaffView === 'WORKSPACE'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Case Workspace & Vault
          </button>
        </div>
      </div>

      {/* Staff Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Assigned to My Docket</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">{staffAssignedCases.length}</p>
          <span className="text-[10px] text-purple-600 font-medium mt-1 block">Limited to my assigned scope</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">My Pending Tasks</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{pendingTasks.length}</p>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Drafting & Court filing items</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Live Co-Edit Drafts</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">{coEditDocs.length}</p>
          <span className="text-[10px] text-blue-600 font-medium mt-1 block">Active Google Docs</span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Firm Total Matters</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-700 mt-1">{cases.length}</p>
          <span className="text-[10px] text-neutral-500 font-medium mt-1 block">Across all litigation forums</span>
        </div>
      </div>

      {/* Main View Display */}
      {activeStaffView === 'TRACK_BOARD' ? (
        <MasterCasesBoard
          casesList={staffAssignedCases}
          customTitle="My Assigned Cases Track Board"
          isStaffScope={true}
        />
      ) : (
        <CaseWorkspace />
      )}

    </div>
  );
};
