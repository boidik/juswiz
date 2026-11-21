import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, UserX, Clock, ShieldCheck, Mail, Phone, Award, ArrowRight } from 'lucide-react';

export const UserApprovalManager = () => {
  const { pendingUsers, approveUser, rejectUser, users } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Pending Approvals Card */}
      <div className="glass-panel-elevated rounded-4xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-warm-obsidian font-display">Pending Registration Approvals</h3>
              <p className="text-xs text-warm-muted">
                Newly registered advocates & clerks require Software Admin verification prior to console entry.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-pill text-xs font-bold bg-terracotta-soft text-terracotta border border-terracotta/20">
            {pendingUsers.length} Pending
          </span>
        </div>

        <div className="p-6">
          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-warm-muted space-y-1">
              <UserCheck className="w-10 h-10 mx-auto stroke-1 text-emerald-500" />
              <p className="text-xs font-semibold text-warm-obsidian font-display">No pending registrations.</p>
              <p className="text-[11px]">All practice accounts have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(p => (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/90"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-warm-obsidian font-display">{p.name}</span>
                      <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-warm-sand/50 text-warm-obsidian">
                        Requested: {p.requestedRole?.replace('_', ' ') || 'Staff'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {p.phone}
                        </span>
                      )}
                      {p.barCouncilNo && (
                        <span className="flex items-center gap-1 font-mono text-warm-obsidian bg-white px-2.5 py-0.5 rounded-pill border border-warm-borderSubtle">
                          <Award className="w-3 h-3 text-terracotta" /> Bar No: {p.barCouncilNo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => rejectUser(p.id)}
                      className="px-3.5 py-1.5 rounded-pill text-xs text-warm-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Decline
                    </button>

                    <button
                      onClick={() => approveUser(p.id, 'STAFF')}
                      className="capsule-btn-dark text-xs"
                    >
                      <span>Approve Staff</span>
                      <div className="knob"><UserCheck className="w-3.5 h-3.5 text-white" /></div>
                    </button>

                    <button
                      onClick={() => approveUser(p.id, 'MANAGER_ADMIN')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-white hover:bg-warm-sand/40 border border-warm-borderSubtle text-xs font-semibold text-warm-obsidian transition-colors shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-terracotta" /> Approve Manager
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Users Directory */}
      <div className="glass-panel rounded-4xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-warm-obsidian font-display">Active Practice Personnel ({users.length})</h3>
            <p className="text-xs text-warm-muted">Verified advocates, clerks, and managing partners</p>
          </div>
        </div>

        <div className="divide-y divide-warm-borderSubtle/60">
          {users.map(u => (
            <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-terracotta to-terracotta-light text-white font-bold text-xs flex items-center justify-center">
                  {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-warm-obsidian">{u.name}</span>
                    <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-warm-sand/50 text-warm-obsidian">
                      {u.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-warm-muted">{u.email} • {u.designation || 'Counsel'}</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-pill">
                Active & Synced
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
