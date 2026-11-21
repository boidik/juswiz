import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Briefcase, Layers, FileText, CheckSquare, Calendar, Video, ArrowUpRight, Sparkles, FolderTree } from 'lucide-react';
import { CaseWorkspace } from './CaseWorkspace';
import { MasterCasesBoard } from '../manager_admin/MasterCasesBoard';

export const StaffConsole = () => {
  const { cases, staffAssignedCases, documents, tasks, currentUser, setSelectedCaseId } = useApp();

  // Sub-view toggle: 'TRACK_BOARD' | 'WORKSPACE'
  const [activeStaffView, setActiveStaffView] = useState('TRACK_BOARD');
  // Docket scope: 'MY_CASES' | 'ALL_CASES' (defaults to MY_CASES if any assigned, else ALL_CASES so user is never stranded)
  const [scopeFilter, setScopeFilter] = useState(staffAssignedCases.length > 0 ? 'MY_CASES' : 'ALL_CASES');

  const myTasks = tasks.filter(t => 
    t.assignedTo?.includes(currentUser?.uid) || 
    t.assignedTo?.includes(currentUser?.id)
  );
  const pendingTasks = myTasks.filter(t => t.status !== 'COMPLETED');
  const coEditDocs = documents.filter(d => !!d.coEditUrl);

  const displayedCases = scopeFilter === 'MY_CASES' && staffAssignedCases.length > 0 
    ? staffAssignedCases 
    : cases;

  return (
    <div className="space-y-6">
      
      {/* Top Console Title & View Switcher (Pinterest Warm Minimalist Luxury) */}
      <div className="glass-panel-elevated rounded-4xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient Warm Sun Orb */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full sun-gradient-circle opacity-70 blur-xs pointer-events-none -mr-12 -mt-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-warm-obsidian tracking-tight font-display">
                  Staff Console (Advocates & Clerks)
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-pill bg-terracotta-soft text-terracotta border border-terracotta/20">
                  Litigation Hub
                </span>
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                Cause list tracking, pleading drafts, online bench orders, and client briefs.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="relative z-10 flex items-center p-1 bg-warm-sand/60 backdrop-blur-md rounded-pill border border-warm-borderSubtle self-start md:self-auto shadow-xs">
          <button
            onClick={() => setActiveStaffView('TRACK_BOARD')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-semibold transition-all ${
              activeStaffView === 'TRACK_BOARD'
                ? 'bg-warm-obsidian text-white shadow-md'
                : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4" /> Cases Track Board ({displayedCases.length})
          </button>

          <button
            onClick={() => setActiveStaffView('WORKSPACE')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-semibold transition-all ${
              activeStaffView === 'WORKSPACE'
                ? 'bg-warm-obsidian text-white shadow-md'
                : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Case Workspace & Vault
          </button>
        </div>
      </div>

      {/* Staff Metrics Bar (Frosted Glass Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => { setScopeFilter('MY_CASES'); setActiveStaffView('TRACK_BOARD'); }}
          className={`p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-glass cursor-pointer transition-all hover:glass-panel-elevated ${
            scopeFilter === 'MY_CASES' ? 'ring-2 ring-terracotta/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-muted font-medium">Assigned to Me</p>
            <span className="text-[10px] font-bold text-terracotta bg-terracotta-soft px-2 py-0.5 rounded-pill">Scope</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-warm-obsidian font-display mt-2">{staffAssignedCases.length}</p>
          <span className="text-[11px] text-warm-graphite font-medium mt-1 block">My active litigation docket</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-glass">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-muted font-medium">My Pending Tasks</p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill">Active</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-display mt-2">{pendingTasks.length}</p>
          <span className="text-[11px] text-warm-graphite font-medium mt-1 block">Drafting & filing deadlines</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-glass">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-muted font-medium">Live Co-Edit Drafts</p>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-pill">Google Docs</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-display mt-2">{coEditDocs.length}</p>
          <span className="text-[11px] text-warm-graphite font-medium mt-1 block">Active petitions in drafting</span>
        </div>

        <div 
          onClick={() => { setScopeFilter('ALL_CASES'); setActiveStaffView('TRACK_BOARD'); }}
          className={`p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-glass cursor-pointer transition-all hover:glass-panel-elevated ${
            scopeFilter === 'ALL_CASES' ? 'ring-2 ring-terracotta/40' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-warm-muted font-medium">Firm Total Matters</p>
            <span className="text-[10px] font-bold text-warm-obsidian bg-warm-sand/80 px-2 py-0.5 rounded-pill">All Forums</span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-warm-obsidian font-display mt-2">{cases.length}</p>
          <span className="text-[11px] text-warm-graphite font-medium mt-1 block">All chambers proceedings</span>
        </div>
      </div>

      {/* Main View Display */}
      {activeStaffView === 'TRACK_BOARD' ? (
        <div className="space-y-4">
          {/* Scope Toggle Bar if user has assigned cases */}
          {staffAssignedCases.length > 0 && (
            <div className="flex items-center justify-between p-2 glass-panel rounded-2xl px-4">
              <span className="text-xs text-warm-graphite font-medium">
                Viewing: <strong className="text-warm-obsidian">{scopeFilter === 'MY_CASES' ? 'My Assigned Docket' : 'All Firm Matters'}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setScopeFilter('MY_CASES')}
                  className={`px-3 py-1 text-xs font-semibold rounded-pill transition-all ${
                    scopeFilter === 'MY_CASES'
                      ? 'bg-terracotta text-white shadow-xs'
                      : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white'
                  }`}
                >
                  My Docket ({staffAssignedCases.length})
                </button>
                <button
                  onClick={() => setScopeFilter('ALL_CASES')}
                  className={`px-3 py-1 text-xs font-semibold rounded-pill transition-all ${
                    scopeFilter === 'ALL_CASES'
                      ? 'bg-terracotta text-white shadow-xs'
                      : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white'
                  }`}
                >
                  All Firm Cases ({cases.length})
                </button>
              </div>
            </div>
          )}

          <MasterCasesBoard
            casesList={displayedCases}
            customTitle={scopeFilter === 'MY_CASES' && staffAssignedCases.length > 0 ? "My Assigned Cases Track Board" : "Chambers Master Cases Track Board"}
            isStaffScope={scopeFilter === 'MY_CASES' && staffAssignedCases.length > 0}
          />
        </div>
      ) : (
        <CaseWorkspace />
      )}

    </div>
  );
};
