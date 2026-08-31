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
    <div className="bg-white border border-[#e2ebd9] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Chart Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f3f8ef] text-[#598327] border border-[#8cc540]/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#101010]">Performance Analytics & Insights</h3>
            <p className="text-xs text-[#666666] font-medium">
              Comparative visualization across team members
            </p>
          </div>
        </div>

        {/* Chart View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f5f5f5] rounded-xl border border-[#e2ebd9] overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveChart('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'revenue'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Revenue Comparison
          </button>
          <button
            onClick={() => setActiveChart('score')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'score'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Final Scores
          </button>
          <button
            onClick={() => setActiveChart('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'projects'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Projects Closed
          </button>
          <button
            onClick={() => setActiveChart('achievement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeChart === 'achievement'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm font-black'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> KPI Breakdown
          </button>
        </div>
      </div>

      {/* Chart 1: Revenue Generated */}
      {activeChart === 'revenue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#666666] font-medium">
            <span>Team Member</span>
            <span>Target Benchmark: $10,000</span>
          </div>

          <div className="space-y-3.5">
            {rankings.map((member) => {
              const rev = member.revenueGenerated ?? 0;
              const pct = Math.min((rev / (maxRevenue || 1)) * 100, 100);
              const targetPct = (10000 / (maxRevenue || 1)) * 100;
              const achievePct = member.breakdown?.['kpi_revenue']?.achievementPercentage ?? 0;
              return (
                <div key={member.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#101010]">{member.userName}</span>
                      <span className="text-[10px] text-[#666666]">
                        ({achievePct.toFixed(1)}% achieved)
                      </span>
                    </div>
                    <span className="font-black text-[#3d591d]">
                      ${rev.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative w-full h-4 bg-[#f5f5f5] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
                    {/* Target line indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                      style={{ left: `${Math.min(targetPct, 100)}%` }}
                      title="Target: $10,000"
                    ></div>
                    <div
                      className="h-full bg-[#8cc540] rounded-full transition-all duration-700"
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
          <div className="flex items-center justify-between text-xs text-[#666666] font-medium">
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
                      <span className="text-xs font-black text-[#888888] w-5">#{member.rank}</span>
                      <span className="font-bold text-[#101010]">{member.userName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-black border border-[#8cc540]/30">
                        {member.performanceBand}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-[#101010] text-sm">
                        {member.finalScoreDisplay}
                      </span>
                      <span className="text-[10px] text-[#888888] font-bold">/ 100</span>
                    </div>
                  </div>

                  <div className="w-full h-4 bg-[#f5f5f5] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
                    <div
                      className="h-full bg-[#8cc540] rounded-full transition-all duration-700"
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
          <div className="flex items-center justify-between text-xs text-[#666666] font-medium">
            <span>Projects Closed Comparison</span>
            <span>Target Benchmark: 25 Projects</span>
          </div>

          <div className="space-y-3.5">
            {rankings.map((member) => {
              const projPct = Math.min((member.projectClosed / maxProjects) * 100, 100);
              return (
                <div key={member.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#101010]">{member.userName}</span>
                    <span className="font-black text-[#598327]">
                      {member.projectClosed} / 25 Projects
                    </span>
                  </div>

                  <div className="w-full h-4 bg-[#f5f5f5] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
                    <div
                      className="h-full bg-[#8cc540] rounded-full transition-all duration-700"
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
              className="p-4 rounded-2xl bg-white border border-[#e2ebd9] space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-2">
                <div>
                  <h4 className="font-bold text-[#101010] text-xs">{member.userName}</h4>
                  <p className="text-[10px] text-[#666666]">Rank #{member.rank} • {member.finalScoreDisplay} pts</p>
                </div>
                <span className="text-xs font-black text-[#436320]">
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
                      <span className="text-[#666666] font-medium">{kpi.kpiName}</span>
                      <span className="font-bold text-[#101010]">
                        {kpi.achievementPercentage.toFixed(0)}% ({kpi.score.toFixed(2)} pts)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8cc540] rounded-full"
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
