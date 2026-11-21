import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  FolderOpen, 
  UploadCloud, 
  Video, 
  Share2, 
  Cpu, 
  CheckSquare, 
  Gavel, 
  ExternalLink,
  ChevronDown,
  Layers,
  FileText,
  ArrowRight
} from 'lucide-react';
import { DocumentVault } from './DocumentVault';
import { FileUploadModal } from './FileUploadModal';
import { GMeetModal } from './GMeetModal';
import { ShareBriefModal } from './ShareBriefModal';
import { HearingDateModal } from './HearingDateModal';
import { OrderFetcherModal } from './OrderFetcherModal';

export const CaseWorkspace = () => {
  const { 
    cases, 
    selectedCase, 
    setSelectedCaseId, 
    documents, 
    tasks, 
    conferences,
    updateTaskStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState('VAULT'); // 'VAULT' | 'TASKS' | 'CONFERENCES' | 'ORDERS'
  
  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGMeetOpen, setIsGMeetOpen] = useState(false);
  const [isShareBriefOpen, setIsShareBriefOpen] = useState(false);
  const [isHearingDateOpen, setIsHearingDateOpen] = useState(false);
  const [isOrderFetcherOpen, setIsOrderFetcherOpen] = useState(false);

  if (!selectedCase) {
    return (
      <div className="glass-panel rounded-4xl p-16 text-center text-warm-muted space-y-2">
        <Briefcase className="w-12 h-12 mx-auto stroke-1 text-warm-sand" />
        <p className="text-sm font-semibold text-warm-obsidian font-display">No cases in docket</p>
        <p className="text-xs">Register your first litigation matter from the Software Admin console.</p>
      </div>
    );
  }

  const caseDocs = documents.filter(d => d.caseId === selectedCase.id);
  const caseTasks = tasks.filter(t => t.caseId === selectedCase.id);
  const caseConfs = conferences.filter(c => c.caseId === selectedCase.id);
  const orderDocs = caseDocs.filter(d => d.folder === '05_Orders_and_Judgments');

  const formatEditorialDate = (dateString) => {
    if (!dateString) return { dayOfWeek: 'TBD', dayOfMonth: '--' };
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day] || "th";
    return { dayOfWeek, dayOfMonth: `${day}${suffix}` };
  };

  const { dayOfWeek, dayOfMonth } = formatEditorialDate(selectedCase.nextHearingDate);

  return (
    <div className="space-y-6">
      
      {/* Top Case Hero Card (Pinterest Luxury Glass Aesthetic) */}
      <div className="glass-panel-elevated rounded-4xl p-6 sm:p-7 relative overflow-hidden space-y-5">
        
        {/* Amber Sunset Orb */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full sun-gradient-circle opacity-75 blur-xs pointer-events-none -mr-12 -mt-12" />

        {/* Case Selector & Header */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Capsule Case Switcher */}
              <div className="relative inline-block">
                <select
                  value={selectedCase.id}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="font-mono text-xs font-bold pl-3.5 pr-8 py-1.5 rounded-pill bg-white/90 text-warm-obsidian border border-warm-borderSubtle appearance-none cursor-pointer hover:bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-warm-graphite absolute right-3 top-2.5 pointer-events-none" />
              </div>

              <span className="text-xs font-medium text-warm-graphite bg-warm-sand/50 px-3 py-1 rounded-pill">
                {selectedCase.courtName}
              </span>
              <span className="text-[11px] font-mono text-warm-muted">
                CNR: {selectedCase.cnrNumber}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-warm-obsidian font-display tracking-tight leading-snug">
              {selectedCase.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-graphite pt-0.5">
              <span>Bench: <strong className="text-warm-obsidian">{selectedCase.bench}</strong></span>
              <span>•</span>
              <span>Lead: <strong className="text-warm-obsidian">{selectedCase.leadCounsel}</strong></span>
              <span>•</span>
              <span>Client: <strong className="text-warm-obsidian">{selectedCase.clientName}</strong></span>
              <span>•</span>
              <span className="font-semibold text-terracotta">{selectedCase.stage}</span>
            </div>
          </div>

          {/* Right Date Card (Pinterest "Thu 24th" Style) */}
          <div className="relative z-10 flex items-center gap-3 self-start lg:self-auto shrink-0">
            <div className="glass-panel rounded-3xl p-4 sm:p-5 text-left border border-white/90 shadow-glass min-w-[150px]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-warm-muted block mb-1">
                Next Listing
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-warm-obsidian font-display tracking-tight">
                  {dayOfWeek}
                </span>
                <span className="text-xl font-light text-terracotta font-display">
                  {dayOfMonth}
                </span>
              </div>
              <p className="text-[11px] font-mono text-warm-muted mt-1 truncate">
                {selectedCase.itemNumber}
              </p>
            </div>

            {selectedCase.driveFolderUrl && (
              <a
                href={selectedCase.driveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-3xl glass-panel border border-white/90 hover:bg-white flex items-center justify-center text-warm-obsidian transition-colors shadow-glass shrink-0"
                title="Google Drive Case Directory"
              >
                <FolderOpen className="w-5 h-5 text-terracotta" />
              </a>
            )}
          </div>

        </div>

        {/* Action Buttons Toolbar (Capsule Pills) */}
        <div className="relative z-10 flex items-center gap-2 flex-wrap pt-4 border-t border-warm-borderSubtle/60">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="capsule-btn-dark text-xs"
          >
            <span>Upload File</span>
            <div className="knob"><UploadCloud className="w-3.5 h-3.5 text-white" /></div>
          </button>

          <button
            onClick={() => setIsGMeetOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
          >
            <Video className="w-3.5 h-3.5 text-terracotta" /> Schedule GMeet
          </button>

          <button
            onClick={() => setIsShareBriefOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-terracotta" /> Share Brief
          </button>

          <button
            onClick={() => setIsHearingDateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Log Hearing Date
          </button>

          <button
            onClick={() => setIsOrderFetcherOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-warm-sand/50 hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all ml-auto"
          >
            <Cpu className="w-3.5 h-3.5 text-terracotta" /> Auto Fetch Order
          </button>
        </div>

      </div>

      {/* Workspace Navigation Sub-Tabs */}
      <div className="flex border-b border-warm-borderSubtle space-x-2">
        <button
          onClick={() => setActiveTab('VAULT')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'VAULT'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Document Vault ({caseDocs.length})
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'TASKS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Case Tasks ({caseTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('CONFERENCES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'CONFERENCES'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Video className="w-4 h-4" /> GMeet Conferences ({caseConfs.length})
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ORDERS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Gavel className="w-4 h-4" /> Orders & Proceedings ({orderDocs.length})
        </button>
      </div>

      {/* Sub-Tab Content */}
      {activeTab === 'VAULT' && (
        <DocumentVault
          targetCaseId={selectedCase.id}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenShareBrief={() => setIsShareBriefOpen(true)}
        />
      )}

      {activeTab === 'TASKS' && (
        <div className="glass-panel rounded-3xl p-5 divide-y divide-warm-borderSubtle/60">
          <div className="pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Litigation Tasks for this Matter</h3>
            <span className="text-xs text-warm-muted">{caseTasks.length} task(s) active</span>
          </div>

          {caseTasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-warm-muted">No tasks assigned specifically to this matter.</p>
          ) : (
            caseTasks.map(t => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-warm-obsidian">{t.title}</span>
                    <span className="text-[10px] bg-terracotta-soft text-terracotta px-2.5 py-0.5 rounded-pill font-medium">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-warm-muted">{t.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-warm-graphite">Due: {t.dueDate}</span>
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    className="capsule-input py-1 text-xs"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'CONFERENCES' && (
        <div className="glass-panel rounded-3xl p-5 divide-y divide-warm-borderSubtle/60">
          <div className="pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Scheduled Google Meet Briefings</h3>
            <button
              onClick={() => setIsGMeetOpen(true)}
              className="capsule-btn-dark text-xs"
            >
              <span>New GMeet</span>
              <div className="knob"><Video className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

          {caseConfs.length === 0 ? (
            <p className="py-8 text-center text-xs text-warm-muted">No conferences scheduled yet.</p>
          ) : (
            caseConfs.map(c => (
              <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-warm-obsidian">{c.title}</span>
                    <span className="text-[10px] bg-terracotta-soft text-terracotta px-2.5 py-0.5 rounded-pill font-semibold">
                      {c.durationMinutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-warm-muted">{c.agenda}</p>
                  <p className="text-[11px] text-warm-muted font-mono">
                    Host: {c.host} • Attendees: {c.attendees?.join(', ') || 'Team counsel'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-warm-graphite">{c.date} at {c.time}</span>
                  <a
                    href={c.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="capsule-btn-dark text-xs"
                  >
                    <span>Join</span>
                    <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-warm-obsidian font-display">Bench Orders & Proceedings Archive</h3>
              <p className="text-xs text-warm-muted">Synced into Drive folder /05_Orders_and_Judgments</p>
            </div>
            <button
              onClick={() => setIsOrderFetcherOpen(true)}
              className="capsule-btn-dark text-xs"
            >
              <span>Auto Fetch Order</span>
              <div className="knob"><Cpu className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

          <div className="p-4 bg-white/70 rounded-2xl border border-warm-borderSubtle text-xs">
            <span className="font-bold text-warm-obsidian">Latest Bench Record:</span>
            <p className="text-warm-graphite italic mt-1 leading-relaxed">
              "{selectedCase.lastOrder}"
            </p>
          </div>

          <div className="divide-y divide-warm-borderSubtle/60">
            {orderDocs.map(o => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-terracotta shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold text-warm-obsidian">{o.name}</p>
                    <p className="text-[11px] text-warm-muted">{o.uploadedBy} • {new Date(o.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <a
                  href={o.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-pill border border-warm-borderSubtle text-warm-graphite text-xs hover:bg-white flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-terracotta" /> View Order
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetCaseId={selectedCase.id}
      />

      <GMeetModal
        isOpen={isGMeetOpen}
        onClose={() => setIsGMeetOpen(false)}
        targetCase={selectedCase}
      />

      <ShareBriefModal
        isOpen={isShareBriefOpen}
        onClose={() => setIsShareBriefOpen(false)}
        targetCase={selectedCase}
        caseDocuments={caseDocs}
      />

      <HearingDateModal
        isOpen={isHearingDateOpen}
        onClose={() => setIsHearingDateOpen(false)}
        targetCase={selectedCase}
      />

      <OrderFetcherModal
        isOpen={isOrderFetcherOpen}
        onClose={() => setIsOrderFetcherOpen(false)}
        targetCase={selectedCase}
      />

    </div>
  );
};
