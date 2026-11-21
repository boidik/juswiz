import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderPlus, 
  Settings, 
  Users, 
  FolderCheck, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { CaseRegistrationModal } from './CaseRegistrationModal';
import { SystemCustomizer } from './SystemCustomizer';
import { UserApprovalManager } from './UserApprovalManager';

export const SoftwareAdminConsole = () => {
  const { cases, pendingUsers, systemConfig, users } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('CASES'); // 'CASES' | 'CUSTOMIZER' | 'APPROVALS'
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
          onClick={() => setIsRegisterModalOpen(true)}
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
      <div className="flex border-b border-warm-borderSubtle space-x-2">
        <button
          onClick={() => setActiveSubTab('CASES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === 'CASES'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <FolderCheck className="w-4 h-4" /> Provisioned Cases ({cases.length})
        </button>

        <button
          onClick={() => setActiveSubTab('CUSTOMIZER')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === 'CUSTOMIZER'
              ? 'border-terracotta text-terracotta font-bold'
              : 'border-transparent text-warm-muted hover:text-warm-obsidian'
          }`}
        >
          <Settings className="w-4 h-4" /> Zero-Code Customizer
        </button>

        <button
          onClick={() => setActiveSubTab('APPROVALS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
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
              onClick={() => setIsRegisterModalOpen(true)}
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

                  <div className="flex items-center gap-2 shrink-0">
                    {c.driveFolderUrl && (
                      <a
                        href={c.driveFolderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white border border-warm-borderSubtle hover:bg-warm-sand/40 text-xs font-medium text-warm-graphite transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-terracotta" /> Open in Drive
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

      {/* Registration Modal */}
      <CaseRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

    </div>
  );
};
