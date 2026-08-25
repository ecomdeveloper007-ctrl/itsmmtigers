import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Users,
  LayoutDashboard,
  Shield,
  Sliders,
  Calendar,
  FileSpreadsheet,
  FileText,
  Activity,
  LogOut,
  ChevronDown,
  User,
  PlusCircle,
  Sparkles,
  Lock,
  Menu,
  X,
  Flame,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout, switchUser, allUsers, isSuperAdmin, isAdmin, isTeamMember, pendingCount } = useAuth();
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedPeriodId,
    setSelectedPeriodId,
    availableMonths,
    availableYears,
    periods,
    openWinnerModal,
    activeTab,
    setActiveTab,
    openDataEntryModal,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDemoSwitchOpen, setIsDemoSwitchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
  const isCurrentLocked = currentPeriod?.status === 'locked';

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Shield className="w-3 h-3" /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'team_member':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <User className="w-3 h-3" /> Team Member
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Super Admin / Active Session Bar */}
      <div className="bg-gradient-to-r from-orange-950/70 via-slate-900/90 to-amber-950/70 border-b border-orange-500/20 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-orange-400">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            Authenticated Session:
          </span>
          <span className="text-slate-300">
            <strong className="text-white">{currentUser?.name}</strong>{' '}
            <span className="text-slate-400 font-mono text-[11px]">({currentUser?.email})</span>
          </span>
          {isSuperAdmin && (
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Super Admin Root
            </span>
          )}
        </div>

        {/* Super Admin Pending Approvals Alert Badge */}
        {isSuperAdmin && pendingCount > 0 && (
          <button
            onClick={() => setActiveTab('user-management')}
            className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 animate-pulse shadow-md cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Registration Requests</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="hidden sm:inline text-[11px] text-slate-400 mr-1">Switch View:</span>
          {allUsers
            .filter((u) => u.status === 'active')
            .slice(0, 4)
            .map((user) => (
              <button
                key={user.uid}
                onClick={() => switchUser(user.uid)}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  currentUser?.uid === user.uid
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {user.name.split(' ')[0]} ({user.role === 'super_admin' ? 'Super' : user.role === 'admin' ? 'Admin' : 'Member'})
              </button>
            ))}
        </div>
      </div>

      {/* Main Header Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/10 group-hover:opacity-100 transition-opacity"></div>
                <svg
                  className="w-6 h-6 text-orange-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 uppercase">
                  IT SMM TIGERS
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30 tracking-widest uppercase">
                  R&R
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Rewards & Recognition Platform
              </p>
            </div>
          </div>

          {/* Period Selector Controls (Month, Year, Week) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 shadow-inner">
            <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Period:</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Performance Month"
              className="bg-slate-800 text-xs font-medium text-white rounded-lg px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Select Performance Year"
              className="bg-slate-800 text-xs font-medium text-white rounded-lg px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              aria-label="Select Performance Week"
              className="bg-slate-800 text-xs font-medium text-orange-300 rounded-lg px-2.5 py-1.5 border border-orange-500/30 hover:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">Entire Month (All Weeks)</option>
              {periods
                .filter((p) => p.month === selectedMonth && p.year === selectedYear)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.weekName} {p.status === 'locked' ? '🔒 (Locked)' : ''}
                  </option>
                ))}
            </select>

            {isCurrentLocked && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded-lg">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Submit Weekly Performance for Members */}
            {isTeamMember && (
              <button
                onClick={() => openDataEntryModal()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Performance
              </button>
            )}

            {/* Announce Winner Button for Admins & Super Admins */}
            {isAdmin && (
              <button
                onClick={openWinnerModal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>🏆 Announce Winner</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-orange-500/30"
                />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                    {currentUser?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 capitalize leading-none">
                    {currentUser?.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800">
                  <div className="p-3">
                    <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                    <div className="mt-2">{getRoleBadge(currentUser?.role)}</div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                      <LayoutDashboard className="w-4 h-4 text-orange-400" />
                      Main Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('leaderboard');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Leaderboard Standings
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('my-performance');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      My Performance Scorecard
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      Monthly Recognition Report
                    </button>
                  </div>

                  {isSuperAdmin && (
                    <div className="py-2 space-y-1">
                      <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Super Admin Controls
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('user-management');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Manage Team Members
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('kpi-settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        <Sliders className="w-3.5 h-3.5 text-pink-400" />
                        KPI Weights & Targets
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('period-management');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        Weeks & Lock Periods
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('audit-logs');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Audit History Logs
                      </button>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-1 border-t border-slate-900 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Main Dashboard
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('my-performance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-performance'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            My Performance
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-data')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin-data'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Team Submissions & Data
            </button>
          )}

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Monthly R&R Report
          </button>

          {isSuperAdmin && (
            <>
              <div className="h-4 w-px bg-slate-800 mx-1"></div>

              <button
                onClick={() => setActiveTab('user-management')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'user-management'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Team Members & Approvals</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('kpi-settings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'kpi-settings'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-pink-400" />
                KPI Config (100%)
              </button>

              <button
                onClick={() => setActiveTab('period-management')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'period-management'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Weeks & Lock
              </button>

              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'audit-logs'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Audit Logs
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-3 space-y-2">
            {/* Mobile Period Selectors */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-800">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Select Month for Mobile"
                className="bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Select Year for Mobile"
                className="bg-slate-900 text-xs text-white rounded-lg p-2 border border-slate-700"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                aria-label="Select Week for Mobile"
                className="bg-slate-900 text-xs text-orange-300 rounded-lg p-2 border border-orange-500/30"
              >
                <option value="all">All Weeks</option>
                {periods
                  .filter((p) => p.month === selectedMonth && p.year === selectedYear)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.weekName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-orange-400" /> Main Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('my-performance');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-emerald-400" /> My Performance
              </button>
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-purple-400" /> R&R Report
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('admin-data');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" /> Submissions
                </button>
              )}
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('user-management');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-indigo-400" /> Team Members
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('kpi-settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Sliders className="w-4 h-4 text-pink-400" /> KPI Weights
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('period-management');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-teal-400" /> Weeks / Lock
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('audit-logs');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-semibold bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-amber-400" /> Audit Logs
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
