import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingDown,
  Percent,
  Layers,
  Cpu,
  Globe,
  Share2,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProfileCode, IT_PROFILES, SMM_PROFILES, ALL_PROFILES } from '../../types';

export const ProfileRevenueAnalysisCard: React.FC = () => {
  const { leaderboardData, settings, selectedTeam } = useApp();
  const { revenueSummary, month, year, rankings } = leaderboardData;

  const [activeFilter, setActiveFilter] = useState<'all' | 'it' | 'smm'>('all');
  const [showMemberDetails, setShowMemberDetails] = useState<boolean>(false);

  const sym = settings.currencySymbol || '$';

  if (!revenueSummary) {
    return null;
  }

  // Active revenue context based on filter or selected team
  const currentFilter = selectedTeam === 'it' ? 'it' : selectedTeam === 'smm' ? 'smm' : activeFilter;

  const itData = revenueSummary?.itTeam || revenueSummary?.itRevenue || {
    grossRevenue: 0,
    platformFee: 0,
    netRevenue: 0,
    activeMembers: 0,
    totalProjects: 0,
  };
  const smmData = revenueSummary?.smmTeam || revenueSummary?.smmRevenue || {
    grossRevenue: 0,
    platformFee: 0,
    netRevenue: 0,
    activeMembers: 0,
    totalProjects: 0,
  };

  const displayGross =
    currentFilter === 'it'
      ? (itData.grossRevenue ?? 0)
      : currentFilter === 'smm'
      ? (smmData.grossRevenue ?? 0)
      : (revenueSummary.totalGrossRevenue ?? revenueSummary.grandTotal?.grossRevenue ?? 0);

  const displayFee =
    currentFilter === 'it'
      ? (itData.platformFee ?? 0)
      : currentFilter === 'smm'
      ? (smmData.platformFee ?? 0)
      : (revenueSummary.totalPlatformFee ?? revenueSummary.grandTotal?.platformFeeAmount ?? 0);

  const displayNet =
    currentFilter === 'it'
      ? (itData.netRevenue ?? 0)
      : currentFilter === 'smm'
      ? (smmData.netRevenue ?? 0)
      : (revenueSummary.totalNetRevenue ?? revenueSummary.grandTotal?.finalNetRevenue ?? 0);

  const displayTitle =
    currentFilter === 'it'
      ? 'IT Team (PR, WR, HW)'
      : currentFilter === 'smm'
      ? 'SMM Team (RR, DR)'
      : 'Overall Organization (IT + SMM)';

  return (
    <div
      id="profile-wise-revenue-section"
      className="rounded-3xl bg-white border border-[#e2ebd9] p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden"
    >
      {/* Ambient background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-[#598327]" />
            <span>Profile-Wise Revenue & Month-End Audit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
            Month-End Final Revenue (-20% Platform Fee)
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Profile breakdown for IT (PR, WR, HW) and SMM (RR, DR) with automated 20% platform charge deduction for {month} {year}
          </p>
        </div>

        {/* Filter Switcher */}
        {selectedTeam === 'all' && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f5f5f5] border border-[#e2ebd9]">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white text-[#101010] shadow-sm border border-[#e2ebd9]'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              Overall All Teams
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('it')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'it'
                  ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              💻 IT Profiles
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('smm')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'smm'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              📱 SMM Profiles
            </button>
          </div>
        )}
      </div>

      {/* Top 3 Executive Revenue Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-[#555555] uppercase tracking-wider">
            <span>Gross Revenue ({displayTitle})</span>
            <DollarSign className="w-4 h-4 text-[#598327]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight">
            {sym}{displayGross.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#666666] font-medium">
            Aggregate client contracts & project revenue before fee deduction
          </p>
        </div>

        {/* Platform Charge (-20%) */}
        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-black text-rose-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Platform Charge (-20%)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900">
              Fixed 20% Fee
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            -{sym}{displayFee.toLocaleString()}
          </p>
          <p className="text-[11px] text-rose-700/80 font-medium">
            20% operational and platform infrastructure charge automatically deducted
          </p>
        </div>

        {/* Final Month-End Net Revenue */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#8cc540]/20 via-[#8cc540]/10 to-white border-2 border-[#8cc540] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-[#436320] uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#598327]" />
              Month-End Final Revenue (Net)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8cc540] text-[#101010]">
              Take-Home / Net
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight">
            {sym}{displayNet.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#436320] font-bold">
            Final settlement revenue = Gross - 20% Platform Fee
          </p>
        </div>
      </div>

      {/* IT Team Profile-Wise Cards */}
      {(currentFilter === 'all' || currentFilter === 'it') && (
        <div className="space-y-3 pt-2 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-xs">
                💻
              </span>
              <h3 className="text-base font-black text-[#101010] uppercase tracking-wide">
                IT Team Profiles (PR, WR, HW)
              </h3>
              <span className="text-xs text-[#666666] font-medium">
                Subtotal Gross: {sym}{(itData.grossRevenue ?? 0).toLocaleString()} | Fee (-20%): -{sym}{(itData.platformFee ?? 0).toLocaleString()} | Final Net: <strong className="text-[#436320] font-black">{sym}{(itData.netRevenue ?? 0).toLocaleString()}</strong>
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#555555]">
              {itData.activeMembers ?? itData.memberCount ?? 0} Members • {itData.totalProjects ?? itData.projectCount ?? 0} Projects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['PR', 'WR', 'HW'] as const).map((code) => {
              const item = revenueSummary.profiles?.[code] || revenueSummary.profileBreakdown?.[code] || {
                grossRevenue: 0,
                platformFee: 0,
                netRevenue: 0,
                memberCount: 0,
                projectCount: 0,
              };
              const itShare = (itData.grossRevenue ?? 0) > 0 ? (item.grossRevenue / itData.grossRevenue) * 100 : 0;
              return (
                <div
                  key={code}
                  className="p-5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-blue-300 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 uppercase">
                          {code} Profile
                        </span>
                        <span className="text-xs font-bold text-[#101010]">
                          {ALL_PROFILES[code]?.title?.split(' ')?.[0] || `${code} Profile`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1 font-medium leading-snug">
                        {ALL_PROFILES[code]?.description || ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#e2ebd9]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666666]">Gross Revenue:</span>
                      <span className="font-black text-[#101010]">{sym}{(item.grossRevenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-rose-600">
                      <span>Platform Fee (-20%):</span>
                      <span className="font-bold">-{sym}{(item.platformFee ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-dashed border-[#e2ebd9]">
                      <span className="font-black text-[#436320]">Month-End Net:</span>
                      <span className="font-black text-[#436320] text-base">{sym}{(item.netRevenue ?? 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#777777] font-medium">
                    <span>{item.memberCount ?? 0} Team Members</span>
                    <span>{item.projectCount ?? 0} Projects Closed</span>
                  </div>

                  {/* IT Team Share Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#666666]">
                      <span>IT Share</span>
                      <span>{itShare.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(itShare, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SMM Team Profile-Wise Cards */}
      {(currentFilter === 'all' || currentFilter === 'smm') && (
        <div className="space-y-3 pt-2 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-black text-xs">
                📱
              </span>
              <h3 className="text-base font-black text-[#101010] uppercase tracking-wide">
                SMM Team Profiles (RR, DR)
              </h3>
              <span className="text-xs text-[#666666] font-medium">
                Subtotal Gross: {sym}{(smmData.grossRevenue ?? 0).toLocaleString()} | Fee (-20%): -{sym}{(smmData.platformFee ?? 0).toLocaleString()} | Final Net: <strong className="text-[#436320] font-black">{sym}{(smmData.netRevenue ?? 0).toLocaleString()}</strong>
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#555555]">
              {smmData.activeMembers ?? smmData.memberCount ?? 0} Members • {smmData.totalProjects ?? smmData.projectCount ?? 0} Projects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['RR', 'DR'] as const).map((code) => {
              const item = revenueSummary.profiles?.[code] || revenueSummary.profileBreakdown?.[code] || {
                grossRevenue: 0,
                platformFee: 0,
                netRevenue: 0,
                memberCount: 0,
                projectCount: 0,
              };
              const smmShare = (smmData.grossRevenue ?? 0) > 0 ? (item.grossRevenue / smmData.grossRevenue) * 100 : 0;
              return (
                <div
                  key={code}
                  className="p-5 rounded-2xl bg-white border border-[#e2ebd9] hover:border-purple-300 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 uppercase">
                          {code} Profile
                        </span>
                        <span className="text-xs font-bold text-[#101010]">
                          {ALL_PROFILES[code]?.title?.split(' ')?.[0] || `${code} Profile`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1 font-medium leading-snug">
                        {ALL_PROFILES[code]?.description || ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#e2ebd9]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#666666]">Gross Revenue:</span>
                      <span className="font-black text-[#101010]">{sym}{(item.grossRevenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-rose-600">
                      <span>Platform Fee (-20%):</span>
                      <span className="font-bold">-{sym}{(item.platformFee ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-dashed border-[#e2ebd9]">
                      <span className="font-black text-[#436320]">Month-End Net:</span>
                      <span className="font-black text-[#436320] text-base">{sym}{(item.netRevenue ?? 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#777777] font-medium">
                    <span>{item.memberCount ?? 0} Team Members</span>
                    <span>{item.projectCount ?? 0} Projects Closed</span>
                  </div>

                  {/* SMM Team Share Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-[#666666]">
                      <span>SMM Share</span>
                      <span>{smmShare.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(smmShare, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle Details of Members in Each Profile */}
      <div className="pt-2 border-t border-[#e2ebd9] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowMemberDetails(!showMemberDetails)}
          className="text-xs font-bold text-[#436320] hover:text-[#2d4315] flex items-center gap-1.5 cursor-pointer"
        >
          {showMemberDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{showMemberDetails ? 'Hide Profile Member Breakdown' : 'Show Members Assigned to Each Profile'}</span>
        </button>

        <span className="text-[11px] font-mono text-[#888888]">
          Automated -20% Platform Fee Calculation Active
        </span>
      </div>

      {showMemberDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {(['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[]).map((pCode) => {
            const profileMembers = (rankings || []).filter((m) => m.profileCode === pCode);
            const pInfo = ALL_PROFILES[pCode] || {
              code: pCode,
              label: pCode,
              fullName: `${pCode} Profile`,
              title: `${pCode} Profile`,
              team: pCode === 'RR' || pCode === 'DR' ? 'SMM' : 'IT',
              description: '',
              badgeBg: 'bg-slate-50',
              badgeText: 'text-slate-700',
              borderColor: 'border-slate-200',
            };
            return (
              <div
                key={pCode}
                className="p-3.5 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#101010] flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#8cc540]/30 text-[#436320] text-[10px] font-black uppercase">
                      {pCode}
                    </span>
                    <span>{pInfo.team} • {pInfo.title}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#666666]">
                    {profileMembers.length} member(s)
                  </span>
                </div>

                {profileMembers.length === 0 ? (
                  <p className="text-[11px] text-[#888888] italic">No members assigned yet</p>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {profileMembers.map((m) => {
                      const net = Math.round((m.revenueGenerated ?? 0) * 0.8);
                      return (
                        <div
                          key={m.userId}
                          className="flex items-center justify-between text-[11px] py-1 border-b border-[#e4ece0] last:border-0"
                        >
                          <span className="font-bold text-[#101010]">{m.userName}</span>
                          <div className="text-right">
                            <span className="text-[#436320] font-black">{sym}{net.toLocaleString()} net</span>
                            <span className="text-[10px] text-[#888888] block">Gross: {sym}{(m.revenueGenerated ?? 0).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
