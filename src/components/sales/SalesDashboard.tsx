import React from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';
import { SalesLeaderboardItem } from '../../types/sales';

export const SalesDashboard: React.FC = () => {
  const {
    salesDashboardSummary,
    salesLeaderboardData,
    selectedDepartment,
    setSelectedDepartment,
    setSalesActiveTab,
    openSalesEntryModal,
    openSalesEmployeeModal,
    setIsSalesImportModalOpen,
    setSelectedEmployeeForDetail,
    salesEmployees,
    salesSettings,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const summary = salesDashboardSummary;
  const top3 = salesLeaderboardData.top3;
  const items = salesLeaderboardData.items;

  const handleViewEmployee = (empId: string) => {
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
              Sales Performance CRM
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Performance & Incentive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Real-time multi-tier evaluation across IT (PR, WR, HW) and SMM (DR, RR) sales divisions
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openSalesEntryModal()}
            className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Performance</span>
          </button>

          <button
            onClick={() => openSalesEmployeeModal()}
            className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#598327]" />
            <span>+ Employee</span>
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
        </div>
      </div>

      {/* Department Filter Selector Pills */}
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

      {/* 8 Primary Sales KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Employees */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Team Size</span>
            <Users className="w-3.5 h-3.5 text-[#598327]" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.totalEmployees}</div>
          <div className="text-[10px] text-[#777777]">Active Sales Reps</div>
        </div>

        {/* 2. Total Reachout */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Reachouts</span>
            <Send className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.totalReachout.toLocaleString()}</div>
          <div className="text-[10px] text-[#777777]">Proposals Sent</div>
        </div>

        {/* 3. Orders Converted */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.totalOrders}</div>
          <div className="text-[10px] text-emerald-700 font-bold">New Clients Closed</div>
        </div>

        {/* 4. Repeat Orders */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Repeats</span>
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.totalRepeatOrders}</div>
          <div className="text-[10px] text-[#777777]">Client Retainers</div>
        </div>

        {/* 5. Follow-ups */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#666666]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Follow-ups</span>
            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.totalFollowups}</div>
          <div className="text-[10px] text-[#777777]">Client Touchpoints</div>
        </div>

        {/* 6. Conversion Rate */}
        <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#8cc540]/40 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#436320]">
            <span className="text-[10px] font-black uppercase tracking-wider">Conversion</span>
            <Percent className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.overallConversionRate}%</div>
          <div className="text-[10px] text-[#598327] font-bold">Orders / Reachout</div>
        </div>

        {/* 7. Avg Performance Score */}
        <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/50 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#436320]">
            <span className="text-[10px] font-black uppercase tracking-wider">Avg Score</span>
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-[#101010]">{summary.avgScore} <span className="text-xs text-[#598327]">/100</span></div>
          <div className="text-[10px] text-[#598327] font-bold">Team Index</div>
        </div>

        {/* 8. Top Conversion Hurdle Achievers */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-black uppercase tracking-wider">Benchmark</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-black text-emerald-950">
            {summary.eligibleCount} / {summary.totalEmployees}
          </div>
          <div className="text-[10px] text-emerald-800 font-bold">Target Qualified</div>
        </div>
      </div>

      {/* Top Champions Podium & Department Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Overall Sales Winner */}
        {summary.topSalesPerformer ? (
          <div
            onClick={() => handleViewEmployee(summary.topSalesPerformer!.employeeId)}
            className="bg-gradient-to-br from-[#f5f9f0] to-[#e8f3de] border-2 border-[#8cc540] rounded-3xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#8cc540] text-[#101010] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Rank #1 Sales Performer
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
                <span className="text-[10px] text-[#666666] block">Reachout</span>
                <span className="font-black text-[#101010]">{summary.topSalesPerformer.totalReachout}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Orders</span>
                <span className="font-black text-[#101010]">{summary.topSalesPerformer.orderConvert}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Repeat</span>
                <span className="font-black text-[#101010]">{summary.topSalesPerformer.repeatOrders}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 2. Top IT Sales Performer */}
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
                  Conv: {summary.topItPerformer.conversionRate}% • Orders: {summary.topItPerformer.orderConvert}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#666666] block">Reachout</span>
                <span className="font-bold text-[#101010]">{summary.topItPerformer.totalReachout}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Orders</span>
                <span className="font-bold text-[#101010]">{summary.topItPerformer.orderConvert}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Repeat</span>
                <span className="font-bold text-[#101010]">{summary.topItPerformer.repeatOrders}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 3. Top SMM Sales Performer */}
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
                  Conv: {summary.topSmmPerformer.conversionRate}% • Orders: {summary.topSmmPerformer.orderConvert}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#666666] block">Reachout</span>
                <span className="font-bold text-[#101010]">{summary.topSmmPerformer.totalReachout}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Orders</span>
                <span className="font-bold text-[#101010]">{summary.topSmmPerformer.orderConvert}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] block">Repeat</span>
                <span className="font-bold text-[#101010]">{summary.topSmmPerformer.repeatOrders}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Metric Champions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.highestConversionPerformer && (
          <div
            onClick={() => handleViewEmployee(summary.highestConversionPerformer!.employeeId)}
            className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-[#8cc540] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-[#666666] uppercase block">🎯 Top Conversion Rate</span>
            <div className="text-sm font-black text-[#101010] mt-1">{summary.highestConversionPerformer.employeeName}</div>
            <div className="text-xs font-black text-emerald-700 mt-0.5">{summary.highestConversionPerformer.conversionRate}% Rate</div>
          </div>
        )}

        {summary.highestRepeatOrdersPerformer && (
          <div
            onClick={() => handleViewEmployee(summary.highestRepeatOrdersPerformer!.employeeId)}
            className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-[#8cc540] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-[#666666] uppercase block">🔄 Retainer Master</span>
            <div className="text-sm font-black text-[#101010] mt-1">{summary.highestRepeatOrdersPerformer.employeeName}</div>
            <div className="text-xs font-black text-purple-700 mt-0.5">{summary.highestRepeatOrdersPerformer.repeatOrders} Repeat Orders</div>
          </div>
        )}

        {summary.highestReachoutPerformer && (
          <div
            onClick={() => handleViewEmployee(summary.highestReachoutPerformer!.employeeId)}
            className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-[#8cc540] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-[#666666] uppercase block">📞 Highest Reachout</span>
            <div className="text-sm font-black text-[#101010] mt-1">{summary.highestReachoutPerformer.employeeName}</div>
            <div className="text-xs font-black text-blue-700 mt-0.5">{summary.highestReachoutPerformer.totalReachout} Reachouts</div>
          </div>
        )}

        {summary.highestFollowupPerformer && (
          <div
            onClick={() => handleViewEmployee(summary.highestFollowupPerformer!.employeeId)}
            className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-[#8cc540] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-bold text-[#666666] uppercase block">💬 Top Follow-up Drive</span>
            <div className="text-sm font-black text-[#101010] mt-1">{summary.highestFollowupPerformer.employeeName}</div>
            <div className="text-xs font-black text-amber-700 mt-0.5">{summary.highestFollowupPerformer.followupSent} Follow-ups</div>
          </div>
        )}
      </div>

      {/* Mini Leaderboard Table Preview */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#101010] tracking-tight">
              Monthly Sales Leaderboard
            </h2>
            <p className="text-xs text-[#666666]">
              Sorted by Performance Score, Conversion Rate, and Order Volume
            </p>
          </div>
          <button
            onClick={() => setSalesActiveTab('sales-leaderboard')}
            className="text-xs font-black text-[#436320] hover:text-[#335017] flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Leaderboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
              <tr>
                <th className="p-3.5 text-center">Rank</th>
                <th className="p-3.5">Sales Employee</th>
                <th className="p-3.5">Dept</th>
                <th className="p-3.5">Profile</th>
                <th className="p-3.5 text-right">Reachout</th>
                <th className="p-3.5 text-right">Orders</th>
                <th className="p-3.5 text-right">Repeat</th>
                <th className="p-3.5 text-right">Conv. Rate</th>
                <th className="p-3.5 text-right">Score</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {items.slice(0, 5).map((item) => (
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
                  <td className="p-3.5 text-right font-medium text-[#101010]">{item.totalReachout}</td>
                  <td className="p-3.5 text-right font-black text-[#101010]">{item.orderConvert}</td>
                  <td className="p-3.5 text-right font-medium text-[#101010]">{item.repeatOrders}</td>
                  <td className="p-3.5 text-right font-black text-emerald-700">{item.conversionRate}%</td>
                  <td className="p-3.5 text-right font-black text-[#101010]">{item.totalPerformanceScore}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        item.conversionRate >= 10
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.conversionRate >= 10 ? 'Met Target' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
