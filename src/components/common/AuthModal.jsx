import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, Phone, ShieldCheck, CheckCircle2, ArrowRight, Award, KeyRound } from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    loginWithGoogle, 
    registerNewUser, 
    sendPasswordReset,
    currentUser,
    systemConfig
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-obsidian/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-4xl border border-white/90 shadow-[0_25px_60px_-15px_rgba(160,140,120,0.35)] overflow-hidden">
        
        {/* Top Minimal Bar (Pinterest Style: Brand name on left, Sign up toggle on right) */}
        <div className="px-7 pt-7 pb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-warm-graphite tracking-tight font-display">
            {systemConfig.firmBranding?.firmName || 'JurisFlow Practice'}
          </span>

          <div className="flex items-center gap-2">
            {!isPendingApproval && (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                  setErrorMessage('');
                }}
                className="font-medium text-warm-obsidian hover:text-terracotta transition-colors underline decoration-warm-sand decoration-2 underline-offset-4"
              >
                {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="w-7 h-7 rounded-full bg-warm-sand/60 hover:bg-warm-sand flex items-center justify-center text-warm-graphite transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-7 pt-4">
          
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {isPendingApproval ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full sun-gradient-circle text-white flex items-center justify-center mx-auto shadow-amber-glow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-warm-obsidian font-display">Practice Approval Pending</h3>
              <p className="text-xs text-warm-graphite leading-relaxed">
                Hello <strong>{currentUser.name}</strong>. Your account is submitted and awaiting confirmation by the Software Admin.
              </p>
              <div className="p-3.5 bg-white/70 rounded-2xl text-left text-xs text-warm-muted border border-warm-borderSubtle space-y-1">
                <p className="font-semibold text-warm-obsidian">Enrolment Record:</p>
                <p>• Requested Role: <strong>{currentUser.role}</strong></p>
                {currentUser.barCouncilNo && <p>• Bar Council No: <strong>{currentUser.barCouncilNo}</strong></p>}
                <p>• Google Drive directory permissions will be provisioned upon approval.</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="capsule-btn-dark text-xs mx-auto"
              >
                <span>Refresh Status</span>
                <div className="knob"><ArrowRight className="w-3 h-3 text-white" /></div>
              </button>
            </div>
          ) : (
            <>
              {/* MODE: LOGIN (Pinterest exact reproduction) */}
              {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  
                  {/* Title & Google Workspace Pill */}
                  <div className="flex items-center justify-between pt-1 pb-2">
                    <h2 className="text-2xl font-bold text-warm-obsidian font-display tracking-tight">
                      Log in
                    </h2>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white/80 hover:bg-white text-warm-obsidian border border-warm-borderSubtle text-[11px] font-semibold transition-all shadow-xs"
                      title="Quick Google Workspace Auth"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Google
                    </button>
                  </div>

                  {/* Pinterest Capsule Input: Email */}
                  <div className="relative flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/15 transition-all shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite font-bold text-xs flex items-center justify-center shrink-0">
                      @
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e-mail address"
                      className="w-full pl-3 pr-2 py-1 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                  </div>

                  {/* Pinterest Capsule Input: Password + "I forgot" button inside! */}
                  <div className="relative flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white focus-within:ring-2 focus-within:ring-terracotta/15 transition-all shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite flex items-center justify-center shrink-0">
                      <KeyRound className="w-3.5 h-3.5 text-warm-graphite" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password"
                      className="w-full pl-3 pr-2 py-1 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                    <button
                      type="button"
                      onClick={() => { setMode('FORGOT'); setErrorMessage(''); }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white text-warm-graphite hover:text-warm-obsidian rounded-pill border border-warm-borderSubtle shrink-0 shadow-2xs hover:bg-warm-sand/40 transition-colors"
                    >
                      I forgot
                    </button>
                  </div>

                  {/* Submission Row: Fine print on left, Capsule button on right */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-warm-muted leading-tight max-w-[210px]">
                      Authorized legal counsel access only. System activity monitored for compliance.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="capsule-btn-dark text-xs disabled:opacity-50 shrink-0"
                    >
                      <span>{isSubmitting ? 'Verifying' : 'Enter'}</span>
                      <div className="knob">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  </div>

                  {/* Footer tagline */}
                  <div className="text-center pt-3 border-t border-warm-borderSubtle/60">
                    <p className="text-[11px] text-warm-muted font-medium">
                      High Court at Calcutta & Supreme Court Litigation Suite
                    </p>
                  </div>
                </form>
              )}

              {/* MODE: REGISTER (Matching aesthetic) */}
              {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="pt-1 pb-1">
                    <h2 className="text-2xl font-bold text-warm-obsidian font-display tracking-tight">
                      Practice Access
                    </h2>
                    <p className="text-xs text-warm-muted mt-0.5">
                      New advocates & clerks require Software Admin verification
                    </p>
                  </div>

                  <div className="flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="full legal name"
                      className="w-full pl-3 pr-2 py-1 text-xs bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                  </div>

                  <div className="flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite flex items-center justify-center shrink-0">
                      @
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="official email"
                      className="w-full pl-3 pr-2 py-1 text-xs bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                  </div>

                  <div className="flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite flex items-center justify-center shrink-0">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password (min. 6 chars)"
                      className="w-full pl-3 pr-2 py-1 text-xs bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="phone / whatsapp"
                      className="w-full px-3 py-2 text-xs bg-white/80 rounded-pill border border-warm-borderSubtle focus:outline-none focus:border-terracotta placeholder:text-warm-muted"
                    />
                    <input
                      type="text"
                      value={barCouncilNo}
                      onChange={(e) => setBarCouncilNo(e.target.value)}
                      placeholder="Bar No. (WB/...)"
                      className="w-full px-3 py-2 text-xs bg-white/80 rounded-pill border border-warm-borderSubtle focus:outline-none focus:border-terracotta placeholder:text-warm-muted font-mono"
                    />
                  </div>

                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/80 rounded-pill border border-warm-borderSubtle focus:outline-none focus:border-terracotta text-warm-graphite"
                  >
                    <option value="STAFF">Staff Console (Associate / Clerk)</option>
                    <option value="MANAGER_ADMIN">Manager Admin (Partner)</option>
                  </select>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-xs text-warm-muted hover:text-warm-obsidian"
                    >
                      ← Back to log in
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="capsule-btn-dark text-xs disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Submitting' : 'Request Access'}</span>
                      <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                    </button>
                  </div>
                </form>
              )}

              {/* MODE: FORGOT */}
              {mode === 'FORGOT' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="pt-1 pb-1">
                    <h2 className="text-2xl font-bold text-warm-obsidian font-display tracking-tight">
                      Reset Password
                    </h2>
                    <p className="text-xs text-warm-muted mt-0.5">
                      Enter your registered email to receive recovery instructions
                    </p>
                  </div>

                  <div className="flex items-center bg-white/80 rounded-pill border border-warm-borderSubtle px-3 py-1.5 focus-within:border-terracotta focus-within:bg-white shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-warm-sand/50 text-warm-graphite flex items-center justify-center shrink-0">
                      @
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="registered email"
                      className="w-full pl-3 pr-2 py-1 text-xs bg-transparent border-none focus:outline-none text-warm-obsidian placeholder:text-warm-muted"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className="text-xs text-warm-muted hover:text-warm-obsidian"
                    >
                      ← Back to log in
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="capsule-btn-dark text-xs disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Sending' : 'Send Link'}</span>
                      <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                    </button>
                  </div>
                </form>
              )}

              {/* MODE: PENDING_NOTICE & FORGOT_SUCCESS */}
              {(mode === 'PENDING_NOTICE' || mode === 'FORGOT_SUCCESS') && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full sun-gradient-circle text-white flex items-center justify-center mx-auto shadow-amber-glow">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-warm-obsidian font-display">
                    {mode === 'PENDING_NOTICE' ? 'Application Registered' : 'Instructions Sent'}
                  </h3>
                  <p className="text-xs text-warm-graphite leading-relaxed">
                    {successInfo}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="capsule-btn-dark text-xs mx-auto"
                  >
                    <span>Return to Log In</span>
                    <div className="knob"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
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
