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
import { ProfileRevenueAnalysisCard } from './components/dashboard/ProfileRevenueAnalysisCard';
import { SalesProvider } from './context/SalesContext';
import { SalesModuleRoot } from './components/sales/SalesModuleRoot';
import { Trophy, Crown, Sparkles, ArrowRight, Flame } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, currentUser, isAdmin, isSuperAdmin } = useAuth();
  const { activeModule, activeTab, setActiveTab, openWinnerModal, leaderboardData, selectedTeam, settings } = useApp();
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Security Guard: Prevent non-super-admin users from accessing protected admin tabs
  React.useEffect(() => {
    const adminOnlyTabs = ['admin-data', 'user-management', 'kpi-settings', 'period-management', 'audit-logs'];
    if (!isSuperAdmin && adminOnlyTabs.includes(activeTab)) {
      setActiveTab('my-performance');
    }
  }, [activeTab, isSuperAdmin, setActiveTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f8ef] flex flex-col items-center justify-center text-[#101010] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8cc540] to-[#6da525] animate-spin p-0.5 flex items-center justify-center shadow-lg shadow-[#8cc540]/20">
          <div className="w-full h-full bg-white rounded-[14px]"></div>
        </div>
        <p className="text-sm font-bold tracking-widest text-[#101010] uppercase animate-pulse">
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
    <div className="min-h-screen bg-[#f3f8ef] text-[#101010] flex flex-col selection:bg-[#8cc540] selection:text-[#101010]">
      {/* Global Header */}
      <Header />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {activeModule === 'sales' ? (
          <SalesModuleRoot />
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Team Division Selector Bar (IT Team / SMM Team / All Teams) */}
                <TeamDashboardSwitcher />

                {/* Top Podium Spotlight for Top 3 Performers of Active Division */}
                {top3.length > 0 && (
                  <div className="relative rounded-3xl bg-white border border-[#e2ebd9] p-6 sm:p-8 shadow-xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <Trophy className="w-48 h-48 text-[#8cc540]" />
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/40 text-xs font-black uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-[#74a831]" />
                          {selectedTeam === 'it'
                            ? '💻 IT Team Podium'
                            : selectedTeam === 'smm'
                            ? '📱 SMM Team Podium'
                            : '🌟 All Division Champions Podium'}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#101010] mt-1 tracking-tight">
                          {selectedTeam === 'it'
                            ? 'Top IT Team Performers'
                            : selectedTeam === 'smm'
                            ? 'Top SMM Team Performers'
                            : 'Top Tiger Performers'}
                        </h2>
                        <p className="text-xs text-[#666666]">
                          Evaluated against strict KPI targets and weighted algorithm
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={openWinnerModal}
                          className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-lg shadow-[#8cc540]/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Trophy className="w-4 h-4 text-[#101010]" />
                          <span>🏆 Announce Winner</span>
                        </button>
                      </div>
                    </div>

                    {/* Podium Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end">
                      {/* Silver - Rank 2 */}
                      {top3[1] && (
                        <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#f5f5f5] border border-[#e4ece0] text-center space-y-3 relative group hover:border-[#8cc540]/50 transition-all shadow-sm">
                          <div className="relative inline-block mx-auto">
                            <img
                              src={
                                top3[1].avatarUrl ||
                                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={top3[1].userName}
                              className="w-18 h-18 rounded-2xl object-cover ring-2 ring-slate-400 shadow-md mx-auto"
                            />
                            <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-white uppercase shadow">
                              🥈 2nd Place
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-[#101010] text-base">{top3[1].userName}</h3>
                            <p className="text-xs text-[#666666]">{top3[1].department || top3[1].performanceBand}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] shadow-inner">
                            <span className="text-2xl font-black text-[#101010]">
                              {top3[1].finalScoreDisplay}
                            </span>
                            <span className="text-xs text-[#888888] font-bold"> / 100 PTS</span>
                          </div>

                          <div className="text-[11px] text-[#555555] flex justify-between px-2 font-medium">
                            <span>Rev: {settings.currencySymbol || '$'}{(top3[1].revenueGenerated ?? 0).toLocaleString()}</span>
                            <span>Projects: {top3[1].projectClosed ?? 0}</span>
                          </div>
                        </div>
                      )}

                      {/* Gold - Rank 1 (Tall / Champion) */}
                      {top3[0] && (
                        <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-[#f3f8ef] via-white to-white border-2 border-[#8cc540] text-center space-y-4 shadow-xl shadow-[#8cc540]/15 relative group scale-105">
                          <div className="absolute -top-4 inset-x-0 flex justify-center">
                            <div className="px-3.5 py-1 rounded-full bg-[#8cc540] text-[#101010] text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 fill-[#101010]" /> 🥇 1st Champion
                            </div>
                          </div>

                          <div className="relative inline-block mx-auto pt-2">
                            <img
                              src={
                                top3[0].avatarUrl ||
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={top3[0].userName}
                              className="w-22 h-22 rounded-2xl object-cover ring-4 ring-[#8cc540] shadow-xl mx-auto"
                            />
                          </div>

                          <div>
                            <h3 className="font-black text-[#101010] text-lg sm:text-xl">{top3[0].userName}</h3>
                            <p className="text-xs font-bold text-[#598327]">
                              {top3[0].department || 'High Performance Leader'}
                            </p>
                          </div>

                          <div className="p-3 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 shadow-inner">
                            <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                              {top3[0].finalScoreDisplay}
                            </span>
                            <span className="text-xs text-[#598327] font-bold"> / 100 PTS</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1 text-[#101010]">
                            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9] shadow-sm">
                              <span className="text-[10px] text-[#777777] block">Revenue</span>
                              <span className="text-[#436320] font-black">{settings.currencySymbol || '$'}{(top3[0].revenueGenerated ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9] shadow-sm">
                              <span className="text-[10px] text-[#777777] block">Projects</span>
                              <span className="text-[#101010] font-black">{top3[0].projectClosed ?? 0} / {top3[0].breakdown?.['kpi_projects']?.target ?? 25}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bronze - Rank 3 */}
                      {top3[2] && (
                        <div className="order-3 p-5 rounded-2xl bg-[#f5f5f5] border border-[#e4ece0] text-center space-y-3 relative group hover:border-[#8cc540]/50 transition-all shadow-sm">
                          <div className="relative inline-block mx-auto">
                            <img
                              src={
                                top3[2].avatarUrl ||
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={top3[2].userName}
                              className="w-18 h-18 rounded-2xl object-cover ring-2 ring-amber-600 shadow-md mx-auto"
                            />
                            <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-700 text-white uppercase shadow">
                              🥉 3rd Place
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-[#101010] text-base">{top3[2].userName}</h3>
                            <p className="text-xs text-[#666666]">{top3[2].department || top3[2].performanceBand}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] shadow-inner">
                            <span className="text-2xl font-black text-[#101010]">
                              {top3[2].finalScoreDisplay}
                            </span>
                            <span className="text-xs text-[#888888] font-bold"> / 100 PTS</span>
                          </div>

                          <div className="text-[11px] text-[#555555] flex justify-between px-2 font-medium">
                            <span>Rev: {settings.currencySymbol || '$'}{(top3[2].revenueGenerated ?? 0).toLocaleString()}</span>
                            <span>Projects: {top3[2].projectClosed ?? 0}</span>
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

                {/* Profile-Wise Revenue and -20% Platform Fee Audit */}
                <ProfileRevenueAnalysisCard />

                {/* Performance Analytics Charts for selected division */}
                <PerformanceCharts />

                {/* Comprehensive Leaderboard Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#101010] tracking-tight">
                        {selectedTeam === 'it'
                          ? '💻 IT Team Member Rankings'
                          : selectedTeam === 'smm'
                          ? '📱 SMM Team Member Rankings'
                          : '🌟 All Team Member Rankings'}
                      </h3>
                      <p className="text-xs text-[#666666]">
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
                    <h1 className="text-2xl font-black text-[#101010] tracking-tight">Full Team Leaderboard</h1>
                    <p className="text-xs text-[#666666]">
                      Performance ranking sorted by weighted scores and verified tie-breakers
                    </p>
                  </div>
                  <button
                    onClick={openWinnerModal}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 cursor-pointer transition-all"
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

            {/* ADMIN DATA MANAGEMENT TAB (Super Admin Only) */}
            {activeTab === 'admin-data' && isSuperAdmin && (
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
          </>
        )}
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
        <SalesProvider>
          <AppContent />
        </SalesProvider>
      </AppProvider>
    </AuthProvider>
  );
}
