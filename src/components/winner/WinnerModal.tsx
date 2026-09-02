import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  X,
  Printer,
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Users,
  Repeat,
  Flame,
  Award,
} from 'lucide-react';

export const WinnerModal: React.FC = () => {
  const {
    isWinnerModalOpen,
    closeWinnerModal,
    leaderboardData,
    itLeaderboardData,
    smmLeaderboardData,
    selectedMonth,
    selectedYear,
    settings,
    kpis,
  } = useApp();

  const [activeWinnerDivision, setActiveWinnerDivision] = React.useState<'active' | 'it' | 'smm'>('active');

  const currentDataset =
    activeWinnerDivision === 'it'
      ? itLeaderboardData
      : activeWinnerDivision === 'smm'
      ? smmLeaderboardData
      : leaderboardData;

  const { winner, top3, rankings } = currentDataset;

  useEffect(() => {
    if (isWinnerModalOpen) {
      // Trigger festive celebration confetti
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#8cc540', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isWinnerModalOpen]);

  if (!isWinnerModalOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white text-[#101010]">
        {/* Modal Header */}
        <div className="relative flex items-center justify-between p-6 pb-4 border-b border-[#e2ebd9] bg-[#f8faf6] print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              <Trophy className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#101010]">
                IT SMM Tigers Recognition
              </h2>
              <p className="text-xs text-[#666666] font-medium">
                Official Performance Winner & Podium Announcement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-[#f0f0f0] text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={closeWinnerModal}
              className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#eaeaea] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-8 print:p-6 print:text-black">
          {/* Headline Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f3f8ef] border border-[#8cc540]/50 text-[#436320] text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              REWARDS & RECOGNITION
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#101010] uppercase tracking-tight">
              {activeWinnerDivision === 'it'
                ? 'IT TEAM CHAMPION'
                : activeWinnerDivision === 'smm'
                ? 'SMM TEAM CHAMPION'
                : 'WINNER OF THE MONTH'}
            </h1>
            <p className="text-sm text-[#666666] font-semibold">
              Performance Period: <strong className="text-[#101010]">{selectedMonth} {selectedYear}</strong>
            </p>

            {/* Division Switching Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2 print:hidden">
              <button
                onClick={() => setActiveWinnerDivision('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeWinnerDivision === 'active'
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                    : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                }`}
              >
                🌟 Overall Winner
              </button>
              <button
                onClick={() => setActiveWinnerDivision('it')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeWinnerDivision === 'it'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                }`}
              >
                💻 IT Team Winner
              </button>
              <button
                onClick={() => setActiveWinnerDivision('smm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeWinnerDivision === 'smm'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[#f5f5f5] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                }`}
              >
                📱 SMM Team Winner
              </button>
            </div>
          </div>

          {winner ? (
            <>
              {/* Grand Champion Spotlight Card (Rank 1 - Gold) */}
              <div className="relative rounded-2xl bg-[#f8faf6] border-2 border-[#8cc540] p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  {/* Winner Avatar with Crown */}
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-[#8cc540] shadow-md">
                      <img
                        src={
                          winner.avatarUrl ||
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={winner.userName}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg text-[#101010] ring-4 ring-white">
                      <Crown className="w-6 h-6 text-[#101010] fill-[#101010]" />
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                      <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-[#101010] shadow-sm uppercase tracking-wider">
                        🥇 Rank #1
                      </span>
                    </div>
                  </div>

                  {/* Winner Info & Final Score */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40 text-xs font-black">
                      <Award className="w-3.5 h-3.5" /> High Performance Champion
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-[#101010] tracking-tight">
                      {winner.userName}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#666666] font-medium">
                      Top Weighted Achievement across all IT SMM Tiger KPIs
                    </p>

                    {/* Grand Score Display */}
                    <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                      <div className="px-4 py-2 rounded-xl bg-white border border-[#e2ebd9] shadow-sm">
                        <span className="text-[11px] font-black text-[#666666] uppercase tracking-wider block">
                          Final Score
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-[#101010]">
                            {winner.finalScoreDisplay}
                          </span>
                          <span className="text-sm font-bold text-[#888888]">/ 100</span>
                        </div>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/40 shadow-sm">
                        <span className="text-[11px] font-black text-[#436320] uppercase tracking-wider block">
                          Overall Achievement
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-[#436320]">
                            {winner.achievementPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champion KPI Metric Cards (Dynamically computed from backend active KPIs) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-[#e2ebd9]">
                  {kpis.filter((k) => k.active).map((kpi) => {
                    const itemBreakdown = winner.breakdown[kpi.id] || {
                      actual: (winner as unknown as Record<string, number>)[kpi.key] ?? 0,
                      target: kpi.defaultTarget,
                      score: 0,
                      achievementPercentage: 0,
                    };
                    const isCurrency = kpi.unit === '$' || kpi.key === 'revenueGenerated';
                    const isRating = kpi.unit === 'Stars' || kpi.key === 'clientRating';

                    let IconComponent = Award;
                    let colorClass = 'text-amber-600';
                    if (kpi.key === 'projectClosed') {
                      IconComponent = Briefcase;
                      colorClass = 'text-blue-600';
                    } else if (kpi.key === 'revenueGenerated') {
                      IconComponent = DollarSign;
                      colorClass = 'text-[#436320]';
                    } else if (kpi.key === 'upsells') {
                      IconComponent = TrendingUp;
                      colorClass = 'text-purple-600';
                    } else if (kpi.key === 'clientRating') {
                      IconComponent = Star;
                      colorClass = 'text-amber-600';
                    } else if (kpi.key === 'followupsCompleted') {
                      IconComponent = Users;
                      colorClass = 'text-indigo-600';
                    } else if (kpi.key === 'repeatClients') {
                      IconComponent = Repeat;
                      colorClass = 'text-pink-600';
                    }

                    return (
                      <div key={kpi.id} className="p-2.5 rounded-xl bg-white border border-[#e2ebd9] text-center shadow-xs">
                        <IconComponent className={`w-4 h-4 ${colorClass} mx-auto mb-1`} />
                        <p className="text-[10px] text-[#666666] uppercase font-black truncate">{kpi.name}</p>
                        <p className="text-lg font-black text-[#101010]">
                          {isCurrency
                            ? `${settings.currencySymbol || '$'}${(itemBreakdown.actual ?? 0).toLocaleString()}`
                            : isRating
                            ? `${Number(itemBreakdown.actual ?? 0).toFixed(1)}/5`
                            : itemBreakdown.actual}
                        </p>
                        <span className="text-[10px] text-[#436320] font-bold block truncate">
                          Target: {isCurrency ? `${settings.currencySymbol || '$'}${Number(itemBreakdown.target ?? 0).toLocaleString()}` : itemBreakdown.target}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Runners-Up Podium Cards (Rank 2 & Rank 3) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rank 2 (Silver) */}
                {top3[1] && (
                  <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={
                            top3[1].avatarUrl ||
                            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={top3[1].userName}
                          className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-300 shadow-sm"
                        />
                        <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-[#101010] uppercase shadow-xs">
                          🥈 Rank 2
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black text-[#666666]">1st Runner Up</span>
                        <h3 className="text-lg font-black text-[#101010] truncate">{top3[1].userName}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-[#101010]">
                            {top3[1].finalScoreDisplay}
                          </span>
                          <span className="text-xs text-[#888888] font-bold">/ 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Revenue</span>
                        <span className="font-black text-[#101010]">
                          ${(top3[1].revenueGenerated ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Projects</span>
                        <span className="font-black text-[#101010]">{top3[1].projectClosed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Upsells</span>
                        <span className="font-black text-[#101010]">{top3[1].upsells}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3[2] && (
                  <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={
                            top3[2].avatarUrl ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={top3[2].userName}
                          className="w-16 h-16 rounded-xl object-cover ring-2 ring-amber-600 shadow-sm"
                        />
                        <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white uppercase shadow-xs">
                          🥉 Rank 3
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black text-amber-700">2nd Runner Up</span>
                        <h3 className="text-lg font-black text-[#101010] truncate">{top3[2].userName}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-[#101010]">
                            {top3[2].finalScoreDisplay}
                          </span>
                          <span className="text-xs text-[#888888] font-bold">/ 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#e2ebd9] text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Revenue</span>
                        <span className="font-black text-[#101010]">
                          ${(top3[2].revenueGenerated ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Projects</span>
                        <span className="font-black text-[#101010]">{top3[2].projectClosed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] font-medium block">Upsells</span>
                        <span className="font-black text-[#101010]">{top3[2].upsells}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Leaderboard Preview Strip */}
              {rankings.length > 3 && (
                <div className="p-4 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <h4 className="text-xs font-black text-[#666666] uppercase tracking-wider mb-2">
                    Other Rankings
                  </h4>
                  <div className="space-y-1.5">
                    {rankings.slice(3).map((item) => (
                      <div
                        key={item.userId}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e2ebd9] text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#666666] w-6">#{item.rank}</span>
                          <span className="font-bold text-[#101010]">{item.userName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[#666666] font-medium">${(item.revenueGenerated ?? 0).toLocaleString()}</span>
                          <span className="font-black text-[#436320]">{item.finalScoreDisplay} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[#666666]">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#8cc540]" />
              <p className="text-sm font-bold">No performance data recorded for this period yet.</p>
            </div>
          )}

          {/* Recognition Footer Note */}
          <div className="text-center pt-2 border-t border-[#e2ebd9]">
            <p className="text-xs text-[#666666] font-medium">
              Generated automatically by the <strong className="text-[#101010]">IT SMM Tigers Platform</strong> based on verified KPI weights & targets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
