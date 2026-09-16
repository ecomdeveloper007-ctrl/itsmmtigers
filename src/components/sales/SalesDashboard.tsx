import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { findMatchingSalesEmployee } from '../../utils/salesAuthUtils';
import {
  Users,
  Send,
  ShoppingBag,
  RotateCcw,
  MessageSquare,
  Percent,
  Award,
  Trophy,
  Crown,
  Sparkles,
  TrendingUp,
  Plus,
  Upload,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Building,
  DollarSign,
  UserCheck,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Target,
  FileText,
} from 'lucide-react';
import { SalesProfileCode } from '../../types/sales';

export const SalesDashboard: React.FC = () => {
  const {
    salesDashboardSummary,
    salesLeaderboardData,
    selectedPeriodType,
    setSelectedPeriodType,
    selectedDate,
    setSelectedDate,
    selectedMemberId,
    setSelectedMemberId,
    selectedDepartment,
    setSelectedDepartment,
    selectedProfile,
    setSelectedProfile,
    selectedWeek,
    setSelectedWeek,
    setSalesActiveTab,
    openSalesEntryModal,
    openSalesEmployeeModal,
    setIsSalesImportModalOpen,
    setSelectedEmployeeForDetail,
    salesEmployees,
    salesSettings,
    salesRecords,
    auditLogs,
    itDepartmentSummary,
    smmDepartmentSummary,
  } = useSales();

  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useApp();
  const { currentUser } = useAuth();
  const { hasPermission, canAccessSection } = usePermissions();
  const matchedMember = findMatchingSalesEmployee(currentUser, salesEmployees);

  const canManageSales =
    canAccessSection('sales.members') ||
    canAccessSection('sales.performance_records') ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super_admin' ||
    !matchedMember;

  const canAccessAuditLogs = canAccessSection('sales.audit_logs');
  const canCreateEntry =
    hasPermission('sales.performance_entry', 'create') ||
    hasPermission('sales.performance_records', 'create');
  const canCreateMember = hasPermission('sales.members', 'create');
  const canImportExport =
    hasPermission('sales.import_export', 'import') ||
    hasPermission('sales.import_export', 'export');

  const [localSearch, setLocalSearch] = useState('');

  // Personal Records for Sales Member
  const myRecords = matchedMember
    ? salesRecords.filter(
        (r) =>
          r.employeeId === matchedMember.id &&
          r.month.toLowerCase() === selectedMonth.toLowerCase() &&
          Number(r.year) === Number(selectedYear) &&
          (selectedWeek === 'all' || r.week === selectedWeek)
      )
    : [];

  const myTotalReachouts = myRecords.reduce((acc, r) => acc + (r.reachouts ?? r.totalReachout ?? 0), 0);
  const myTotalConversions = myRecords.reduce((acc, r) => acc + (r.conversions ?? r.orderConvert ?? 0), 0);
  const myTotalFollowups = myRecords.reduce((acc, r) => acc + (r.followups ?? r.followupSent ?? 0), 0);
  const myTotalOrderValue = myRecords.reduce((acc, r) => acc + (r.orderValue || 0), 0);
  const myConversionRate = myTotalReachouts > 0 ? Math.round((myTotalConversions / myTotalReachouts) * 1000) / 10 : 0;
  const myAvgScore =
    myRecords.length > 0
      ? Math.round((myRecords.reduce((acc, r) => acc + (r.totalPerformanceScore || 0), 0) / myRecords.length) * 10) / 10
      : 0;

  const summary = salesDashboardSummary;
  const items = salesLeaderboardData.items;
  const winner = salesLeaderboardData.winner || summary.salesWinner || summary.topSalesPerformer;
  const top3 = salesLeaderboardData.top3;

  // Find my personal standing in the leaderboard
  const myLeaderboardItem = matchedMember ? items.find((i) => i.employeeId === matchedMember.id) : undefined;
  const myRank = myLeaderboardItem ? myLeaderboardItem.rank : items.findIndex((i) => i.employeeId === matchedMember?.id) + 1;

  // Filtered leaderboard table in dashboard
  const displayItems = localSearch.trim()
    ? items.filter(
        (i) =>
          i.employeeName.toLowerCase().includes(localSearch.toLowerCase()) ||
          String(i.profileCode).toLowerCase().includes(localSearch.toLowerCase()) ||
          i.department.toLowerCase().includes(localSearch.toLowerCase())
      )
    : items;

  const handleViewEmployee = (empId: string) => {
    if (!canManageSales && matchedMember && empId !== matchedMember.id) {
      return;
    }
    const emp = salesEmployees.find((e) => e.id === empId);
    if (emp) setSelectedEmployeeForDetail(emp);
  };

  const recentAuditLogs = auditLogs.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. Header Landing Banner */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#598327]" />
              {canManageSales ? 'Sales Main Dashboard' : 'Sales Member Portal'}
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • Current Period: {selectedPeriodType === 'daily' ? `Daily (${selectedDate})` : selectedPeriodType === 'weekly' ? `Weekly (${selectedWeek}, ${selectedMonth} ${selectedYear})` : `Monthly (${selectedMonth} ${selectedYear})`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1.5">
            {canManageSales
              ? 'Sales Performance Overview'
              : `Welcome back, ${matchedMember?.name || currentUser?.name || 'Sales Representative'}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Weighted Score: <span className="font-bold text-[#101010]">50% Conversion</span> • <span className="font-bold text-[#101010]">20% Follow-ups</span> • <span className="font-bold text-[#101010]">30% Order Value</span> • 0% Reachouts
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canManageSales ? (
            <>
              {canCreateEntry && (
                <>
                  <button
                    onClick={() => openSalesEntryModal(undefined, undefined, undefined, 'daily')}
                    className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Daily Entry</span>
                  </button>

                  <button
                    onClick={() => openSalesEntryModal(undefined, undefined, undefined, 'weekly')}
                    className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>+ Weekly Entry</span>
                  </button>
                </>
              )}

              {canCreateMember && (
                <button
                  onClick={() => openSalesEmployeeModal()}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#598327]" />
                  <span>+ Member</span>
                </button>
              )}

              {canImportExport && (
                <button
                  onClick={() => setIsSalesImportModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#598327]" />
                  <span>Import/Export</span>
                </button>
              )}

              {canAccessAuditLogs && (
                <button
                  onClick={() => setSalesActiveTab('sales-audit')}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-rose-800 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Sales Audit Logs"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Audit Logs</span>
                </button>
              )}
            </>
          ) : (
            canCreateEntry && (
              <>
                <button
                  onClick={() => openSalesEntryModal(undefined, matchedMember?.id, undefined, 'daily')}
                  className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Log Today's Entry (Daily)</span>
                </button>

                <button
                  onClick={() => openSalesEntryModal(undefined, matchedMember?.id, undefined, 'weekly')}
                  className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>+ Log Weekly Batch</span>
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Type Buttons: Daily / Weekly / Monthly */}
          <div className="flex items-center bg-[#f8faf6] p-1 rounded-xl border border-[#e2ebd9]">
            <button
              onClick={() => setSelectedPeriodType('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedPeriodType === 'daily'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily</span>
            </button>
            <button
              onClick={() => setSelectedPeriodType('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedPeriodType === 'weekly'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Weekly</span>
            </button>
            <button
              onClick={() => setSelectedPeriodType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedPeriodType === 'monthly'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Monthly</span>
            </button>
          </div>

          {/* If Daily: Date input */}
          {selectedPeriodType === 'daily' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
              />
              <button
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className="px-2.5 py-1.5 bg-[#f8faf6] hover:bg-[#edf4e8] border border-[#e2ebd9] rounded-xl text-[11px] font-bold text-[#436320] cursor-pointer"
              >
                Today
              </button>
            </div>
          )}

          {/* If Weekly: Week selector */}
          {selectedPeriodType === 'weekly' && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
            >
              <option value="all">All Weeks Combined</option>
              <option value="Week 1">Week 1</option>
              <option value="Week 2">Week 2</option>
              <option value="Week 3">Week 3</option>
              <option value="Week 4">Week 4</option>
              <option value="Week 5">Week 5</option>
            </select>
          )}

          {/* Department Filter */}
          {canManageSales && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedDepartment('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDepartment === 'all'
                    ? 'bg-[#8cc540] text-[#101010]'
                    : 'bg-[#f8faf6] text-[#666666] hover:bg-[#edf4e8]'
                }`}
              >
                All Depts
              </button>
              <button
                onClick={() => setSelectedDepartment('IT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedDepartment === 'IT'
                    ? 'bg-[#8cc540] text-[#101010]'
                    : 'bg-[#f8faf6] text-[#666666] hover:bg-[#edf4e8]'
                }`}
              >
                <Building className="w-3 h-3" />
                <span>IT</span>
              </button>
              <button
                onClick={() => setSelectedDepartment('SMM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedDepartment === 'SMM'
                    ? 'bg-[#8cc540] text-[#101010]'
                    : 'bg-[#f8faf6] text-[#666666] hover:bg-[#edf4e8]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>SMM</span>
              </button>
            </div>
          )}

          {/* Profile Filter */}
          {canManageSales && (
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value as any)}
              className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
            >
              <option value="all">All Sales Profiles</option>
              <option value="PR">PR - Project Reachout</option>
              <option value="WR">WR - Warm Reachout</option>
              <option value="HW">HW - Hardware & Web</option>
              <option value="DR">DR - Direct Reachout</option>
              <option value="RR">RR - Referral & Rel.</option>
            </select>
          )}

          {/* Member Filter */}
          {canManageSales && (
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
            >
              <option value="all">All Sales Members ({salesEmployees.length})</option>
              {salesEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} - {emp.profileCode})
                </option>
              ))}
            </select>
          )}
        </div>

        {!canManageSales && matchedMember && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#f3f8ef] border border-[#8cc540]/40 rounded-xl text-xs font-bold text-[#436320] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#598327]" />
              <span>My Assigned Profiles: {(matchedMember.assignedProfiles || [matchedMember.profileCode]).join(', ')}</span>
            </span>
          </div>
        )}
      </div>

      {/* 3. PROMINENT SALES WINNER SHOWCASE */}
      {winner && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18260c] via-[#243812] to-[#121c08] border-2 border-[#8cc540] text-white p-6 shadow-xl">
          {/* Subtle Background Elements */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#8cc540]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Winner Avatar with Crown Ribbon */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-[#8cc540] shadow-xl shadow-[#8cc540]/20 bg-[#101010]">
                  <img
                    src={
                      winner.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={winner.employeeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#101010] p-1.5 rounded-full shadow-lg border-2 border-white">
                  <Crown className="w-5 h-5 fill-amber-300 stroke-[#101010]" />
                </div>
              </div>

              {/* Winner Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-[#101010] flex items-center gap-1 shadow-sm">
                    <Trophy className="w-4 h-4 fill-[#101010]" />
                    <span>🏆 SALES WINNER</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8cc540]/25 text-[#8cc540] border border-[#8cc540]/40">
                    Rank #1
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90">
                    {winner.department} Sales
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#8cc540] text-[#101010]">
                    {winner.profileCode}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                  {winner.employeeName}
                </h2>
                <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-[#8cc540] text-[#101010]">
                    {winner.profileCode}
                  </span>
                  <span className="text-xs font-bold text-white/90">
                    Performance Score: <span className="text-[#8cc540] font-black text-sm">{winner.totalPerformanceScore}%</span>
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-1 max-w-lg">
                  Calculated automatically from existing performance score (50% Conversion, 20% Follow-ups, 30% Order Value).
                </p>
              </div>
            </div>

            {/* Winner Score & Metrics Matrix */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">Performance Score</span>
                <span className="text-2xl sm:text-3xl font-black text-[#8cc540]">
                  {winner.totalPerformanceScore}%
                </span>
                <span className="text-[10px] text-white/60 block">Overall Score</span>
              </div>

              <div className="h-10 w-px bg-white/15" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">Conv. Rate (50%)</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  {winner.conversionRate}%
                </span>
                <span className="text-[10px] text-white/60 block">{winner.conversions ?? winner.orderConvert} Orders</span>
              </div>

              <div className="h-10 w-px bg-white/15" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">Follow-ups (20%)</span>
                <span className="text-xl sm:text-2xl font-black text-blue-400">
                  {winner.followups ?? winner.followupSent}
                </span>
                <span className="text-[10px] text-white/60 block">Touches</span>
              </div>

              <div className="h-10 w-px bg-white/15" />

              <div className="text-center px-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/60 block">Order Value (30%)</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  ${(winner.orderValue || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-white/60 block">Revenue</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback when no winner in current period */}
      {!winner && (
        <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 shadow-xs text-center space-y-2">
          <Trophy className="w-8 h-8 text-[#8cc540] mx-auto opacity-80" />
          <h3 className="text-sm font-black text-[#101010] uppercase tracking-wider">🏆 SALES WINNER</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto">
            No sales performance entries recorded for this period yet. Log a daily or weekly performance record to activate the leaderboard and highlight the Sales Winner.
          </p>
        </div>
      )}

      {/* 4. High-Level Cards */}
      {canManageSales ? (
        /* Management Overview */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Card 1: Total Sales Members */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Members</span>
              <Users className="w-3.5 h-3.5 text-[#598327]" />
            </div>
            <div className="text-xl font-black text-[#101010]">
              {summary.totalEmployees ?? salesEmployees.length}
            </div>
            <div className="text-[10px] text-[#777777]">{summary.activeEmployeesCount ?? 0} active now</div>
          </div>

          {/* Card 2: Active Sales Members */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-900">
              {summary.activeEmployeesCount ?? 0}
            </div>
            <div className="text-[10px] text-blue-700 font-bold">Logging activity</div>
          </div>

          {/* Card 3: Total Reachouts (0% wt) */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Reachouts</span>
              <Send className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="text-xl font-black text-[#101010]">
              {(summary.totalReachouts ?? summary.totalReachout ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-[#777777]">0% wt (Denominator)</div>
          </div>

          {/* Card 4: Total Conversions */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Conversions</span>
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-emerald-950">
              {summary.totalConversions ?? summary.totalOrders ?? 0}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Closed orders</div>
          </div>

          {/* Card 5: Overall Conversion Rate (50% wt) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Conv. Rate (50%)</span>
              <Percent className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-emerald-950">
              {summary.overallConversionRate ?? 0}%
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">Primary Weight</div>
          </div>

          {/* Card 6: Total Follow-ups (20% wt) */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Follow-ups (20%)</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-blue-950">
              {summary.totalFollowups ?? 0}
            </div>
            <div className="text-[10px] text-blue-700 font-bold">Client Touchpoints</div>
          </div>

          {/* Card 7: Total Order Value (30% wt) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Order Value (30%)</span>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-amber-950">
              ${(summary.totalOrderValue || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-700 font-bold">Total Deal Revenue</div>
          </div>

          {/* Card 8: Average Performance Score */}
          <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#436320]">
              <span className="text-[10px] font-black uppercase tracking-wider">Avg Score</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-[#101010]">
              {summary.avgScore ?? 0} <span className="text-xs text-[#598327]">/100</span>
            </div>
            <div className="text-[10px] text-[#598327] font-bold">Team Index</div>
          </div>
        </div>
      ) : (
        /* Sales Member: Personalized Performance Cards */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. My Leaderboard Rank */}
          <div className="p-4 rounded-2xl bg-[#f5f9f0] border-2 border-[#8cc540] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#436320]">
              <span className="text-[10px] font-black uppercase tracking-wider">My Rank</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-[#101010]">
              #{myRank || 1} <span className="text-xs font-normal text-[#666666]">of {items.length}</span>
            </div>
            <div className="text-[10px] text-[#598327] font-bold">
              {myRank === 1 ? 'Current Winner!' : `${winner ? `${Math.max(0, Number((winner.totalPerformanceScore - myAvgScore).toFixed(1)))} pts behind #1` : 'Active Competitor'}`}
            </div>
          </div>

          {/* 2. My Reachouts */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#666666]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Reachouts</span>
              <Send className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-black text-[#101010]">
              {myTotalReachouts.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#777777]">0% weight (Denominator)</div>
          </div>

          {/* 3. My Conversion Rate (50% wt) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Conv. Rate (50%)</span>
              <Percent className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-emerald-950">
              {myConversionRate}%
            </div>
            <div className="text-[10px] text-emerald-700 font-bold">{myTotalConversions} Orders Converted</div>
          </div>

          {/* 4. My Follow-ups (20% wt) */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Follow-ups (20%)</span>
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-blue-950">
              {myTotalFollowups}
            </div>
            <div className="text-[10px] text-blue-700 font-bold">Client Touchpoints</div>
          </div>

          {/* 5. My Order Value (30% wt) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-black uppercase tracking-wider">Order Value (30%)</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-amber-950">
              ${myTotalOrderValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-700 font-bold">Deal Size Revenue</div>
          </div>

          {/* 6. My Performance Score */}
          <div className="p-4 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#436320]">
              <span className="text-[10px] font-black uppercase tracking-wider">My Total Score</span>
              <Award className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-[#101010]">
              {myAvgScore} <span className="text-xs text-[#598327]">/100</span>
            </div>
            <div className="text-[10px] text-[#598327] font-bold">
              {myAvgScore >= 90 ? 'Platinum Tier' : myAvgScore >= 80 ? 'Gold Tier' : myAvgScore >= 70 ? 'Silver Tier' : 'Developing'}
            </div>
          </div>
        </div>
      )}

      {/* 5. INTEGRATED SALES LEADERBOARD SECTION */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#101010] tracking-tight">
                Sales Leaderboard Rankings
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8cc540]/20 text-[#436320]">
                {items.length} Performers
              </span>
            </div>
            <p className="text-xs text-[#666666]">
              Rankings computed automatically: 50% Conversion Rate, 20% Follow-ups, and 30% Order Value.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search member or profile..."
                className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none w-48 sm:w-60"
              />
            </div>

            {canAccessSection('sales.leaderboard') && (
              <button
                onClick={() => setSalesActiveTab('sales-leaderboard')}
                className="px-3 py-1.5 rounded-xl bg-[#f8faf6] hover:bg-[#edf4e8] border border-[#e2ebd9] text-xs font-bold text-[#436320] flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Full Leaderboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
              <tr>
                <th className="p-3.5 text-center">Rank</th>
                <th className="p-3.5">Sales Member</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Profile</th>
                <th className="p-3.5 text-right">Reachouts</th>
                <th className="p-3.5 text-right">Conv. Rate (50%)</th>
                <th className="p-3.5 text-right">Follow-ups (20%)</th>
                <th className="p-3.5 text-right">Order Value (30%)</th>
                <th className="p-3.5 text-right">Performance Score</th>
                <th className="p-3.5 text-center">Winner / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {displayItems.length > 0 ? (
                displayItems.map((item) => {
                  const isCurrentWinner = item.rank === 1;
                  const isMe = matchedMember?.id === item.employeeId;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleViewEmployee(item.employeeId)}
                      className={`hover:bg-[#f8faf6] cursor-pointer transition-colors ${
                        isMe ? 'bg-[#f5f9f0] border-l-4 border-l-[#8cc540]' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="p-3.5 text-center font-black">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                            item.rank === 1
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-[#101010] shadow-sm'
                              : item.rank === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300'
                              : item.rank === 3
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'text-[#666666]'
                          }`}
                        >
                          {item.rank === 1 ? <Crown className="w-4 h-4 fill-amber-300" /> : item.rank}
                        </span>
                      </td>

                      {/* Member Info */}
                      <td className="p-3.5 font-bold text-[#101010]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={item.employeeName}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-[#101010]">{item.employeeName}</span>
                              {isMe && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#8cc540] text-[#101010]">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#777777]">
                              {item.assignedProfiles ? item.assignedProfiles.join(', ') : item.profileCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3.5 font-bold text-[#555555]">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            item.department === 'IT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.department} Sales
                        </span>
                      </td>

                      {/* Profile */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                          {item.profileCode}
                        </span>
                      </td>

                      {/* Reachouts */}
                      <td className="p-3.5 text-right font-medium text-[#101010]">
                        {item.reachouts ?? item.totalReachout}
                      </td>

                      {/* Conversion Rate */}
                      <td className="p-3.5 text-right font-black text-emerald-800">
                        {item.conversionRate}%{' '}
                        <span className="text-[10px] font-normal text-emerald-600">
                          ({item.conversions ?? item.orderConvert} ord)
                        </span>
                      </td>

                      {/* Follow-ups */}
                      <td className="p-3.5 text-right font-medium text-blue-900">
                        {item.followups ?? item.followupSent}
                      </td>

                      {/* Order Value */}
                      <td className="p-3.5 text-right font-bold text-amber-900">
                        ${(item.orderValue || 0).toLocaleString()}
                      </td>

                      {/* Performance Score */}
                      <td className="p-3.5 text-right font-black text-base text-[#101010]">
                        {item.totalPerformanceScore}%
                      </td>

                      {/* Status / Winner Badge */}
                      <td className="p-3.5 text-center">
                        {isCurrentWinner ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-[#101010] inline-flex items-center gap-1 shadow-xs">
                            <Crown className="w-3 h-3 fill-[#101010]" /> WINNER
                          </span>
                        ) : item.rewardEligibility === 'Eligible' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Developing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-xs text-[#777777]">
                    No sales performers match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Performance Breakdown & Department Insights */}
      {canManageSales && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* IT Sales Department Card */}
          <div className="bg-white rounded-3xl border border-[#e2ebd9] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#101010]">IT Sales Performance</h3>
                  <p className="text-[11px] text-[#666666]">PR, WR, and HW Profiles</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
                {itDepartmentSummary?.activeCount ?? 0} Members
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f0f4ec] text-center">
              <div>
                <span className="text-[10px] text-[#777777] block">Avg Conv Rate</span>
                <span className="font-black text-emerald-800 text-sm">{itDepartmentSummary?.avgConversionRate ?? 0}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Total Revenue</span>
                <span className="font-black text-amber-800 text-sm">${(itDepartmentSummary?.totalOrderValue || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Avg Score</span>
                <span className="font-black text-[#101010] text-sm">{itDepartmentSummary?.avgScore ?? 0} pts</span>
              </div>
            </div>
          </div>

          {/* SMM Sales Department Card */}
          <div className="bg-white rounded-3xl border border-[#e2ebd9] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#101010]">SMM Sales Performance</h3>
                  <p className="text-[11px] text-[#666666]">DR and RR Profiles</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200">
                {smmDepartmentSummary?.activeCount ?? 0} Members
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f0f4ec] text-center">
              <div>
                <span className="text-[10px] text-[#777777] block">Avg Conv Rate</span>
                <span className="font-black text-emerald-800 text-sm">{smmDepartmentSummary?.avgConversionRate ?? 0}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Total Revenue</span>
                <span className="font-black text-amber-800 text-sm">${(smmDepartmentSummary?.totalOrderValue || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#777777] block">Avg Score</span>
                <span className="font-black text-[#101010] text-sm">{smmDepartmentSummary?.avgScore ?? 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT LOGS QUICK ACCESS SECTION */}
      {canAccessAuditLogs && (
        <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010] tracking-tight">
                  Sales Module Audit Logs & Compliance Trail
                </h3>
                <p className="text-xs text-[#666666]">
                  Restricted to Super Admin only. Records member creations, performance updates, and config changes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSalesActiveTab('sales-audit')}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>View Full Audit Logs ({auditLogs.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick List of Recent Audit Logs */}
          <div className="divide-y divide-[#f0f4ec] rounded-2xl border border-[#e2ebd9] overflow-hidden">
            {recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-[#f8faf6] hover:bg-white transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white border border-[#e2ebd9] text-[#436320]">
                      {log.actionCategory || 'Sales'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#101010]">{log.action}</p>
                      <p className="text-[11px] text-[#666666]">{log.details}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#777777] block flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-[#999999]" />
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-bold text-[#555555] block">
                      by {log.userName || 'Super Admin'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#777777]">
                No audit log activities recorded yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
