import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { SoftwareAdminConsole } from './components/software_admin/SoftwareAdminConsole';
import { ManagerAdminConsole } from './components/manager_admin/ManagerAdminConsole';
import { StaffConsole } from './components/staff_console/StaffConsole';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/common/AuthModal';
import { Toast } from './components/common/Toast';
import { ShieldCheck, BarChart3, Briefcase, Lock, Sparkles, ArrowRight } from 'lucide-react';

function AppContent() {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    authLoading, 
    systemConfig,
    setIsAuthModalOpen 
  } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2EA]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full sun-gradient-circle animate-spin mx-auto flex items-center justify-center shadow-amber-glow">
            <div className="w-8 h-8 rounded-full bg-[#F6F2EA]" />
          </div>
          <p className="text-xs font-semibold text-warm-graphite tracking-tight font-display">
            Connecting to Firebase Cloud Database...
          </p>
        </div>
      </div>
    );
  }

  const isPending = currentUser && currentUser.status === 'PENDING';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EA] text-[#161618] relative z-10">
      
      {/* Top Floating App Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {!currentUser ? (
          // Unauthenticated Luxury Gateway (Pinterest sample aesthetic)
          <div className="max-w-md mx-auto my-12 p-8 glass-panel-elevated rounded-4xl border border-white/95 text-center space-y-4 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.3)]">
            <div className="w-16 h-16 rounded-full sun-gradient-circle text-white flex items-center justify-center mx-auto shadow-amber-glow">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-warm-obsidian font-display tracking-tight">
              Litigation Gateway Secured
            </h2>
            <p className="text-xs text-warm-graphite leading-relaxed">
              Welcome to <strong>{systemConfig.firmBranding?.firmName || 'JurisFlow'}</strong>. Access to ongoing dockets, court filings, and order sheets is reserved for authorized counsel.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="capsule-btn-dark text-xs mx-auto"
              >
                <span>Sign In to Console</span>
                <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
              </button>
            </div>
          </div>
        ) : isPending ? (
          // Account Pending Approval Screen
          <div className="max-w-md mx-auto my-12 p-8 glass-panel rounded-4xl border border-warm-borderSubtle text-center space-y-4">
            <div className="w-16 h-16 rounded-full sun-gradient-circle text-white flex items-center justify-center mx-auto shadow-amber-glow">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-warm-obsidian font-display tracking-tight">
              Awaiting Practice Verification
            </h2>
            <p className="text-xs text-warm-graphite leading-relaxed">
              Your registration has been forwarded to the Software Admin for review. Once verified, access to your counsel console will activate automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="capsule-btn-dark text-xs mx-auto"
            >
              <span>Check Approval Status</span>
              <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
            </button>
          </div>
        ) : (
          // Authenticated Console Views
          <>
            {currentRole === 'SOFTWARE_ADMIN' && <SoftwareAdminConsole />}
            {currentRole === 'MANAGER_ADMIN' && <ManagerAdminConsole />}
            {currentRole === 'STAFF' && <StaffConsole />}
          </>
        )}

      </main>

      {/* Floating Bottom Console Switcher for Authorized Admins */}
      {currentUser && (currentUser.role === 'SOFTWARE_ADMIN' || currentUser.role === 'MANAGER_ADMIN') && (
        <aside aria-label="Console switcher" className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#141416]/95 backdrop-blur-xl text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-pill shadow-obsidian border border-white/10 flex items-center gap-1.5 sm:gap-3 text-xs max-w-[96vw] overflow-x-auto no-scrollbar">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-widest pr-1 shrink-0">
            <Sparkles className="w-3 h-3 text-terracotta-light" /> Switch Console:
          </span>

          {currentUser.role === 'SOFTWARE_ADMIN' && (
            <button
              onClick={() => switchRole('SOFTWARE_ADMIN')}
              className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-pill text-xs font-semibold transition-all whitespace-nowrap ${
                currentRole === 'SOFTWARE_ADMIN'
                  ? 'bg-terracotta text-white shadow-amber-glow'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          )}

          <button
            onClick={() => switchRole('MANAGER_ADMIN')}
            className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-pill text-xs font-semibold transition-all whitespace-nowrap ${
              currentRole === 'MANAGER_ADMIN'
                ? 'bg-terracotta text-white shadow-amber-glow'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Manager
          </button>

          <button
            onClick={() => switchRole('STAFF')}
            className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-pill text-xs font-semibold transition-all whitespace-nowrap ${
              currentRole === 'STAFF'
                ? 'bg-terracotta text-white shadow-amber-glow'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Staff
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-warm-borderSubtle/60 py-8 mt-16 text-center text-xs text-warm-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            © {new Date().getFullYear()} {systemConfig.firmBranding?.firmName || 'JurisFlow'}. Warm Minimalist Architecture.
          </p>
          <p className="flex items-center gap-2 text-[11px]">
            <span>Supreme Court of India</span>
            <span>•</span>
            <span>High Court at Calcutta</span>
            <span>•</span>
            <span>National Tribunals</span>
          </p>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <NotificationDrawer />
      <AuthModal />
      <Toast />

    </div>
  );
}

export default function App() {
  return <AppContent />;
}
