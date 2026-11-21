import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { SoftwareAdminConsole } from './components/software_admin/SoftwareAdminConsole';
import { ManagerAdminConsole } from './components/manager_admin/ManagerAdminConsole';
import { StaffConsole } from './components/staff_console/StaffConsole';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/common/AuthModal';
import { Toast } from './components/common/Toast';
import { ShieldCheck, BarChart3, Briefcase, Lock, Sparkles } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafd]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-material-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-neutral-600">Connecting to Firebase Cloud Database...</p>
        </div>
      </div>
    );
  }

  const isPending = currentUser && currentUser.status === 'PENDING';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafd] text-[#1b1b1f]">
      
      {/* Top App Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {!currentUser ? (
          // Unauthenticated Gateway
          <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-m3-2xl shadow-m3-2 border border-neutral-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-material-primary flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Litigation Gateway Secured</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Welcome to {systemConfig.firmBranding?.firmName || 'JurisFlow'}. Access to active legal case dockets, pleadings, and orders is restricted to authorized counsel and practice personnel.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 bg-material-primary hover:bg-blue-700 text-white font-medium text-xs rounded-m3-full shadow-xs transition-all"
            >
              Sign In with Email or Google Workspace
            </button>
          </div>
        ) : isPending ? (
          // Account Pending Approval Screen
          <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-m3-2xl shadow-m3-2 border border-amber-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Registration Pending Approval</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Your account has been submitted to the Software Admin for review. Once your Bar Council enrolment is verified, access to your console will be unlocked automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-neutral-800 text-white text-xs font-medium rounded-m3-full hover:bg-neutral-900 transition-all"
            >
              Check Approval Status
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

      {/* Interactive Console Switcher for Authorized Admins */}
      {currentUser && (currentUser.role === 'SOFTWARE_ADMIN' || currentUser.role === 'MANAGER_ADMIN') && (
        <aside aria-label="Console switcher" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/90 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-full shadow-m3-3 border border-neutral-700/80 flex items-center gap-2 sm:gap-3 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider pr-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Switch View:
          </span>

          {currentUser.role === 'SOFTWARE_ADMIN' && (
            <button
              onClick={() => switchRole('SOFTWARE_ADMIN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                currentRole === 'SOFTWARE_ADMIN'
                  ? 'bg-material-primary text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          )}

          <button
            onClick={() => switchRole('MANAGER_ADMIN')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              currentRole === 'MANAGER_ADMIN'
                ? 'bg-material-primary text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Manager
          </button>

          <button
            onClick={() => switchRole('STAFF')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              currentRole === 'STAFF'
                ? 'bg-material-primary text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Staff
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} {systemConfig.firmBranding?.firmName || 'JurisFlow'}. Powered by Firebase Firestore.
          </p>
          <p className="flex items-center gap-2">
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
