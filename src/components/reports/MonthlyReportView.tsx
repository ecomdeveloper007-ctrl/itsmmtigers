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
  TrendingDown,
  Layers,
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { ALL_PROFILES, ProfileCode } from '../../types';

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
  const { winner, top3, rankings, teamStats, revenueSummary } = leaderboardData;

  const sym = settings.currencySymbol || '$';

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
        {(() => {
          const grossRev = revenueSummary?.totalGrossRevenue ?? revenueSummary?.grandTotal?.grossRevenue ?? teamStats?.totalRevenue ?? 0;
          const feeAmount = revenueSummary?.totalPlatformFee ?? revenueSummary?.grandTotal?.platformFeeAmount ?? Math.round(grossRev * 0.2);
          const netRev = revenueSummary?.totalNetRevenue ?? revenueSummary?.grandTotal?.finalNetRevenue ?? Math.round(grossRev * 0.8);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Gross Revenue</span>
                <p className="text-base sm:text-lg font-black text-white print:text-black">
                  {sym}{(grossRev || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-slate-500 print:text-gray-500">Before Fee</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-950/40 print:bg-red-50 border border-rose-800/60 print:border-red-300">
                <span className="text-[10px] text-rose-300 print:text-red-700 uppercase font-bold">Platform Fee (-20%)</span>
                <p className="text-base sm:text-lg font-black text-rose-400 print:text-red-600">
                  -{sym}{(feeAmount || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-rose-400/80 print:text-red-600">20% Deduction</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 print:bg-emerald-50 border-2 border-emerald-500 print:border-emerald-700">
                <span className="text-[10px] text-emerald-300 print:text-emerald-800 uppercase font-bold">Month-End Net</span>
                <p className="text-base sm:text-lg font-black text-emerald-400 print:text-emerald-700">
                  {sym}{(netRev || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-emerald-400/90 print:text-emerald-800 font-bold">Final Settlement</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Projects Closed</span>
                <p className="text-base sm:text-lg font-black text-white print:text-black">{teamStats?.totalProjects ?? 0}</p>
                <span className="text-[9px] text-slate-500 print:text-gray-500">All Profiles</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Total Upsells</span>
                <p className="text-base sm:text-lg font-black text-cyan-400 print:text-black">{teamStats?.totalUpsells ?? 0}</p>
                <span className="text-[9px] text-slate-500 print:text-gray-500">Client Expansions</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 uppercase font-bold">Avg Score</span>
                <p className="text-base sm:text-lg font-black text-amber-400 print:text-black">
                  {(teamStats?.avgTeamScore ?? 0).toFixed(2)} / 100
                </p>
                <span className="text-[9px] text-slate-500 print:text-gray-500">Weighted Performance</span>
              </div>
            </div>
          );
        })()}

        {/* Profile-Wise Month-End Revenue Breakdown Audit Table */}
        {revenueSummary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400 print:text-black" />
                <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
                  Month-End Profile-Wise Revenue Audit (-20% Automated Platform Fee)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 print:text-gray-600">
                Net Revenue = Gross Revenue - 20% Platform Charge
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 print:border-black overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black bg-slate-950 print:bg-gray-200 text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider">
                    <th className="py-2.5 px-4">Division</th>
                    <th className="py-2.5 px-4">Profile Code</th>
                    <th className="py-2.5 px-4">Profile Designation</th>
                    <th className="py-2.5 px-4 text-center">Active Members</th>
                    <th className="py-2.5 px-4 text-center">Projects</th>
                    <th className="py-2.5 px-4 text-right">Gross Billing ({sym})</th>
                    <th className="py-2.5 px-4 text-right">Platform Fee (-20%)</th>
                    <th className="py-2.5 px-4 text-right font-black">Month-End Net ({sym})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {/* IT Profiles: PR, WR, HW */}
                  {(['PR', 'WR', 'HW'] as const).map((pCode) => {
                    const item = revenueSummary.profiles?.[pCode] || revenueSummary.profileBreakdown?.[pCode] || {
                      memberCount: 0,
                      projectCount: 0,
                      grossRevenue: 0,
                      platformFee: 0,
                      netRevenue: 0,
                    };
                    const info = ALL_PROFILES[pCode] || { title: `${pCode} Profile` };
                    return (
                      <tr key={pCode} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="py-2 px-4 text-cyan-400 print:text-blue-700 font-bold">IT Team</td>
                        <td className="py-2 px-4 font-black">
                          <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 print:bg-blue-100 print:text-blue-800 border border-blue-700/50 print:border-blue-300">
                            {pCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-300 print:text-black font-medium">{info?.title || `${pCode} Profile`}</td>
                        <td className="py-2 px-4 text-center text-slate-300 print:text-black">{item.memberCount ?? 0}</td>
                        <td className="py-2 px-4 text-center text-slate-300 print:text-black">{item.projectCount ?? 0}</td>
                        <td className="py-2 px-4 text-right text-slate-300 print:text-black font-medium">
                          {sym}{(item.grossRevenue ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-rose-400 print:text-red-700 font-medium">
                          -{sym}{(item.platformFee ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-400 print:text-green-800 font-black">
                          {sym}{(item.netRevenue ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* IT Subtotal */}
                  <tr className="bg-slate-950/80 print:bg-gray-100 font-bold border-t border-b border-slate-700 print:border-gray-400">
                    <td colSpan={3} className="py-2 px-4 text-white print:text-black uppercase text-[11px]">
                      💻 Subtotal — IT Division (PR + WR + HW)
                    </td>
                    <td className="py-2 px-4 text-center text-white print:text-black">
                      {revenueSummary.itTeam?.activeMembers ?? revenueSummary.itRevenue?.memberCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-center text-white print:text-black">
                      {revenueSummary.itTeam?.totalProjects ?? revenueSummary.itRevenue?.projectCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-right text-white print:text-black font-bold">
                      {sym}{(revenueSummary.itTeam?.grossRevenue ?? revenueSummary.itRevenue?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400 print:text-red-700 font-bold">
                      -{sym}{(revenueSummary.itTeam?.platformFee ?? revenueSummary.itRevenue?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-400 print:text-green-800 font-black text-sm">
                      {sym}{(revenueSummary.itTeam?.netRevenue ?? revenueSummary.itRevenue?.finalNetRevenue ?? 0).toLocaleString()}
                    </td>
                  </tr>

                  {/* SMM Profiles: RR, DR */}
                  {(['RR', 'DR'] as const).map((pCode) => {
                    const item = revenueSummary.profiles?.[pCode] || revenueSummary.profileBreakdown?.[pCode] || {
                      memberCount: 0,
                      projectCount: 0,
                      grossRevenue: 0,
                      platformFee: 0,
                      netRevenue: 0,
                    };
                    const info = ALL_PROFILES[pCode] || { title: `${pCode} Profile` };
                    return (
                      <tr key={pCode} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                        <td className="py-2 px-4 text-purple-400 print:text-purple-700 font-bold">SMM Team</td>
                        <td className="py-2 px-4 font-black">
                          <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 print:bg-purple-100 print:text-purple-800 border border-purple-700/50 print:border-purple-300">
                            {pCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-300 print:text-black font-medium">{info?.title || `${pCode} Profile`}</td>
                        <td className="py-2 px-4 text-center text-slate-300 print:text-black">{item.memberCount ?? 0}</td>
                        <td className="py-2 px-4 text-center text-slate-300 print:text-black">{item.projectCount ?? 0}</td>
                        <td className="py-2 px-4 text-right text-slate-300 print:text-black font-medium">
                          {sym}{(item.grossRevenue ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-rose-400 print:text-red-700 font-medium">
                          -{sym}{(item.platformFee ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-emerald-400 print:text-green-800 font-black">
                          {sym}{(item.netRevenue ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* SMM Subtotal */}
                  <tr className="bg-slate-950/80 print:bg-gray-100 font-bold border-t border-b border-slate-700 print:border-gray-400">
                    <td colSpan={3} className="py-2 px-4 text-white print:text-black uppercase text-[11px]">
                      📱 Subtotal — SMM Division (RR + DR)
                    </td>
                    <td className="py-2 px-4 text-center text-white print:text-black">
                      {revenueSummary.smmTeam?.activeMembers ?? revenueSummary.smmRevenue?.memberCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-center text-white print:text-black">
                      {revenueSummary.smmTeam?.totalProjects ?? revenueSummary.smmRevenue?.projectCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-right text-white print:text-black font-bold">
                      {sym}{(revenueSummary.smmTeam?.grossRevenue ?? revenueSummary.smmRevenue?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-rose-400 print:text-red-700 font-bold">
                      -{sym}{(revenueSummary.smmTeam?.platformFee ?? revenueSummary.smmRevenue?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-400 print:text-green-800 font-black text-sm">
                      {sym}{(revenueSummary.smmTeam?.netRevenue ?? revenueSummary.smmRevenue?.finalNetRevenue ?? 0).toLocaleString()}
                    </td>
                  </tr>

                  {/* Grand Total All Teams */}
                  <tr className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-emerald-950/60 print:bg-gray-200 font-black text-sm border-t-2 border-emerald-500 print:border-black">
                    <td colSpan={3} className="py-3 px-4 text-white print:text-black uppercase">
                      🌟 Grand Total — All Teams (IT + SMM)
                    </td>
                    <td className="py-3 px-4 text-center text-white print:text-black">
                      {(revenueSummary.itTeam?.activeMembers ?? revenueSummary.itRevenue?.memberCount ?? 0) +
                        (revenueSummary.smmTeam?.activeMembers ?? revenueSummary.smmRevenue?.memberCount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-center text-white print:text-black">
                      {(revenueSummary.itTeam?.totalProjects ?? revenueSummary.itRevenue?.projectCount ?? 0) +
                        (revenueSummary.smmTeam?.totalProjects ?? revenueSummary.smmRevenue?.projectCount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-white print:text-black">
                      {sym}{(revenueSummary.totalGrossRevenue ?? revenueSummary.grandTotal?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-400 print:text-red-700">
                      -{sym}{(revenueSummary.totalPlatformFee ?? revenueSummary.grandTotal?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 print:text-green-800 text-base font-black">
                      {sym}{(revenueSummary.totalNetRevenue ?? revenueSummary.grandTotal?.finalNetRevenue ?? 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Rankings Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Complete Team Standings & Scores
          </h3>

          <div className="rounded-2xl border border-slate-800 print:border-black overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-black bg-slate-950 print:bg-gray-200 text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Team Member</th>
                  <th className="py-3 px-2">Profile</th>
                  <th className="py-3 px-3">Final Score</th>
                  <th className="py-3 px-3">Achievement %</th>
                  <th className="py-3 px-3 text-right">Gross Rev ({sym})</th>
                  <th className="py-3 px-3 text-right">Net Rev (-20%)</th>
                  <th className="py-3 px-3 text-center">Projects</th>
                  <th className="py-3 px-3 text-center">Upsells</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-3 text-center">Follow-ups</th>
                  <th className="py-3 px-3 text-center">Repeat</th>
                  <th className="py-3 px-3">Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                {rankings.map((m) => {
                  const gross = m.revenueGenerated ?? 0;
                  const net = Math.round(gross * 0.8);
                  return (
                    <tr key={m.userId} className={m.rank === 1 ? 'bg-amber-500/10 font-semibold' : ''}>
                      <td className="py-3 px-3 font-bold">
                        {m.rank === 1 ? '🥇 #1' : m.rank === 2 ? '🥈 #2' : m.rank === 3 ? '🥉 #3' : `#${m.rank}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-white print:text-black">
                        {m.userName}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          ['PR', 'WR', 'HW'].includes(m.profileCode || '')
                            ? 'bg-blue-900/60 text-blue-300 print:bg-blue-100 print:text-blue-800 border border-blue-700/40'
                            : 'bg-purple-900/60 text-purple-300 print:bg-purple-100 print:text-purple-800 border border-purple-700/40'
                        }`}>
                          {m.profileCode || (m.team === 'IT' ? 'PR' : 'RR')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-amber-400 print:text-black">
                        {m.finalScoreDisplay}
                      </td>
                      <td className="py-3 px-3 font-bold">{m.achievementPercentage.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right text-slate-300 print:text-black font-semibold">
                        {sym}{gross.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 print:text-green-800 font-bold">
                        {sym}{net.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">{m.projectClosed}</td>
                      <td className="py-3 px-3 text-center">{m.upsells}</td>
                      <td className="py-3 px-3 text-center">{m.clientRating > 0 ? `${m.clientRating.toFixed(1)} ★` : '0 ★'}</td>
                      <td className="py-3 px-3 text-center">{m.followupsCompleted}</td>
                      <td className="py-3 px-3 text-center">{m.repeatClients}</td>
                      <td className="py-3 px-3 font-semibold">{m.performanceBand}</td>
                    </tr>
                  );
                })}
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
