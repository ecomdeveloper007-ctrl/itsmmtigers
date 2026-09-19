import React from 'react';
import { useApp } from '../../context/AppContext';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { SalesEmployee } from '../../types/sales';
import { findMatchingSalesEmployee } from '../../utils/salesAuthUtils';
import {
  Layers,
  Briefcase,
  LayoutDashboard,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface MultiModulePerformanceCardProps {
  user?: UserProfile | null;
  salesEmployee?: SalesEmployee | null;
  userId?: string;
  className?: string;
  compact?: boolean;
}

export const MultiModulePerformanceCard: React.FC<MultiModulePerformanceCardProps> = ({
  user,
  salesEmployee,
  userId,
  className = '',
  compact = false,
}) => {
  const { allUsers } = useAuth();
  const {
    getMemberSummary,
    selectedMonth,
    selectedYear,
    setActiveModule,
    setActiveTab,
  } = useApp();
  const {
    salesEmployees,
    salesLeaderboardData,
    setSalesActiveTab,
  } = useSales();

  // Resolve target PM user
  const targetUser: UserProfile | undefined = React.useMemo(() => {
    if (user) return user;
    if (userId) {
      return allUsers.find(
        (u) =>
          u.uid.toLowerCase() === userId.toLowerCase() ||
          u.userId.toLowerCase() === userId.toLowerCase()
      );
    }
    if (salesEmployee) {
      return allUsers.find(
        (u) =>
          (salesEmployee.userId &&
            (u.userId.toLowerCase() === salesEmployee.userId.toLowerCase() ||
              u.uid.toLowerCase() === salesEmployee.userId.toLowerCase())) ||
          (salesEmployee.email &&
            u.email.toLowerCase() === salesEmployee.email.toLowerCase()) ||
          u.name.toLowerCase() === salesEmployee.name.toLowerCase()
      );
    }
    return undefined;
  }, [user, userId, salesEmployee, allUsers]);

  // Resolve target Sales employee
  const targetSalesEmp: SalesEmployee | undefined = React.useMemo(() => {
    if (salesEmployee) return salesEmployee;
    if (targetUser) {
      return findMatchingSalesEmployee(targetUser, salesEmployees);
    }
    if (userId) {
      return salesEmployees.find(
        (e) =>
          e.id.toLowerCase() === userId.toLowerCase() ||
          (e.userId && e.userId.toLowerCase() === userId.toLowerCase()) ||
          e.email.toLowerCase() === userId.toLowerCase()
      );
    }
    return undefined;
  }, [salesEmployee, targetUser, userId, salesEmployees]);

  // Determine eligibility
  const hasPmAssignment = Boolean(
    targetUser &&
      (targetUser.moduleAssignment === 'pm' ||
        targetUser.moduleAssignment === 'both' ||
        !targetUser.moduleAssignment)
  );

  const hasSalesAssignment = Boolean(
    targetSalesEmp &&
      (targetSalesEmp.moduleAssignment === 'sales' ||
        targetSalesEmp.moduleAssignment === 'both' ||
        targetUser?.moduleAssignment === 'sales' ||
        targetUser?.moduleAssignment === 'both' ||
        !targetSalesEmp.moduleAssignment)
  );

  const worksInBoth = hasPmAssignment && hasSalesAssignment;

  // Compute PM metrics
  const pmSummary = targetUser
    ? getMemberSummary(targetUser.uid) || getMemberSummary(targetUser.userId)
    : undefined;

  // Compute Sales metrics from leaderboard data
  const salesItem = targetSalesEmp
    ? salesLeaderboardData.items.find((i) => i.employeeId === targetSalesEmp.id)
    : undefined;

  // If the user does not work in both modules, do not render multi-module overall card
  if (!worksInBoth) {
    return null;
  }

  const pmScoreDisplay = pmSummary ? `${pmSummary.finalScoreDisplay}%` : 'Pending';
  const salesScoreDisplay = salesItem
    ? `${salesItem.totalPerformanceScore}%`
    : 'Pending';

  const isSalesWinner = salesItem?.rank === 1;
  const isPmWinner = pmSummary?.rank === 1;

  if (compact) {
    return (
      <div className={`p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] shadow-xs space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#598327]" />
            <span className="text-[11px] font-black text-[#101010] uppercase tracking-wider">
              Overall Performance
            </span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase">
            Both Modules
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Sales Score */}
          <div className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#666666] mb-0.5">
              <Briefcase className="w-3 h-3 text-emerald-600" />
              <span>Sales</span>
            </div>
            <span className="text-base font-black text-[#101010]">{salesScoreDisplay}</span>
            {isSalesWinner && (
              <span className="text-[9px] font-black text-amber-700 block mt-0.5">
                🏆 Winner
              </span>
            )}
          </div>

          {/* PM Score */}
          <div className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#666666] mb-0.5">
              <LayoutDashboard className="w-3 h-3 text-blue-600" />
              <span>Project Mgmt</span>
            </div>
            <span className="text-base font-black text-[#101010]">{pmScoreDisplay}</span>
            {isPmWinner && (
              <span className="text-[9px] font-black text-amber-700 block mt-0.5">
                🏆 Winner
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-white border border-[#e2ebd9] p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2ebd9] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40 shadow-xs">
            <Layers className="w-5 h-5 text-[#598327]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-[#101010] uppercase tracking-wide">
                Overall Performance
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 tracking-wider">
                Multi-Module Performer
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-0.5 font-medium">
              Separate performance scores for <strong className="text-[#101010]">{selectedMonth} {selectedYear}</strong>. Scores are tracked independently and never merged.
            </p>
          </div>
        </div>

        {/* Both Winners Milestone Badge */}
        {isSalesWinner && isPmWinner && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-[#101010] shadow-sm flex items-center gap-1.5 animate-pulse">
            <Trophy className="w-4 h-4 fill-[#101010]" />
            <span>Dual Champion (Sales & PM Winner)</span>
          </span>
        )}
      </div>

      {/* Two Separate Side-by-Side Module Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Sales Performance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] shadow-xs space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-[#101010] uppercase tracking-wider block">
                  Sales Module
                </span>
                <span className="text-[10px] text-[#666666] font-medium">
                  {targetSalesEmp?.department} Sales • Profile {targetSalesEmp?.profileCode || 'PR'}
                </span>
              </div>
            </div>

            {isSalesWinner ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-[#101010] shadow-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 fill-[#101010]" /> Sales Winner
              </span>
            ) : salesItem?.rank ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/30">
                Rank #{salesItem.rank}
              </span>
            ) : null}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                {salesScoreDisplay}
              </span>
              <span className="text-xs font-bold text-[#666666] ml-2">Sales Score</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white text-[#436320] border border-[#e2ebd9] shadow-xs">
              {salesItem?.performanceBand || 'Active Member'}
            </span>
          </div>

          {/* Key Sales Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e2ebd9] text-center">
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Conv. Rate (50%)</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {salesItem ? `${salesItem.conversionRate}%` : '-'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Follow-ups (20%)</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {salesItem?.followups ?? '-'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Order Value (30%)</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {salesItem?.orderValue ? `$${salesItem.orderValue.toLocaleString()}` : '-'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveModule('sales');
              setSalesActiveTab('sales-my-performance');
            }}
            className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#edf4e8] text-[#436320] border border-[#e2ebd9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Sales Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module 2: Project Management Performance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] shadow-xs space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-[#101010] uppercase tracking-wider block">
                  Project Management
                </span>
                <span className="text-[10px] text-[#666666] font-medium">
                  {targetUser?.team || targetUser?.department || 'Operations'} • {targetUser?.profileCode || 'PR'}
                </span>
              </div>
            </div>

            {isPmWinner ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-[#101010] shadow-xs flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 fill-[#101010]" /> PM Winner
              </span>
            ) : pmSummary?.rank ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Rank #{pmSummary.rank}
              </span>
            ) : null}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                {pmScoreDisplay}
              </span>
              <span className="text-xs font-bold text-[#666666] ml-2">PM Score</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white text-blue-700 border border-[#e2ebd9] shadow-xs">
              {pmSummary?.performanceBand || 'Active Member'}
            </span>
          </div>

          {/* Key PM Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#e2ebd9] text-center">
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Projects Closed</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {pmSummary?.projectClosed ?? '-'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Revenue</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {pmSummary?.revenueGenerated ? `$${pmSummary.revenueGenerated.toLocaleString()}` : '-'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-[#e2ebd9]">
              <span className="text-[10px] text-[#666666] block font-medium">Upsells</span>
              <span className="text-xs sm:text-sm font-black text-[#101010]">
                {pmSummary?.upsells ?? '-'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveModule('pm');
              setActiveTab('my-performance');
            }}
            className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-[#e2ebd9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View PM Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Independent evaluation disclaimer */}
      <div className="flex items-center justify-between text-[11px] text-[#777777] pt-1">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#598327]" />
          Scores are measured independently using their respective module formulas. No blended or arbitrary average is applied.
        </span>
      </div>
    </div>
  );
};
