import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { TeamDashboardSwitcher } from '../dashboard/TeamDashboardSwitcher';
import {
  FileText,
  Printer,
  Download,
  Trophy,
  Crown,
  Medal,
  DollarSign,
  Briefcase,
  TrendingUp,
  Star,
  Users,
  Repeat,
  CheckCircle,
} from 'lucide-react';
import { DataService } from '../../services/dataService';

export const MonthlyReportView: React.FC = () => {
  const { allUsers, isSuperAdmin } = useAuth();
  const {
    leaderboardData,
    selectedMonth,
    selectedYear,
    settings,
    records,
    kpis,
    addToast,
    selectedTeam,
  } = useApp();
  const { winner, top3, rankings, teamStats } = leaderboardData;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!isSuperAdmin) {
      addToast('error', 'Unauthorized', 'Only Super Admin is authorized to export raw team data.');
      return;
    }
    try {
      const csv = DataService.generateCSV(records, allUsers, kpis);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `IT_SMM_Tigers_RR_Report_${selectedMonth}_${selectedYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Report Export Complete');
    } catch (e) {
      console.error(e);
      addToast('error', 'Export Failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Monthly Rewards & Recognition Report</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official Performance & Winner Audit Document for {selectedMonth} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export CSV Data
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report / PDF
          </button>
        </div>
      </div>

      <TeamDashboardSwitcher />

      {/* Printable Report Document Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12 shadow-2xl space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white text-slate-100 print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-black pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              🐅
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white print:text-black">
                IT SMM TIGERS
              </h1>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest print:text-black">
                Monthly Performance, Rewards & Recognition Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <p className="text-slate-400 print:text-gray-600">
              Period: <strong className="text-white print:text-black">{selectedMonth} {selectedYear}</strong>
            </p>
            <p className="text-slate-400 print:text-gray-600">
              Generated: <strong className="text-white print:text-black">{new Date().toLocaleDateString()}</strong>
            </p>
            <p className="text-emerald-400 print:text-green-700 font-semibold mt-0.5">
              Status: Verified & Audited
            </p>
          </div>
        </div>

        {/* Winner Highlight Box */}
        {winner && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-orange-950/40 border-2 border-amber-500/50 print:border-black print:bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-xl shrink-0">
                <img
                  src={
                    winner.avatarUrl ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={winner.userName}
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                  🥇 WINNER OF THE MONTH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white print:text-black mt-1">
                  {winner.userName}
                </h2>
                <p className="text-xs text-slate-400 print:text-gray-600">
                  {winner.weeksSubmitted} week(s) evaluated • Overall Achievement: {winner.achievementPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right px-6 py-3 rounded-xl bg-slate-950/80 print:bg-gray-100 border border-slate-800 print:border-gray-300">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Final Score
              </span>
              <div className="flex items-baseline justify-center sm:justify-end gap-1">
                <span className="text-3xl font-black text-amber-400 print:text-black">
                  {winner.finalScoreDisplay}
                </span>
                <span className="text-sm font-bold text-slate-500">/ 100 PTS</span>
              </div>
            </div>
          </div>
        )}

        {/* Team Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Total Revenue</span>
            <p className="text-lg font-black text-emerald-400 print:text-black">
              ${teamStats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Projects Closed</span>
            <p className="text-lg font-black text-white print:text-black">{teamStats.totalProjects}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Total Upsells</span>
            <p className="text-lg font-black text-cyan-400 print:text-black">{teamStats.totalUpsells}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
            <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Average Team Score</span>
            <p className="text-lg font-black text-amber-400 print:text-black">
              {teamStats.avgTeamScore.toFixed(2)} / 100
            </p>
          </div>
        </div>

        {/* Official Rankings Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Complete Team Standings & Scores
          </h3>

          <div className="rounded-2xl border border-slate-800 print:border-black overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-black bg-slate-950 print:bg-gray-200 text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Final Score</th>
                  <th className="py-3 px-4">Achievement %</th>
                  <th className="py-3 px-4">Revenue ($)</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Upsells</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Follow-ups</th>
                  <th className="py-3 px-4">Repeat</th>
                  <th className="py-3 px-4">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {rankings.map((m) => (
                  <tr key={m.userId} className={m.rank === 1 ? 'bg-amber-500/10 font-semibold' : ''}>
                    <td className="py-3 px-4 font-bold">
                      {m.rank === 1 ? '🥇 #1' : m.rank === 2 ? '🥈 #2' : m.rank === 3 ? '🥉 #3' : `#${m.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white print:text-black">{m.userName}</td>
                    <td className="py-3 px-4 font-black text-amber-400 print:text-black">
                      {m.finalScoreDisplay}
                    </td>
                    <td className="py-3 px-4 font-bold">{m.achievementPercentage.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-emerald-400 print:text-black font-semibold">
                      ${m.revenueGenerated.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{m.projectClosed}</td>
                    <td className="py-3 px-4">{m.upsells}</td>
                    <td className="py-3 px-4">{m.clientRating > 0 ? `${m.clientRating.toFixed(1)} ★` : '0 ★'}</td>
                    <td className="py-3 px-4">{m.followupsCompleted}</td>
                    <td className="py-3 px-4">{m.repeatClients}</td>
                    <td className="py-3 px-4 font-semibold">{m.performanceBand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corporate Signatures & Authentication Stamp */}
        <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-black">
          <div>
            <p className="font-bold text-white print:text-black">Prepared By:</p>
            <p className="mt-6 border-t border-slate-700 print:border-black pt-1">
              IT SMM Tigers Automated Scoring Engine
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-white print:text-black">Authorized & Approved:</p>
            <p className="mt-6 border-t border-slate-700 print:border-black pt-1">
              Leadership & Operations Command
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
