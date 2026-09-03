import React from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Sparkles,
  Users,
  Send,
  ShoppingBag,
  RotateCcw,
  MessageSquare,
  Percent,
  Award,
  Trophy,
  ChevronRight,
} from 'lucide-react';

export const SalesDepartmentPerformanceView: React.FC = () => {
  const {
    itDepartmentSummary,
    smmDepartmentSummary,
    salesSettings,
    setSelectedDepartment,
    setSalesActiveTab,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const it = itDepartmentSummary;
  const smm = smmDepartmentSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Department Performance Comparison
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            IT Sales vs SMM Sales Performance
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Departmental analysis comparing software delivery pipelines against social media retainer growth
          </p>
        </div>
      </div>

      {/* 2 Big Department Cards Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. IT Sales Department */}
        <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#101010]">IT Sales Division</h2>
                <p className="text-xs text-[#666666]">
                  Profiles: PR (Solutions), WR (Web Eng), HW (Cloud Infra)
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
              {it.employeeCount} Reps
            </span>
          </div>

          {/* IT Primary Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
              <span className="text-[10px] font-bold text-[#666666] uppercase block">Conversion Rate</span>
              <span className="text-2xl font-black text-emerald-700">{it.overallConversionRate}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40">
              <span className="text-[10px] font-bold text-[#436320] uppercase block">Avg Score</span>
              <span className="text-2xl font-black text-[#101010]">{it.avgScore} <span className="text-xs text-[#598327]">/ 100</span></span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Rewards</span>
              <span className="text-2xl font-black text-emerald-950">
                {salesSettings.currencySymbol}{(it.totalRewards ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Metric Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Reachout</span>
              <span className="font-black text-sm text-[#101010]">{(it.totalReachout ?? 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Orders Converted</span>
              <span className="font-black text-sm text-[#101010]">{it.totalOrders}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Repeat Orders</span>
              <span className="font-black text-sm text-[#101010]">{it.totalRepeatOrders}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Follow-ups</span>
              <span className="font-black text-sm text-[#101010]">{it.totalFollowups}</span>
            </div>
          </div>

          {/* Profile Breakdowns within IT */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider">
              IT Profile Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              {it.profiles.map((p) => (
                <div
                  key={p.profileCode}
                  className="p-3 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] flex items-center justify-between"
                >
                  <div>
                    <span className="font-black text-[#101010]">{p.profileCode} Profile</span>
                    <span className="text-[#666666] ml-2">({p.employeeCount} reps)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#101010]">{p.avgScore} pts</span>
                    <span className="text-[#598327] font-bold ml-2">({p.avgConversionRate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDepartment('IT');
              setSalesActiveTab('sales-leaderboard');
            }}
            className="w-full py-2.5 rounded-xl bg-[#f8faf6] hover:bg-[#edf4e8] border border-[#e2ebd9] text-xs font-black text-[#436320] flex items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span>View IT Sales Leaderboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2. SMM Sales Department */}
        <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#101010]">SMM Sales Division</h2>
                <p className="text-xs text-[#666666]">
                  Profiles: DR (Direct Response), RR (Retainers & Growth)
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-200">
              {smm.employeeCount} Reps
            </span>
          </div>

          {/* SMM Primary Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
              <span className="text-[10px] font-bold text-[#666666] uppercase block">Conversion Rate</span>
              <span className="text-2xl font-black text-emerald-700">{smm.overallConversionRate}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40">
              <span className="text-[10px] font-bold text-[#436320] uppercase block">Avg Score</span>
              <span className="text-2xl font-black text-[#101010]">{smm.avgScore} <span className="text-xs text-[#598327]">/ 100</span></span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Rewards</span>
              <span className="text-2xl font-black text-emerald-950">
                {salesSettings.currencySymbol}{(smm.totalRewards ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Metric Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Reachout</span>
              <span className="font-black text-sm text-[#101010]">{(smm.totalReachout ?? 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Orders Converted</span>
              <span className="font-black text-sm text-[#101010]">{smm.totalOrders}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Repeat Orders</span>
              <span className="font-black text-sm text-[#101010]">{smm.totalRepeatOrders}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#777777] block">Follow-ups</span>
              <span className="font-black text-sm text-[#101010]">{smm.totalFollowups}</span>
            </div>
          </div>

          {/* Profile Breakdowns within SMM */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider">
              SMM Profile Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              {smm.profiles.map((p) => (
                <div
                  key={p.profileCode}
                  className="p-3 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] flex items-center justify-between"
                >
                  <div>
                    <span className="font-black text-[#101010]">{p.profileCode} Profile</span>
                    <span className="text-[#666666] ml-2">({p.employeeCount} reps)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#101010]">{p.avgScore} pts</span>
                    <span className="text-[#598327] font-bold ml-2">({p.avgConversionRate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDepartment('SMM');
              setSalesActiveTab('sales-leaderboard');
            }}
            className="w-full py-2.5 rounded-xl bg-[#f8faf6] hover:bg-[#edf4e8] border border-[#e2ebd9] text-xs font-black text-[#436320] flex items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span>View SMM Sales Leaderboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
