import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../context/PermissionContext';
import { useSales } from '../../context/SalesContext';
import { getLatestMonthAndYear, MONTH_INDEX_MAP } from '../../utils/monthUtils';
import { TeamDashboardSwitcher } from './TeamDashboardSwitcher';
import { TeamComparisonCard } from './TeamComparisonCard';
import { KPISummaryCards } from './KPISummaryCards';
import { ProfileRevenueAnalysisCard } from './ProfileRevenueAnalysisCard';
import { PerformanceCharts } from './PerformanceCharts';
import { LeaderboardTable } from './LeaderboardTable';
import {
  Trophy,
  Crown,
  Sparkles,
  TrendingUp,
  Briefcase,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  BarChart3,
  Layers,
  PlusCircle,
  Medal,
  Zap,
  Lock,
} from 'lucide-react';

export const CRMHomePage: React.FC = () => {
  const { currentUser, isAdmin, isTeamMember } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setActiveModule,
    openWinnerModal,
    openDataEntryModal,
    leaderboardData,
    selectedTeam,
    records,
    periods,
    settings,
    selectedMonth,
    selectedYear,
    isPeriodLocked,
  } = useApp();

  const { canAccessModule, canAccessSection } = usePermissions();
  const { salesDashboardSummary, setSalesActiveTab, openSalesEntryModal, salesRecords } = useSales();

  // Tab or view mode within home page (Executive Overview vs Detailed Analytics)
  const [analyticsViewExpanded, setAnalyticsViewExpanded] = useState<boolean>(true);

  // 1. DYNAMICALLY RESOLVE LATEST AVAILABLE MONTH & YEAR (Requirement #9)
  const latestPeriodInfo = useMemo(() => {
    if (selectedMonth && selectedYear) {
      return { month: selectedMonth, year: selectedYear };
    }
    // Inspect both PM records/periods and Sales records
    const pmLatest = getLatestMonthAndYear([...records, ...periods]);
    const salesLatest = getLatestMonthAndYear(salesRecords);

    if (pmLatest && salesLatest) {
      const pmScore = (MONTH_INDEX_MAP[pmLatest.month.toLowerCase()] ?? 0) + pmLatest.year * 12;
      const salesScore = (MONTH_INDEX_MAP[salesLatest.month.toLowerCase()] ?? 0) + salesLatest.year * 12;
      return pmScore >= salesScore ? pmLatest : salesLatest;
    }
    if (pmLatest) return pmLatest;
    if (salesLatest) return salesLatest;

    // Fallback to active selection
    return { month: selectedMonth || 'September', year: selectedYear || 2026 };
  }, [records, periods, salesRecords, selectedMonth, selectedYear]);

  // Top performers from existing leaderboard calculations
  const { winner, top3, rankings, averageScore: rawAverageScore, teamStats, revenueSummary } = leaderboardData;
  const currentChampion = winner || (top3.length > 0 ? top3[0] : undefined);

  // Safely compute Team Average score from leaderboard calculations
  const averageScore = useMemo(() => {
    if (rawAverageScore !== undefined && rawAverageScore !== null && rawAverageScore !== '') {
      return rawAverageScore;
    }
    if (typeof teamStats?.avgTeamScore === 'number' && !isNaN(teamStats.avgTeamScore)) {
      return teamStats.avgTeamScore.toFixed(2);
    }
    if (rankings && rankings.length > 0) {
      const validScores = rankings
        .map((r) => r.finalScore)
        .filter((s) => typeof s === 'number' && !isNaN(s));
      if (validScores.length > 0) {
        return (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2);
      }
    }
    return '0.00';
  }, [rawAverageScore, teamStats, rankings]);

  // Accurate project delivery and revenue stats for active cycle and division
  const totalProjectsClosed = useMemo(() => {
    return teamStats?.totalProjects ?? 0;
  }, [teamStats]);

  const grossPmRevenue = useMemo(() => {
    if (selectedTeam === 'it') {
      return revenueSummary?.itTeam?.grossRevenue ?? revenueSummary?.itRevenue?.grossRevenue ?? teamStats?.totalRevenue ?? 0;
    }
    if (selectedTeam === 'smm') {
      return revenueSummary?.smmTeam?.grossRevenue ?? revenueSummary?.smmRevenue?.grossRevenue ?? teamStats?.totalRevenue ?? 0;
    }
    return revenueSummary?.totalGrossRevenue ?? revenueSummary?.grandTotal?.grossRevenue ?? teamStats?.totalRevenue ?? 0;
  }, [selectedTeam, revenueSummary, teamStats]);

  const netPmRevenue = useMemo(() => {
    if (selectedTeam === 'it') {
      return revenueSummary?.itTeam?.netRevenue ?? revenueSummary?.itRevenue?.finalNetRevenue ?? Math.round(grossPmRevenue * 0.8);
    }
    if (selectedTeam === 'smm') {
      return revenueSummary?.smmTeam?.netRevenue ?? revenueSummary?.smmRevenue?.finalNetRevenue ?? Math.round(grossPmRevenue * 0.8);
    }
    return revenueSummary?.totalNetRevenue ?? revenueSummary?.grandTotal?.finalNetRevenue ?? Math.round(grossPmRevenue * 0.8);
  }, [selectedTeam, revenueSummary, grossPmRevenue]);

  const activeMembersCount = rankings.length;

  // User display name
  const userName = currentUser?.name?.split(' ')[0] || currentUser?.name || 'Leader';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* =========================================================================
          1. CREATIVE HERO SECTION (Requirement #3)
          Uses existing brand tokens: #8cc540, #101010, #f3f8ef, #e2ebd9
         ========================================================================= */}
      <section
        id="crm-hero-section"
        className="relative rounded-3xl bg-gradient-to-br from-white via-[#f3f8ef] to-[#eef6e9] border border-[#e2ebd9] p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden"
      >
        {/* Subtle abstract geometric accents using existing brand colors */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#8cc540]/15 to-transparent blur-2xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#8cc540]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none hidden lg:block"
        >
          <Trophy className="w-80 h-80 text-[#8cc540]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Greeting and Key Value Proposition */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#8cc540]/20 text-[#3a5818] border border-[#8cc540]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#598327]" />
                Performance & Team Recognition CRM
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/80 text-[#555555] border border-[#e2ebd9]">
                <Calendar className="w-3.5 h-3.5 text-[#598327]" />
                {latestPeriodInfo.month} {latestPeriodInfo.year}
              </span>

              {currentUser?.role && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#101010] text-white">
                  <UserCheck className="w-3 h-3 text-[#8cc540]" />
                  {currentUser.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101010] tracking-tight">
                Welcome Back, {userName} 👋
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#555555] max-w-2xl font-medium leading-relaxed">
                Track your team&apos;s performance, recognize achievements, and drive growth with live KPI benchmarks and weighted champion rewards.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {canAccessSection('pm.leaderboard') && (
                <button
                  id="hero-btn-view-leaderboard"
                  onClick={() => setActiveTab('leaderboard')}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Trophy className="w-4 h-4 text-[#101010]" />
                  <span>View Full Leaderboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isTeamMember && (
                <button
                  id="hero-btn-submit-performance"
                  onClick={() => openDataEntryModal()}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#101010] hover:bg-[#252525] text-white shadow-md shadow-[#101010]/20 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4 text-[#8cc540]" />
                  <span>Submit My Performance</span>
                </button>
              )}

              {canAccessModule('sales') && (
                <button
                  id="hero-btn-sales-record"
                  onClick={() => openSalesEntryModal()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#101010] border border-[#e2ebd9] hover:border-[#8cc540] hover:bg-[#f3f8ef] flex items-center gap-2 cursor-pointer transition-all shadow-xs transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <TrendingUp className="w-4 h-4 text-[#598327]" />
                  <span>+ Sales Record</span>
                </button>
              )}

              {isAdmin && (
                <button
                  id="hero-btn-announce-winner"
                  onClick={openWinnerModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#3d591d] border border-[#8cc540]/40 hover:bg-[#8cc540]/10 flex items-center gap-2 cursor-pointer transition-all shadow-xs transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Announce Winner</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Spotlight Mini Card */}
          <div className="lg:col-span-4">
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-[#e2ebd9] p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#f0f4ec] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f3f8ef] border border-[#8cc540]/30 flex items-center justify-center text-[#598327]">
                    <Zap className="w-4 h-4 text-[#74a831]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#101010]">Active Rhythm</h3>
                    <p className="text-[11px] text-[#666666]">
                      {latestPeriodInfo.month} {latestPeriodInfo.year}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#8cc540]/15 text-[#3a5818] border border-[#8cc540]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8cc540] animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* Reigning Champion Spotlight Teaser */}
              {currentChampion ? (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/30">
                  <div className="relative">
                    <img
                      src={
                        currentChampion.avatarUrl ||
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={currentChampion.userName}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#8cc540] shadow-sm"
                    />
                    <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-[#598327] uppercase tracking-wider flex items-center gap-1">
                      <Medal className="w-3 h-3 text-[#74a831]" />
                      Reigning 1st Rank
                    </div>
                    <div className="font-bold text-xs text-[#101010] truncate">
                      {currentChampion.userName}
                    </div>
                    <div className="text-[11px] text-[#666666] font-medium">
                      {currentChampion.finalScoreDisplay} / 100
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#f5f5f5] text-center text-xs text-[#666666]">
                  Awaiting first submissions for this period
                </div>
              )}

              {/* Fast stats row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-white border border-[#e4ece0] text-center">
                  <div className="text-[10px] text-[#777777] font-semibold">Active Roster</div>
                  <div className="text-sm font-black text-[#101010] mt-0.5">{activeMembersCount} Members</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#e4ece0] text-center">
                  <div className="text-[10px] text-[#777777] font-semibold">Team Average</div>
                  <div className="text-sm font-black text-[#436320] mt-0.5 flex items-baseline justify-center gap-0.5">
                    <span>{averageScore}</span>
                    <span className="text-[10px] text-[#777777] font-bold">/ 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PERFORMANCE SNAPSHOT (Requirement #5)
          Uses existing data & calculations dynamically
         ========================================================================= */}
      <section id="crm-performance-snapshot" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#101010] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#598327]" />
              Executive Performance Snapshot
            </h2>
            <p className="text-xs text-[#666666]">
              Real-time indicators evaluated from live scorecards and division records
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#555555]">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e2ebd9]">
              Period: {latestPeriodInfo.month} {latestPeriodInfo.year}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Active Period */}
          <div className="p-5 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540]/60 transition-all">
            <div className="flex items-center justify-between text-xs text-[#777777] font-semibold">
              <span>Operational Period</span>
              <Calendar className="w-4 h-4 text-[#598327]" />
            </div>
            <div className="text-xl font-black text-[#101010] mt-2">
              {latestPeriodInfo.month} {latestPeriodInfo.year}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#436320] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#74a831]" />
              <span>Active Performance Cycle</span>
            </div>
          </div>

          {/* Card 2: Project Delivery Velocity */}
          <div className="p-5 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540]/60 transition-all">
            <div className="flex items-center justify-between text-xs text-[#777777] font-semibold">
              <span>Projects Completed</span>
              <Briefcase className="w-4 h-4 text-[#598327]" />
            </div>
            <div className="text-xl font-black text-[#101010] mt-2">
              {totalProjectsClosed} Deliveries
            </div>
            <div className="text-xs text-[#666666] font-medium mt-1">
              Gross: {settings.currencySymbol || '$'}
              {grossPmRevenue.toLocaleString()}
              {netPmRevenue > 0 && (
                <span className="text-[#436320] font-bold ml-1.5">
                  (Net: {settings.currencySymbol || '$'}{netPmRevenue.toLocaleString()})
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Sales Performance Snapshot */}
          <div className="p-5 rounded-2xl bg-white border border-[#e4ece0] shadow-xs hover:border-[#8cc540]/60 transition-all">
            <div className="flex items-center justify-between text-xs text-[#777777] font-semibold">
              <span>Sales Pipeline</span>
              <TrendingUp className="w-4 h-4 text-[#598327]" />
            </div>
            <div className="text-xl font-black text-[#101010] mt-2">
              ₹{(salesDashboardSummary?.totalOrderValue ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#436320] font-bold mt-1 flex items-center justify-between">
              <span>Conv: {salesDashboardSummary?.overallConversionRate?.toFixed(1) ?? '0.0'}%</span>
              <span className="text-[#888888] font-normal">
                {salesDashboardSummary?.totalConversions ?? 0} Won Deals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. MAIN MODULE CARDS (Requirement #4)
          Sales Division & Project Management Division with Live Summaries
         ========================================================================= */}
      <section id="crm-main-modules" className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#101010] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#598327]" />
            Core Enterprise Divisions
          </h2>
          <p className="text-xs text-[#666666]">
            Select a division below to manage performance records, individual targets, and scorecards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Sales Division */}
          <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 shadow-sm hover:shadow-md hover:border-[#8cc540]/60 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 flex items-center justify-center text-[#598327] group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-[#74a831]" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#f3f8ef] text-[#3a5818] border border-[#8cc540]/30">
                  Sales Module
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#101010] tracking-tight">
                  Sales Performance Division
                </h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Track client reachouts, qualified conversions, follow-up benchmarks, and profile-based order values across IT &amp; SMM sales representatives.
                </p>
              </div>

              {/* Performance summary data */}
              <div className="p-4 rounded-2xl bg-[#f5f5f5] border border-[#e4ece0] grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Total Revenue</div>
                  <div className="text-sm font-black text-[#101010] mt-0.5">
                    ₹{(salesDashboardSummary?.totalOrderValue ?? 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Conversion</div>
                  <div className="text-sm font-black text-[#436320] mt-0.5">
                    {salesDashboardSummary?.overallConversionRate?.toFixed(1) ?? '0.0'}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Won Deals</div>
                  <div className="text-sm font-black text-[#101010] mt-0.5">
                    {salesDashboardSummary?.totalConversions ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#f0f4ec] mt-6 flex items-center justify-between">
              <span className="text-xs text-[#666666] font-medium">
                {salesDashboardSummary?.totalEmployees ?? 0} Sales Team Members
              </span>

              {canAccessModule('sales') ? (
                <button
                  onClick={() => {
                    setActiveModule('sales');
                    setSalesActiveTab('sales-dashboard');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Open Sales Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-[#888888] font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Restricted to Sales
                </span>
              )}
            </div>
          </div>

          {/* Card B: Project Management Division */}
          <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 shadow-sm hover:shadow-md hover:border-[#8cc540]/60 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 flex items-center justify-center text-[#598327] group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-[#74a831]" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#8cc540]/15 text-[#3a5818] border border-[#8cc540]/30">
                  Project Management
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-[#101010] tracking-tight">
                  Project Management Division
                </h3>
                <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                  Monitor sprint delivery velocity, weighted project closures, client satisfaction ratings, and 20% platform fee revenue breakdowns for IT &amp; SMM engineers.
                </p>
              </div>

              {/* Performance summary data */}
              <div className="p-4 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/30 grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-[10px] font-bold text-[#598327] uppercase">Projects Closed</div>
                  <div className="text-sm font-black text-[#101010] mt-0.5">
                    {totalProjectsClosed} Deliveries
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#598327] uppercase">Net Revenue</div>
                  <div className="text-sm font-black text-[#101010] mt-0.5">
                    {settings.currencySymbol || '$'}{netPmRevenue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#f0f4ec] mt-6 flex items-center justify-between">
              <span className="text-xs text-[#666666] font-medium">
                {activeMembersCount} Active Contributors
              </span>

              <button
                onClick={() => {
                  setActiveModule('pm');
                  setActiveTab('dashboard');
                  setAnalyticsViewExpanded(true);
                  // Scroll smoothly to detailed section
                  const el = document.getElementById('division-deep-dive-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#101010] hover:bg-[#252525] text-white shadow-md shadow-[#101010]/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Open PM Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8cc540]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. TEAM RECOGNITION & LEADERBOARD PREVIEW (Requirements #6 & #7)
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Team Recognition / Reigning Champion Spotlight (Requirement #6) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#101010] tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Team Recognition Spotlight
              </h2>
              <p className="text-xs text-[#666666]">
                Honoring high performers and celebrating champion milestones
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={openWinnerModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#3d591d] bg-[#f3f8ef] hover:bg-[#8cc540]/20 border border-[#8cc540]/30 transition-all cursor-pointer"
              >
                🏆 Celebrate
              </button>
            )}
          </div>

          {currentChampion ? (
            <div className="rounded-3xl bg-gradient-to-b from-[#f3f8ef] via-white to-white border-2 border-[#8cc540] p-6 sm:p-7 shadow-lg shadow-[#8cc540]/10 relative space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                  <img
                    src={
                      currentChampion.avatarUrl ||
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={currentChampion.userName}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#8cc540] shadow-xl"
                  />
                  <span className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8cc540] text-[#101010] shadow uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-[#101010]" />
                    Rank 1
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#598327] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#74a831]" />
                    Top Division Performer
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#101010]">
                    {currentChampion.userName}
                  </h3>
                  <p className="text-xs text-[#666666] font-medium">
                    {currentChampion.department || 'Tiger Performer'} • {latestPeriodInfo.month} {latestPeriodInfo.year}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#8cc540]/15 text-[#3a5818] border border-[#8cc540]/40">
                      {currentChampion.performanceBand || 'High Performance Leader'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Champion KPI breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f5f5f5] border border-[#e4ece0] text-center">
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Final Score</div>
                  <div className="text-base sm:text-lg font-black text-[#101010] mt-0.5">
                    {currentChampion.finalScoreDisplay}
                    <span className="text-[10px] text-[#888888] font-normal"> / 100</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Revenue</div>
                  <div className="text-base sm:text-lg font-black text-[#436320] mt-0.5">
                    {settings.currencySymbol || '$'}
                    {(currentChampion.revenueGenerated ?? 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#777777] uppercase">Projects</div>
                  <div className="text-base sm:text-lg font-black text-[#101010] mt-0.5">
                    {currentChampion.projectClosed ?? 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#666666]">
                <div className="flex items-center gap-1.5 text-[#436320] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#74a831]" />
                  <span>Weighted Scoring Verified</span>
                </div>
                <button
                  onClick={openWinnerModal}
                  className="font-bold text-[#101010] hover:text-[#598327] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Podium Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-[#e2ebd9] p-8 text-center space-y-3">
              <Trophy className="w-12 h-12 text-[#8cc540]/40 mx-auto" />
              <h3 className="font-bold text-sm text-[#101010]">No Champion Selected Yet</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto">
                Once weekly or monthly performance records are submitted, the weighted ranking algorithm will highlight the top performer here.
              </p>
            </div>
          )}
        </div>

        {/* Right: Compact Leaderboard Preview (Requirement #7) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#101010] tracking-tight flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#598327]" />
                Leaderboard Preview
              </h2>
              <p className="text-xs text-[#666666]">
                Top ranked employees by weighted multi-tier score
              </p>
            </div>

            {canAccessSection('pm.leaderboard') && (
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="px-3 py-1.5 rounded-lg text-xs font-black text-[#101010] bg-[#8cc540] hover:bg-[#7db734] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Full Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-[#e2ebd9] p-5 shadow-sm space-y-3">
            {rankings.length > 0 ? (
              <div className="space-y-2.5">
                {rankings.slice(0, 4).map((member, idx) => {
                  const rankIcons = ['🥇', '🥈', '🥉', '4', '5'];
                  const isTopOne = idx === 0;

                  return (
                    <div
                      key={member.userId || idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isTopOne
                          ? 'bg-[#f3f8ef] border-[#8cc540]/40'
                          : 'bg-[#fafafa] border-[#e4ece0] hover:border-[#8cc540]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base font-black w-6 text-center text-[#101010]">
                          {rankIcons[idx] || `${idx + 1}`}
                        </span>

                        <img
                          src={
                            member.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={member.userName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                        />

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#101010] truncate">
                            {member.userName}
                          </div>
                          <div className="text-[11px] text-[#666666] truncate">
                            {member.department || member.performanceBand}
                          </div>
                        </div>
                      </div>

                      <div className="text-right pl-3 shrink-0">
                        <div className="text-sm font-black text-[#101010]">
                          {member.finalScoreDisplay}
                        </div>
                        <div className="text-[10px] text-[#555555] font-medium">
                          {settings.currencySymbol || '$'}
                          {(member.revenueGenerated ?? 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {canAccessSection('pm.leaderboard') && (
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-[#8cc540]/50 text-xs font-bold text-[#436320] hover:bg-[#f3f8ef] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View All {rankings.length} Ranked Members</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#777777] space-y-2">
                <p>No leaderboard rankings recorded for this period yet.</p>
                {isTeamMember && (
                  <button
                    onClick={() => openDataEntryModal()}
                    className="px-3 py-1.5 rounded-lg bg-[#8cc540] text-[#101010] font-bold text-xs"
                  >
                    Submit Performance
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          DETAILED DIVISION ANALYTICS (Preserving Full Existing Functionality)
         ========================================================================= */}
      <section id="division-deep-dive-section" className="space-y-6 pt-4 border-t border-[#e2ebd9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8cc540]/15 text-[#3a5818] border border-[#8cc540]/40 text-xs font-black uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5 text-[#74a831]" />
              Detailed Division Analytics
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#101010] mt-1 tracking-tight">
              {selectedTeam === 'it'
                ? '💻 IT Team Scorecards & Analytics'
                : selectedTeam === 'smm'
                ? '📱 SMM Team Scorecards & Analytics'
                : '🌟 All Divisions Unified Analytics'}
            </h2>
            <p className="text-xs text-[#666666]">
              Interactive filters, KPI benchmarks, profile-wise revenue splits, and comprehensive tables
            </p>
          </div>

          <button
            onClick={() => setAnalyticsViewExpanded(!analyticsViewExpanded)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#101010] border border-[#e2ebd9] hover:border-[#8cc540] transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
          >
            <span>{analyticsViewExpanded ? 'Collapse Analytics' : 'Expand Analytics'}</span>
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform ${analyticsViewExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        </div>

        {analyticsViewExpanded && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Team Division Selector Bar (IT Team / SMM Team / All Teams) */}
            <TeamDashboardSwitcher />

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
      </section>
    </div>
  );
};
