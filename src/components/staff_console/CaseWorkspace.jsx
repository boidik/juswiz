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
  FileText
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
      <div className="p-12 text-center text-neutral-400">
        <Briefcase className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-50" />
        <p className="text-sm font-medium">No cases available.</p>
      </div>
    );
  }

  const caseDocs = documents.filter(d => d.caseId === selectedCase.id);
  const caseTasks = tasks.filter(t => t.caseId === selectedCase.id);
  const caseConfs = conferences.filter(c => c.caseId === selectedCase.id);
  const orderDocs = caseDocs.filter(d => d.folder === '05_Orders_and_Judgments');

  return (
    <div className="space-y-6">
      
      {/* Top Case Selector & Primary Action Header */}
      <div className="bg-white rounded-m3-2xl p-5 shadow-m3-1 border border-neutral-200 space-y-4">
        
        {/* Selector & Forum Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Case Switcher Dropdown */}
              <div className="relative inline-block">
                <select
                  value={selectedCase.id}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-300 pr-7 appearance-none cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title.slice(0, 35)}...
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-blue-800 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                {selectedCase.courtName}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                CNR: {selectedCase.cnrNumber}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
              {selectedCase.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>Bench: <strong className="text-neutral-800">{selectedCase.bench}</strong></span>
              <span>•</span>
              <span>Lead: <strong className="text-neutral-800">{selectedCase.leadCounsel}</strong></span>
              <span>•</span>
              <span>Senior: <strong className="text-neutral-800">{selectedCase.seniorAdvocate}</strong></span>
              <span>•</span>
              <span>Client: <strong className="text-neutral-800">{selectedCase.clientName}</strong></span>
            </div>
          </div>

          {/* Quick Drive Folder Link & Next Date Card */}
          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
            <div className="p-3 rounded-m3-xl bg-amber-50/80 border border-amber-200 text-left">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-600" /> Next Hearing Date
              </div>
              <p className="text-sm font-bold text-neutral-900 font-mono mt-0.5">
                {selectedCase.nextHearingDate || 'Unscheduled'}
              </p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                {selectedCase.itemNumber}
              </p>
            </div>

            <a
              href={selectedCase.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-m3-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex flex-col items-center justify-center transition-colors"
              title="Open Case Google Drive Root Directory"
            >
              <FolderOpen className="w-5 h-5 text-blue-600 mb-1" />
              <span>Google Drive</span>
            </a>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-neutral-100">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-3.5 py-1.5 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Upload File (Auto-Rename)
          </button>

          <button
            onClick={() => setIsGMeetOpen(true)}
            className="px-3.5 py-1.5 rounded-m3-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Video className="w-3.5 h-3.5" /> Schedule GMeet
          </button>

          <button
            onClick={() => setIsShareBriefOpen(true)}
            className="px-3.5 py-1.5 rounded-m3-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Case Brief
          </button>

          <button
            onClick={() => setIsHearingDateOpen(true)}
            className="px-3.5 py-1.5 rounded-m3-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" /> Log Date & Reminders
          </button>

          <button
            onClick={() => setIsOrderFetcherOpen(true)}
            className="px-3.5 py-1.5 rounded-m3-full bg-neutral-900 hover:bg-black text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all ml-auto"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" /> Fetch Court Order (Auto-Scraper)
          </button>
        </div>

      </div>

      {/* Workspace Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-200 space-x-2">
        <button
          onClick={() => setActiveTab('VAULT')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'VAULT'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Document Vault ({caseDocs.length})
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'TASKS'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Case Tasks ({caseTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('CONFERENCES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'CONFERENCES'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Video className="w-4 h-4" /> GMeet Conferences ({caseConfs.length})
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeTab === 'ORDERS'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Gavel className="w-4 h-4" /> Orders & Proceedings ({orderDocs.length})
        </button>
      </div>

      {/* Sub-Tab 1: Document Vault */}
      {activeTab === 'VAULT' && (
        <DocumentVault
          targetCaseId={selectedCase.id}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenShareBrief={() => setIsShareBriefOpen(true)}
        />
      )}

      {/* Sub-Tab 2: Case Tasks */}
      {activeTab === 'TASKS' && (
        <div className="bg-white rounded-m3-xl shadow-m3-1 border border-neutral-200 p-5 divide-y divide-neutral-100">
          <div className="pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Litigation Tasks for this Matter</h3>
            <span className="text-xs text-neutral-500">{caseTasks.length} task(s) delegated</span>
          </div>

          {caseTasks.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-400">No tasks delegated specifically to this case.</p>
          ) : (
            caseTasks.map(t => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{t.title}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{t.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-neutral-600">Due: {t.dueDate}</span>
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    className="text-xs bg-neutral-50 border border-neutral-300 rounded px-2 py-1"
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

      {/* Sub-Tab 3: GMeet Conferences */}
      {activeTab === 'CONFERENCES' && (
        <div className="bg-white rounded-m3-xl shadow-m3-1 border border-neutral-200 p-5 divide-y divide-neutral-100">
          <div className="pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Scheduled Google Meet Conferences</h3>
            <button
              onClick={() => setIsGMeetOpen(true)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-medium hover:bg-emerald-700"
            >
              + New GMeet
            </button>
          </div>

          {caseConfs.length === 0 ? (
            <p className="py-8 text-center text-xs text-neutral-400">No GMeet conferences scheduled yet.</p>
          ) : (
            caseConfs.map(c => (
              <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{c.title}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      {c.durationMinutes} mins
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{c.agenda}</p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Host: {c.host} • Attendees: {c.attendees.join(', ') || 'Team members'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-neutral-700">{c.date} at {c.time}</span>
                  <a
                    href={c.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-m3-md hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Join Meet
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 4: Orders & Proceedings */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-m3-xl shadow-m3-1 border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Bench Orders & Proceedings Archive</h3>
              <p className="text-xs text-neutral-500">Synced to Google Drive /05_Orders_and_Judgments</p>
            </div>
            <button
              onClick={() => setIsOrderFetcherOpen(true)}
              className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-black flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> Run Automated Order Fetcher
            </button>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-m3-lg border border-neutral-200 text-xs">
            <span className="font-semibold text-neutral-800">Current Order on Record:</span>
            <p className="text-neutral-700 italic mt-1 leading-relaxed">
              "{selectedCase.lastOrder}"
            </p>
          </div>

          <div className="divide-y divide-neutral-100">
            {orderDocs.map(o => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs font-mono font-bold text-neutral-900">{o.name}</p>
                    <p className="text-[11px] text-neutral-500">{o.uploadedBy} • {new Date(o.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <a
                  href={o.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 border border-neutral-300 text-neutral-700 rounded-md text-xs hover:bg-neutral-100 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View PDF
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
