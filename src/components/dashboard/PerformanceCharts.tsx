import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  PieChart,
  Layers,
} from 'lucide-react';

export const PerformanceCharts: React.FC = () => {
  const { leaderboardData, settings } = useApp();
  const { rankings } = leaderboardData;

  const [activeChart, setActiveChart] = useState<'revenue' | 'score' | 'projects' | 'achievement'>('revenue');

  if (rankings.length === 0) return null;

  // Max calculations for scaling
  const maxRevenue = Math.max(...rankings.map((r) => r.revenueGenerated), 10000);
  const maxProjects = Math.max(...rankings.map((r) => r.projectClosed), 25);
  const maxScore = 100;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Chart Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Performance Analytics & Insights</h3>
            <p className="text-xs text-slate-400">
              Comparative visualization across team members
            </p>
          </div>
        </div>

        {/* Chart View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveChart('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'revenue'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Revenue Comparison
          </button>
          <button
            onClick={() => setActiveChart('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'score'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Final Scores
          </button>
          <button
            onClick={() => setActiveChart('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'projects'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Projects Closed
          </button>
          <button
            onClick={() => setActiveChart('achievement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'achievement'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> KPI Breakdown
          </button>
        </div>
      </div>

      {/* Chart 1: Revenue Generated */}
      {activeChart === 'revenue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Team Member</span>
            <span>Target Benchmark: $10,000</span>
          </div>

          <div className="space-y-3.5">
            {rankings.map((member) => {
              const pct = Math.min((member.revenueGenerated / maxRevenue) * 100, 100);
              const targetPct = (10000 / maxRevenue) * 100;
              return (
                <div key={member.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{member.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        ({member.breakdown['kpi_revenue']?.achievementPercentage.toFixed(1)}% achieved)
                      </span>
                    </div>
                    <span className="font-black text-emerald-400">
                      ${member.revenueGenerated.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    {/* Target line indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                      style={{ left: `${Math.min(targetPct, 100)}%` }}
                      title="Target: $10,000"
                    ></div>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart 2: Final Scores */}
      {activeChart === 'score' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Leaderboard Score Rating (Max 100 Pts)</span>
            <span>Excellence Threshold: 90+</span>
          </div>

          <div className="space-y-3.5">
            {rankings.map((member) => {
              const scorePct = Math.min((member.finalScore / maxScore) * 100, 100);
              return (
                <div key={member.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5">#{member.rank}</span>
                      <span className="font-bold text-white">{member.userName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {member.performanceBand}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-amber-400 text-sm">
                        {member.finalScoreDisplay}
                      </span>
                      <span className="text-[10px] text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${scorePct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart 3: Projects Closed */}
      {activeChart === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projects Closed Comparison</span>
            <span>Target Benchmark: 25 Projects</span>
          </div>

          <div className="space-y-3.5">
            {rankings.map((member) => {
              const projPct = Math.min((member.projectClosed / maxProjects) * 100, 100);
              return (
                <div key={member.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{member.userName}</span>
                    <span className="font-black text-orange-400">
                      {member.projectClosed} / 25 Projects
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${projPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart 4: KPI Breakdown & Distribution */}
      {activeChart === 'achievement' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankings.slice(0, 6).map((member) => (
            <div
              key={member.userId}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-white text-xs">{member.userName}</h4>
                  <p className="text-[10px] text-slate-400">Rank #{member.rank} • {member.finalScoreDisplay} pts</p>
                </div>
                <span className="text-xs font-black text-emerald-400">
                  {member.achievementPercentage.toFixed(0)}% Avg
                </span>
              </div>

              <div className="space-y-2">
                {(Object.values(member.breakdown) as {
                  kpiId: string;
                  kpiName: string;
                  achievementPercentage: number;
                  score: number;
                }[]).map((kpi) => (
                  <div key={kpi.kpiId} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">{kpi.kpiName}</span>
                      <span className="font-bold text-slate-200">
                        {kpi.achievementPercentage.toFixed(0)}% ({kpi.score.toFixed(2)} pts)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min(kpi.achievementPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
