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
  ArrowRight,
  Link2,
  X,
  Save,
  CheckCircle2,
  FolderTree,
  Sparkles,
  Eye,
  Edit3
} from 'lucide-react';
import { DocumentVault } from './DocumentVault';
import { FileUploadModal } from './FileUploadModal';
import { GMeetModal } from './GMeetModal';
import { ShareBriefModal } from './ShareBriefModal';
import { HearingDateModal } from './HearingDateModal';
import { OrderFetcherModal } from './OrderFetcherModal';
import { OrderReaderModal } from './OrderReaderModal';
import { CaseRegistrationModal } from '../software_admin/CaseRegistrationModal';
import { extractDriveFolderId, isValidGoogleDriveId, getExactFileDriveUrl } from '../../services/googleWorkspace';

export const CaseWorkspace = () => {
  const { 
    cases, 
    selectedCase, 
    setSelectedCaseId, 
    documents, 
    tasks, 
    conferences,
    updateTaskStatus,
    updateCaseDriveLink,
    provisionCaseInGoogleDrive,
    isGoogleConnected,
    connectGoogleWorkspace
  } = useApp();

  const [activeTab, setActiveTab] = useState('VAULT'); // 'VAULT' | 'TASKS' | 'CONFERENCES' | 'ORDERS'
  
  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGMeetOpen, setIsGMeetOpen] = useState(false);
  const [isShareBriefOpen, setIsShareBriefOpen] = useState(false);
  const [isHearingDateOpen, setIsHearingDateOpen] = useState(false);
  const [isOrderFetcherOpen, setIsOrderFetcherOpen] = useState(false);
  const [isDriveEditOpen, setIsDriveEditOpen] = useState(false);
  const [customDriveInput, setCustomDriveInput] = useState('');
  const [isProvisioningDrive, setIsProvisioningDrive] = useState(false);
  const [selectedOrderToRead, setSelectedOrderToRead] = useState(null);
  const [isEditCaseOpen, setIsEditCaseOpen] = useState(false);

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
  const orderDocs = caseDocs.filter(d => 
    d.folder === '05_Orders_and_Judgments' || 
    d.category === 'Court Order' || 
    (d.tags && (d.tags.includes('Auto-Fetched') || d.tags.includes('Verified Bench Order')))
  );

  const formatEditorialDate = (dateString) => {
    if (!dateString) return { dayOfWeek: 'TBD', dayOfMonth: '--' };
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const suffix = ["th", "st", "nd", "rd"][((day % 100) - 20) % 10] || ["th", "st", "nd", "rd"][day] || "th";
    return { dayOfWeek, dayOfMonth: `${day}${suffix}` };
  };

  const { dayOfWeek, dayOfMonth } = formatEditorialDate(selectedCase.nextHearingDate);

  const handleOpenDriveModal = () => {
    setCustomDriveInput(selectedCase.driveFolderUrl || '');
    setIsDriveEditOpen(true);
  };

  const handleSaveDriveLink = async (e) => {
    e.preventDefault();
    await updateCaseDriveLink(selectedCase.id, customDriveInput);
    setIsDriveEditOpen(false);
  };

  const handleGenerateSearchLink = () => {
    const safeQuery = encodeURIComponent(`${selectedCase.caseNumber} ${selectedCase.courtCode || ''}`);
    const generatedUrl = `https://drive.google.com/drive/search?q=${safeQuery}`;
    setCustomDriveInput(generatedUrl);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Case Hero Card (Pinterest Luxury Glass Aesthetic) */}
      <div className="glass-panel-elevated rounded-4xl p-5 sm:p-7 relative overflow-hidden space-y-5">
        
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

          {/* Right Date Card (Pinterest "Thu 24th" Style) & Google Drive Link */}
          <div className="relative z-10 flex items-center gap-3 self-start lg:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            <div className="glass-panel rounded-3xl p-4 sm:p-5 text-left border border-white/90 shadow-glass min-w-[140px]">
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

            {/* Google Drive Folder Buttons */}
            <div className="flex flex-col gap-2">
              <a
                href={selectedCase.driveFolderUrl || 'https://drive.google.com/drive/my-drive'}
                target="_blank"
                rel="noreferrer"
                className={`w-12 h-12 rounded-3xl glass-panel border border-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-glass shrink-0 ${
                  selectedCase.hasRealDriveFolder ? 'text-warm-obsidian' : 'text-warm-muted'
                }`}
                title={selectedCase.hasRealDriveFolder ? `Open Linked Drive Folder (${selectedCase.driveFolderId})` : "Open Google Drive (Click below to link Folder ID)"}
              >
                <FolderOpen className={`w-5 h-5 ${selectedCase.hasRealDriveFolder ? 'text-terracotta' : 'text-warm-muted'}`} />
              </a>
              <button
                onClick={handleOpenDriveModal}
                className="w-12 h-10 rounded-2xl glass-panel border border-white/90 hover:bg-white flex items-center justify-center text-warm-graphite hover:text-warm-obsidian transition-colors shadow-glass shrink-0 text-[10px] font-bold"
                title="Link or Provision Google Drive Folder ID"
              >
                <Link2 className="w-4 h-4 text-terracotta" />
              </button>
            </div>
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
            <Share2 className="w-3.5 h-3.5 text-terracotta" /> Share Brief via Gmail
          </button>

          <button
            onClick={() => setIsHearingDateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> Log Hearing Date
          </button>

          <button
            onClick={() => setIsEditCaseOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-terracotta" /> Edit Docket
          </button>

          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-pill text-xs font-semibold transition-all shadow-xs ${
              activeTab === 'ORDERS' 
                ? 'bg-terracotta text-white shadow-amber-glow' 
                : 'bg-white/90 hover:bg-white text-warm-obsidian border border-warm-borderSubtle'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-terracotta" /> View Orders ({orderDocs.length})
          </button>

          <button
            onClick={() => setIsOrderFetcherOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-warm-sand/80 hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold transition-all ml-auto shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-terracotta" /> Auto Fetch Order
          </button>
        </div>

      </div>

      {/* Live Court Bench Order Sheet / Cause List Status Banner */}
      {selectedCase.lastOrder && (
        <div className="glass-panel-elevated rounded-3xl p-5 border border-terracotta/25 relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-white/80 to-terracotta/10 space-y-3 shadow-glass">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
                <Gavel className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-warm-obsidian font-display uppercase tracking-wider">
                    Official Bench Order Sheet
                  </span>
                  <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Auto-Fetched ({selectedCase.courtName})
                  </span>
                </div>
                <p className="text-[11px] text-warm-muted">
                  Hearing: <strong className="text-warm-obsidian">{selectedCase.lastHearingDate || 'Recent'}</strong> • Next Listing: <strong className="text-terracotta">{selectedCase.nextHearingDate || 'Pending Listing'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOrderToRead({
                  name: `Order_Sheet_${selectedCase.caseNumber.replace(/[\/\s]/g, '_')}.pdf`,
                  summary: selectedCase.lastOrder,
                  courtName: selectedCase.courtName,
                  bench: selectedCase.bench,
                  hearingDate: selectedCase.lastHearingDate,
                  nextHearingDate: selectedCase.nextHearingDate,
                  cnrNumber: selectedCase.cnrNumber,
                  caseNumber: selectedCase.caseNumber,
                  caseTitle: selectedCase.title,
                  driveUrl: getExactFileDriveUrl({ name: `Order_Sheet_${selectedCase.caseNumber}.pdf` })
                })}
                className="px-3.5 py-1.5 rounded-pill bg-white hover:bg-warm-sand text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-terracotta" /> Read Authentic Court PDF
              </button>

              <button
                onClick={() => setIsOrderFetcherOpen(true)}
                className="px-3.5 py-1.5 rounded-pill bg-terracotta text-white text-xs font-semibold shadow-xs hover:bg-terracotta/90 flex items-center gap-1.5 transition-all"
              >
                <Cpu className="w-3.5 h-3.5" /> Fetch Daily Orders Online
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-warm-borderSubtle text-xs leading-relaxed text-warm-obsidian font-medium">
            <p className="italic">"{selectedCase.lastOrder}"</p>
          </div>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex border-b border-warm-borderSubtle bg-white/30 backdrop-blur-md rounded-t-3xl overflow-x-auto no-scrollbar px-3 sm:px-6">
        <button
          onClick={() => setActiveTab('VAULT')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'VAULT'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Case Document Vault ({caseDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'TASKS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Assigned Tasks ({caseTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFERENCES')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'CONFERENCES'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>GMeet Conferences ({caseConfs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ORDERS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Bench Orders & Judgments ({orderDocs.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'VAULT' && (
        <DocumentVault 
          caseId={selectedCase.id}
          targetCaseId={selectedCase.id}
          driveFolderUrl={selectedCase.driveFolderUrl}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenShareBrief={() => setIsShareBriefOpen(true)}
          onOpenOrderFetcher={() => setIsOrderFetcherOpen(true)}
        />
      )}

      {activeTab === 'TASKS' && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Tasks Linked to {selectedCase.caseNumber}</h3>
            <span className="text-xs text-warm-muted font-mono">{caseTasks.filter(t => t.status === 'COMPLETED').length}/{caseTasks.length} Done</span>
          </div>

          {caseTasks.length === 0 ? (
            <p className="text-xs text-warm-muted py-8 text-center">No tasks assigned to this case yet.</p>
          ) : (
            <div className="space-y-2">
              {caseTasks.map(t => (
                <div key={t.id} className="p-4 bg-white/70 rounded-2xl border border-warm-borderSubtle flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${
                        t.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                        t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-warm-sand text-warm-graphite'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="text-xs font-bold text-warm-obsidian">{t.title}</span>
                    </div>
                    <p className="text-[11px] text-warm-muted mt-1">Due: {t.dueDate} • Category: {t.category}</p>
                  </div>
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
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'CONFERENCES' && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-warm-obsidian font-display">Google Meet Consultations</h3>
            <button
              onClick={() => setIsGMeetOpen(true)}
              className="px-3.5 py-1.5 rounded-pill bg-terracotta text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-terracotta/90"
            >
              <Video className="w-3.5 h-3.5" /> New Meet
            </button>
          </div>

          {caseConfs.length === 0 ? (
            <p className="text-xs text-warm-muted py-8 text-center">No conferences scheduled for this matter.</p>
          ) : (
            <div className="space-y-2">
              {caseConfs.map(c => (
                <div key={c.id} className="p-4 bg-white/70 rounded-2xl border border-warm-borderSubtle flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-warm-obsidian">{c.title}</h4>
                    <p className="text-[11px] text-warm-muted mt-0.5">
                      {c.scheduledDate} at {c.scheduledTime} ({c.durationMinutes} mins)
                    </p>
                    <p className="text-[10px] text-warm-graphite mt-1">Attendees: {c.attendees?.join(', ')}</p>
                  </div>
                  <a
                    href={c.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="capsule-btn-dark text-xs"
                  >
                    <span>Join GMeet</span>
                    <div className="knob"><Video className="w-3.5 h-3.5 text-white" /></div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-warm-obsidian font-display">Bench Orders & Judicial Decisions</h3>
                <span className="px-2 py-0.5 rounded-pill text-[10px] font-bold bg-terracotta-soft text-terracotta border border-terracotta/20">
                  {orderDocs.length} Order Sheets
                </span>
              </div>
              <p className="text-xs text-warm-muted mt-0.5">
                Cause list recordings, interim injunctions, and signed court orders
              </p>
            </div>

            <button
              onClick={() => setIsOrderFetcherOpen(true)}
              className="capsule-btn-dark text-xs self-start sm:self-auto"
            >
              <span>Fetch Live Order from Court</span>
              <div className="knob"><Cpu className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

          {orderDocs.length === 0 ? (
            <div className="p-12 text-center text-warm-muted space-y-3 bg-white/40 rounded-3xl border border-dashed border-warm-borderSubtle">
              <Gavel className="w-12 h-12 mx-auto stroke-1 text-terracotta animate-pulse" />
              <p className="text-sm font-semibold text-warm-obsidian font-display">No Bench Orders Ingested Yet</p>
              <p className="text-xs text-warm-muted max-w-md mx-auto">
                No orders have been pulled from the adjudicating court for this matter yet. Click below to query the official court portal.
              </p>
              <button
                onClick={() => setIsOrderFetcherOpen(true)}
                className="capsule-btn-dark text-xs inline-flex"
              >
                <span>Trigger Automated Live Order Fetch</span>
                <div className="knob"><Cpu className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orderDocs.map(o => {
                const orderTitle = o.name || o.fileName || o.originalName || 'Bench_Order.pdf';
                const orderSummary = o.summary || o.orderText || selectedCase.lastOrder;
                const formattedDate = o.uploadedAt ? new Date(o.uploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent Listing';

                return (
                  <div key={o.id} className="p-4 sm:p-5 bg-white/85 rounded-3xl border border-warm-borderSubtle/80 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-glass hover:glass-panel-elevated transition-all">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold bg-terracotta text-white px-2.5 py-0.5 rounded-pill flex items-center gap-1 shadow-xs">
                          <Gavel className="w-3 h-3 text-white" /> Verified Order
                        </span>
                        <span 
                          onClick={() => setSelectedOrderToRead(o)}
                          className="text-xs font-mono font-bold text-warm-obsidian hover:text-terracotta cursor-pointer underline decoration-terracotta/40 break-all"
                        >
                          {orderTitle}
                        </span>
                        <span className="text-[10px] font-medium bg-warm-sand/60 text-warm-graphite px-2 py-0.5 rounded-pill">
                          {o.fileSize || '1.4 MB'}
                        </span>
                      </div>

                      {orderSummary && (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-warm-obsidian italic font-sans leading-relaxed">
                          "{orderSummary}"
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-warm-muted">
                        <span>Ingested: <strong className="text-warm-obsidian">{formattedDate}</strong></span>
                        <span>•</span>
                        <span>Source: <strong className="text-warm-obsidian">{o.uploadedBy || selectedCase.courtName}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-warm-graphite">📁 /05_Orders_and_Judgments</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => setSelectedOrderToRead(o)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-terracotta text-white hover:bg-terracotta/90 text-xs font-semibold shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read Order PDF
                      </button>

                      <a
                        href={getExactFileDriveUrl(o)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-pill border border-warm-borderSubtle text-warm-graphite text-xs hover:bg-white flex items-center gap-1 font-semibold shadow-xs"
                        title={`Open exact file in Google Drive: ${o.name}`}
                      >
                        <ExternalLink className="w-3 h-3 text-terracotta" /> Exact File in Drive
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Google Drive Link Editor Modal */}
      {isDriveEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel-elevated rounded-4xl border border-white/95 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-borderSubtle/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-xs">
                  <FolderTree className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-warm-obsidian font-display">Google Drive Folder Coordination</h3>
                  <p className="text-[11px] text-warm-muted">{selectedCase.caseNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDriveEditOpen(false)}
                className="w-7 h-7 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Folder Status Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs ${
              selectedCase.hasRealDriveFolder 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <span className={`w-2 h-2 rounded-full ${selectedCase.hasRealDriveFolder ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{selectedCase.hasRealDriveFolder ? 'Real Google Drive Folder Linked' : 'No Unique Folder ID Linked Yet'}</span>
              </div>
              <p className="text-[11px] mt-1 text-warm-graphite">
                {selectedCase.hasRealDriveFolder 
                  ? `Google Drive Unique ID: ${selectedCase.driveFolderId}`
                  : 'Google Drive folders use unique opaque IDs (e.g. drive.google.com/drive/folders/1A2b3C...). You can auto-create the folder or paste your folder link below.'}
              </p>
            </div>

            {/* 1-Click Auto Provisioning Button */}
            <div className="p-4 bg-white/70 rounded-3xl border border-warm-borderSubtle space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-warm-obsidian flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-terracotta" /> Auto-Create Folder in Google Drive
                  </h4>
                  <p className="text-[11px] text-warm-muted">
                    Provisions case folder & all 6 subdirectories via Google Drive API
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProvisioningDrive}
                  onClick={async () => {
                    setIsProvisioningDrive(true);
                    await provisionCaseInGoogleDrive(selectedCase.id);
                    setIsProvisioningDrive(false);
                    setIsDriveEditOpen(false);
                  }}
                  className="capsule-btn-dark text-xs shrink-0"
                >
                  <span>{isProvisioningDrive ? 'Creating...' : 'Auto-Provision'}</span>
                  <div className="knob"><FolderTree className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </div>

            {/* Manual Link/ID Input */}
            <form onSubmit={handleSaveDriveLink} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1.5">
                  Or Paste Google Drive Folder Link or Folder ID
                </label>
                <input
                  type="text"
                  required
                  value={customDriveInput}
                  onChange={(e) => setCustomDriveInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1w7uR4K8yP... or raw ID"
                  className="w-full capsule-input text-xs font-mono"
                />
                {customDriveInput && (
                  <p className="text-[11px] text-warm-muted mt-1 font-mono">
                    {extractDriveFolderId(customDriveInput) 
                      ? `✓ Valid Google Drive Folder ID detected: ${extractDriveFolderId(customDriveInput)}`
                      : 'ℹ Note: Please paste a link containing a real Google Drive ID'}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-warm-muted">
                <span>Want to open your Google Drive?</span>
                <a
                  href="https://drive.google.com/drive/my-drive"
                  target="_blank"
                  rel="noreferrer"
                  className="text-terracotta font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open My Drive
                </a>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-warm-borderSubtle/60">
                <button
                  type="button"
                  onClick={() => setIsDriveEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-warm-graphite hover:bg-white rounded-pill"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save Drive Link</span>
                  <div className="knob"><Save className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </form>
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

      <OrderReaderModal
        isOpen={Boolean(selectedOrderToRead)}
        onClose={() => setSelectedOrderToRead(null)}
        order={selectedOrderToRead}
        caseData={selectedCase}
      />

      <CaseRegistrationModal
        isOpen={isEditCaseOpen}
        onClose={() => setIsEditCaseOpen(false)}
        caseToEdit={selectedCase}
      />

    </div>
  );
};
