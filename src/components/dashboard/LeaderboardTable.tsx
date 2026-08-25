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

  const filteredRankings = useMemo(() => {
    return rankings
      .filter((m) => {
        const matchesSearch =
          m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.userId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBand = bandFilter === 'all' || m.performanceBand === bandFilter;
        return matchesSearch && matchesBand;
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
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/30">
            🥇 1
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Tie
            </span>
          )}
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
            🥈 2
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-300 font-bold border border-slate-500/30">
              Tie
            </span>
          )}
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white font-black text-sm flex items-center justify-center shadow-md">
            🥉 3
          </span>
          {isTie && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-700/20 text-amber-300 font-bold border border-amber-700/30">
              Tie
            </span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center">
          #{rank}
        </span>
        {isTie && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
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
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Excellent
          </span>
        );
      case 'Very Good':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Very Good
          </span>
        );
      case 'Good':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Good
          </span>
        );
      case 'Needs Improvement':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Needs Improvement
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Rating Filter, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search performer by name or ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tier:</span>
          </div>

          {['all', 'Excellent', 'Very Good', 'Good', 'Needs Improvement'].map((b) => (
            <button
              key={b}
              onClick={() => setBandFilter(b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                bandFilter === b
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {b === 'all' ? 'All Tiers' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table for Desktop / Tablet */}
      <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('rank')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Team Member</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Final Score</span>
                    <ArrowUpDown className="w-3 h-3 text-orange-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Achievement %</th>
                <th
                  onClick={() => toggleSort('revenue')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Revenue</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('projects')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Projects</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('upsells')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Upsells</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Client Rating</th>
                <th className="py-3.5 px-4">Follow-ups</th>
                <th className="py-3.5 px-4">Repeat</th>
                <th className="py-3.5 px-4">Status Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRankings.map((member) => (
                <tr
                  key={member.userId}
                  onClick={() => onSelectMember && onSelectMember(member)}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    member.rank === 1 ? 'bg-amber-500/5' : ''
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
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white text-sm">{member.userName}</p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                              member.team === 'IT'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                            }`}
                          >
                            {member.team || 'SMM'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {member.department || (member.team === 'IT' ? 'IT Solutions' : 'SMM Strategy')} • {member.weeksSubmitted} wk(s)
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-amber-400">
                        {member.finalScoreDisplay}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">/ 100</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap min-w-[130px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-300">
                        <span>{member.achievementPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                          style={{
                            width: `${Math.min(member.achievementPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-emerald-400">
                    ${member.revenueGenerated.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-200">
                    {member.projectClosed}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-cyan-400">
                    {member.upsells}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-amber-400">
                    {member.clientRating > 0 ? `${member.clientRating.toFixed(1)} ★` : '0 ★'}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-300">
                    {member.followupsCompleted}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-300">
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
            className={`p-4 rounded-2xl border bg-slate-900/90 shadow-lg space-y-3 ${
              member.rank === 1
                ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900'
                : 'border-slate-800'
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
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm">{member.userName}</h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                        member.team === 'IT'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      }`}
                    >
                      {member.team || 'SMM'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {member.department || (member.team === 'IT' ? 'IT Solutions' : 'SMM Strategy')} • {member.weeksSubmitted} wk(s)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-amber-400">{member.finalScoreDisplay}</div>
                <div className="text-[10px] text-slate-500 font-bold">/ 100 PTS</div>
              </div>
            </div>

            {/* Achievement Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Overall Achievement</span>
                <span className="text-emerald-400 font-bold">
                  {member.achievementPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  style={{ width: `${Math.min(member.achievementPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-500 block">Revenue</span>
                <span className="font-bold text-emerald-400">
                  ${member.revenueGenerated.toLocaleString()}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-500 block">Projects</span>
                <span className="font-bold text-white">{member.projectClosed}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950">
                <span className="text-[10px] text-slate-500 block">Upsells</span>
                <span className="font-bold text-cyan-400">{member.upsells}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {getBandBadge(member.performanceBand)}
              <div className="text-xs text-slate-400 font-medium">
                Rating: <strong className="text-amber-400">{member.clientRating.toFixed(1)} ★</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRankings.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-sm font-semibold text-slate-400">No performance data matches the selected filters.</p>
        </div>
      )}
    </div>
  );
};
