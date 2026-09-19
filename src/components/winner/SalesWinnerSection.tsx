import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { calculateSalesLeaderboard } from '../../services/salesCalculationService';
import { SalesDepartment } from '../../types/sales';
import {
  Trophy,
  Crown,
  Sparkles,
  TrendingUp,
  Briefcase,
  Users,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface SalesWinnerSectionProps {
  onSelectEmployee?: (empId: string) => void;
}

export const SalesWinnerSection: React.FC<SalesWinnerSectionProps> = ({ onSelectEmployee }) => {
  const {
    salesEmployees,
    salesRecords,
    salesSettings,
    selectedPeriodType: initialPeriodType,
    selectedWeek: initialWeek,
    selectedDate: initialDate,
    setSelectedEmployeeForDetail,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  // Period filter states: daily, weekly, monthly
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>(
    initialPeriodType || 'weekly'
  );
  const [selectedWeek, setSelectedWeek] = useState<string>(
    initialWeek && initialWeek !== 'all' ? initialWeek : 'Week 1'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || '2026-09-07'
  );

  // Department / division filter
  const [salesDivision, setSalesDivision] = useState<'all' | 'IT' | 'SMM'>('all');

  // Compute leaderboard with existing calculation logic
  const dataset = useMemo(() => {
    return calculateSalesLeaderboard(
      salesEmployees,
      salesRecords,
      salesSettings,
      selectedMonth,
      selectedYear,
      periodType === 'weekly' ? selectedWeek : 'all',
      salesDivision,
      'all',
      'all',
      '',
      periodType,
      periodType === 'daily' ? selectedDate : undefined
    );
  }, [
    salesEmployees,
    salesRecords,
    salesSettings,
    selectedMonth,
    selectedYear,
    periodType,
    selectedWeek,
    selectedDate,
    salesDivision,
  ]);

  const { winner, top3, items } = dataset;

  const handleEmpClick = (empId: string) => {
    const emp = salesEmployees.find((e) => e.id === empId);
    if (emp) {
      setSelectedEmployeeForDetail(emp);
    }
    if (onSelectEmployee) {
      onSelectEmployee(empId);
    }
  };

  const periodLabel = useMemo(() => {
    if (periodType === 'daily') return `Day of ${selectedDate} (${selectedMonth} ${selectedYear})`;
    if (periodType === 'weekly') return `${selectedWeek} • ${selectedMonth} ${selectedYear}`;
    return `Full Month: ${selectedMonth} ${selectedYear}`;
  }, [periodType, selectedDate, selectedWeek, selectedMonth, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Sales Winner Headline & Period Controls */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f3f8ef] border border-[#8cc540]/50 text-[#436320] text-xs font-black tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          SALES PERFORMANCE RECOGNITION
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-[#101010] uppercase tracking-tight">
          {salesDivision === 'IT'
            ? 'IT SALES CHAMPION'
            : salesDivision === 'SMM'
            ? 'SMM SALES CHAMPION'
            : 'SALES WINNER OF THE PERIOD'}
        </h1>

        <p className="text-sm text-[#666666] font-semibold">
          Performance Period: <strong className="text-[#101010]">{periodLabel}</strong>
        </p>

        {/* Existing Performance Period Switcher: Daily / Weekly / Monthly */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 print:hidden">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#f0f4ec] border border-[#e2ebd9]">
            <button
              type="button"
              onClick={() => setPeriodType('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                periodType === 'daily'
                  ? 'bg-white text-[#101010] shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              📅 Daily
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                periodType === 'weekly'
                  ? 'bg-white text-[#101010] shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              📊 Weekly
            </button>
            <button
              type="button"
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                periodType === 'monthly'
                  ? 'bg-white text-[#101010] shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              🏆 Monthly
            </button>
          </div>

          {/* Sub-selectors depending on period */}
          {periodType === 'weekly' && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-white border border-[#e2ebd9] rounded-xl px-3 py-1.5 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
            >
              <option value="Week 1">Week 1</option>
              <option value="Week 2">Week 2</option>
              <option value="Week 3">Week 3</option>
              <option value="Week 4">Week 4</option>
              <option value="Week 5">Week 5</option>
            </select>
          )}

          {periodType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-[#e2ebd9] rounded-xl px-3 py-1 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
            />
          )}
        </div>

        {/* Division Switching Buttons */}
        <div className="flex items-center justify-center gap-2 pt-1 print:hidden">
          <button
            type="button"
            onClick={() => setSalesDivision('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              salesDivision === 'all'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
            }`}
          >
            🌟 Overall Sales Winner
          </button>
          <button
            type="button"
            onClick={() => setSalesDivision('IT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              salesDivision === 'IT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
            }`}
          >
            💻 IT Sales Winner
          </button>
          <button
            type="button"
            onClick={() => setSalesDivision('SMM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              salesDivision === 'SMM'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
            }`}
          >
            📱 SMM Sales Winner
          </button>
        </div>
      </div>

      {winner ? (
        <>
          {/* Grand Champion Spotlight Card (Rank 1 - Gold) */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-[#f8faf6] border-2 border-[#8cc540] p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              {/* Winner Avatar with Crown */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-[#8cc540] shadow-md">
                  <img
                    src={
                      winner.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={winner.employeeName}
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg text-[#101010] ring-4 ring-white">
                  <Crown className="w-6 h-6 text-[#101010] fill-[#101010]" />
                </div>
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-[#101010] shadow-sm uppercase tracking-wider">
                    🥇 Rank #1
                  </span>
                </div>
              </div>

              {/* Winner Info & Final Score */}
              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40 text-xs font-black">
                  <Award className="w-3.5 h-3.5" /> Sales Performance Champion
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight truncate">
                  {winner.employeeName}
                </h2>
                <p className="text-xs sm:text-sm text-[#666666] font-medium">
                  {winner.department} Sales • Profile{' '}
                  <strong className="text-[#101010]">{winner.profileCode}</strong>
                  {winner.joiningDate && (
                    <span className="text-[#888888] ml-2">Joined {winner.joiningDate}</span>
                  )}
                </p>

                {/* Score & Reward Tier Display */}
                <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <div className="px-4 py-2 rounded-xl bg-white border border-[#e2ebd9] shadow-sm">
                    <span className="text-[11px] font-black text-[#666666] uppercase tracking-wider block">
                      Sales Score
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                        {winner.totalPerformanceScore}%
                      </span>
                      <span className="text-sm font-bold text-[#888888]">/ 100</span>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/40 shadow-sm">
                    <span className="text-[11px] font-black text-[#436320] uppercase tracking-wider block">
                      Performance Tier
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-[#436320]">
                        {winner.performanceBand}
                      </span>
                    </div>
                  </div>

                  {winner.rewardAmount > 0 && (
                    <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                      <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                        Cash Reward
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-900">
                        {salesSettings.currencySymbol || '₹'}
                        {winner.rewardAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Champion KPI Metric Cards (50% Conversion, 20% Follow-ups, 30% Order Value, Reachouts) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#e2ebd9]">
              {/* Conversion Rate (50%) */}
              <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] text-center shadow-xs">
                <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] uppercase font-black">Conv. Rate (50%)</p>
                <p className="text-lg font-black text-[#101010]">{winner.conversionRate}%</p>
                <span className="text-[10px] text-[#436320] font-bold block truncate">
                  Score: {winner.conversionScore.toFixed(1)} pts
                </span>
              </div>

              {/* Follow-ups (20%) */}
              <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] text-center shadow-xs">
                <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] uppercase font-black">Follow-ups (20%)</p>
                <p className="text-lg font-black text-[#101010]">{winner.followups}</p>
                <span className="text-[10px] text-[#436320] font-bold block truncate">
                  Score: {winner.followupScore.toFixed(1)} pts
                </span>
              </div>

              {/* Order Value (30%) */}
              <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] text-center shadow-xs">
                <Briefcase className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] uppercase font-black">Order Value (30%)</p>
                <p className="text-lg font-black text-[#101010]">
                  {salesSettings.currencySymbol || '₹'}
                  {winner.orderValue.toLocaleString()}
                </p>
                <span className="text-[10px] text-[#436320] font-bold block truncate">
                  Score: {winner.orderValueScore.toFixed(1)} pts
                </span>
              </div>

              {/* Reachouts & Conversions (Activity Benchmark) */}
              <div className="p-3 rounded-xl bg-white border border-[#e2ebd9] text-center shadow-xs">
                <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-[10px] text-[#666666] uppercase font-black">Won / Reachouts</p>
                <p className="text-lg font-black text-[#101010]">
                  {winner.conversions} / {winner.reachouts}
                </p>
                <span className="text-[10px] text-[#888888] font-bold block truncate">
                  0% score weight
                </span>
              </div>
            </div>
          </div>

          {/* Runners-Up Podium Cards (Rank 2 & Rank 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rank 2 (Silver) */}
            {top3[1] && (
              <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={
                        top3[1].avatarUrl ||
                        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={top3[1].employeeName}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-300 shadow-sm"
                    />
                    <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-[#101010] uppercase shadow-xs">
                      🥈 Rank 2
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-black text-[#666666]">
                      1st Runner Up • {top3[1].department} ({top3[1].profileCode})
                    </span>
                    <h3 className="text-lg font-black text-[#101010] truncate">
                      {top3[1].employeeName}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-[#101010]">
                        {top3[1].totalPerformanceScore}%
                      </span>
                      <span className="text-xs text-[#888888] font-bold">/ 100</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f3f8ef] text-[#436320]">
                        {top3[1].performanceBand}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Conv. Rate</span>
                    <span className="font-black text-[#101010]">{top3[1].conversionRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Follow-ups</span>
                    <span className="font-black text-[#101010]">{top3[1].followups}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Order Value</span>
                    <span className="font-black text-[#101010]">
                      {salesSettings.currencySymbol || '₹'}
                      {top3[1].orderValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3[2] && (
              <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={
                        top3[2].avatarUrl ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={top3[2].employeeName}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-amber-600 shadow-sm"
                    />
                    <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase shadow-xs">
                      🥉 Rank 3
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-black text-amber-700">
                      2nd Runner Up • {top3[2].department} ({top3[2].profileCode})
                    </span>
                    <h3 className="text-lg font-black text-[#101010] truncate">
                      {top3[2].employeeName}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-[#101010]">
                        {top3[2].totalPerformanceScore}%
                      </span>
                      <span className="text-xs text-[#888888] font-bold">/ 100</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f3f8ef] text-[#436320]">
                        {top3[2].performanceBand}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Conv. Rate</span>
                    <span className="font-black text-[#101010]">{top3[2].conversionRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Follow-ups</span>
                    <span className="font-black text-[#101010]">{top3[2].followups}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] font-medium block">Order Value</span>
                    <span className="font-black text-[#101010]">
                      {salesSettings.currencySymbol || '₹'}
                      {top3[2].orderValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complete Sales Leaderboard Preview Strip */}
          {items.length > 3 && (
            <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-[#666666] uppercase tracking-wider">
                  Top Contenders & Rankings
                </h4>
                <span className="text-[11px] text-[#888888] font-medium">
                  {items.length} Performers Ranked
                </span>
              </div>
              <div className="space-y-1.5">
                {items.slice(3, 10).map((item) => (
                  <div
                    key={item.employeeId}
                    onClick={() => handleEmpClick(item.employeeId)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#f3f8ef] border border-[#e2ebd9] text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-black text-[#666666] w-6 shrink-0">#{item.rank}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-[#101010] truncate block">
                          {item.employeeName}
                        </span>
                        <span className="text-[10px] text-[#777777]">
                          {item.department} • {item.profileCode}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[#666666] font-medium hidden sm:inline">
                        Conv: {item.conversionRate}%
                      </span>
                      <span className="text-[#666666] font-medium hidden sm:inline">
                        {salesSettings.currencySymbol || '₹'}{item.orderValue.toLocaleString()}
                      </span>
                      <span className="font-black text-[#436320] text-sm">
                        {item.totalPerformanceScore}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#888888]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-[#666666] bg-[#f8faf6] rounded-2xl border border-[#e2ebd9]">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#8cc540]" />
          <p className="text-sm font-bold text-[#101010]">
            No Sales performance records found for {periodLabel}.
          </p>
          <p className="text-xs text-[#777777] mt-1">
            Try choosing a different week, day, or monthly view above to see recorded winners.
          </p>
        </div>
      )}

      {/* Recognition Footer Note */}
      <div className="text-center pt-2 border-t border-[#e2ebd9]">
        <p className="text-xs text-[#666666] font-medium flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#598327]" />
          Evaluated automatically by the <strong className="text-[#101010]">IT SMM Tigers Platform</strong> using verified weights: 50% Conv. Rate • 20% Follow-ups • 30% Order Value.
        </p>
      </div>
    </div>
  );
};
