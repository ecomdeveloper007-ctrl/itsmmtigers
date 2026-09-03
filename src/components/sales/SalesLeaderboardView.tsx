import React from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Search,
  Filter,
  Download,
  Plus,
  Crown,
  Sparkles,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpDown,
} from 'lucide-react';
import { SalesProfileCode } from '../../types/sales';

export const SalesLeaderboardView: React.FC = () => {
  const {
    salesLeaderboardData,
    selectedDepartment,
    setSelectedDepartment,
    selectedProfile,
    setSelectedProfile,
    selectedWeek,
    setSelectedWeek,
    salesSearchQuery,
    setSalesSearchQuery,
    openSalesEntryModal,
    setIsSalesImportModalOpen,
    setSelectedEmployeeForDetail,
    salesEmployees,
    salesSettings,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const items = salesLeaderboardData.items;

  const handleRowClick = (empId: string) => {
    const emp = salesEmployees.find((e) => e.id === empId);
    if (emp) setSelectedEmployeeForDetail(emp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Official Leaderboard
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear} ({selectedWeek})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Performance Rankings
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            50% Conversion Rate • 20% Follow-ups • 30% Order Value (Reachouts 0% weight)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openSalesEntryModal()}
            className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Performance</span>
          </button>
          <button
            onClick={() => setIsSalesImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#598327]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search member, profile, department..."
            value={salesSearchQuery}
            onChange={(e) => setSalesSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl text-xs font-medium text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Filter */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Weeks</option>
            <option value="Week 1">Week 1</option>
            <option value="Week 2">Week 2</option>
            <option value="Week 3">Week 3</option>
            <option value="Week 4">Week 4</option>
            <option value="Week 5">Week 5</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT Sales (PR, WR, HW)</option>
            <option value="SMM">SMM Sales (DR, RR)</option>
          </select>

          {/* Profile Filter */}
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Profiles</option>
            <option value="PR">PR Profile (IT)</option>
            <option value="WR">WR Profile (IT)</option>
            <option value="HW">HW Profile (IT)</option>
            <option value="DR">DR Profile (SMM)</option>
            <option value="RR">RR Profile (SMM)</option>
          </select>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
              <tr>
                <th className="p-4 text-center">Rank</th>
                <th className="p-4">Sales Member</th>
                <th className="p-4">Department & Profile</th>
                <th className="p-4 text-right">Reachouts (0%)</th>
                <th className="p-4 text-right">Conv. Rate (50%)</th>
                <th className="p-4 text-right">Follow-ups (20%)</th>
                <th className="p-4 text-right">Order Value (30%)</th>
                <th className="p-4 text-right">Score</th>
                <th className="p-4 text-right">Reward</th>
                <th className="p-4 text-center">Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item.employeeId)}
                    className="hover:bg-[#f8faf6] cursor-pointer transition-colors"
                  >
                    {/* Rank */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-800 border border-slate-300 font-bold'
                            : item.rank === 3
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                            : 'text-[#666666] font-medium'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Employee */}
                    <td className="p-4 font-bold text-[#101010]">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={item.employeeName}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                        />
                        <div>
                          <div className="font-black text-sm">{item.employeeName}</div>
                          <div className="text-[10px] text-[#777777] font-normal">{item.performanceBand}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Profile */}
                    <td className="p-4 font-bold text-[#555555]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            item.department === 'IT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.department}
                        </span>
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                          {item.profileCode}
                        </span>
                      </div>
                    </td>

                    {/* Reachouts */}
                    <td className="p-4 text-right font-medium text-[#101010]">
                      <div>{item.reachouts ?? item.totalReachout}</div>
                      <div className="text-[10px] text-[#777777]">0% wt</div>
                    </td>

                    {/* Conversion Rate */}
                    <td className="p-4 text-right">
                      <div className="font-black text-emerald-800 text-sm">
                        {item.conversionRate}%
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {item.conversionScore ?? item.orderConvertScore} / 50 pts ({item.conversions ?? item.orderConvert} ord)
                      </div>
                    </td>

                    {/* Follow-ups */}
                    <td className="p-4 text-right">
                      <div className="font-bold text-blue-900">
                        {item.followups ?? item.followupSent}
                      </div>
                      <div className="text-[10px] text-blue-700 font-medium">
                        {item.followupsScore ?? item.followupScore} / 20 pts
                      </div>
                    </td>

                    {/* Order Value */}
                    <td className="p-4 text-right">
                      <div className="font-bold text-amber-900">
                        ${(item.orderValue || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">
                        {item.orderValueScore ?? 0} / 30 pts
                      </div>
                    </td>

                    {/* Total Performance Score */}
                    <td className="p-4 text-right">
                      <span className="font-black text-base text-[#101010]">
                        {item.totalPerformanceScore}
                      </span>
                      <span className="text-[10px] text-[#598327] font-bold block">/ 100 PTS</span>
                    </td>

                    {/* Reward */}
                    <td className="p-4 text-right">
                      <div className="font-black text-sm text-[#436320]">
                        {salesSettings.currencySymbol}{(item.rewardAmount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-[#666666]">
                        {item.rewardLevel}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          item.rewardEligibility === 'Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.rewardEligibility === 'Eligible' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Benchmark Fail
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#777777]">
                    No sales rankings available for the selected filters.
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
