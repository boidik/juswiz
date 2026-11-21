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
  LogIn, 
  Sparkles, 
  ArrowRight,
  FolderTree
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

  const actualRole = currentUser?.role || 'STAFF';
  const canAccessAdmin = actualRole === 'SOFTWARE_ADMIN';
  const canAccessManager = actualRole === 'SOFTWARE_ADMIN' || actualRole === 'MANAGER_ADMIN';

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto glass-panel-elevated rounded-3xl sm:rounded-pill px-4 sm:px-6 py-2.5 sm:py-3 border border-white/80 shadow-[0_10px_35px_-5px_rgba(180,160,140,0.12)]">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full sun-gradient-circle flex items-center justify-center p-2 text-white shadow-amber-glow">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-warm-obsidian font-display">
                  {systemConfig.firmBranding?.firmName || 'JurisFlow'}
                </h1>
                <span className="hidden md:inline-flex text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-terracotta-soft text-terracotta border border-terracotta/20">
                  Legal Studio
                </span>
              </div>
              <p className="text-[11px] text-warm-muted font-medium truncate max-w-[200px] sm:max-w-xs">
                {systemConfig.firmBranding?.tagline || 'High Court & Supreme Court'}
              </p>
            </div>
          </div>

          {/* Center Capsule Navigation: 3 Consoles */}
          {currentUser && (
            <nav className="flex items-center p-1 bg-warm-sand/50 backdrop-blur-md rounded-pill border border-warm-borderSubtle">
              {canAccessAdmin && (
                <button
                  onClick={() => switchRole('SOFTWARE_ADMIN')}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                    currentRole === 'SOFTWARE_ADMIN'
                      ? 'bg-warm-obsidian text-white shadow-md'
                      : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white/60'
                  }`}
                  title="Software Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}

              {canAccessManager && (
                <button
                  onClick={() => switchRole('MANAGER_ADMIN')}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                    currentRole === 'MANAGER_ADMIN'
                      ? 'bg-warm-obsidian text-white shadow-md'
                      : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white/60'
                  }`}
                  title="Manager Admin Console"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Manager</span>
                </button>
              )}

              <button
                onClick={() => switchRole('STAFF')}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                  currentRole === 'STAFF'
                    ? 'bg-warm-obsidian text-white shadow-md'
                    : 'text-warm-graphite hover:text-warm-obsidian hover:bg-white/60'
                }`}
                title="Staff Console"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* Master Google Drive Cloud */}
            {currentUser && (
              <a
                href={systemConfig.firmBranding?.masterDriveUrl || 'https://drive.google.com/drive/my-drive'}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-white text-warm-graphite hover:text-warm-obsidian transition-colors border border-transparent hover:border-warm-borderSubtle hidden sm:flex items-center"
                title="Chambers Master Google Drive"
              >
                <FolderTree className="w-4 h-4 text-terracotta" />
              </a>
            )}

            {/* Notification Bell */}
            {currentUser && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 rounded-full hover:bg-white text-warm-graphite hover:text-warm-obsidian transition-colors border border-transparent hover:border-warm-borderSubtle"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-terracotta rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            )}

            {/* Profile Dropdown or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-pill bg-white/90 hover:bg-white border border-warm-borderSubtle transition-all shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-terracotta to-terracotta-light text-white font-bold text-xs flex items-center justify-center">
                    {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <div className="font-semibold text-warm-obsidian truncate max-w-[110px]">
                      {currentUser.name || currentUser.email?.split('@')[0]}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-warm-muted" />
                </button>

                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 glass-panel-elevated rounded-3xl p-3 z-50 animate-fade-in border border-white"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-warm-borderSubtle mb-2">
                      <p className="text-xs font-bold text-warm-obsidian">{currentUser.name}</p>
                      <p className="text-[11px] text-warm-muted truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-terracotta-soft text-terracotta">
                        {currentUser.designation || currentUser.role}
                      </span>
                    </div>

                    {canAccessAdmin && (
                      <div className="py-1">
                        <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-warm-muted">
                          Switch View
                        </p>
                        <button
                          onClick={() => { switchRole('SOFTWARE_ADMIN'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-pill hover:bg-white flex items-center gap-2 text-warm-graphite hover:text-warm-obsidian"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-terracotta" /> Software Admin
                        </button>
                        <button
                          onClick={() => { switchRole('MANAGER_ADMIN'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-pill hover:bg-white flex items-center gap-2 text-warm-graphite hover:text-warm-obsidian"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Manager Admin
                        </button>
                        <button
                          onClick={() => { switchRole('STAFF'); setIsProfileMenuOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-pill hover:bg-white flex items-center gap-2 text-warm-graphite hover:text-warm-obsidian"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-terracotta" /> Staff Console
                        </button>
                      </div>
                    )}

                    <div className="border-t border-warm-borderSubtle mt-2 pt-2">
                      <button
                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs rounded-pill hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="capsule-btn-dark text-xs"
              >
                <span>Sign In</span>
                <div className="knob">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
