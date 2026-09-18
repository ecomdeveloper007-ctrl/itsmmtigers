import React, { useState, useRef } from 'react';
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
  Briefcase,
  Users,
  TrendingUp,
  Layers,
  Zap,
  Menu,
  FileText,
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
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const loginInputRef = useRef<HTMLInputElement>(null);

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
  const regFileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle Sign In using existing auth logic
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

  // Handle Registration using existing auth logic
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

  const scrollToLogin = (mode: 'signin' | 'register' = 'signin') => {
    setAuthMode(mode);
    setErrorMessage(null);
    setRegistrationSuccess(false);
    setMobileMenuOpen(false);
    const elem = document.getElementById('login-card-container');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        loginInputRef.current?.focus();
      }, 500);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f8ef] text-[#101010] flex flex-col relative overflow-x-hidden selection:bg-[#8cc540] selection:text-[#101010] font-sans">
      {/* Subtle Ambient Background Glows using the previously used #8cc540 palette */}
      <div className="fixed top-0 left-1/3 w-[36rem] h-[36rem] bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 right-10 w-[30rem] h-[30rem] bg-[#8cc540]/8 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-10 w-[28rem] h-[28rem] bg-[#101010]/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* =========================================================================
          1. HEADER / NAVIGATION (Prompt Requirement #2 with original branding)
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e4ece0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo using official assets */}
            <div 
              onClick={() => scrollToSection('hero')} 
              className="flex items-center gap-2 cursor-pointer group py-1"
            >
              <img
                src="https://framerusercontent.com/images/mRMK3iRhUP61hmrTIjXC0oPQ0U.webp?width=451&height=125"
                alt="IT SMM Tigers"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="hidden xl:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-black border border-[#8cc540]/30 uppercase tracking-wider">
                Rewards & Recognition
              </span>
            </div>

            {/* Center Navigation Links (Prompt Requirement #2) */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#555555]">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-[#101010] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('platform')}
                className="hover:text-[#101010] transition-colors cursor-pointer"
              >
                Our Platform
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#101010] transition-colors cursor-pointer"
              >
                Features
              </button>
            </nav>

            {/* Right: Prominent Login Button with original green/dark styling */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollToLogin('signin')}
                className="px-5 py-2.5 rounded-xl text-sm font-black bg-[#8cc540] hover:bg-[#74a831] text-[#101010] shadow-md shadow-[#8cc540]/20 transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4 text-[#101010]" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[#101010] hover:bg-[#f3f8ef] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#101010]" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#e4ece0] py-4 px-2 space-y-2 animate-in slide-in-from-top-2 duration-200 bg-white">
              <button
                onClick={() => scrollToSection('hero')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#101010] hover:bg-[#f3f8ef]"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('platform')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#101010] hover:bg-[#f3f8ef]"
              >
                Our Platform
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-[#101010] hover:bg-[#f3f8ef]"
              >
                Features
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        {/* =========================================================================
            2. HERO SECTION & LOGIN CARD (Prompt Requirements #3, #4, #5)
           ========================================================================= */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-6 sm:pb-8 lg:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Headline, Highlights, & Visual Illustration */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Category Pill with previously used brand pill styles */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#8cc540]/40 text-[#436320] text-xs font-black shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#8cc540]" />
                <span>Next-Generation Performance & Recognition Platform</span>
              </div>

              {/* Main Headline (Prompt Requirement #3) */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#101010] tracking-tight leading-[1.15]">
                A Stronger Team<br />
                Builds a Brighter<br />
                <span className="text-[#8cc540]">
                  Tomorrow
                </span>
              </h1>

              {/* Supporting Text (Prompt Requirement #3) */}
              <p className="text-base sm:text-lg text-[#555555] max-w-xl leading-relaxed font-medium">
                Track performance, manage goals, recognize achievements and keep your team moving forward — all in one place.
              </p>

              {/* Three Feature Highlights (Prompt Requirement #3) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center font-black mb-2">
                    <Target className="w-4 h-4 text-[#8cc540]" />
                  </div>
                  <h4 className="text-xs font-black text-[#101010] uppercase tracking-wide">
                    Track Performance
                  </h4>
                  <p className="text-[11px] text-[#666666] font-medium mt-1 leading-snug">
                    Monitor team performance and progress.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#101010] text-[#8cc540] flex items-center justify-center font-black mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-black text-[#101010] uppercase tracking-wide">
                    Manage Teams
                  </h4>
                  <p className="text-[11px] text-[#666666] font-medium mt-1 leading-snug">
                    Keep teams aligned and focused.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#fef3c7] border border-amber-200 text-amber-700 flex items-center justify-center font-black mb-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-black text-[#101010] uppercase tracking-wide">
                    Recognize Achievements
                  </h4>
                  <p className="text-[11px] text-[#666666] font-medium mt-1 leading-snug">
                    Celebrate performance and recognize real talent.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Prominent Login Card (Prompt Requirement #5) */}
            <div id="login-card-container" className="lg:col-span-5 scroll-mt-24 w-full lg:pt-4">
              <div className="bg-white rounded-3xl border border-[#e4ece0] shadow-xl shadow-[#8cc540]/10 p-6 sm:p-8 space-y-6 relative overflow-hidden">
                {/* Card Title & Subtitle (Prompt Requirement #5) */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 text-[11px] font-black">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8cc540]" />
                      <span>Secure Member Portal</span>
                    </div>
                    {authMode === 'register' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setErrorMessage(null);
                        }}
                        className="text-xs font-bold text-[#436320] hover:text-[#101010] cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-[#101010] tracking-tight mt-3">
                    {authMode === 'signin' ? 'Welcome Back' : 'Create Team Account'}
                  </h2>
                  <p className="text-xs text-[#666666] font-medium mt-1">
                    {authMode === 'signin'
                      ? 'Login to your account to continue'
                      : 'Submit your profile for administrative activation'}
                  </p>
                </div>

                {/* Error Alert Message */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                {/* Registration Success Banner */}
                {registrationSuccess && (
                  <div className="p-4 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 text-[#101010] text-xs space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm text-[#436320]">
                      <CheckCircle2 className="w-5 h-5 text-[#8cc540]" />
                      Registration Request Submitted!
                    </div>
                    <p className="text-[#555555] leading-relaxed font-medium">
                      Your account has been registered with status <strong>Pending Approval</strong>. System administrators will verify and activate your permissions. Once approved, you can log in right here.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setAuthMode('signin');
                      }}
                      className="px-3.5 py-1.5 bg-[#8cc540] text-[#101010] rounded-xl font-black text-xs hover:bg-[#74a831] cursor-pointer transition-colors"
                    >
                      Return to Login
                    </button>
                  </div>
                )}

                {/* --- MODE A: SIGN IN FORM (Prompt Requirement #5) --- */}
                {authMode === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Identifier Field */}
                    <div>
                      <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1.5">
                        User ID or Email *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          ref={loginInputRef}
                          type="text"
                          required
                          placeholder="e.g. rahul.verma or name@company.com"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full bg-[#f8faf6] hover:bg-[#f3f8ef] focus:bg-white border border-[#e4ece0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 focus:border-[#8cc540] transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-black text-[#101010] uppercase tracking-wider">
                          Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-[11px] text-[#436320] hover:text-[#101010] font-bold hover:underline cursor-pointer"
                        >
                          Forgot password?
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
                          className="w-full bg-[#f8faf6] hover:bg-[#f3f8ef] focus:bg-white border border-[#e4ece0] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 focus:border-[#8cc540] transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#101010] cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Option */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        id="remember-me-checkbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-[#8cc540] border-[#e4ece0] rounded cursor-pointer"
                      />
                      <label htmlFor="remember-me-checkbox" className="text-xs text-[#555555] font-medium cursor-pointer">
                        Remember me on this browser
                      </label>
                    </div>

                    {/* Login Submit Button with previously used #8cc540 primary style */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl text-sm font-black bg-[#8cc540] hover:bg-[#74a831] text-[#101010] flex items-center justify-center gap-2 shadow-lg shadow-[#8cc540]/25 transition-all cursor-pointer disabled:opacity-50 transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>{isLoading ? 'Verifying Credentials...' : 'Login'}</span>
                      <ArrowRight className="w-4 h-4 text-[#101010]" />
                    </button>

                    {/* Footer Contact Statement (Prompt Requirement #5) */}
                    <div className="pt-2 text-center text-xs text-[#666666] space-y-2 border-t border-[#e4ece0]">
                      <p className="font-medium">
                        New to the platform? <span className="font-bold text-[#101010]">Contact your admin</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMessage(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#436320] hover:text-[#101010] cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#8cc540]" />
                        <span>Or Register as a New Team Member</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* --- MODE B: REGISTRATION FORM (Preserving Existing Application Functionality) --- */}
                {authMode === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/30 text-xs text-[#436320] font-medium flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#8cc540]" />
                      <span>
                        Registrations are verified by administration prior to granting module and workspace access.
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
                        className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3.5 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                          Desired Username *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. rahul.verma"
                          value={regUserId}
                          onChange={(e) => setRegUserId(e.target.value)}
                          className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3 py-2 text-xs text-[#101010] font-mono focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul@company.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="At least 6 chars"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
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
                          className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#101010] uppercase tracking-wider mb-1">
                        Department / Primary Division *
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full bg-[#f8faf6] focus:bg-white border border-[#e4ece0] rounded-xl px-3 py-2 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium cursor-pointer"
                      >
                        <option value="IT Team">💻 IT Team (PM Solutions & Engineering)</option>
                        <option value="SMM Team">📱 SMM Team (PM Retainers & Growth)</option>
                        <option value="IT Sales">💼 IT Sales (PR / WR Solutions)</option>
                        <option value="SMM Sales">📈 SMM Sales (DR / RR Retainers)</option>
                        <option value="Dual Operations">⚡ Both (PM & Sales Operations)</option>
                        <option value="Operations">⚙️ Operations & Support</option>
                      </select>
                    </div>

                    {/* Avatar Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-black text-[#101010] uppercase tracking-wider">
                          Avatar Profile Photo
                        </label>
                        <div className="flex gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setRegAvatarMode('presets')}
                            className={`px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                              regAvatarMode === 'presets'
                                ? 'bg-[#101010] text-[#8cc540]'
                                : 'text-[#555555] bg-[#f0f4ec] hover:bg-[#e4ece0]'
                            }`}
                          >
                            Presets
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegAvatarMode('upload')}
                            className={`px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                              regAvatarMode === 'upload'
                                ? 'bg-[#101010] text-[#8cc540]'
                                : 'text-[#555555] bg-[#f0f4ec] hover:bg-[#e4ece0]'
                            }`}
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegAvatarMode('url')}
                            className={`px-2 py-0.5 rounded-md font-black transition-all cursor-pointer ${
                              regAvatarMode === 'url'
                                ? 'bg-[#101010] text-[#8cc540]'
                                : 'text-[#555555] bg-[#f0f4ec] hover:bg-[#e4ece0]'
                            }`}
                          >
                            URL
                          </button>
                        </div>
                      </div>

                      {regAvatarMode === 'presets' && (
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                          {AVATAR_OPTIONS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRegAvatar(url)}
                              className={`relative rounded-xl overflow-hidden shrink-0 ring-2 transition-all cursor-pointer ${
                                regAvatar === url ? 'ring-[#8cc540] scale-105 shadow-md' : 'ring-[#e4ece0] opacity-70'
                              }`}
                            >
                              <img src={url} alt={`avatar-${idx}`} className="w-7 h-7 object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

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
                            className="flex-1 py-1.5 px-3 rounded-xl bg-[#f0f4ec] hover:bg-[#e4ece0] text-[#101010] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#8cc540]" />
                            <span>Choose image file...</span>
                          </button>
                          {regAvatar && (
                            <img
                              src={regAvatar}
                              alt="preview"
                              className="w-7 h-7 rounded-xl object-cover ring-2 ring-[#8cc540] shrink-0"
                            />
                          )}
                        </div>
                      )}

                      {regAvatarMode === 'url' && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            placeholder="Paste image URL (https://...)"
                            value={regCustomAvatarUrl}
                            onChange={(e) => setRegCustomAvatarUrl(e.target.value)}
                            className="flex-1 bg-[#f8faf6] border border-[#e4ece0] rounded-xl px-2.5 py-1 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (regCustomAvatarUrl.trim()) {
                                setRegAvatar(regCustomAvatarUrl.trim());
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl bg-[#101010] text-[#8cc540] text-xs font-black hover:bg-[#242424] cursor-pointer shrink-0"
                          >
                            Set
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#74a831] text-[#101010] flex items-center justify-center gap-2 shadow-md shadow-[#8cc540]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Submitting Registration...' : 'Submit Profile for Approval'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. PLATFORM VALUE SECTION (Prompt Requirement #7)
           ========================================================================= */}
        <section id="platform" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black text-[#436320] uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-[#8cc540]/30 shadow-xs">
              Core Purpose & Operating Cycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight">
              Everything Your Team Needs to Perform Better
            </h2>
            <p className="text-sm sm:text-base text-[#555555] font-medium">
              A unified operating rhythm engineered to turn individual dedication into measurable business milestones, collaborative momentum, and deserved recognition.
            </p>
          </div>

          {/* Visual Flow: Set Goals → Track Performance → Recognize Achievement → Grow Together */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-[#e4ece0] shadow-sm hover:shadow-md hover:border-[#8cc540] transition-all space-y-3 relative group">
              <div className="w-12 h-12 rounded-2xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-[#8cc540]" />
              </div>
              <div className="text-xs font-black text-[#436320] tracking-widest uppercase">
                Step 01
              </div>
              <h3 className="text-lg font-black text-[#101010]">
                Set Goals
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                Establish clear benchmarks, KPI weights, and monthly performance targets transparently across all teams.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-[#e4ece0] shadow-sm hover:shadow-md hover:border-[#8cc540] transition-all space-y-3 relative group">
              <div className="w-12 h-12 rounded-2xl bg-[#101010] text-[#8cc540] flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-[#101010] tracking-widest uppercase">
                Step 02
              </div>
              <h3 className="text-lg font-black text-[#101010]">
                Track Performance
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                Capture real-time deliverable closures, project milestones, sales logs, and team progress smoothly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-[#e4ece0] shadow-sm hover:shadow-md hover:border-[#8cc540] transition-all space-y-3 relative group">
              <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border border-amber-200 text-amber-600 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-xs font-black text-amber-600 tracking-widest uppercase">
                Step 03
              </div>
              <h3 className="text-lg font-black text-[#101010]">
                Recognize Achievement
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                Celebrate champions through automated podium rankings, badges, reward tiers, and transparent honors.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-[#e4ece0] shadow-sm hover:shadow-md hover:border-[#8cc540] transition-all space-y-3 relative group">
              <div className="w-12 h-12 rounded-2xl bg-[#f3f8ef] text-[#101010] border border-[#8cc540]/30 flex items-center justify-center font-black text-base group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-[#8cc540]" />
              </div>
              <div className="text-xs font-black text-[#436320] tracking-widest uppercase">
                Step 04
              </div>
              <h3 className="text-lg font-black text-[#101010]">
                Grow Together
              </h3>
              <p className="text-xs text-[#555555] leading-relaxed font-medium">
                Continuous feedback loops and peer recognition cultivate a culture of sustainable achievement and growth.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FEATURE SECTION (Prompt Requirement #6)
           ========================================================================= */}
        <section id="features" className="bg-white border-t border-[#e4ece0] py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <span className="text-xs font-black text-[#436320] uppercase tracking-widest bg-[#f3f8ef] px-3 py-1 rounded-full border border-[#8cc540]/30">
                Platform Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight">
                Designed for High-Velocity Modern Teams
              </h2>
              <p className="text-sm sm:text-base text-[#555555] font-medium">
                Explore the six pillars engineered to streamline workflows and energize team dedication.
              </p>
            </div>

            {/* 6 Attractive Feature Cards (Prompt Requirement #6) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Sales Performance */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#e4ece0] text-[#101010] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <TrendingUp className="w-6 h-6 text-[#8cc540]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">Sales Performance</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Track, analyze and grow revenue with data-driven insights. Monitor daily logs, deal tiers, and closing velocity.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-[#436320] flex items-center gap-1">
                  <span>Revenue Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>

              {/* Card 2: Project Management */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#101010] text-[#8cc540] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">Project Management</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Manage projects, track progress and achieve team goals. Coordinate deliverables with complete operational clarity.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-[#101010] flex items-center gap-1">
                  <span>Workflow Alignment</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>

              {/* Card 3: KPI & Targets */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#e4ece0] text-[#101010] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Target className="w-6 h-6 text-[#8cc540]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">KPI & Targets</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Set goals, measure performance and stay on track. Automated scoring matrices translate effort into transparent evaluation.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-[#436320] flex items-center gap-1">
                  <span>Weighted Scoring</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>

              {/* Card 4: Rewards & Recognition */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">Rewards & Recognition</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Celebrate achievements and motivate your team. Crown weekly champions and reward milestone excellence openly.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-amber-600 flex items-center gap-1">
                  <span>Podium Celebrations</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>

              {/* Card 5: Team Collaboration */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#e4ece0] text-[#101010] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Users className="w-6 h-6 text-[#8cc540]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">Team Collaboration</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Work together, stay aligned and build stronger teams. Connect engineering, management, and sales seamlessly.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-[#436320] flex items-center gap-1">
                  <span>Cross-Department Synergy</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>

              {/* Card 6: Reports & Insights */}
              <div className="p-7 rounded-3xl bg-[#f3f8ef]/60 border border-[#e4ece0] shadow-sm hover:shadow-xl hover:border-[#8cc540] hover:-translate-y-1 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#101010] text-[#8cc540] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#101010]">Reports & Insights</h3>
                  <p className="text-xs text-[#555555] font-medium mt-1.5 leading-relaxed">
                    Get detailed reports to make better business decisions. Export performance audit histories and executive summaries.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-black text-[#101010] flex items-center gap-1">
                  <span>Executive Summaries</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8cc540]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. INSPIRATIONAL CTA (Prompt Requirement #10)
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="rounded-3xl bg-[#101010] text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden border border-[#242424] shadow-2xl">
            {/* Ambient Background Accents using brand green #8cc540 */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8cc540]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#8cc540]/40 text-[#8cc540] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Elevate Your Team?</span>
              </span>

              {/* Headline (Prompt Requirement #10) */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Build a Stronger Team.<br />
                <span className="text-[#8cc540]">Create a Brighter Tomorrow.</span>
              </h2>

              {/* Supporting Text (Prompt Requirement #10) */}
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                Bring performance, goals, collaboration and recognition together in one platform.
              </p>

              {/* Button: Login to Your Dashboard → (Prompt Requirement #10) */}
              <div className="pt-4">
                <button
                  onClick={() => scrollToLogin('signin')}
                  className="px-8 py-3.5 rounded-2xl bg-[#8cc540] hover:bg-[#74a831] text-[#101010] text-base font-black shadow-xl shadow-[#8cc540]/25 transition-all inline-flex items-center gap-2.5 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <span>Login to Your Dashboard</span>
                  <ArrowRight className="w-5 h-5 text-[#101010]" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          9. FOOTER (Prompt Requirement #11)
         ========================================================================= */}
      <footer className="bg-[#101010] text-slate-400 border-t border-[#242424] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#242424]">
            {/* Left: Brand info */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://framerusercontent.com/images/mRMK3iRhUP61hmrTIjXC0oPQ0U.webp?width=451&height=125"
                  alt="IT SMM Tigers"
                  className="h-8 w-auto object-contain brightness-0 invert opacity-90"
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
                Unified rewards, recognition, and performance engine for IT SMM Tigers. Engineered to drive measurable outcomes and celebrate champion talent.
              </p>
            </div>

            {/* Middle: Links */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                  Platform
                </h4>
                <ul className="space-y-2 text-xs font-bold">
                  <li>
                    <button
                      onClick={() => scrollToSection('hero')}
                      className="hover:text-[#8cc540] transition-colors cursor-pointer"
                    >
                      About
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('features')}
                      className="hover:text-[#8cc540] transition-colors cursor-pointer"
                    >
                      Features
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3">
                  Support & Legal
                </h4>
                <ul className="space-y-2 text-xs font-bold">
                  <li>
                    <button
                      onClick={() => alert('For privacy inquiries, please contact your workspace administrator.')}
                      className="hover:text-[#8cc540] transition-colors cursor-pointer"
                    >
                      Privacy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => alert('Terms of Service are governed by internal organization policies.')}
                      className="hover:text-[#8cc540] transition-colors cursor-pointer"
                    >
                      Terms
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToLogin('signin')}
                      className="hover:text-[#8cc540] transition-colors cursor-pointer"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Security info */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Security & Isolation
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All platform modules, employee scorecards, audit histories, and sales figures require verified authentication.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#8cc540] font-black pt-1">
                <ShieldCheck className="w-4 h-4 text-[#8cc540]" />
                <span>Protected Enterprise Access</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
            <div>© IT SMM Tigers. All rights reserved.</div>
            <div>Rewards & Recognition Platform</div>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal (Preserving Existing Application Functionality) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e4ece0] max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-[#888888] hover:text-[#101010] p-1 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#8cc540]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#101010]">Resetting Your Credentials</h3>
              <p className="text-xs text-[#555555] font-medium mt-1 leading-relaxed">
                For administrative compliance and team security, password resets are handled by your assigned Super Admin or Workspace Administrator. Please reach out to management with your User ID.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#101010] hover:bg-[#242424] text-white font-black text-xs transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
