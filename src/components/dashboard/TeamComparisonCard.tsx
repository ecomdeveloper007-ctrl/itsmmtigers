import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  Share2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Repeat,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export const TeamComparisonCard: React.FC = () => {
  const { itLeaderboardData, smmLeaderboardData, setSelectedTeam, settings } = useApp();

  const itStats = itLeaderboardData?.teamStats || {
    totalMembers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    totalUpsells: 0,
    avgClientRating: 0,
    avgTeamScore: 0,
  };
  const smmStats = smmLeaderboardData?.teamStats || {
    totalMembers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    totalUpsells: 0,
    avgClientRating: 0,
    avgTeamScore: 0,
  };

  const itRev = itStats.totalRevenue ?? 0;
  const smmRev = smmStats.totalRevenue ?? 0;
  const totalCombinedRevenue = (itRev + smmRev) || 1;
  const itRevPct = Math.round((itRev / totalCombinedRevenue) * 100);
  const smmRevPct = 100 - itRevPct;

  const itScore = itStats.avgTeamScore ?? 0;
  const smmScore = smmStats.avgTeamScore ?? 0;

  return (
    <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#598327]" /> Division Face-off
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#101010]">
            IT Team vs SMM Team Performance Benchmark
          </h3>
          <p className="text-xs text-[#666666]">
            Side-by-side breakdown of total productivity, revenue generation, and quality metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTeam('it')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open IT Team</span>
          </button>
          <button
            onClick={() => setSelectedTeam('smm')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open SMM Team</span>
          </button>
        </div>
      </div>

      {/* Revenue Share Bar */}
      <div className="space-y-2 bg-[#f5f5f5] p-4 rounded-2xl border border-[#e2ebd9]">
        <div className="flex justify-between items-center text-xs font-black">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Code2 className="w-4 h-4" />
            <span>IT Team Revenue: ${(itStats?.totalRevenue ?? 0).toLocaleString()} ({itRevPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700">
            <span>SMM Team Revenue: ${(smmStats?.totalRevenue ?? 0).toLocaleString()} ({smmRevPct}%)</span>
            <Share2 className="w-4 h-4" />
          </div>
        </div>
        <div className="h-3.5 w-full bg-white rounded-full overflow-hidden flex p-0.5 border border-[#e2ebd9]">
          <div
            className="h-full bg-blue-500 rounded-l-full transition-all duration-700"
            style={{ width: `${itRevPct}%` }}
            title={`IT Team: ${itRevPct}%`}
          ></div>
          <div
            className="h-full bg-purple-500 rounded-r-full transition-all duration-700"
            style={{ width: `${smmRevPct}%` }}
            title={`SMM Team: ${smmRevPct}%`}
          ></div>
        </div>
      </div>

      {/* Metric Battle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IT TEAM CARD */}
        <div className="relative rounded-2xl bg-white border-2 border-blue-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#101010]">IT Engineering Division</h4>
                <p className="text-xs text-[#666666]">{itStats.totalMembers} Active Tech Tigers</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
              Avg: {itScore.toFixed(2)} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Projects Delivered</span>
              <span className="text-lg font-black text-[#101010]">{itStats.totalProjects}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Total Revenue</span>
              <span className="text-lg font-black text-blue-700">${(itStats?.totalRevenue ?? 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Total Upsells</span>
              <span className="text-lg font-black text-[#101010]">{itStats.totalUpsells}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Avg Rating</span>
              <span className="text-lg font-black text-amber-600">{(itStats.avgClientRating ?? 0).toFixed(2)} ★</span>
            </div>
          </div>

          {itLeaderboardData.winner && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">IT Division Champion</span>
                  <span className="text-xs font-black text-[#101010]">{itLeaderboardData.winner.userName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam('it')}
                className="text-xs text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                View IT Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* SMM TEAM CARD */}
        <div className="relative rounded-2xl bg-white border-2 border-purple-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-[#101010]">SMM & Growth Division</h4>
                <p className="text-xs text-[#666666]">{smmStats.totalMembers} Active Social Tigers</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
              Avg: {smmScore.toFixed(2)} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Projects Delivered</span>
              <span className="text-lg font-black text-[#101010]">{smmStats.totalProjects}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Total Revenue</span>
              <span className="text-lg font-black text-purple-700">${(smmStats?.totalRevenue ?? 0).toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Total Upsells</span>
              <span className="text-lg font-black text-[#101010]">{smmStats.totalUpsells}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#e2ebd9]">
              <span className="text-[10px] text-[#888888] uppercase font-bold block">Avg Rating</span>
              <span className="text-lg font-black text-amber-600">{(smmStats.avgClientRating ?? 0).toFixed(2)} ★</span>
            </div>
          </div>

          {smmLeaderboardData.winner && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-[10px] text-purple-800 font-bold uppercase block">SMM Division Champion</span>
                  <span className="text-xs font-black text-[#101010]">{smmLeaderboardData.winner.userName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam('smm')}
                className="text-xs text-purple-700 hover:text-purple-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                View SMM Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
