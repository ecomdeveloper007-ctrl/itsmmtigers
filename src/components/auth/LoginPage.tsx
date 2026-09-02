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
  Camera,
  Upload,
  Image as ImageIcon,
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
  const [regAvatarMode, setRegAvatarMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [regCustomAvatarUrl, setRegCustomAvatarUrl] = useState<string>('');
  const [regNotes, setRegNotes] = useState<string>('');
  const regFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRegAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const res = uploadEvent.target?.result as string;
      if (res) {
        setRegAvatar(res);
      }
    };
    reader.readAsDataURL(file);
  };

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
    <div className="min-h-screen bg-[#f3f8ef] text-[#101010] flex flex-col relative overflow-x-hidden selection:bg-[#8cc540] selection:text-[#101010]">
      {/* Background Subtle Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 right-10 w-[30rem] h-[30rem] bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* 1. Top Public Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2ebd9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <img
                src="https://framerusercontent.com/images/mRMK3iRhUP61hmrTIjXC0oPQ0U.webp?width=451&height=125"
                alt="IT SMM Tigers"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-black border border-[#8cc540]/30 uppercase tracking-wider">
                R&R Portal
              </span>
            </div>

            {/* Quick Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#555555]">
              <a href="#kpi-framework-section" className="hover:text-[#101010] transition-colors">
                KPI Weights
              </a>
              <a href="#pipeline-section" className="hover:text-[#101010] transition-colors">
                Approval Workflow
              </a>
            </nav>

            {/* Public Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => scrollToAuth('signin')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black text-[#101010] hover:text-black bg-[#f5f5f5] hover:bg-[#eaeaea] border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#598327]" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => scrollToAuth('register')}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 transition-all flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f3f8ef] border border-[#8cc540]/40 text-[#3d591d] text-xs font-black shadow-xs">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Weekly Performance Tracking & Rewards Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#101010] leading-tight">
            Elevate. Compete.{' '}
            <span className="text-[#598327] underline decoration-[#8cc540] decoration-wavy decoration-2">
              Celebrate Champions.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#555555] leading-relaxed font-medium">
            Welcome to the official recognition platform for <strong>IT SMM Tigers</strong>. Track weekly KPI achievements, weighted percentages, automated rankings, and crown the weekly MVP champions.
          </p>

          {/* Access Policy Notice Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] text-left max-w-2xl mx-auto shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#f3f8ef] text-[#598327] shrink-0 mt-0.5 border border-[#8cc540]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#101010] flex items-center gap-2">
                Verified Team Access Portal
                <span className="px-2 py-0.5 rounded-full bg-[#8cc540]/20 text-[#436320] text-[10px] font-black border border-[#8cc540]/40">
                  Secure Access
                </span>
              </p>
              <p className="text-[#666666] leading-normal font-medium">
                Authorized members can sign in with their assigned corporate credentials. New team members must <strong>Register</strong> first. Upon account approval, you can log in and submit your weekly metrics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => scrollToAuth('signin')}
              className="px-6 py-3 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-lg shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Your Account
            </button>

            <button
              onClick={() => scrollToAuth('register')}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white hover:bg-[#f5f5f5] text-[#101010] border border-[#e2ebd9] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#598327]" />
              Register as New Member
            </button>
          </div>
        </section>

        {/* 3. Interactive Sign In & Register Portal Section */}
        <section id="auth-portal-section" className="max-w-xl mx-auto scroll-mt-24">
          <div className="rounded-3xl border border-[#e2ebd9] bg-white shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Ambient Corner Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8cc540]/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Tab Switches: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#f5f5f5] border border-[#e2ebd9] text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setRegistrationSuccess(false);
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                    : 'text-[#666666] hover:text-[#101010]'
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
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                    : 'text-[#666666] hover:text-[#101010]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register Member
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Registration Success Banner */}
            {registrationSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Registration Request Submitted!
                </div>
                <p className="text-emerald-700 leading-relaxed font-medium">
                  Your application has been received with status <strong>Pending Approval</strong>. Administration will review and approve your profile. Once approved, you can log in directly using your chosen credentials.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(false);
                    setAuthMode('signin');
                  }}
                  className="px-3 py-1.5 bg-[#8cc540] text-[#101010] rounded-lg font-black text-xs hover:bg-[#7db734] cursor-pointer"
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
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider">
                      User ID / Email Address *
                    </label>
                  </div>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your User ID or Email address"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] text-[#598327] hover:underline font-bold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#101010] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center justify-center gap-2 shadow-lg shadow-[#8cc540]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* --- TAB B: REGISTER FORM --- */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 text-xs text-[#3d591d] font-medium flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#598327]" />
                  <span>
                    New registrations are submitted for administrative approval before access is enabled.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
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
                    className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                      Desired User ID (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.verma"
                      value={regUserId}
                      onChange={(e) => setRegUserId(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@itsmmtigers.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                      Department / Primary Module *
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                    >
                      <option value="IT Team">💻 IT Team (PM Solutions & Eng)</option>
                      <option value="SMM Team">📱 SMM Team (PM Retainers & Growth)</option>
                      <option value="IT Sales">💼 IT Sales (PR / WR / HW Solutions)</option>
                      <option value="SMM Sales">📈 SMM Sales (DR / RR Growth & Retainers)</option>
                      <option value="Dual Operations">⚡ Both (PM & Sales Operations)</option>
                      <option value="Operations">⚙️ Operations & Support</option>
                      <option value="Leadership & Ops">👑 Leadership & Executive</option>
                    </select>
                    <p className="text-[10px] text-[#777777] mt-1 font-medium">
                      Admin will review & assign your module (PM, Sales, or Both) upon approval.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black text-[#101010] uppercase tracking-wider">
                        Profile Picture
                      </label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setRegAvatarMode('presets')}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            regAvatarMode === 'presets'
                              ? 'bg-[#8cc540] text-[#101010]'
                              : 'text-[#666666] hover:text-[#101010] bg-[#f5f5f5]'
                          }`}
                        >
                          Presets
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegAvatarMode('upload')}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            regAvatarMode === 'upload'
                              ? 'bg-[#8cc540] text-[#101010]'
                              : 'text-[#666666] hover:text-[#101010] bg-[#f5f5f5]'
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegAvatarMode('url')}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            regAvatarMode === 'url'
                              ? 'bg-[#8cc540] text-[#101010]'
                              : 'text-[#666666] hover:text-[#101010] bg-[#f5f5f5]'
                          }`}
                        >
                          URL
                        </button>
                      </div>
                    </div>

                    {/* Presets mode */}
                    {regAvatarMode === 'presets' && (
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {AVATAR_OPTIONS.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRegAvatar(url)}
                            className={`relative rounded-xl overflow-hidden shrink-0 ring-2 transition-all cursor-pointer ${
                              regAvatar === url ? 'ring-[#8cc540] scale-105 shadow-md' : 'ring-[#e2ebd9] opacity-70'
                            }`}
                          >
                            <img src={url} alt={`avatar-${idx}`} className="w-8 h-8 object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Upload File mode */}
                    {regAvatarMode === 'upload' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={regFileInputRef}
                          onChange={handleRegAvatarUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => regFileInputRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9] hover:border-[#8cc540] text-[#555555] hover:text-[#101010] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#598327]" />
                          <span>Choose image file...</span>
                        </button>
                        {regAvatar && (
                          <img
                            src={regAvatar}
                            alt="preview"
                            className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#8cc540] shrink-0"
                          />
                        )}
                      </div>
                    )}

                    {/* Custom URL mode */}
                    {regAvatarMode === 'url' && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          placeholder="Paste image URL (https://...)"
                          value={regCustomAvatarUrl}
                          onChange={(e) => setRegCustomAvatarUrl(e.target.value)}
                          className="flex-1 bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-2.5 py-1.5 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (regCustomAvatarUrl.trim()) {
                              setRegAvatar(regCustomAvatarUrl.trim());
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#8cc540] text-[#101010] text-xs font-black hover:bg-[#7db734] cursor-pointer shrink-0"
                        >
                          Set
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                    Introduction / Note to Administration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SMM Executive joining Team Alpha"
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl px-3.5 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center justify-center gap-2 shadow-lg shadow-[#8cc540]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isLoading ? 'Submitting Application...' : 'Submit Registration for Approval'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 4. KPI Weighted Scoring Framework (Public Structure) */}
        <section id="kpi-framework-section" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#598327] uppercase tracking-widest">
              Standardized Blueprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101010] uppercase">
              The 6 Core Performance Pillars (100% Total)
            </h2>
            <p className="text-xs text-[#666666] max-w-lg mx-auto font-medium">
              Automated weighted calculations ensure 100% fair and transparent recognition
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Revenue Generated</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/30">
                  30% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Total client revenue generated during the weekly evaluation cycle.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: $10,000</div>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Projects Closed</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  20% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Number of successfully contracted deliverables and campaigns.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: 25 Projects</div>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Upsells & Add-ons</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                  15% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Additional retained services, add-on deliverables, and expansions.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: 10 Upsells</div>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Repeat Clients</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                  15% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Retention and renewal accounts returning for continuous SMM campaigns.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: 10 Clients</div>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Follow-up Completed</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200">
                  10% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Timely communication, account reviews, and client check-ins logged.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: 50 Follow-ups</div>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#101010]">Client CSAT Rating</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                  10% Weight
                </span>
              </div>
              <p className="text-xs text-[#666666] font-medium">Direct feedback rating received from active client campaign reviews.</p>
              <div className="text-[11px] font-mono text-[#888888] pt-1">Monthly Benchmark: 5.0 / 5.0 ★</div>
            </div>
          </div>
        </section>

        {/* 6. Four-Step Operational Pipeline (Public Structure) */}
        <section id="pipeline-section" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#598327] uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101010] uppercase">
              The Tiger Recognition Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 text-center shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center mx-auto font-black text-sm">
                1
              </div>
              <h4 className="text-sm font-black text-[#101010]">Register Account</h4>
              <p className="text-xs text-[#666666] font-medium">
                Create your team profile with your desired credentials and department.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-[#8cc540]/40 bg-white space-y-2 text-center shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#8cc540] text-[#101010] flex items-center justify-center mx-auto font-black text-sm">
                2
              </div>
              <h4 className="text-sm font-black text-[#101010]">Account Approval</h4>
              <p className="text-xs text-[#666666] font-medium">
                Administration verifies and activates your profile for authenticated access.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 text-center shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center mx-auto font-black text-sm">
                3
              </div>
              <h4 className="text-sm font-black text-[#101010]">Log Weekly KPIs</h4>
              <p className="text-xs text-[#666666] font-medium">
                Submit weekly revenue, project deliveries, upsells, and client ratings.
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-[#e2ebd9] bg-white space-y-2 text-center shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center mx-auto font-black text-sm">
                4
              </div>
              <h4 className="text-sm font-black text-[#101010]">Win Recognition</h4>
              <p className="text-xs text-[#666666] font-medium">
                Automated rankings crown weekly podium winners with certificate badges.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Public Footer */}
      <footer className="border-t border-[#e2ebd9] bg-white py-8 text-center text-xs text-[#666666] mt-16">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-black text-[#101010]">
            🐅 IT SMM TIGERS – Rewards & Recognition Platform
          </p>
          <p className="font-medium">
            Enterprise Rewards & Recognition System | Verified Team Access
          </p>
          <p className="text-[11px] text-[#888888]">
            © 2026 IT SMM Tigers. All rights reserved. Secure Cloud Architecture.
          </p>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101010]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
              <h3 className="text-sm font-black text-[#101010] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#598327]" />
                Password Assistance
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-[#888888] hover:text-[#101010]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed font-medium">
              Passwords for registered team members are managed by system administrators. If you forgot your password or need a reset, please reach out to your administrator or team lead.
            </p>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-[#101010] text-white hover:bg-[#252525] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
