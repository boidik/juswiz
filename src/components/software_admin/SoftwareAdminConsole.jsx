import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FolderPlus, 
  Settings, 
  Users, 
  FolderCheck, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  Layers
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
            <span className="p-1.5 rounded-m3-md bg-purple-100 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Software Administrator Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure system parameters, provision Google Drive directories, approve team access, and customize firm branding.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="px-4 py-2.5 bg-material-primary hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-m3-full shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" /> Register New Case & Provision Drive
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Registered Cases</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">{cases.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <FolderCheck className="w-3 h-3" /> Drive Directories Synced
          </span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Pending Approvals</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{pendingUsers.length}</p>
          <span className="text-[10px] text-neutral-500 font-medium mt-1 block">
            Awaiting admin sign-off
          </span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Active Forums</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">{systemConfig.courts.length}</p>
          <span className="text-[10px] text-neutral-500 font-medium mt-1 block">
            High Courts, SCI & Tribunals
          </span>
        </div>

        <div className="p-4 rounded-m3-xl bg-white border border-neutral-200 shadow-xs">
          <p className="text-xs text-neutral-500 font-medium">Active Personnel</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">{users.length}</p>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
            Litigators & Clerks
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-neutral-200 space-x-2">
        <button
          onClick={() => setActiveSubTab('CASES')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeSubTab === 'CASES'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FolderCheck className="w-4 h-4" /> Registered Cases & Drive Directories
        </button>

        <button
          onClick={() => setActiveSubTab('CUSTOMIZER')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeSubTab === 'CUSTOMIZER'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Zero-Code Customizer
        </button>

        <button
          onClick={() => setActiveSubTab('APPROVALS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
            activeSubTab === 'APPROVALS'
              ? 'border-material-primary text-material-primary font-bold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" /> User Approvals
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Registered Cases List with Drive Links */}
      {activeSubTab === 'CASES' && (
        <div className="bg-white rounded-m3-2xl shadow-m3-1 border border-neutral-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Provisioned Case Directory Trees</h3>
              <p className="text-xs text-neutral-500">
                Every case holds an automated folder structure in the linked Google Drive workspace.
              </p>
            </div>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-material-primary bg-blue-50 hover:bg-blue-100 rounded-m3-full border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" /> New Case Registration
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {cases.map(c => (
              <div key={c.id} className="p-4 sm:p-5 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      {c.courtName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Drive Provisioned
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-neutral-900">{c.title}</h4>
                  
                  <p className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                    📁 {c.driveFolderPath}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 pt-1">
                    <span>Client: <strong className="text-neutral-800">{c.clientName}</strong></span>
                    <span>•</span>
                    <span>Lead: <strong className="text-neutral-800">{c.leadCounsel}</strong></span>
                    <span>•</span>
                    <span>CNR: <strong className="font-mono text-neutral-700">{c.cnrNumber}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <a
                    href={c.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-m3-md border border-neutral-300 hover:bg-neutral-100 text-xs text-neutral-700 flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Open in Google Drive
                  </a>
                </div>
              </div>
            ))}
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
