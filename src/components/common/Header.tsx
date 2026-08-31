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
  Camera,
  Edit3,
  Eye,
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export const Header: React.FC = () => {
  const { currentUser, logout, switchUser, allUsers, isSuperAdmin, isAdmin, isTeamMember, isViewer, pendingCount } = useAuth();
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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId);
  const isCurrentLocked = currentPeriod?.status === 'locked';

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
            <Shield className="w-3 h-3" /> Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Eye className="w-3 h-3" /> Viewer (Read-Only)
          </span>
        );
      case 'team_member':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8cc540]/15 text-[#3d591d] border border-[#8cc540]/30">
            <User className="w-3 h-3" /> Team Member
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2ebd9] shadow-xs">
      {/* Super Admin / Active Session Bar */}
      <div className="bg-[#101010] border-b border-[#222222] px-4 py-1.5 text-xs text-[#e0e0e0] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-[#8cc540]">
            <Flame className="w-3.5 h-3.5 text-[#8cc540] animate-pulse" />
            Active Session:
          </span>
          <span className="text-[#cccccc]">
            <strong className="text-white font-bold">{currentUser?.name}</strong>{' '}
            <span className="text-[#888888] font-mono text-[11px]">({currentUser?.email})</span>
          </span>
          {isSuperAdmin && (
            <span className="px-2 py-0.2 rounded text-[10px] font-black bg-[#8cc540]/20 text-[#8cc540] border border-[#8cc540]/40">
              Super Admin
            </span>
          )}
        </div>

        {/* Super Admin Pending Approvals Alert Badge */}
        {isSuperAdmin && pendingCount > 0 && (
          <button
            onClick={() => setActiveTab('user-management')}
            className="px-3 py-0.5 rounded-full text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7db734] flex items-center gap-1.5 animate-pulse shadow-sm cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Registration Requests</span>
          </button>
        )}

        {/* Super Admin Switch View Tool (Strictly restricted to Super Admin) */}
        {isSuperAdmin && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="hidden sm:inline text-[11px] text-[#888888] mr-1">Switch View:</span>
            {allUsers
              .filter((u) => u.status === 'active')
              .slice(0, 4)
              .map((user) => (
                <button
                  key={user.uid}
                  onClick={() => switchUser(user.uid)}
                  className={`px-2 py-0.5 rounded-md font-medium text-xs transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                    currentUser?.uid === user.uid
                      ? 'bg-[#8cc540] text-[#101010] font-black shadow-xs'
                      : 'bg-[#222222] text-[#cccccc] hover:bg-[#333333] hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8cc540]"></span>
                  {user.name.split(' ')[0]} ({user.role === 'super_admin' ? 'Super' : user.role === 'admin' ? 'Admin' : 'Member'})
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Main Header Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 cursor-pointer py-1" onClick={() => setActiveTab('dashboard')}>
            <img
              src="https://framerusercontent.com/images/mRMK3iRhUP61hmrTIjXC0oPQ0U.webp?width=451&height=125"
              alt="IT SMM Tigers"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-black border border-[#8cc540]/30 uppercase tracking-wider">
              Rewards & Recognition
            </span>
          </div>

          {/* Period Selector Controls (Month, Year, Week) */}
          <div className="hidden lg:flex items-center gap-2 bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl p-1.5 shadow-inner">
            <div className="flex items-center gap-1 px-2 text-xs font-bold text-[#555555]">
              <Calendar className="w-3.5 h-3.5 text-[#598327]" />
              <span>Period:</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Performance Month"
              className="bg-white text-xs font-semibold text-[#101010] rounded-lg px-2.5 py-1.5 border border-[#e2ebd9] hover:border-[#8cc540] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer shadow-xs"
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
              className="bg-white text-xs font-semibold text-[#101010] rounded-lg px-2.5 py-1.5 border border-[#e2ebd9] hover:border-[#8cc540] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer shadow-xs"
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
              className="bg-[#f3f8ef] text-xs font-bold text-[#2d4317] rounded-lg px-2.5 py-1.5 border border-[#8cc540]/40 hover:border-[#8cc540] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer shadow-xs"
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
              <span className="flex items-center gap-1 text-[11px] px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold">
                <Lock className="w-3 h-3 text-amber-600" /> Locked
              </span>
            )}
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Submit Weekly Performance for Members */}
            {isTeamMember && (
              <button
                onClick={() => openDataEntryModal()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-[#101010] hover:bg-[#252525] text-white shadow-md shadow-[#101010]/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#8cc540]" />
                Submit Performance
              </button>
            )}

            {/* View-Only Indicator Badge for Viewers */}
            {isViewer && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>View-Only Access</span>
              </div>
            )}

            {/* Announce Winner Button for Admins & Super Admins */}
            {isAdmin && (
              <button
                onClick={openWinnerModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#101010] animate-bounce" />
                <span>🏆 Announce Winner</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9] hover:border-[#8cc540]/50 text-left transition-all cursor-pointer"
              >
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#8cc540]/40"
                />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-black text-[#101010] leading-none truncate max-w-[120px]">
                    {currentUser?.name}
                  </p>
                  <p className="text-[10px] text-[#666666] mt-1 capitalize leading-none font-medium">
                    {currentUser?.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#666666] hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e2ebd9] rounded-2xl shadow-xl p-2 z-50 divide-y divide-[#f0f4ec]">
                  <div className="p-3">
                    <p className="text-sm font-bold text-[#101010]">{currentUser?.name}</p>
                    <p className="text-xs text-[#666666] truncate">{currentUser?.email}</p>
                    <div className="mt-2">{getRoleBadge(currentUser?.role)}</div>
                    <button
                      onClick={() => {
                        setIsEditProfileOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#f3f8ef] text-[#3d591d] hover:bg-[#8cc540]/20 border border-[#8cc540]/30 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Edit Profile & Photo
                    </button>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#598327]" />
                      Main Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('leaderboard');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                    >
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Leaderboard Standings
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('my-performance');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                    >
                      <User className="w-4 h-4 text-[#598327]" />
                      My Performance Scorecard
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      Monthly Recognition Report
                    </button>
                  </div>

                  {isSuperAdmin && (
                    <div className="py-2 space-y-1">
                      <p className="px-3 text-[10px] font-black text-[#888888] uppercase tracking-wider">
                        Super Admin Controls
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('user-management');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        Manage Team Members
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('kpi-settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                      >
                        <Sliders className="w-3.5 h-3.5 text-pink-600" />
                        KPI Weights & Targets
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('period-management');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                      >
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Weeks & Lock Periods
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('audit-logs');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-[#101010] hover:bg-[#f5f5f5]"
                      >
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
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
              className="lg:hidden p-2 text-[#101010] hover:text-[#8cc540] rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-1 border-t border-[#f0f4ec] py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Main Dashboard
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>

          <button
            onClick={() => setActiveTab('my-performance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-performance'
                ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Performance
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admin-data')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin-data'
                  ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                  : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Team Submissions & Data
            </button>
          )}

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Monthly R&R Report
          </button>

          {isSuperAdmin && (
            <>
              <div className="h-4 w-px bg-[#e2ebd9] mx-1"></div>

              <button
                onClick={() => setActiveTab('user-management')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'user-management'
                    ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                    : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Members & Approvals</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#101010] text-[#8cc540]">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('kpi-settings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'kpi-settings'
                    ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                    : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                KPI Config (100%)
              </button>

              <button
                onClick={() => setActiveTab('period-management')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'period-management'
                    ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                    : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Weeks & Lock
              </button>

              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'audit-logs'
                    ? 'bg-[#8cc540] text-[#101010] shadow-xs'
                    : 'text-[#555555] hover:text-[#101010] hover:bg-[#f5f5f5]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Audit Logs
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e2ebd9] py-3 space-y-2 bg-white">
            {/* Mobile Period Selectors */}
            <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#e2ebd9]">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Select Month for Mobile"
                className="bg-[#f5f5f5] text-xs text-[#101010] font-semibold rounded-lg p-2 border border-[#e2ebd9]"
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
                className="bg-[#f5f5f5] text-xs text-[#101010] font-semibold rounded-lg p-2 border border-[#e2ebd9]"
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
                className="bg-[#f3f8ef] text-xs text-[#2d4317] font-bold rounded-lg p-2 border border-[#8cc540]/40"
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
                className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
              >
                <LayoutDashboard className="w-4 h-4 text-[#598327]" /> Main Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
              >
                <Trophy className="w-4 h-4 text-amber-500" /> Leaderboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('my-performance');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
              >
                <User className="w-4 h-4 text-[#598327]" /> My Performance
              </button>
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
              >
                <FileText className="w-4 h-4 text-blue-600" /> R&R Report
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('admin-data');
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Submissions
                </button>
              )}
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('user-management');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
                  >
                    <Users className="w-4 h-4 text-indigo-600" /> Team Members
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('kpi-settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
                  >
                    <Sliders className="w-4 h-4 text-pink-600" /> KPI Weights
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('period-management');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
                  >
                    <Calendar className="w-4 h-4 text-teal-600" /> Weeks / Lock
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('audit-logs');
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg text-left text-xs font-bold bg-[#f5f5f5] text-[#101010] flex items-center gap-2 hover:bg-[#8cc540]/20"
                  >
                    <Activity className="w-4 h-4 text-amber-600" /> Audit Logs
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* Edit Profile Modal */}
        {isEditProfileOpen && (
          <EditProfileModal onClose={() => setIsEditProfileOpen(false)} />
        )}
      </div>
    </header>
  );
};
