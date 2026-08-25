import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { WinnerModal } from './components/winner/WinnerModal';
import { WeeklyDataEntryModal } from './components/member/WeeklyDataEntryModal';
import { KPISummaryCards } from './components/dashboard/KPISummaryCards';
import { LeaderboardTable } from './components/dashboard/LeaderboardTable';
import { PerformanceCharts } from './components/dashboard/PerformanceCharts';
import { TeamDashboardSwitcher } from './components/dashboard/TeamDashboardSwitcher';
import { TeamComparisonCard } from './components/dashboard/TeamComparisonCard';
import { MemberDashboard } from './components/member/MemberDashboard';
import { DataManagement } from './components/admin/DataManagement';
import { UserManagement } from './components/admin/UserManagement';
import { KPISettings } from './components/admin/KPISettings';
import { PeriodManagement } from './components/admin/PeriodManagement';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { ImportExportModal } from './components/admin/ImportExportModal';
import { Trophy, Crown, Sparkles, ArrowRight, Flame } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser, isAdmin, isSuperAdmin } = useAuth();
  const { activeTab, setActiveTab, openWinnerModal, leaderboardData, selectedTeam } = useApp();
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 animate-spin p-0.5 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px]"></div>
        </div>
        <p className="text-sm font-bold tracking-widest text-orange-400 uppercase animate-pulse">
          Loading IT SMM Tigers...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  const { winner, top3 } = leaderboardData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-slate-950">
      {/* Global Header */}
      <Header />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Team Division Selector Bar (IT Team / SMM Team / All Teams) */}
            <TeamDashboardSwitcher />

            {/* Top Podium Spotlight for Top 3 Performers of Active Division */}
            {top3.length > 0 && (
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-orange-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Trophy className="w-48 h-48 text-orange-400" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      {selectedTeam === 'it'
                        ? '💻 IT Team Podium'
                        : selectedTeam === 'smm'
                        ? '📱 SMM Team Podium'
                        : '🌟 All Division Champions Podium'}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {selectedTeam === 'it'
                        ? 'Top IT Team Performers'
                        : selectedTeam === 'smm'
                        ? 'Top SMM Team Performers'
                        : 'Top Tiger Performers'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Evaluated against strict KPI targets and weighted algorithm
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={openWinnerModal}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Trophy className="w-4 h-4 text-slate-950" />
                      <span>🏆 Announce Winner</span>
                    </button>
                  </div>
                </div>

                {/* Podium Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end">
                  {/* Silver - Rank 2 */}
                  {top3[1] && (
                    <div className="order-2 md:order-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-center space-y-3 relative group hover:border-slate-500 transition-all">
                      <div className="relative inline-block mx-auto">
                        <img
                          src={
                            top3[1].avatarUrl ||
                            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={top3[1].userName}
                          className="w-18 h-18 rounded-2xl object-cover ring-2 ring-slate-300 shadow-lg mx-auto"
                        />
                        <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-300 text-slate-950 uppercase shadow">
                          🥈 2nd Place
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base">{top3[1].userName}</h3>
                        <p className="text-xs text-slate-400">{top3[1].department || top3[1].performanceBand}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-2xl font-black text-slate-200">
                          {top3[1].finalScoreDisplay}
                        </span>
                        <span className="text-xs text-slate-500 font-bold"> / 100 PTS</span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex justify-between px-2">
                        <span>Rev: ${top3[1].revenueGenerated.toLocaleString()}</span>
                        <span>Projects: {top3[1].projectClosed}</span>
                      </div>
                    </div>
                  )}

                  {/* Gold - Rank 1 (Tall / Champion) */}
                  {top3[0] && (
                    <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/70 text-center space-y-4 shadow-2xl shadow-amber-500/20 relative group scale-105">
                      <div className="absolute -top-4 inset-x-0 flex justify-center">
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 fill-slate-950" /> 🥇 1st Champion
                        </div>
                      </div>

                      <div className="relative inline-block mx-auto pt-2">
                        <img
                          src={
                            top3[0].avatarUrl ||
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={top3[0].userName}
                          className="w-22 h-22 rounded-2xl object-cover ring-4 ring-amber-400 shadow-2xl mx-auto"
                        />
                      </div>

                      <div>
                        <h3 className="font-black text-white text-lg sm:text-xl">{top3[0].userName}</h3>
                        <p className="text-xs font-semibold text-amber-400">
                          {top3[0].department || 'High Performance Leader'}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-inner">
                        <span className="text-3xl sm:text-4xl font-black text-amber-400">
                          {top3[0].finalScoreDisplay}
                        </span>
                        <span className="text-xs text-slate-500 font-bold"> / 100 PTS</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1 text-slate-300">
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Revenue</span>
                          <span className="text-emerald-400">${top3[0].revenueGenerated.toLocaleString()}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Projects</span>
                          <span className="text-white">{top3[0].projectClosed} / 25</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bronze - Rank 3 */}
                  {top3[2] && (
                    <div className="order-3 p-5 rounded-2xl bg-slate-900/80 border border-amber-800/60 text-center space-y-3 relative group hover:border-amber-600 transition-all">
                      <div className="relative inline-block mx-auto">
                        <img
                          src={
                            top3[2].avatarUrl ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={top3[2].userName}
                          className="w-18 h-18 rounded-2xl object-cover ring-2 ring-amber-600 shadow-lg mx-auto"
                        />
                        <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-700 text-white uppercase shadow">
                          🥉 3rd Place
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base">{top3[2].userName}</h3>
                        <p className="text-xs text-slate-400">{top3[2].department || top3[2].performanceBand}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-2xl font-black text-amber-400">
                          {top3[2].finalScoreDisplay}
                        </span>
                        <span className="text-xs text-slate-500 font-bold"> / 100 PTS</span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex justify-between px-2">
                        <span>Rev: ${top3[2].revenueGenerated.toLocaleString()}</span>
                        <span>Projects: {top3[2].projectClosed}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If in All Teams view, render comparative battleground overview */}
            {selectedTeam === 'all' && <TeamComparisonCard />}

            {/* KPI Summary Cards for selected division */}
            <KPISummaryCards />

            {/* Performance Analytics Charts for selected division */}
            <PerformanceCharts />

            {/* Comprehensive Leaderboard Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedTeam === 'it'
                      ? '💻 IT Team Member Rankings'
                      : selectedTeam === 'smm'
                      ? '📱 SMM Team Member Rankings'
                      : '🌟 All Team Member Rankings'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive division leaderboard with multi-tier tie-breakers
                  </p>
                </div>
              </div>
              <LeaderboardTable />
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">Full Team Leaderboard</h1>
                <p className="text-xs text-slate-400">
                  Performance ranking sorted by weighted scores and verified tie-breakers
                </p>
              </div>
              <button
                onClick={openWinnerModal}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg cursor-pointer"
              >
                🏆 View Winner Podium
              </button>
            </div>
            <TeamDashboardSwitcher />
            <LeaderboardTable />
            <PerformanceCharts />
          </div>
        )}

        {/* MY PERFORMANCE TAB */}
        {activeTab === 'my-performance' && <MemberDashboard />}

        {/* ADMIN DATA MANAGEMENT TAB */}
        {activeTab === 'admin-data' && isAdmin && (
          <DataManagement onOpenImportModal={() => setIsImportModalOpen(true)} />
        )}

        {/* USER MANAGEMENT TAB (Super Admin) */}
        {activeTab === 'user-management' && isSuperAdmin && <UserManagement />}

        {/* KPI SETTINGS TAB (Super Admin) */}
        {activeTab === 'kpi-settings' && isSuperAdmin && <KPISettings />}

        {/* PERIOD MANAGEMENT TAB (Super Admin) */}
        {activeTab === 'period-management' && isSuperAdmin && <PeriodManagement />}

        {/* AUDIT LOGS TAB (Super Admin) */}
        {activeTab === 'audit-logs' && isSuperAdmin && <AuditLogsView />}

        {/* MONTHLY REPORT TAB */}
        {activeTab === 'reports' && <MonthlyReportView />}
      </main>

      {/* Global Modals */}
      <WinnerModal />
      <WeeklyDataEntryModal />
      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
