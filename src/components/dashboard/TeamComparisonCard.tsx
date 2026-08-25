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

  const itStats = itLeaderboardData.teamStats;
  const smmStats = smmLeaderboardData.teamStats;

  const totalCombinedRevenue = (itStats.totalRevenue + smmStats.totalRevenue) || 1;
  const itRevPct = Math.round((itStats.totalRevenue / totalCombinedRevenue) * 100);
  const smmRevPct = 100 - itRevPct;

  const itScore = itStats.avgTeamScore;
  const smmScore = smmStats.avgTeamScore;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Division Face-off
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            IT Team vs SMM Team Performance Benchmark
          </h3>
          <p className="text-xs text-slate-400">
            Side-by-side breakdown of total productivity, revenue generation, and quality metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTeam('it')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open IT Team</span>
          </button>
          <button
            onClick={() => setSelectedTeam('smm')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open SMM Team</span>
          </button>
        </div>
      </div>

      {/* Revenue Share Bar */}
      <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Code2 className="w-4 h-4" />
            <span>IT Team Revenue: ${itStats.totalRevenue.toLocaleString()} ({itRevPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-pink-400">
            <span>SMM Team Revenue: ${smmStats.totalRevenue.toLocaleString()} ({smmRevPct}%)</span>
            <Share2 className="w-4 h-4" />
          </div>
        </div>
        <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-l-full transition-all duration-700"
            style={{ width: `${itRevPct}%` }}
            title={`IT Team: ${itRevPct}%`}
          ></div>
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-600 rounded-r-full transition-all duration-700"
            style={{ width: `${smmRevPct}%` }}
            title={`SMM Team: ${smmRevPct}%`}
          ></div>
        </div>
      </div>

      {/* Metric Battle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IT TEAM CARD */}
        <div className="relative rounded-2xl bg-gradient-to-b from-cyan-950/30 via-slate-900 to-slate-900 border-2 border-cyan-500/40 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">IT Engineering Division</h4>
                <p className="text-xs text-slate-400">{itStats.totalMembers} Active Tech Tigers</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Avg: {itScore.toFixed(2)} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Projects Delivered</span>
              <span className="text-lg font-black text-slate-100">{itStats.totalProjects}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Revenue</span>
              <span className="text-lg font-black text-cyan-400">${itStats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Upsells</span>
              <span className="text-lg font-black text-slate-100">{itStats.totalUpsells}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Rating</span>
              <span className="text-lg font-black text-amber-400">{itStats.avgClientRating.toFixed(2)} ★</span>
            </div>
          </div>

          {itLeaderboardData.winner && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-cyan-300 font-bold uppercase block">IT Division Champion</span>
                  <span className="text-xs font-black text-white">{itLeaderboardData.winner.userName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam('it')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                View IT Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* SMM TEAM CARD */}
        <div className="relative rounded-2xl bg-gradient-to-b from-pink-950/30 via-slate-900 to-slate-900 border-2 border-pink-500/40 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">SMM & Growth Division</h4>
                <p className="text-xs text-slate-400">{smmStats.totalMembers} Active Social Tigers</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">
              Avg: {smmScore.toFixed(2)} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Projects Delivered</span>
              <span className="text-lg font-black text-slate-100">{smmStats.totalProjects}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Revenue</span>
              <span className="text-lg font-black text-pink-400">${smmStats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Upsells</span>
              <span className="text-lg font-black text-slate-100">{smmStats.totalUpsells}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Rating</span>
              <span className="text-lg font-black text-amber-400">{smmStats.avgClientRating.toFixed(2)} ★</span>
            </div>
          </div>

          {smmLeaderboardData.winner && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-pink-950/40 border border-pink-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-pink-300 font-bold uppercase block">SMM Division Champion</span>
                  <span className="text-xs font-black text-white">{smmLeaderboardData.winner.userName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeam('smm')}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
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
