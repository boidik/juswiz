import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  BarChart3, 
  Briefcase, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  LogIn
} from 'lucide-react';

export const Header = () => {
  const { 
    systemConfig, 
    currentUser, 
    currentRole, 
    switchRole, 
    notifications, 
    setIsNotificationOpen,
    setIsAuthModalOpen,
    logout
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Determine which consoles this user can switch to
  const actualRole = currentUser?.role || 'STAFF';
  const canAccessAdmin = actualRole === 'SOFTWARE_ADMIN';
  const canAccessManager = actualRole === 'SOFTWARE_ADMIN' || actualRole === 'MANAGER_ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-material-outline-variant/40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Firm Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-m3-lg bg-material-primary-container/60 flex items-center justify-center p-2 border border-material-primary/20 shadow-sm">
              <img 
                src={systemConfig.firmBranding?.logoUrl || "https://api.iconify.design/material-symbols:balance.svg?color=%230b57d0"} 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <Briefcase className="w-6 h-6 text-material-primary hidden" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-tight">
                  {systemConfig.firmBranding?.firmName || 'JurisFlow Legal Practice'}
                </h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Live Firebase Cloud
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium truncate max-w-xs sm:max-w-md">
                {systemConfig.firmBranding?.tagline || 'Litigation Practice Management'}
              </p>
            </div>
          </div>

          {/* Center Navigation: 3 Consoles Switcher */}
          {currentUser && (
            <nav className="flex items-center p-1 bg-material-surface-container-high/60 rounded-m3-full border border-material-outline-variant/30">
              {canAccessAdmin && (
                <button
                  onClick={() => switchRole('SOFTWARE_ADMIN')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-m3-full text-xs sm:text-sm font-medium transition-all ${
                    currentRole === 'SOFTWARE_ADMIN'
                      ? 'bg-material-primary text-white shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                  title="Software Admin Console: Manage settings, drive folders, court masters, user approvals"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              )}

              {canAccessManager && (
                <button
                  onClick={() => switchRole('MANAGER_ADMIN')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-m3-full text-xs sm:text-sm font-medium transition-all ${
                    currentRole === 'MANAGER_ADMIN'
                      ? 'bg-material-primary text-white shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                  title="Manager Admin Console: Master cases board, workflow tracking & task delegation"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Manager</span>
                </button>
              )}

              <button
                onClick={() => switchRole('STAFF')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-m3-full text-xs sm:text-sm font-medium transition-all ${
                  currentRole === 'STAFF'
                    ? 'bg-material-primary text-white shadow-sm'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                }`}
                title="Staff Console: Case workspace, file uploads, GMeet, coordinated editing, brief sharing"
              >
                <Briefcase className="w-4 h-4" />
                <span>Staff Console</span>
              </button>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            {currentUser && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2.5 rounded-m3-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                title="Notifications & Hearing Reminders"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Dropdown or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-m3-full bg-white hover:bg-neutral-50 border border-neutral-200 transition-all shadow-sm"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-material-primary-container text-material-primary font-bold text-xs sm:text-sm flex items-center justify-center">
                    {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <div className="font-semibold text-neutral-900 truncate max-w-[120px]">
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                      {(currentRole || actualRole).replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-m3-xl shadow-m3-3 border border-neutral-200 p-2 z-50 animate-fade-in"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                      <p className="text-xs font-semibold text-neutral-900">{currentUser.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{currentUser.email}</p>
                      <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                        {currentUser.designation || currentUser.role}
                      </p>
                    </div>

                    {canAccessAdmin && (
                      <div className="py-1">
                        <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Switch View
                        </p>
                        <button
                          onClick={() => { switchRole('SOFTWARE_ADMIN'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-m3-md hover:bg-blue-50 flex items-center gap-2 text-neutral-700"
                        >
                          <ShieldCheck className="w-4 h-4 text-blue-600" /> Software Admin
                        </button>
                        <button
                          onClick={() => { switchRole('MANAGER_ADMIN'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-m3-md hover:bg-blue-50 flex items-center gap-2 text-neutral-700"
                        >
                          <BarChart3 className="w-4 h-4 text-emerald-600" /> Manager Admin
                        </button>
                        <button
                          onClick={() => { switchRole('STAFF'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-m3-md hover:bg-blue-50 flex items-center gap-2 text-neutral-700"
                        >
                          <Briefcase className="w-4 h-4 text-purple-600" /> Staff Console
                        </button>
                      </div>
                    )}

                    <div className="border-t border-neutral-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs rounded-m3-md hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-material-primary hover:bg-blue-700 text-white rounded-m3-full text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
