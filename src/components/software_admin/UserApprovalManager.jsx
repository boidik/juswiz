import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, UserX, Clock, ShieldCheck, Mail, Phone, Award } from 'lucide-react';

export const UserApprovalManager = () => {
  const { pendingUsers, approveUser, rejectUser, users } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Pending Approvals Card */}
      <div className="bg-white rounded-m3-2xl shadow-m3-1 border border-neutral-200 overflow-hidden">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/70 to-orange-50/40 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-m3-lg bg-amber-500 text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Pending Registration Approvals</h3>
              <p className="text-xs text-neutral-600">
                Newly registered advocates & clerks must be approved by Software Admin prior to console entry.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {pendingUsers.length} Pending
          </span>
        </div>

        <div className="p-5">
          {pendingUsers.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              <UserCheck className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-60 text-emerald-500" />
              <p className="text-xs font-medium text-neutral-600">No pending registrations.</p>
              <p className="text-[11px] text-neutral-400">All practice accounts have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-m3-xl border border-amber-200/80 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{p.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        Requested: {p.requestedRole.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" /> {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" /> {p.phone}
                        </span>
                      )}
                      {p.barCouncilNo && (
                        <span className="flex items-center gap-1 font-mono text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                          <Award className="w-3 h-3 text-amber-600" /> Bar No: {p.barCouncilNo}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-neutral-400">
                      Applied: {new Date(p.registeredAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => rejectUser(p.id)}
                      className="px-3 py-1.5 rounded-m3-full border border-neutral-300 text-xs text-neutral-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" /> Decline
                    </button>

                    <button
                      onClick={() => approveUser(p.id, 'STAFF')}
                      className="px-3 py-1.5 rounded-m3-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs flex items-center gap-1 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Approve as Staff
                    </button>

                    <button
                      onClick={() => approveUser(p.id, 'MANAGER_ADMIN')}
                      className="px-3 py-1.5 rounded-m3-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs flex items-center gap-1 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Approve as Manager
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Users Directory */}
      <div className="bg-white rounded-m3-2xl shadow-m3-1 border border-neutral-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Active Practice Users ({users.length})</h3>
            <p className="text-xs text-neutral-500">Current advocates, clerks, and practice administrators</p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {users.map(u => (
            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-material-primary-container text-material-primary font-bold text-xs flex items-center justify-center">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{u.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.role === 'SOFTWARE_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'MANAGER_ADMIN' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{u.email} • {u.designation}</p>
                </div>
              </div>

              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active & Synced
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
