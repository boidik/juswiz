import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderPlus, 
  Settings, 
  Users, 
  FolderCheck, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight,
  Edit3,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { CaseRegistrationModal } from './CaseRegistrationModal';
import { SystemCustomizer } from './SystemCustomizer';
import { UserApprovalManager } from './UserApprovalManager';

export const SoftwareAdminConsole = () => {
  const { cases, pendingUsers, systemConfig, users, deleteCase } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('CASES'); // 'CASES' | 'CUSTOMIZER' | 'APPROVALS'
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [caseToDelete, setCaseToDelete] = useState(null);

  const handleDeleteConfirmed = async () => {
    if (!caseToDelete) return;
    await deleteCase(caseToDelete.id);
    setCaseToDelete(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Console Title & KPI Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-full sun-gradient-circle text-white shadow-amber-glow">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-warm-obsidian tracking-tight font-display">
              Software Administrator Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-warm-muted mt-1">
            System parameter customization, Google Drive provisioning, staff approvals, and firm branding.
          </p>
        </div>

        <button
          onClick={() => {
            setCaseToEdit(null);
            setIsRegisterModalOpen(true);
          }}
          className="capsule-btn-dark text-xs sm:text-sm self-start sm:self-auto"
        >
          <span>Register Case & Drive</span>
          <div className="knob"><FolderPlus className="w-4 h-4 text-white" /></div>
        </button>
      </div>

      {/* KPI Cards (Frosted & Obsidian) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-5 rounded-3xl glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full sun-gradient-circle opacity-15 blur-lg pointer-events-none" />
          <p className="text-xs text-warm-muted font-medium">Registered Cases</p>
          <p className="text-2xl font-black text-warm-obsidian mt-1 font-display">{cases.length}</p>
          <span className="text-[10px] text-terracotta font-semibold flex items-center gap-1 mt-1">
            <FolderCheck className="w-3 h-3" /> Drive Provisioned
          </span>
        </div>

        <div className="p-5 rounded-3xl obsidian-card">
          <p className="text-xs text-white/60 font-medium">Pending Approvals</p>
          <p className="text-2xl font-black text-terracotta mt-1 font-display">{pendingUsers.length}</p>
          <span className="text-[10px] text-white/40 font-medium mt-1 block">
            Awaiting verification
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel">
          <p className="text-xs text-warm-muted font-medium">Active Forums</p>
          <p className="text-2xl font-black text-warm-obsidian mt-1 font-display">{systemConfig.courts?.length || 0}</p>
          <span className="text-[10px] text-warm-muted font-medium mt-1 block">
            High Courts, SCI & Tribunals
          </span>
        </div>

        <div className="p-5 rounded-3xl glass-panel">
          <p className="text-xs text-warm-muted font-medium">Active Staff</p>
          <p className="text-2xl font-black text-warm-obsidian mt-1 font-display">{users.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            Advocates & Clerks
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-warm-borderSubtle space-x-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('CASES')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'CASES'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <FolderCheck className="w-4 h-4" /> Provisioned Cases ({cases.length})
        </button>

        <button
          onClick={() => setActiveSubTab('CUSTOMIZER')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'CUSTOMIZER'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Settings className="w-4 h-4" /> Zero-Code Customizer
        </button>

        <button
          onClick={() => setActiveSubTab('APPROVALS')}
          className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'APPROVALS'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Users className="w-4 h-4" /> Staff Approvals
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-terracotta text-white font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Registered Cases List with Drive Links */}
      {activeSubTab === 'CASES' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-warm-borderSubtle/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-warm-obsidian font-display">Provisioned Case Directory Trees</h3>
              <p className="text-xs text-warm-muted">
                Every case holds an automated folder structure in the linked Google Drive workspace.
              </p>
            </div>
            <button
              onClick={() => {
                setCaseToEdit(null);
                setIsRegisterModalOpen(true);
              }}
              className="capsule-btn-dark text-xs"
            >
              <span>New Case</span>
              <div className="knob"><FolderPlus className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>

          <div className="divide-y divide-warm-borderSubtle/60">
            {cases.length === 0 ? (
              <p className="py-12 text-center text-xs text-warm-muted">No cases registered yet.</p>
            ) : (
              cases.map(c => (
                <div key={c.id} className="p-5 hover:bg-white/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-pill bg-warm-sand/50 text-warm-obsidian border border-warm-borderSubtle">
                        {c.caseNumber}
                      </span>
                      <span className="text-xs font-medium text-warm-graphite">
                        {c.courtName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-pill bg-emerald-500/10 text-emerald-700">
                        Drive Synced
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-warm-obsidian font-display">{c.title}</h4>
                    
                    <p className="text-xs text-warm-muted font-mono flex items-center gap-1">
                      📁 {c.driveFolderPath}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-warm-graphite pt-1">
                      <span>Client: <strong className="text-warm-obsidian">{c.clientName}</strong></span>
                      <span>•</span>
                      <span>Lead: <strong className="text-warm-obsidian">{c.leadCounsel}</strong></span>
                      <span>•</span>
                      <span>CNR: <strong className="font-mono text-warm-muted">{c.cnrNumber}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => {
                        setCaseToEdit(c);
                        setIsRegisterModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle hover:bg-warm-sand/50 text-xs font-semibold text-warm-obsidian transition-colors shadow-xs"
                      title="Edit Case Details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-terracotta" /> Edit
                    </button>

                    <button
                      onClick={() => setCaseToDelete(c)}
                      className="p-2 rounded-full border border-warm-borderSubtle hover:bg-rose-50 text-warm-muted hover:text-rose-600 transition-colors"
                      title="Delete Case Docket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {c.driveFolderUrl && (
                      <a
                        href={c.driveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-white border border-warm-borderSubtle hover:bg-warm-sand/40 text-xs font-medium text-warm-graphite transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-terracotta" /> Drive
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Zero-Code Customizer */}
      {activeSubTab === 'CUSTOMIZER' && (
        <SystemCustomizer />
      )}

      {/* Tab 3: User Approvals */}
      {activeSubTab === 'APPROVALS' && (
        <UserApprovalManager />
      )}

      {/* Registration / Edit Modal */}
      <CaseRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setCaseToEdit(null);
        }}
        caseToEdit={caseToEdit}
      />

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-md glass-panel-elevated rounded-4xl border border-white/95 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-warm-obsidian font-display">Delete Case Docket</h3>
                <p className="text-xs text-warm-muted">{caseToDelete.caseNumber}</p>
              </div>
            </div>

            <p className="text-xs text-warm-graphite leading-relaxed">
              Are you sure you want to permanently delete <strong>{caseToDelete.title}</strong>? All associated filings, task delegations, and conferences will be removed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-warm-borderSubtle/60">
              <button
                onClick={() => setCaseToDelete(null)}
                className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 text-xs font-semibold border border-warm-borderSubtle"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-pill bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Docket</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
