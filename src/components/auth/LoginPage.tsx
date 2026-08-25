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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, allUsers } = useAuth();

  const [userIdOrEmail, setUserIdOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userIdOrEmail.trim()) {
      setErrorMsg('Please enter your User ID or Email address.');
      return;
    }

    setIsLoading(true);
    const res = await login(userIdOrEmail, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = (userLoginId: string) => {
    setUserIdOrEmail(userLoginId);
    setPassword('tiger2026');
    setErrorMsg(null);
    login(userLoginId, 'tiger2026');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 p-0.5 shadow-2xl shadow-orange-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl">🐅</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
              IT SMM TIGERS
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Rewards & Recognition Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400">
              Enter your User ID and password to access your weekly performance
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                User ID / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. divya.bhardwaj or superadmin"
                  value={userIdOrEmail}
                  onChange={(e) => setUserIdOrEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Evaluation / Demo Logins */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Quick 1-Click Test Access:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Shield className="w-3.5 h-3.5" /> Super Admin
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">superadmin</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-blue-500/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Shield className="w-3.5 h-3.5" /> Ops Admin
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">admin</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('divya.bhardwaj')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  🥇 Divya (68.02)
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">divya.bhardwaj</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('mohita.sharma')}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  🥈 Mohita (60.97)
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">mohita.sharma</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Password Assistance</h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Passwords for IT SMM Tigers are managed directly by your Super Admin. Please contact leadership or select any 1-Click quick login above to test immediate access.
            </p>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
