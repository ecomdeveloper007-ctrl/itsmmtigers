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

  const itStats = itLeaderboardData?.teamStats;
  const smmStats = smmLeaderboardData?.teamStats;
  const allStats = leaderboardData?.teamStats;

  return (
    <div className="bg-white border border-[#e2ebd9] rounded-3xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Title / Label */}
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 rounded-2xl bg-[#8cc540] text-[#101010] font-black shadow-sm flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#436320]">
                Team-Wise Dashboard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-bold border border-[#8cc540]/30">
                Live Division Filter
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#101010]">
              {selectedTeam === 'it'
                ? '💻 IT Team Performance Dashboard'
                : selectedTeam === 'smm'
                ? '📱 SMM Team Performance Dashboard'
                : '🌟 All Teams Consolidated Dashboard'}
            </h3>
          </div>
        </div>

        {/* Team Selector Navigation Pills */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#f5f5f5] rounded-2xl border border-[#e2ebd9]">
          {/* ALL TEAMS */}
          <button
            onClick={() => setSelectedTeam('all')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center ${
              selectedTeam === 'all'
                ? 'bg-[#101010] text-white shadow-sm scale-[1.02]'
                : 'text-[#555555] hover:text-[#101010] hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#8cc540]" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>All Teams</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'all'
                    ? 'bg-white/20 text-[#8cc540]'
                    : 'bg-[#e2ebd9] text-[#436320]'
                }`}
              >
                Combined
              </span>
            </div>
          </button>

          {/* IT TEAM */}
          <button
            onClick={() => setSelectedTeam('it')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              selectedTeam === 'it'
                ? 'bg-blue-600 text-white shadow-sm scale-[1.02]'
                : 'text-[#555555] hover:text-[#101010] hover:bg-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>IT Team</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'it'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {itStats?.totalMembers ?? 0} Tigers
              </span>
            </div>
          </button>

          {/* SMM TEAM */}
          <button
            onClick={() => setSelectedTeam('smm')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer text-center relative ${
              selectedTeam === 'smm'
                ? 'bg-purple-600 text-white shadow-sm scale-[1.02]'
                : 'text-[#555555] hover:text-[#101010] hover:bg-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>SMM Team</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedTeam === 'smm'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                {smmStats?.totalMembers ?? 0} Tigers
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Division Snapshot Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-[#e2ebd9]">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
          <div className="text-xs">
            <span className="text-[#666666] text-[10px] uppercase font-bold block">
              IT Team Output
            </span>
            <span className="font-bold text-[#101010]">
              ${(itStats?.totalRevenue ?? 0).toLocaleString()} • {itStats?.totalProjects ?? 0} Projects
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
          <div className="text-xs">
            <span className="text-[#666666] text-[10px] uppercase font-bold block">
              SMM Team Output
            </span>
            <span className="font-bold text-[#101010]">
              ${(smmStats?.totalRevenue ?? 0).toLocaleString()} • {smmStats?.totalProjects ?? 0} Projects
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
          <Award className="w-4 h-4 text-blue-600" />
          <div className="text-xs">
            <span className="text-[#666666] text-[10px] uppercase font-bold block">
              IT Top Performer
            </span>
            <span className="font-bold text-blue-800 truncate block max-w-[140px]">
              {itLeaderboardData.winner?.userName || 'Amitabh Sharma'} (
              {itLeaderboardData.winner?.finalScoreDisplay || '75.60'} pts)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
          <Award className="w-4 h-4 text-purple-600" />
          <div className="text-xs">
            <span className="text-[#666666] text-[10px] uppercase font-bold block">
              SMM Top Performer
            </span>
            <span className="font-bold text-purple-800 truncate block max-w-[140px]">
              {smmLeaderboardData.winner?.userName || 'Divya Bhardwaj'} (
              {smmLeaderboardData.winner?.finalScoreDisplay || '68.02'} pts)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

