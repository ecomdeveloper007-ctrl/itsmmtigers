import React from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isUserSuperAdmin, findMatchingSalesEmployee } from '../../utils/salesAuthUtils';
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
} from 'lucide-react';
import { SalesLeaderboardItem } from '../../types/sales';

export const SalesDashboard: React.FC = () => {
  const {
    salesDashboardSummary,
    salesLeaderboardData,
    selectedDepartment,
    setSelectedDepartment,
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
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();
  const { currentUser } = useAuth();
  const isSuperAdmin = isUserSuperAdmin(currentUser);

  const matchedMember = findMatchingSalesEmployee(currentUser, salesEmployees);

  // Filter personal records for non-admin
  const myRecords = matchedMember
    ? salesRecords.filter(
        (r) =>
          r.employeeId === matchedMember.id &&
          r.month === selectedMonth &&
          Number(r.year) === Number(selectedYear) &&
          (selectedWeek === 'all' || r.week === selectedWeek)
      )
    : [];

  const myTotalReachouts = myRecords.reduce((acc, r) => acc + (r.reachouts || 0), 0);
  const myTotalConversions = myRecords.reduce((acc, r) => acc + (r.conversions || 0), 0);
  const myTotalFollowups = myRecords.reduce((acc, r) => acc + (r.followups || 0), 0);
  const myTotalOrderValue = myRecords.reduce((acc, r) => acc + (r.orderValue || 0), 0);
  const myConversionRate = myTotalReachouts > 0 ? Math.round((myTotalConversions / myTotalReachouts) * 1000) / 10 : 0;
  const myAvgScore = myRecords.length > 0 ? Math.round((myRecords.reduce((acc, r) => acc + (r.totalPerformanceScore || 0), 0) / myRecords.length) * 10) / 10 : 0;

  const summary = salesDashboardSummary;
  const top3 = salesLeaderboardData.top3;
  const items = salesLeaderboardData.items;

  const handleViewEmployee = (empId: string) => {
    // Sales members can only view their own detail
    if (!isSuperAdmin && matchedMember && empId !== matchedMember.id) {
      return;
    }
    const emp = salesEmployees.find((e) => e.id === empId);
    if (emp) setSelectedEmployeeForDetail(emp);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              {isSuperAdmin ? 'Sales CRM Dashboard' : 'My Sales Workspace'}
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear} ({selectedWeek})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            {isSuperAdmin ? 'Sales Multi-Profile Performance' : `Welcome back, ${matchedMember?.name || currentUser?.name || 'Sales Representative'}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            50% Conversion Rate • 20% Follow-ups • 30% Order Value • 0% Reachouts weight
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openSalesEntryModal(undefined, matchedMember?.id)}
            className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Performance</span>
          </button>

          {isSuperAdmin && (
            <>
              <button
                onClick={() => openSalesEmployeeModal()}
                className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#598327]" />
                <span>+ Member</span>
              </button>

              <button
                onClick={() => setIsSalesImportModalOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#598327]" />
                <span>Import/Export</span>
              </button>

              <button
                onClick={() => setSalesActiveTab('sales-settings')}
                className="p-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] border border-[#e2ebd9] transition-all cursor-pointer"
                title="Sales Settings"
              >
                <Sliders className="w-4 h-4 text-[#598327]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Week Selector / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isSuperAdmin ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDepartment('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                selectedDepartment === 'all'
                  ? 'bg-[#101010] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
              }`}
            >
              All Sales Teams ({salesEmployees.length})
            </button>
            <button
              onClick={() => setSelectedDepartment('IT')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedDepartment === 'IT'
                  ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                  : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>IT Sales (PR, WR, HW)</span>
            </button>
            <button
              onClick={() => setSelectedDepartment('SMM')}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedDepartment === 'SMM'
                  ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                  : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SMM Sales (DR, RR)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-[#f8faf6] border border-[#e2ebd9] rounded-2xl text-xs font-bold text-[#436320] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#598327]" />
              <span>Assigned Profiles: {(matchedMember?.assignedProfiles || ['PR']).join(', ')}</span>
            </span>
          </div>
        )}

        {/* Week Selector */}
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="bg-white border border-[#e2ebd9] rounded-2xl px-3.5 py-2 text-xs font-bold text-[#101010] shadow-xs focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
        >
          <option value="all">All Weeks Combined</option>
          <option value="Week 1">Week 1</option>
          <option value="Week 2">Week 2</option>
          <option value="Week 3">Week 3</option>
          <option value="Week 4">Week 4</option>
          <option value="Week 5">Week 5</option>
        </select>
      </div>

      {/* KPI Cards (Personalized for Member vs Team for Super Admin) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Scope / Assigned Profiles */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">{isSuperAdmin ? 'Team Size' : 'Profiles'}</span>
            <Users className="w-3.5 h-3.5 text-[#598327]" />
          </div>
          <div className="text-xl font-black text-[#101010]">
            {isSuperAdmin ? (summary.totalEmployees ?? 0) : (matchedMember?.assignedProfiles?.length || 1)}
          </div>
          <div className="text-[10px] text-[#777777]">{isSuperAdmin ? 'Sales Members' : 'Active Roles'}</div>
        </div>

        {/* 2. Total Reachouts */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Reachouts</span>
            <Send className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-black text-[#101010]">
            {(isSuperAdmin ? (summary.totalReachouts ?? summary.totalReachout ?? 0) : myTotalReachouts).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#777777]">0% weight (Denominator)</div>
        </div>

        {/* 3. Conversion Rate (50% wt) */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Conv. Rate (50%)</span>
            <Percent className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-emerald-950">
            {isSuperAdmin ? (summary.overallConversionRate ?? 0) : myConversionRate}%
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            {isSuperAdmin ? (summary.totalConversions ?? summary.totalOrders ?? 0) : myTotalConversions} Orders Converted
          </div>
        </div>

        {/* 4. Follow-ups (20% wt) */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Follow-ups (20%)</span>
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-blue-950">
            {isSuperAdmin ? (summary.totalFollowups ?? 0) : myTotalFollowups}
          </div>
          <div className="text-[10px] text-blue-700 font-bold">Client Touchpoints</div>
        </div>

        {/* 5. Order Value (30% wt) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Order Value (30%)</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-amber-950">
            ${(isSuperAdmin ? (summary.totalOrderValue || 0) : myTotalOrderValue).toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-700 font-bold">Total Deal Size</div>
        </div>

        {/* 6. Performance Score */}
        <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/50 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#436320]">
            <span className="text-[10px] font-black uppercase tracking-wider">{isSuperAdmin ? 'Avg Score' : 'My Score'}</span>
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-[#101010]">
            {isSuperAdmin ? (summary.avgScore ?? 0) : myAvgScore} <span className="text-xs text-[#598327]">/100</span>
          </div>
          <div className="text-[10px] text-[#598327] font-bold">{isSuperAdmin ? 'Team Index' : 'Weighted Index'}</div>
        </div>
      </div>

      {/* Super Admin Podium */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.topSalesPerformer ? (
            <div
              onClick={() => handleViewEmployee(summary.topSalesPerformer!.employeeId)}
              className="bg-gradient-to-br from-[#f5f9f0] to-[#e8f3de] border-2 border-[#8cc540] rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#8cc540] text-[#101010] flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> Rank #1 Top Performer
                </span>
                <span className="text-xs font-black text-[#436320]">
                  {summary.topSalesPerformer.totalPerformanceScore} PTS
                </span>
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <img
                  src={
                    summary.topSalesPerformer.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={summary.topSalesPerformer.employeeName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#8cc540] shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-black text-[#101010] group-hover:text-[#436320] transition-colors">
                    {summary.topSalesPerformer.employeeName}
                  </h3>
                  <p className="text-xs text-[#555555]">
                    {summary.topSalesPerformer.department} Sales • {summary.topSalesPerformer.profileCode} Profile
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-[#101010]">
                      Score: {summary.topSalesPerformer.totalPerformanceScore} pts
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      • Conv: {summary.topSalesPerformer.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#8cc540]/30 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#666666] block">Conversions</span>
                  <span className="font-black text-emerald-800">{summary.topSalesPerformer.conversions ?? summary.topSalesPerformer.orderConvert}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Follow-ups</span>
                  <span className="font-black text-blue-800">{summary.topSalesPerformer.followups ?? summary.topSalesPerformer.followupSent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Order Value</span>
                  <span className="font-black text-amber-800">${(summary.topSalesPerformer.orderValue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : null}

          {summary.topItPerformer ? (
            <div
              onClick={() => handleViewEmployee(summary.topItPerformer!.employeeId)}
              className="bg-white border border-[#e2ebd9] rounded-3xl p-5 shadow-xs hover:border-[#8cc540] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Building className="w-3 h-3" /> Top IT Sales Rep
                </span>
                <span className="text-xs font-black text-[#436320]">
                  {summary.topItPerformer.totalPerformanceScore} PTS
                </span>
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <img
                  src={
                    summary.topItPerformer.avatarUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={summary.topItPerformer.employeeName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-200"
                />
                <div>
                  <h3 className="text-base font-black text-[#101010] group-hover:text-blue-700 transition-colors">
                    {summary.topItPerformer.employeeName}
                  </h3>
                  <p className="text-xs text-[#666666]">
                    IT Sales • {summary.topItPerformer.profileCode} Profile
                  </p>
                  <p className="text-xs text-[#436320] font-bold mt-0.5">
                    Conv: {summary.topItPerformer.conversionRate}% • Score: {summary.topItPerformer.totalPerformanceScore} pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#666666] block">Conversions</span>
                  <span className="font-bold text-emerald-800">{summary.topItPerformer.conversions ?? summary.topItPerformer.orderConvert}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Follow-ups</span>
                  <span className="font-bold text-blue-800">{summary.topItPerformer.followups ?? summary.topItPerformer.followupSent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Order Value</span>
                  <span className="font-bold text-amber-800">${(summary.topItPerformer.orderValue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : null}

          {summary.topSmmPerformer ? (
            <div
              onClick={() => handleViewEmployee(summary.topSmmPerformer!.employeeId)}
              className="bg-white border border-[#e2ebd9] rounded-3xl p-5 shadow-xs hover:border-[#8cc540] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Top SMM Sales Rep
                </span>
                <span className="text-xs font-black text-[#436320]">
                  {summary.topSmmPerformer.totalPerformanceScore} PTS
                </span>
              </div>

              <div className="flex items-center gap-3.5 mt-4">
                <img
                  src={
                    summary.topSmmPerformer.avatarUrl ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={summary.topSmmPerformer.employeeName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-200"
                />
                <div>
                  <h3 className="text-base font-black text-[#101010] group-hover:text-purple-700 transition-colors">
                    {summary.topSmmPerformer.employeeName}
                  </h3>
                  <p className="text-xs text-[#666666]">
                    SMM Sales • {summary.topSmmPerformer.profileCode} Profile
                  </p>
                  <p className="text-xs text-[#436320] font-bold mt-0.5">
                    Conv: {summary.topSmmPerformer.conversionRate}% • Score: {summary.topSmmPerformer.totalPerformanceScore} pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#666666] block">Conversions</span>
                  <span className="font-bold text-emerald-800">{summary.topSmmPerformer.conversions ?? summary.topSmmPerformer.orderConvert}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Follow-ups</span>
                  <span className="font-bold text-blue-800">{summary.topSmmPerformer.followups ?? summary.topSmmPerformer.followupSent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] block">Order Value</span>
                  <span className="font-bold text-amber-800">${(summary.topSmmPerformer.orderValue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Summary Table Preview */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#101010] tracking-tight">
              {isSuperAdmin ? 'Monthly Sales Rankings Summary' : 'My Recent Performance Logs'}
            </h2>
            <p className="text-xs text-[#666666]">
              {isSuperAdmin
                ? 'Sorted by Performance Score, Conversion Rate (50%), Follow-ups (20%), and Order Value (30%)'
                : 'Your submitted performance logs for the selected period.'}
            </p>
          </div>
          <button
            onClick={() => setSalesActiveTab(isSuperAdmin ? 'sales-leaderboard' : 'sales-performance')}
            className="text-xs font-black text-[#436320] hover:text-[#335017] flex items-center gap-1 cursor-pointer"
          >
            <span>{isSuperAdmin ? 'View Full Leaderboard' : 'View All My Records'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
              <tr>
                {isSuperAdmin && <th className="p-3.5 text-center">Rank</th>}
                <th className="p-3.5">{isSuperAdmin ? 'Sales Member' : 'Week / Profile'}</th>
                <th className="p-3.5">Dept</th>
                <th className="p-3.5">Profile</th>
                <th className="p-3.5 text-right">Reachouts</th>
                <th className="p-3.5 text-right">Conv. Rate (50%)</th>
                <th className="p-3.5 text-right">Follow-ups (20%)</th>
                <th className="p-3.5 text-right">Order Value (30%)</th>
                <th className="p-3.5 text-right">Score</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {isSuperAdmin ? (
                items.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleViewEmployee(item.employeeId)}
                    className="hover:bg-[#f8faf6] cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 text-center font-black">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : item.rank === 3
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'text-[#666666]'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#101010]">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            item.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={item.employeeName}
                          className="w-7 h-7 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                        />
                        <span>{item.employeeName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-[#555555]">{item.department}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                        {item.profileCode}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-[#101010]">{item.reachouts ?? item.totalReachout}</td>
                    <td className="p-3.5 text-right font-black text-emerald-800">{item.conversionRate}% ({item.conversions ?? item.orderConvert} ord)</td>
                    <td className="p-3.5 text-right font-medium text-blue-900">{item.followups ?? item.followupSent}</td>
                    <td className="p-3.5 text-right font-bold text-amber-900">${(item.orderValue || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-black text-[#101010]">{item.totalPerformanceScore}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.rewardEligibility === 'Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.rewardEligibility === 'Eligible' ? 'Eligible' : 'Disqualified'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : myRecords.length > 0 ? (
                myRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#f8faf6] transition-colors">
                    <td className="p-3.5 font-bold text-[#101010]">
                      {rec.week} ({rec.month} {rec.year})
                    </td>
                    <td className="p-3.5 font-bold text-[#555555]">{rec.department}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                        {rec.profileCode}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-[#101010]">{rec.reachouts}</td>
                    <td className="p-3.5 text-right font-black text-emerald-800">{rec.conversionRate}% ({rec.conversions} ord)</td>
                    <td className="p-3.5 text-right font-medium text-blue-900">{rec.followups}</td>
                    <td className="p-3.5 text-right font-bold text-amber-900">${(rec.orderValue || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-black text-[#101010]">{rec.totalPerformanceScore}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          rec.rewardEligibility === 'Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.rewardEligibility === 'Eligible' ? 'Eligible' : 'Disqualified'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-xs text-[#777777]">
                    No performance records recorded for this week. Click "Enter Performance" above to submit your performance log.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
