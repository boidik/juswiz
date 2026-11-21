import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Briefcase, 
  AlertTriangle, 
  ArrowRight,
  Gavel,
  FolderOpen,
  Eye,
  Sparkles,
  Edit3
} from 'lucide-react';
import { OrderReaderModal } from '../staff_console/OrderReaderModal';
import { CaseRegistrationModal } from '../software_admin/CaseRegistrationModal';

export const MasterCasesBoard = ({ casesList, customTitle, isStaffScope = false }) => {
  const { cases, documents, setSelectedCaseId, switchRole, systemConfig } = useApp();

  const baseCases = casesList || cases;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForum, setSelectedForum] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [readingCaseOrder, setReadingCaseOrder] = useState(null);
  const [caseToEdit, setCaseToEdit] = useState(null);

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

  const formatEditorialDate = (dateString) => {
    if (!dateString) return { dayOfWeek: 'TBD', dayOfMonth: '--' };
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day] || "th";
    return { dayOfWeek, dayOfMonth: `${day}${suffix}` };
  };

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
    <div className="space-y-5">
      
      {/* Header & Controls */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-warm-obsidian font-display tracking-tight">
            {customTitle || 'Master Litigation Tracking Board'}
          </h3>
          <p className="text-xs text-warm-muted mt-0.5">
            {isStaffScope 
              ? 'Docket restricted strictly to your assigned counsel scope'
              : 'Enterprise cause list schedule, bench listings, and order sheets'}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Capsule Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-warm-muted absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docket, counsel, CNR..."
              className="w-full pl-9 pr-3 py-1.5 text-xs capsule-input"
            />
          </div>

          {/* Forum Capsule Select */}
          <select
            value={selectedForum}
            onChange={(e) => setSelectedForum(e.target.value)}
            className="capsule-input py-1.5 text-xs text-warm-graphite font-medium cursor-pointer"
          >
            <option value="ALL">All Forums ({baseCases.length})</option>
            {systemConfig.courts.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Urgency Capsule Select */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="capsule-input py-1.5 text-xs text-warm-graphite font-medium cursor-pointer"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical (Stay / Urgent)</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Standard</option>
          </select>
        </div>
      </div>

      {/* Cases Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCases.length === 0 ? (
          <div className="col-span-full glass-panel rounded-4xl p-12 text-center text-warm-muted space-y-2">
            <Briefcase className="w-10 h-10 mx-auto stroke-1 text-warm-sand" />
            <p className="text-sm font-semibold text-warm-obsidian font-display">No matters found</p>
            <p className="text-xs text-warm-muted">
              {isStaffScope ? 'You have no assigned cases in your docket.' : 'No cases matching the selected filters.'}
            </p>
          </div>
        ) : (
          filteredCases.map(c => {
            const daysLeft = getDaysUntilNextDate(c.nextHearingDate);
            const isCritical = c.urgency === 'CRITICAL';
            const { dayOfWeek, dayOfMonth } = formatEditorialDate(c.nextHearingDate);

            // Auto-fetched orders linked to this case
            const caseOrders = (documents || []).filter(d => 
              d.caseId === c.id && (
                d.folder === '05_Orders_and_Judgments' || 
                d.category === 'Court Order' || 
                (d.tags && (d.tags.includes('Auto-Fetched') || d.tags.includes('Verified Bench Order')))
              )
            );
            const latestOrderDoc = caseOrders[0] || null;
            const effectiveLastOrder = c.lastOrder || latestOrderDoc?.summary || latestOrderDoc?.orderText || null;

            return (
              <div
                key={c.id}
                className={`rounded-4xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isCritical 
                    ? 'obsidian-card hover:shadow-[0_25px_50px_-12px_rgba(20,20,22,0.5)]' 
                    : 'glass-panel hover:glass-panel-elevated hover:shadow-[0_20px_45px_-10px_rgba(160,140,120,0.18)]'
                }`}
              >
                
                {/* Background Amber Sun Orb (Pinterest aesthetic) */}
                <div className="absolute top-2 right-2 w-32 h-32 rounded-full sun-gradient-circle opacity-80 blur-[2px] pointer-events-none -mr-8 -mt-8" />
                
                {/* Top Section */}
                <div className="relative z-10 space-y-3">
                  
                  {/* Category Pill & Urgency */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-[11px] font-bold px-3 py-1 rounded-pill ${
                      isCritical 
                        ? 'bg-white/10 text-white border border-white/15' 
                        : 'bg-warm-sand/60 text-warm-obsidian border border-warm-borderSubtle'
                    }`}>
                      {c.caseNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta text-white flex items-center gap-1 shadow-amber-glow animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Urgent Stay
                        </span>
                      )}
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-pill ${
                        isCritical ? 'text-white/60 bg-white/5' : 'text-warm-muted bg-white/70'
                      }`}>
                        {c.courtName}
                      </span>
                    </div>
                  </div>

                  {/* Case Title */}
                  <h4 className={`text-base sm:text-lg font-bold leading-snug font-display tracking-tight line-clamp-2 ${
                    isCritical ? 'text-white' : 'text-warm-obsidian'
                  }`}>
                    {c.title}
                  </h4>

                  {/* Bench & Stage */}
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${
                    isCritical ? 'text-white/70' : 'text-warm-graphite'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Gavel className="w-3.5 h-3.5 opacity-60" />
                      {c.bench}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-terracotta">{c.stage}</span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">Client: {c.clientName}</span>
                  </div>

                  {/* Order Sheet Snippet with High-Visibility Judicial Card */}
                  {effectiveLastOrder && (
                    <div 
                      onClick={() => setReadingCaseOrder({
                        ...c,
                        lastOrder: effectiveLastOrder,
                        orderDoc: latestOrderDoc
                      })}
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed cursor-pointer transition-all border ${
                        isCritical 
                          ? 'bg-white/10 hover:bg-white/15 border-white/20 text-white/95' 
                          : 'bg-white/90 hover:bg-white border-terracotta/30 text-warm-obsidian hover:shadow-glass hover:border-terracotta'
                      }`}
                      title="Click to view full bench order transcript"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1.5">
                        <span className="flex items-center gap-1.5 text-terracotta font-bold">
                          <Gavel className="w-3.5 h-3.5 text-terracotta" />
                          <span>Latest Bench Order</span>
                          {caseOrders.length > 0 && (
                            <span className="px-2 py-0.5 rounded-pill bg-terracotta text-white text-[9px] font-extrabold shadow-xs">
                              {caseOrders.length} {caseOrders.length === 1 ? 'Sheet' : 'Sheets'}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-warm-graphite hover:text-terracotta bg-warm-sand/50 px-2 py-0.5 rounded-pill">
                          <Eye className="w-3 h-3 text-terracotta" /> Read Synopsis
                        </span>
                      </div>
                      <p className="line-clamp-2 italic font-sans font-medium text-xs leading-relaxed">
                        "{effectiveLastOrder}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Section: Pinterest Editorial Date + Capsule Button */}
                <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex items-end justify-between gap-3">
                  
                  {/* Editorial Date Presentation (Direct Pinterest Style: Thu 24th) */}
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${
                      isCritical ? 'text-white' : 'text-warm-obsidian'
                    }`}>
                      {dayOfWeek}
                    </span>
                    <span className={`text-xl sm:text-2xl font-light font-display ${
                      isCritical ? 'text-terracotta-light' : 'text-warm-muted'
                    }`}>
                      {dayOfMonth}
                    </span>

                    {daysLeft !== null && (
                      <span className={`ml-2 text-[10px] font-bold px-2.5 py-0.5 rounded-pill ${
                        daysLeft === 0 ? 'bg-terracotta text-white animate-bounce' :
                        daysLeft <= 3 ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {daysLeft === 0 ? 'Today!' : `in ${daysLeft}d`}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCaseToEdit(c)}
                      className={`p-2 rounded-full border transition-colors ${
                        isCritical 
                          ? 'border-white/20 text-white hover:bg-white/10' 
                          : 'border-warm-borderSubtle text-warm-graphite hover:bg-white'
                      }`}
                      title="Edit Case Details"
                    >
                      <Edit3 className="w-4 h-4 text-terracotta" />
                    </button>

                    {c.driveFolderUrl && (
                      <a
                        href={c.driveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2 rounded-full border transition-colors ${
                          isCritical 
                            ? 'border-white/20 text-white hover:bg-white/10' 
                            : 'border-warm-borderSubtle text-warm-graphite hover:bg-white'
                        }`}
                        title="Google Drive Case Folder"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        switchRole('STAFF');
                      }}
                      className={isCritical 
                        ? "inline-flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-pill bg-white text-warm-obsidian hover:bg-warm-sand transition-all text-xs font-semibold shadow-md"
                        : "capsule-btn-dark text-xs"
                      }
                    >
                      <span>Workspace</span>
                      <div className={`knob ${isCritical ? '!bg-warm-obsidian !text-white' : ''}`}>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* In-App Order Reader Modal */}
      <OrderReaderModal
        isOpen={Boolean(readingCaseOrder)}
        onClose={() => setReadingCaseOrder(null)}
        order={readingCaseOrder?.orderDoc || (readingCaseOrder ? {
          summary: readingCaseOrder?.lastOrder,
          courtName: readingCaseOrder?.courtName,
          bench: readingCaseOrder?.bench,
          hearingDate: readingCaseOrder?.lastHearingDate,
          driveUrl: readingCaseOrder?.driveFolderUrl,
          name: `Order_Sheet_${readingCaseOrder?.caseNumber}.pdf`
        } : null)}
        caseData={readingCaseOrder}
      />

      {/* Edit Case Modal */}
      <CaseRegistrationModal
        isOpen={Boolean(caseToEdit)}
        onClose={() => setCaseToEdit(null)}
        caseToEdit={caseToEdit}
      />

    </div>
  );
};
