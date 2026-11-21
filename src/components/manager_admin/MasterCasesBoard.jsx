import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Briefcase, 
  AlertTriangle, 
  ArrowUpRight,
  Gavel,
  FolderOpen
} from 'lucide-react';

export const MasterCasesBoard = ({ casesList, customTitle, isStaffScope = false }) => {
  const { cases, setSelectedCaseId, switchRole, systemConfig } = useApp();

  // If casesList is provided (e.g. staff assigned cases), use it; otherwise use all cases
  const baseCases = casesList || cases;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForum, setSelectedForum] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  const filteredCases = baseCases.filter(c => {
    const matchesSearch = 
      (c.caseNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cnrNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.leadCounsel || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesForum = selectedForum === 'ALL' || c.courtCode === selectedForum;
    const matchesUrgency = selectedUrgency === 'ALL' || c.urgency === selectedUrgency;

    return matchesSearch && matchesForum && matchesUrgency;
  });

  const getDaysUntilNextDate = (dateString) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Scope Banner */}
      {customTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">{customTitle}</h3>
            {isStaffScope && (
              <p className="text-xs text-neutral-500">
                Displaying only cases assigned to your docket • Limited to staff execution scope
              </p>
            )}
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {filteredCases.length} Assigned Matter(s)
          </span>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-m3-xl shadow-m3-1 border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case No., Title, CNR, Advocate or Client..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Filter className="w-3.5 h-3.5" /> Forum:
          </div>
          <select
            value={selectedForum}
            onChange={(e) => setSelectedForum(e.target.value)}
            className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-700"
          >
            <option value="ALL">All Forums ({baseCases.length})</option>
            {systemConfig.courts.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-300 rounded-m3-md font-medium text-neutral-700"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical (Stay / Urgent)</option>
            <option value="HIGH">High Urgency</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>

      </div>

      {/* Cases Cards Grid */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-m3-xl border border-neutral-200 text-neutral-400">
            <Briefcase className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">No cases found in this view</p>
            <p className="text-xs">
              {isStaffScope ? 'You have not been assigned to any ongoing matters yet.' : 'Adjust your search query or forum filter.'}
            </p>
          </div>
        ) : (
          filteredCases.map(c => {
            const daysLeft = getDaysUntilNextDate(c.nextHearingDate);

            return (
              <div
                key={c.id}
                className="bg-white rounded-m3-xl border border-neutral-200 p-4 sm:p-5 hover:border-blue-300 hover:shadow-m3-2 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                
                {/* Left: Case Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {c.courtName}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      CNR: {c.cnrNumber}
                    </span>

                    {c.urgency === 'CRITICAL' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Critical Hearing
                      </span>
                    )}
                    {c.urgency === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        High Priority
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {c.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Gavel className="w-3.5 h-3.5 text-neutral-400" />
                      Bench: <span className="font-medium text-neutral-800">{c.bench}</span>
                    </span>
                    <span>•</span>
                    <span>Stage: <strong className="text-blue-700">{c.stage}</strong></span>
                    <span>•</span>
                    <span>Client: <strong className="text-neutral-800">{c.clientName}</strong></span>
                  </div>

                  {/* Last Order Snippet */}
                  <div className="p-2.5 bg-neutral-50 rounded-m3-md border border-neutral-200 text-xs text-neutral-700 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold mb-0.5">
                      <span>Last Order ({c.lastHearingDate || 'Recent'})</span>
                      <span className="text-blue-600 font-normal">Google Drive Ingested</span>
                    </div>
                    <p className="line-clamp-2 leading-relaxed italic text-neutral-800">
                      "{c.lastOrder}"
                    </p>
                  </div>
                </div>

                {/* Right: Planning Dates & Action Center */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100 shrink-0">
                  
                  {/* Next Date Countdown Card */}
                  <div className="text-left lg:text-right">
                    <div className="flex items-center lg:justify-end gap-1.5 text-xs font-semibold text-neutral-800">
                      <Calendar className="w-4 h-4 text-material-primary" />
                      <span>Next Hearing: {c.nextHearingDate || 'Unscheduled'}</span>
                    </div>

                    <div className="flex items-center lg:justify-end gap-1.5 mt-1">
                      {daysLeft !== null && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          daysLeft < 0 ? 'bg-neutral-200 text-neutral-700' :
                          daysLeft === 0 ? 'bg-rose-500 text-white animate-bounce' :
                          daysLeft <= 3 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          daysLeft <= 7 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {daysLeft < 0 ? 'Hearing Past' :
                           daysLeft === 0 ? 'Hearing Today!' :
                           `In ${daysLeft} days`}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-neutral-500">
                        {c.itemNumber}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {c.driveFolderUrl && (
                      <a
                        href={c.driveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-m3-md border border-neutral-200 hover:bg-neutral-100 text-neutral-600 text-xs transition-colors"
                        title="Open Google Drive Case Folder"
                      >
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        switchRole('STAFF');
                      }}
                      className="px-3.5 py-1.5 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      Open Case Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
