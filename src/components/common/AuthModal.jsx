import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, CheckCircle2, ArrowRight, Award } from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    loginWithGoogle, 
    registerNewUser, 
    sendPasswordReset,
    currentUser,
    authLoading,
    showToast 
  } = useApp();

  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'FORGOT' | 'PENDING_NOTICE' | 'FORGOT_SUCCESS'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [barCouncilNo, setBarCouncilNo] = useState('');
  const [requestedRole, setRequestedRole] = useState('STAFF');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated and active, do not force modal open unless requested
  const isAuthenticated = !!currentUser && currentUser.status === 'ACTIVE';
  const isPendingApproval = !!currentUser && currentUser.status === 'PENDING';

  if (!isAuthModalOpen && isAuthenticated) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setIsSubmitting(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !email || !password) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }
    setIsSubmitting(true);
    const res = await registerNewUser({
      name,
      email,
      password,
      phone,
      barCouncilNo,
      role: requestedRole
    });
    setIsSubmitting(false);
    if (res.success) {
      setSuccessInfo(res.message);
      setMode('PENDING_NOTICE');
    } else {
      setErrorMessage(res.message || 'Registration error. Please check fields.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setIsSubmitting(true);
    const res = await sendPasswordReset(email);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessInfo(`If an account exists for ${email}, a password reset link has been dispatched to your inbox.`);
      setMode('FORGOT_SUCCESS');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-m3-2xl shadow-m3-3 border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50/50 to-white border-b border-neutral-100 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Firebase Live Authentication
            </div>
            <h2 className="text-xl font-bold text-neutral-900">
              {isPendingApproval && 'Account Pending Admin Approval'}
              {!isPendingApproval && mode === 'LOGIN' && 'Sign In to Your Console'}
              {!isPendingApproval && mode === 'REGISTER' && 'Request Practice Access'}
              {!isPendingApproval && mode === 'FORGOT' && 'Reset Your Password'}
              {!isPendingApproval && (mode === 'PENDING_NOTICE' || mode === 'FORGOT_SUCCESS') && 'Request Processed'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Authorized personnel access only • High Court & Supreme Court Practices
            </p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-m3-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Pending Approval Notice if current user is logged in but pending */}
          {isPendingApproval ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Application Under Verification</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hello <strong>{currentUser.name}</strong> ({currentUser.email}). Your account is currently in <strong>PENDING</strong> status awaiting verification by the Software Admin.
              </p>
              <div className="p-3 bg-neutral-50 rounded-m3-md text-left text-xs text-neutral-500 border border-neutral-200 space-y-1">
                <p className="font-semibold text-neutral-800">Registration Details:</p>
                <p>• Requested Role: <strong>{currentUser.role}</strong></p>
                {currentUser.barCouncilNo && <p>• Bar Council Enrolment: <strong>{currentUser.barCouncilNo}</strong></p>}
                <p>• Once approved, this screen will automatically grant access to your console.</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 rounded-m3-full bg-material-primary text-white text-xs font-medium hover:bg-blue-700 transition-all"
              >
                Refresh Approval Status
              </button>
            </div>
          ) : (
            <>
              {/* Mode: LOGIN */}
              {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="advocate@lexfirm.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-neutral-700">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('FORGOT'); setErrorMessage(''); }}
                        className="text-xs text-material-primary hover:underline font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Sign In to Console'} <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-neutral-400 font-semibold">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Workspace Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-m3-full border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium text-sm transition-all flex items-center justify-center gap-3 shadow-xs disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Sign in with Google Workspace
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-neutral-500">
                      New advocate or clerk?{' '}
                      <button
                        type="button"
                        onClick={() => { setMode('REGISTER'); setErrorMessage(''); }}
                        className="text-material-primary font-semibold hover:underline"
                      >
                        Register for Practice Approval
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* Mode: REGISTER */}
              {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adv. Debojyoti Banerjee"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Official Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="debojyoti@bar.in"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Password (Minimum 6 characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98311..."
                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Bar Council Enrolment
                      </label>
                      <input
                        type="text"
                        value={barCouncilNo}
                        onChange={(e) => setBarCouncilNo(e.target.value)}
                        placeholder="WB/1420/2021"
                        className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Requested Role
                    </label>
                    <select
                      value={requestedRole}
                      onChange={(e) => setRequestedRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                    >
                      <option value="STAFF">Staff Console (Associate Counsel / Clerk)</option>
                      <option value="MANAGER_ADMIN">Manager Admin Console (Partner / Supervisor)</option>
                    </select>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      * Note: New accounts require verification by Software Admin before console access is unlocked.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Submit Registration Request'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('LOGIN'); setErrorMessage(''); }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                      Already have an account? Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Mode: PENDING_NOTICE */}
              {mode === 'PENDING_NOTICE' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Registration Submitted</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {successInfo}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); }}
                    className="w-full py-2 px-4 rounded-m3-full bg-neutral-800 text-white text-xs font-medium hover:bg-neutral-900 transition-all"
                  >
                    Return to Login
                  </button>
                </div>
              )}

              {/* Mode: FORGOT */}
              {mode === 'FORGOT' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Enter Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="advocate@lexfirm.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-m3-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-material-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-m3-full bg-material-primary hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Password Reset Instructions'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('LOGIN'); setErrorMessage(''); }}
                      className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                      Remembered password? Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Mode: FORGOT_SUCCESS */}
              {mode === 'FORGOT_SUCCESS' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">Check Your Inbox</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {successInfo}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); }}
                    className="w-full py-2 px-4 rounded-m3-full bg-material-primary text-white text-xs font-medium hover:bg-blue-700 transition-all"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
