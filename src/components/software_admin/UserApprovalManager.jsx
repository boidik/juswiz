import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Award, 
  ArrowRight,
  KeyRound,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  Check,
  ShieldAlert
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const UserApprovalManager = () => {
  const { 
    pendingUsers, 
    approveUser, 
    rejectUser, 
    users, 
    currentUser, 
    deleteUserAccount, 
    resetUserPassword,
    showToast 
  } = useApp();

  const [staffToDelete, setStaffToDelete] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editRole, setEditRole] = useState('STAFF');
  const [editDesignation, setEditDesignation] = useState('');

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setEditRole(staff.role || 'STAFF');
    setEditDesignation(staff.designation || 'Litigation Associate');
  };

  const handleSaveStaffEdit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      await updateDoc(doc(db, 'users', editingStaff.id), {
        role: editRole,
        designation: editDesignation
      });
      showToast(`Updated permissions for ${editingStaff.name || editingStaff.email}`);
      setEditingStaff(null);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  const handleSendReset = async (email) => {
    await resetUserPassword(email);
  };

  const handleDeleteStaffConfirmed = async () => {
    if (!staffToDelete) return;
    if (staffToDelete.id === currentUser?.uid || staffToDelete.uid === currentUser?.uid) {
      showToast('Cannot delete your own active administrator account.', 'error');
      setStaffToDelete(null);
      return;
    }
    await deleteUserAccount(staffToDelete.id);
    setStaffToDelete(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Pending Approvals Card */}
      <div className="glass-panel-elevated rounded-4xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full sun-gradient-circle text-white flex items-center justify-center shadow-amber-glow shrink-0">
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
                      className="px-3.5 py-1.5 rounded-pill text-xs text-warm-muted hover:text-rose-600 hover:bg-rose-50 transition-colors font-medium"
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

      {/* Active Users Directory with Delete & Password Reset */}
      <div className="glass-panel rounded-4xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-warm-borderSubtle/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-warm-obsidian font-display">Active Practice Personnel ({users.length})</h3>
            <p className="text-xs text-warm-muted">Verified advocates, clerks, and managing partners with access control</p>
          </div>
        </div>

        <div className="divide-y divide-warm-borderSubtle/60">
          {users.map(u => {
            const isSelf = u.id === currentUser?.uid || u.uid === currentUser?.uid;

            return (
              <div key={u.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-terracotta to-terracotta-light text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-warm-obsidian">{u.name}</span>
                      <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-bold bg-warm-sand/60 text-warm-obsidian border border-warm-borderSubtle">
                        {u.role?.replace('_', ' ')}
                      </span>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-pill text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Current Account
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-warm-muted mt-0.5">
                      {u.email} • {u.designation || 'Counsel'} {u.phone ? `• ${u.phone}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                  {/* Reset Password Button */}
                  <button
                    onClick={() => handleSendReset(u.email)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand/50 text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs transition-colors"
                    title={`Send official password reset link to ${u.email}`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset Password</span>
                  </button>

                  {/* Edit Role / Designation */}
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white hover:bg-warm-sand/50 text-warm-obsidian border border-warm-borderSubtle text-xs font-semibold shadow-xs transition-colors"
                    title="Change console role & designation"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-terracotta" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Staff Button */}
                  {!isSelf ? (
                    <button
                      onClick={() => setStaffToDelete(u)}
                      className="p-2 rounded-full border border-warm-borderSubtle hover:bg-rose-50 text-warm-muted hover:text-rose-600 transition-colors shadow-xs"
                      title="Permanently remove personnel account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Staff Role & Designation Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-md glass-panel-elevated rounded-4xl border border-white/95 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-warm-borderSubtle/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full sun-gradient-circle text-white flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-warm-obsidian font-display">Edit Staff Permissions</h3>
                  <p className="text-xs text-warm-muted">{editingStaff.name} ({editingStaff.email})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="w-7 h-7 rounded-full bg-warm-sand/50 hover:bg-warm-sand flex items-center justify-center text-warm-graphite"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Console Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full capsule-input text-xs"
                >
                  <option value="STAFF">Staff Console (Associate / Litigation Clerk)</option>
                  <option value="MANAGER_ADMIN">Manager Admin (Partner / Team Lead)</option>
                  <option value="SOFTWARE_ADMIN">Software Administrator (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-graphite mb-1">
                  Firm Designation
                </label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  placeholder="e.g. Senior Partner, Litigation Clerk"
                  className="w-full capsule-input text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-warm-borderSubtle/60">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 text-xs font-semibold border border-warm-borderSubtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="capsule-btn-dark text-xs"
                >
                  <span>Save Changes</span>
                  <div className="knob"><Check className="w-3.5 h-3.5 text-white" /></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-warm-obsidian/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-md glass-panel-elevated rounded-4xl border border-white/95 shadow-glass overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-warm-obsidian font-display">Delete Staff Record</h3>
                <p className="text-xs text-warm-muted">{staffToDelete.name} ({staffToDelete.email})</p>
              </div>
            </div>

            <p className="text-xs text-warm-graphite leading-relaxed">
              Are you sure you want to permanently delete this personnel profile from the practice system? They will immediately lose access to all litigation consoles.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-warm-borderSubtle/60">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 rounded-pill bg-white text-warm-graphite hover:bg-warm-sand/50 text-xs font-semibold border border-warm-borderSubtle"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaffConfirmed}
                className="px-4 py-2 rounded-pill bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Staff Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
