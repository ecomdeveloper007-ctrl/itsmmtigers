import React from 'react';
import { useApp } from '../../context/AppContext';
import { TeamType } from '../../types';
import {
  Users,
  Code2,
  Share2,
  Trophy,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const TeamDashboardSwitcher: React.FC = () => {
  const {
    selectedTeam,
    setSelectedTeam,
    leaderboardData,
    itLeaderboardData,
    smmLeaderboardData,
  } = useApp();

  const itStats = itLeaderboardData.teamStats;
  const smmStats = smmLeaderboardData.teamStats;
  const allStats = leaderboardData.teamStats;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Title / Label */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 font-black shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-400">
                Team-Wise Dashboard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                Live Division Filter
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {selectedTeam === 'it'
                ? '💻 IT Team Performance Dashboard'
                : selectedTeam === 'smm'
                ? '📱 SMM Team Performance Dashboard'
                : '🌟 All Teams Consolidated Dashboard'}
            </h3>
          </div>
        </div>

        {/* Team Selector Navigation Pills */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800">
          {/* ALL TEAMS */}
          <button
            onClick={() => setSelectedTeam('all')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
              selectedTeam === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/30 ring-1 ring-orange-400/50 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>All Teams</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'all'
                    ? 'bg-slate-950/30 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Combined
              </span>
            </div>
          </button>

          {/* IT TEAM */}
          <button
            onClick={() => setSelectedTeam('it')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              selectedTeam === 'it'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400/50 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>IT Team</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'it'
                    ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-400/30'
                    : 'bg-slate-800 text-cyan-400'
                }`}
              >
                {itStats.totalMembers} Tigers
              </span>
            </div>
          </button>

          {/* SMM TEAM */}
          <button
            onClick={() => setSelectedTeam('smm')}
            className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              selectedTeam === 'smm'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 ring-1 ring-pink-400/50 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>SMM Team</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'smm'
                    ? 'bg-pink-950/60 text-pink-200 border border-pink-400/30'
                    : 'bg-slate-800 text-pink-400'
                }`}
              >
                {smmStats.totalMembers} Tigers
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Division Snapshot Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              IT Team Output
            </span>
            <span className="font-bold text-slate-200">
              ${itStats.totalRevenue.toLocaleString()} • {itStats.totalProjects} Projects
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              SMM Team Output
            </span>
            <span className="font-bold text-slate-200">
              ${smmStats.totalRevenue.toLocaleString()} • {smmStats.totalProjects} Projects
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              IT Top Performer
            </span>
            <span className="font-bold text-amber-300 truncate block max-w-[140px]">
              {itLeaderboardData.winner?.userName || 'Amitabh Sharma'} (
              {itLeaderboardData.winner?.finalScoreDisplay || '75.60'} pts)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <Award className="w-3.5 h-3.5 text-orange-400" />
          <div className="text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              SMM Top Performer
            </span>
            <span className="font-bold text-orange-300 truncate block max-w-[140px]">
              {smmLeaderboardData.winner?.userName || 'Divya Bhardwaj'} (
              {smmLeaderboardData.winner?.finalScoreDisplay || '68.02'} pts)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
