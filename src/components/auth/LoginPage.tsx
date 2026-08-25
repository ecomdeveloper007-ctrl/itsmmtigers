import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Trophy,
  Lock,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
  Flame,
  CheckCircle2,
  UserPlus,
  LogIn,
  Check,
  Target,
  BarChart3,
  Award,
  Crown,
  Eye,
  EyeOff,
  Building,
  Mail,
  Send,
  Star,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regUserId, setRegUserId] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regDepartment, setRegDepartment] = useState<string>('IT Team');
  const [regAvatar, setRegAvatar] = useState<string>(AVATAR_OPTIONS[0]);
  const [regNotes, setRegNotes] = useState<string>('');

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your User ID or Email address.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await login(loginIdentifier.trim(), loginPassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim() || !regUserId.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password should be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      name: regName.trim(),
      userId: regUserId.trim(),
      email: regEmail.trim(),
      password: regPassword,
      department: regDepartment,
      avatarUrl: regAvatar,
      notes: regNotes.trim(),
    });
    setIsLoading(false);

    if (res.success) {
      setRegistrationSuccess(true);
    } else {
      setErrorMessage(res.message || 'Registration failed. Please try again.');
    }
  };

  const scrollToAuth = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setRegistrationSuccess(false);
    const elem = document.getElementById('auth-portal-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Ambient Lights */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-10 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* 1. Top Public Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 p-0.5 shadow-lg shadow-orange-500/25 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🐅</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 uppercase">
                    IT SMM TIGERS
                  </span>
                  <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                    R&R Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Rewards & Recognition Platform
                </p>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
              <a href="#spotlight-section" className="hover:text-orange-400 transition-colors">
                Top Tigers
              </a>
              <a href="#kpi-framework-section" className="hover:text-orange-400 transition-colors">
                KPI Weights
              </a>
              <a href="#pipeline-section" className="hover:text-orange-400 transition-colors">
                Approval Workflow
              </a>
            </nav>

            {/* Public Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => scrollToAuth('signin')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => scrollToAuth('register')}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Public Content Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
        {/* 2. Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold shadow-inner animate-pulse">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Weekly Performance Tracking & Rewards Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            Elevate. Compete.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              Celebrate Champions.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Welcome to the official recognition platform for <strong>IT SMM Tigers</strong>. Track weekly KPI achievements, weighted percentages, automated rankings, and crown the weekly MVP champions.
          </p>

          {/* Access Policy Notice Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30 text-left max-w-2xl mx-auto shadow-xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-2">
                Verified Team Access Portal
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold border border-amber-500/40">
                  Secure Access
                </span>
              </p>
              <p className="text-slate-300 leading-normal">
                Authorized members can sign in with their assigned corporate credentials. New team members must <strong>Register</strong> first. Upon account approval, you can log in and submit your weekly metrics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => scrollToAuth('signin')}
              className="px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-xl shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Your Account
            </button>

            <button
              onClick={() => scrollToAuth('register')}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              Register as New Member
            </button>
          </div>
        </section>

        {/* 3. Interactive Sign In & Register Portal Section */}
        <section id="auth-portal-section" className="max-w-xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Ambient Corner Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Tab Switches: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800/90 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setRegistrationSuccess(false);
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                  setRegistrationSuccess(false);
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register Member
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Registration Success Banner */}
            {registrationSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Registration Request Submitted!
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your application has been received with status <strong>Pending Approval</strong>. Administration will review and approve your profile. Once approved, you can log in directly using your chosen credentials.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setAuthMode('signin');
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg font-bold text-xs hover:bg-emerald-400 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            )}

            {/* --- TAB A: SIGN IN FORM --- */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      User ID / Email Address *
                    </label>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your User ID or Email address"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* --- TAB B: REGISTER FORM --- */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    New registrations are submitted for administrative approval before access is enabled.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (!regUserId) {
                        setRegUserId(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Desired User ID (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.verma"
                      value={regUserId}
                      onChange={(e) => setRegUserId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@itsmmtigers.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Department / Team *
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    >
                      <option value="IT Team">💻 IT Team</option>
                      <option value="SMM Team">📱 SMM Team</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Select Avatar
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {AVATAR_OPTIONS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegAvatar(url)}
                          className={`relative rounded-xl overflow-hidden shrink-0 ring-2 transition-all ${
                            regAvatar === url ? 'ring-orange-500 scale-105' : 'ring-slate-800 opacity-60'
                          }`}
                        >
                          <img src={url} alt={`avatar-${idx}`} className="w-8 h-8 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Introduction / Note to Administration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SMM Executive joining Team Alpha"
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Submitting Application...' : 'Submit Registration for Approval'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 4. Live Leaderboard Spotlight (Public Structure) */}
        <section id="spotlight-section" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Live Season Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Top Tiger Champions Spotlight
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Real-time weighted score leaderboard preview for August 2026
            </p>
          </div>

          {/* Podium Cards Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* 2nd Place */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col items-center text-center relative md:order-1 order-2 space-y-3">
              <span className="absolute top-4 right-4 text-2xl font-black text-slate-600">#2</span>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                  alt="Mohita Sharma"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-400 shadow-lg"
                />
                <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-300 text-slate-950">
                  🥈 2nd
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mohita Sharma</h3>
                <p className="text-xs text-slate-400">SMM Growth Squad</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-mono text-sm font-bold">
                60.97 pts
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">Tier 1: High Performer</span>
            </div>

            {/* 1st Place Champion */}
            <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-900 p-6 sm:p-8 flex flex-col items-center text-center relative md:order-2 order-1 space-y-4 shadow-2xl shadow-amber-500/20 transform md:-translate-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> 🏆 Current #1 Champion
              </span>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                  alt="Divya Bhardwaj"
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-amber-400 shadow-2xl"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Divya Bhardwaj</h3>
                <p className="text-xs text-orange-300 font-semibold">SMM Enterprise Division</p>
              </div>
              <div className="px-4 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-base font-black">
                68.02 pts
              </div>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 8 Consecutive Strong Weeks
              </span>
            </div>

            {/* 3rd Place */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 flex flex-col items-center text-center relative md:order-3 order-3 space-y-3">
              <span className="absolute top-4 right-4 text-2xl font-black text-slate-600">#3</span>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Naveen Jakhar"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-700 shadow-lg"
                />
                <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-700 text-white">
                  🥉 3rd
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Naveen Jakhar</h3>
                <p className="text-xs text-slate-400">SMM Accounts Squad</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-slate-800 text-slate-200 font-mono text-sm font-bold">
                45.40 pts
              </div>
              <span className="text-[11px] text-blue-400 font-semibold">Tier 2: Solid Contender</span>
            </div>
          </div>
        </section>

        {/* 5. KPI Weighted Scoring Framework (Public Structure) */}
        <section id="kpi-framework-section" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Standardized Blueprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
              The 6 Core Performance Pillars (100% Total)
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Automated weighted calculations ensure 100% fair and transparent recognition
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Revenue Generated</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  30% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Total client revenue generated during the weekly evaluation cycle.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: $10,000</div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Projects Closed</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  20% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Number of successfully contracted deliverables and campaigns.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: 25 Projects</div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Upsells & Add-ons</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  15% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Additional retained services, add-on deliverables, and expansions.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: 10 Upsells</div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Repeat Clients</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  15% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Retention and renewal accounts returning for continuous SMM campaigns.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: 10 Clients</div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Follow-up Completed</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  10% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Timely communication, account reviews, and client check-ins logged.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: 50 Follow-ups</div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Client CSAT Rating</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  10% Weight
                </span>
              </div>
              <p className="text-xs text-slate-400">Direct feedback rating received from active client campaign reviews.</p>
              <div className="text-[11px] font-mono text-slate-500 pt-1">Monthly Benchmark: 5.0 / 5.0 ★</div>
            </div>
          </div>
        </section>

        {/* 6. Four-Step Operational Pipeline (Public Structure) */}
        <section id="pipeline-section" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
              The Tiger Recognition Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto font-black text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Register Account</h4>
              <p className="text-xs text-slate-400">
                Create your team profile with your desired credentials and department.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-amber-500/30 bg-slate-900/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto font-black text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Account Approval</h4>
              <p className="text-xs text-slate-400">
                Administration verifies and activates your profile for authenticated access.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-black text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Log Weekly KPIs</h4>
              <p className="text-xs text-slate-400">
                Submit weekly revenue, project deliveries, upsells, and client ratings.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto font-black text-sm">
                4
              </div>
              <h4 className="text-sm font-bold text-white">Win Recognition</h4>
              <p className="text-xs text-slate-400">
                Automated rankings crown weekly podium winners with certificate badges.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Public Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">
            🐅 IT SMM TIGERS – Rewards & Recognition Platform
          </p>
          <p>
            Enterprise Rewards & Recognition System | Verified Team Access
          </p>
          <p className="text-[11px] text-slate-600">
            © 2026 IT SMM Tigers. All rights reserved. Secure Cloud Architecture.
          </p>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                Password Assistance
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Passwords for registered team members are managed by system administrators. If you forgot your password or need a reset, please reach out to your administrator or team lead.
            </p>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
