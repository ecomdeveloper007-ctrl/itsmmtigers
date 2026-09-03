import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Building,
  Target,
  Users,
  Award,
  Trophy,
  Percent,
  CheckCircle2,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { SalesProfileCode, SALES_PROFILES_META } from '../../types/sales';
import { getProfileSettings } from '../../services/salesCalculationService';

export const SalesProfilePerformanceView: React.FC = () => {
  const {
    profileSummaries,
    salesSettings,
    salesEmployees,
    salesRecords,
    setSalesActiveTab,
    setSelectedProfile,
    setSelectedEmployeeForDetail,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const [selectedDeptTab, setSelectedDeptTab] = useState<'all' | 'IT' | 'SMM'>('all');

  const profileCodes: SalesProfileCode[] =
    selectedDeptTab === 'IT'
      ? ['PR', 'WR', 'HW']
      : selectedDeptTab === 'SMM'
      ? ['DR', 'RR']
      : ['PR', 'WR', 'HW', 'DR', 'RR'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Profile Performance Analysis
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Profiles & Fair Target Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Role-specific evaluation targets ensuring fair comparisons across distinct IT and SMM functions
          </p>
        </div>

        <button
          onClick={() => setSalesActiveTab('sales-settings')}
          className="px-4 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-black text-xs border border-[#e2ebd9] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-[#598327]" />
          <span>Adjust Profile Targets</span>
        </button>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDeptTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            selectedDeptTab === 'all'
              ? 'bg-[#101010] text-white shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          All 5 Sales Profiles
        </button>
        <button
          onClick={() => setSelectedDeptTab('IT')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedDeptTab === 'IT'
              ? 'bg-[#8cc540] text-[#101010] shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>IT Profiles (PR, WR, HW)</span>
        </button>
        <button
          onClick={() => setSelectedDeptTab('SMM')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedDeptTab === 'SMM'
              ? 'bg-[#8cc540] text-[#101010] shadow-sm'
              : 'bg-white text-[#555555] border border-[#e2ebd9] hover:bg-[#f8faf6]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>SMM Profiles (DR, RR)</span>
        </button>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {profileCodes.map((code) => {
          const summary = profileSummaries[code];
          const config = getProfileSettings(salesSettings, code);
          const meta = SALES_PROFILES_META[code];
          const emps = salesEmployees.filter((e) => e.profileCode === code && e.status === 'active');

          return (
            <div
              key={code}
              className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-5 hover:border-[#8cc540] transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                      {code} Profile
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        config.department === 'IT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {config.department} Sales
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#101010] mt-1.5">{meta.name}</h3>
                  <p className="text-xs text-[#666666] mt-0.5">{meta.description}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#777777] font-bold block">Assigned Reps</span>
                  <span className="text-xl font-black text-[#101010]">{summary.employeeCount}</span>
                </div>
              </div>

              {/* Performance Key Index */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center">
                <div>
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">Avg Score</span>
                  <span className="text-lg font-black text-[#101010]">{summary.avgScore} <span className="text-xs text-[#598327]">/ 100</span></span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">Conversion Rate</span>
                  <span className="text-lg font-black text-emerald-700">{summary.avgConversionRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#666666] uppercase block">Total Rewards</span>
                  <span className="text-lg font-black text-[#436320]">
                    {salesSettings.currencySymbol}{(summary.totalRewards ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Targets vs Actual Averages */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#666666]">
                  <span>Metric Performance Breakdown</span>
                  <span>Avg Actual / Target (Weight)</span>
                </div>

                {/* Reachout */}
                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] flex items-center justify-between">
                  <span className="font-bold text-[#101010]">1. Total Reachout</span>
                  <div className="text-right">
                    <span className="font-black text-[#101010]">{summary.avgReachout}</span>
                    <span className="text-[#666666]"> / {config.reachoutTarget} ({config.reachoutWeight} pts)</span>
                  </div>
                </div>

                {/* Orders */}
                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] flex items-center justify-between">
                  <span className="font-bold text-[#101010]">2. Order Convert</span>
                  <div className="text-right">
                    <span className="font-black text-[#436320]">{summary.avgOrders}</span>
                    <span className="text-[#666666]"> / {config.orderConvertTarget} ({config.orderConvertWeight} pts)</span>
                  </div>
                </div>

                {/* Repeat Orders */}
                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] flex items-center justify-between">
                  <span className="font-bold text-[#101010]">3. Repeat Orders</span>
                  <div className="text-right">
                    <span className="font-black text-[#101010]">{summary.avgRepeatOrders}</span>
                    <span className="text-[#666666]"> / {config.repeatOrdersTarget} ({config.repeatOrdersWeight} pts)</span>
                  </div>
                </div>

                {/* Follow-ups */}
                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] flex items-center justify-between">
                  <span className="font-bold text-[#101010]">4. Follow-up Sent</span>
                  <div className="text-right">
                    <span className="font-black text-[#101010]">{summary.avgFollowups}</span>
                    <span className="text-[#666666]"> / {config.followupTarget} ({config.followupWeight} pts)</span>
                  </div>
                </div>
              </div>

              {/* Roster & Quick Link */}
              <div className="pt-2 border-t border-[#e2ebd9] flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  {emps.map((e) => (
                    <img
                      key={e.id}
                      src={e.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={e.name}
                      title={e.name}
                      onClick={() => setSelectedEmployeeForDetail(e)}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white cursor-pointer hover:scale-110 transition-transform"
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedProfile(code);
                    setSalesActiveTab('sales-leaderboard');
                  }}
                  className="text-xs font-bold text-[#436320] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter Leaderboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
