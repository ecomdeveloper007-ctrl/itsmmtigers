import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Medal,
  Search,
  ArrowUpDown,
  TrendingUp,
  Star,
  DollarSign,
  Briefcase,
  User,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { MemberPerformanceSummary } from '../../types';

interface LeaderboardTableProps {
  onSelectMember?: (member: MemberPerformanceSummary) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ onSelectMember }) => {
  const { leaderboardData, settings, searchQuery, setSearchQuery, setActiveTab } = useApp();
  const { rankings, month, year, periodFilter } = leaderboardData;

  const [sortBy, setSortBy] = useState<'score' | 'revenue' | 'projects' | 'upsells' | 'rank'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');

  const filteredRankings = useMemo(() => {
    return rankings
      .filter((m) => {
        const matchesSearch =
          m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.userId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBand = bandFilter === 'all' || m.performanceBand === bandFilter;
        const matchesProfile =
          profileFilter === 'all' ||
          (m.profileCode || (m.team === 'IT' ? 'PR' : 'RR')) === profileFilter;
        return matchesSearch && matchesBand && matchesProfile;
      })
      .sort((a, b) => {
        let diff = 0;
        switch (sortBy) {
          case 'score':
            diff = b.finalScore - a.finalScore;
            break;
          case 'revenue':
            diff = b.revenueGenerated - a.revenueGenerated;
            break;
          case 'projects':
            diff = b.projectClosed - a.projectClosed;
            break;
          case 'upsells':
            diff = b.upsells - a.upsells;
            break;
          case 'rank':
          default:
            diff = a.rank - b.rank;
            break;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [rankings, searchQuery, bandFilter, sortBy, sortOrder]);

  const toggleSort = (column: 'score' | 'revenue' | 'projects' | 'upsells' | 'rank') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'rank' ? 'asc' : 'desc');
    }
  };

  const getRankBadge = (rank: number, isTie?: boolean) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-xl bg-[#8cc540] text-[#101010] font-black text-sm flex items-center justify-center shadow-md shadow-[#8cc540]/30">
            🥇 1
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8cc540]/20 text-[#436320] font-black border border-[#8cc540]/40">
              Tie
            </span>
          )}
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-xl bg-slate-200 text-slate-900 font-black text-sm flex items-center justify-center shadow-sm border border-slate-300">
            🥈 2
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold border border-slate-300">
              Tie
            </span>
          )}
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shadow-sm border border-amber-300">
            🥉 3
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
              Tie
            </span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <span className="w-8 h-8 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9] text-[#555555] font-black text-xs flex items-center justify-center">
          #{rank}
        </span>
        {isTie && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
            Tie
          </span>
        )}
      </div>
    );
  };

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'Excellent':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
            Excellent
          </span>
        );
      case 'Very Good':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            Very Good
          </span>
        );
      case 'Good':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            Good
          </span>
        );
      case 'Needs Improvement':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            Needs Improvement
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Rating Filter, Profile Filter, Sort */}
      <div className="flex flex-col gap-3 bg-white p-3.5 rounded-2xl border border-[#e2ebd9] shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search performer by name or ID..."
              className="w-full bg-[#f5f5f5] border border-[#e2ebd9] rounded-xl pl-9 pr-4 py-2 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
            />
          </div>

          {/* Performance Tier Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <div className="flex items-center gap-1 text-xs text-[#666666] font-bold shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#598327]" />
              <span className="hidden md:inline">Tier:</span>
            </div>

            {['all', 'Excellent', 'Very Good', 'Good', 'Needs Improvement'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBandFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  bandFilter === b
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                    : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                }`}
              >
                {b === 'all' ? 'All Tiers' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Filter Pills (IT: PR, WR, HW; SMM: RR, DR) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#f0f4ec]">
          <span className="text-[11px] font-black uppercase text-[#436320] tracking-wider shrink-0 flex items-center gap-1">
            <span>Profile Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setProfileFilter('all')}
            className={`px-2.5 py-0.5 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              profileFilter === 'all'
                ? 'bg-[#101010] text-white shadow-sm font-black'
                : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
            }`}
          >
            All Profiles
          </button>

          {/* IT Profiles */}
          <span className="text-[10px] text-blue-700 font-bold uppercase ml-2 hidden sm:inline">IT:</span>
          {(['PR', 'WR', 'HW'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProfileFilter(p)}
              className={`px-2 py-0.5 rounded-md text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                profileFilter === p
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              {p}
            </button>
          ))}

          {/* SMM Profiles */}
          <span className="text-[10px] text-purple-700 font-bold uppercase ml-2 hidden sm:inline">SMM:</span>
          {(['RR', 'DR'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProfileFilter(p)}
              className={`px-2 py-0.5 rounded-md text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                profileFilter === p
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table for Desktop / Tablet */}
      <div className="hidden md:block rounded-2xl border border-[#e2ebd9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2ebd9] bg-[#f5f5f5] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('rank')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#101010]"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-[#888888]" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Team Member</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#101010]"
                >
                  <div className="flex items-center gap-1">
                    <span>Final Score</span>
                    <ArrowUpDown className="w-3 h-3 text-[#598327]" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Achievement %</th>
                <th
                  onClick={() => toggleSort('revenue')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#101010]"
                >
                  <div className="flex items-center gap-1">
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-[#888888]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('projects')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#101010]"
                >
                  <div className="flex items-center gap-1">
                    <span>Projects</span>
                    <ArrowUpDown className="w-3 h-3 text-[#888888]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('upsells')}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#101010]"
                >
                  <div className="flex items-center gap-1">
                    <span>Upsells</span>
                    <ArrowUpDown className="w-3 h-3 text-[#888888]" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Client Rating</th>
                <th className="py-3.5 px-4">Follow-ups</th>
                <th className="py-3.5 px-4">Repeat</th>
                <th className="py-3.5 px-4">Status Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4ece0] text-xs">
              {filteredRankings.map((member) => (
                <tr
                  key={member.userId}
                  onClick={() => onSelectMember && onSelectMember(member)}
                  className={`hover:bg-[#f3f8ef]/60 transition-colors ${
                    member.rank === 1 ? 'bg-[#f3f8ef]/40' : ''
                  }`}
                >
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getRankBadge(member.rank, member.isTie)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          member.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={member.userName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-[#101010] text-sm">{member.userName}</p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                              member.team === 'IT'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {member.team || 'SMM'}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                              ['PR', 'WR', 'HW'].includes(member.profileCode || '')
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-300'
                            }`}
                          >
                            {member.profileCode || (member.team === 'IT' ? 'PR' : 'RR')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666666]">
                          {member.department || (member.team === 'IT' ? 'IT Solutions' : 'SMM Strategy')} • {member.weeksSubmitted} wk(s)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-[#101010]">
                        {member.finalScoreDisplay}
                      </span>
                      <span className="text-[10px] font-bold text-[#888888]">/ 100</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap min-w-[130px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-[#101010]">
                        <span>{(member.achievementPercentage ?? 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden border border-[#e2ebd9]">
                        <div
                          className="h-full bg-[#8cc540] rounded-full"
                          style={{
                            width: `${Math.min(member.achievementPercentage ?? 0, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-black text-[#436320] text-sm">
                      {settings.currencySymbol || '$'}{Math.round((member.revenueGenerated ?? 0) * 0.8).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-[#777777] font-medium">
                      Gross: {settings.currencySymbol || '$'}{(member.revenueGenerated ?? 0).toLocaleString()} (-20%)
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-[#101010]">
                    {member.projectClosed}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-purple-700">
                    {member.upsells}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-amber-600">
                    {(member.clientRating ?? 0) > 0 ? `${(member.clientRating ?? 0).toFixed(1)} ★` : '0 ★'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-[#555555]">
                    {member.followupsCompleted}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-[#555555]">
                    {member.repeatClients}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getBandBadge(member.performanceBand)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredRankings.map((member) => (
          <div
            key={member.userId}
            className={`p-4 rounded-2xl border bg-white shadow-xs space-y-3 ${
              member.rank === 1
                ? 'border-[#8cc540] bg-[#f3f8ef]/40'
                : 'border-[#e2ebd9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankBadge(member.rank, member.isTie)}
                <img
                  src={
                    member.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={member.userName}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#101010] text-sm">{member.userName}</h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        member.team === 'IT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {member.team || 'SMM'}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        ['PR', 'WR', 'HW'].includes(member.profileCode || '')
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}
                    >
                      {member.profileCode || (member.team === 'IT' ? 'PR' : 'RR')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#666666]">
                    {member.department || (member.team === 'IT' ? 'IT Solutions' : 'SMM Strategy')} • {member.weeksSubmitted} wk(s)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-[#101010]">{member.finalScoreDisplay}</div>
                <div className="text-[10px] text-[#888888] font-bold">/ 100 PTS</div>
              </div>
            </div>

            {/* Achievement Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#666666] font-semibold">Overall Achievement</span>
                <span className="text-[#436320] font-bold">
                  {(member.achievementPercentage ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden border border-[#e2ebd9]">
                <div
                  className="h-full bg-[#8cc540] rounded-full"
                  style={{ width: `${Math.min(member.achievementPercentage ?? 0, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e2ebd9] text-center text-xs">
              <div className="p-1.5 rounded-lg bg-[#f5f5f5]">
                <span className="text-[10px] text-[#888888] block font-medium">Net Rev (-20%)</span>
                <span className="font-black text-[#436320]">
                  ${Math.round((member.revenueGenerated ?? 0) * 0.8).toLocaleString()}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#f5f5f5]">
                <span className="text-[10px] text-[#888888] block font-medium">Projects</span>
                <span className="font-bold text-[#101010]">{member.projectClosed}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-[#f5f5f5]">
                <span className="text-[10px] text-[#888888] block font-medium">Upsells</span>
                <span className="font-bold text-purple-700">{member.upsells}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {getBandBadge(member.performanceBand)}
              <div className="text-xs text-[#666666] font-medium">
                Rating: <strong className="text-amber-600">{((member.clientRating ?? 0)).toFixed(1)} ★</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRankings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#e2ebd9] shadow-xs">
          <p className="text-sm font-semibold text-[#666666]">No performance data matches the selected filters.</p>
        </div>
      )}
    </div>
  );
};
