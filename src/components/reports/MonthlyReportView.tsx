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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#e2ebd9] shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-[#101010]">Monthly Rewards & Recognition Report</h2>
          </div>
          <p className="text-xs text-[#666666] mt-1 font-medium">
            Official Performance & Winner Audit Document for <strong className="text-[#101010]">{selectedMonth} {selectedYear}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#f5f5f5] hover:bg-[#eaeaea] text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#436320]" />
              Export CSV Data
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db438] text-[#101010] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report / PDF
          </button>
        </div>
      </div>

      <TeamDashboardSwitcher />

      {/* Printable Report Document Card */}
      <div className="rounded-3xl border border-[#e2ebd9] bg-white p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none print:bg-white text-[#101010]">
        {/* Document Header */}
        <div className="border-b border-[#e2ebd9] print:border-black pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8cc540] flex items-center justify-center text-[#101010] font-black text-xl shadow-sm">
              🐅
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-[#101010]">
                IT SMM TIGERS
              </h1>
              <p className="text-xs font-black text-[#436320] uppercase tracking-widest print:text-black">
                Monthly Performance, Rewards & Recognition Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <p className="text-[#666666] print:text-gray-600">
              Period: <strong className="text-[#101010] print:text-black">{selectedMonth} {selectedYear}</strong>
            </p>
            <p className="text-[#666666] print:text-gray-600">
              Generated: <strong className="text-[#101010] print:text-black">{new Date().toLocaleDateString()}</strong>
            </p>
            <p className="text-[#436320] print:text-green-700 font-bold mt-0.5">
              Status: Verified & Audited
            </p>
          </div>
        </div>

        {/* Winner Highlight Box */}
        {winner && (
          <div className="p-6 rounded-2xl bg-[#f8faf6] border-2 border-[#8cc540] print:border-black print:bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#8cc540] to-amber-400 shadow-sm shrink-0">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#8cc540] text-[#101010] uppercase tracking-wider">
                  🥇 WINNER OF THE MONTH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#101010] mt-1">
                  {winner.userName}
                </h2>
                <p className="text-xs text-[#666666] print:text-gray-600 font-medium">
                  {winner.weeksSubmitted} week(s) evaluated • Overall Achievement: {winner.achievementPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right px-6 py-3 rounded-xl bg-white print:bg-gray-100 border border-[#e2ebd9] print:border-gray-300 shadow-sm">
              <span className="text-[11px] font-black text-[#555555] uppercase tracking-wider block">
                Final Score
              </span>
              <div className="flex items-baseline justify-center sm:justify-end gap-1">
                <span className="text-3xl font-black text-[#101010] print:text-black">
                  {winner.finalScoreDisplay}
                </span>
                <span className="text-sm font-bold text-[#888888]">/ 100 PTS</span>
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
              <div className="p-3.5 rounded-xl bg-[#f8faf6] print:bg-gray-100 border border-[#e2ebd9] print:border-gray-300">
                <span className="text-[10px] text-[#666666] print:text-gray-600 uppercase font-black">Gross Revenue</span>
                <p className="text-base sm:text-lg font-black text-[#101010]">
                  {sym}{(grossRev || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-[#888888] font-medium">Before Fee</span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-50 print:bg-red-50 border border-rose-200 print:border-red-300">
                <span className="text-[10px] text-rose-800 print:text-red-700 uppercase font-black">Platform Fee (-20%)</span>
                <p className="text-base sm:text-lg font-black text-rose-700 print:text-red-600">
                  -{sym}{(feeAmount || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-rose-600 font-medium">20% Deduction</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f3f8ef] print:bg-emerald-50 border-2 border-[#8cc540] print:border-emerald-700">
                <span className="text-[10px] text-[#436320] print:text-emerald-800 uppercase font-black">Month-End Net</span>
                <p className="text-base sm:text-lg font-black text-[#436320] print:text-emerald-700">
                  {sym}{(netRev || 0).toLocaleString()}
                </p>
                <span className="text-[9px] text-[#436320] font-black">Final Settlement</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8faf6] print:bg-gray-100 border border-[#e2ebd9] print:border-gray-300">
                <span className="text-[10px] text-[#666666] print:text-gray-600 uppercase font-black">Projects Closed</span>
                <p className="text-base sm:text-lg font-black text-[#101010]">{teamStats?.totalProjects ?? 0}</p>
                <span className="text-[9px] text-[#888888] font-medium">All Profiles</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8faf6] print:bg-gray-100 border border-[#e2ebd9] print:border-gray-300">
                <span className="text-[10px] text-[#666666] print:text-gray-600 uppercase font-black">Total Upsells</span>
                <p className="text-base sm:text-lg font-black text-purple-700 print:text-black">{teamStats?.totalUpsells ?? 0}</p>
                <span className="text-[9px] text-[#888888] font-medium">Client Expansions</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#f8faf6] print:bg-gray-100 border border-[#e2ebd9] print:border-gray-300">
                <span className="text-[10px] text-[#666666] print:text-gray-600 uppercase font-black">Avg Score</span>
                <p className="text-base sm:text-lg font-black text-[#101010]">
                  {(teamStats?.avgTeamScore ?? 0).toFixed(2)} / 100
                </p>
                <span className="text-[9px] text-[#888888] font-medium">Weighted Performance</span>
              </div>
            </div>
          );
        })()}

        {/* Profile-Wise Month-End Revenue Breakdown Audit Table */}
        {revenueSummary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#436320] print:text-black" />
                <h3 className="text-sm font-black text-[#101010] print:text-black uppercase tracking-wider">
                  Month-End Profile-Wise Revenue Audit (-20% Automated Platform Fee)
                </h3>
              </div>
              <span className="text-[11px] text-[#666666] font-medium print:text-gray-600">
                Net Revenue = Gross Revenue - 20% Platform Charge
              </span>
            </div>

            <div className="rounded-2xl border border-[#e2ebd9] print:border-black overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2ebd9] print:border-black bg-[#f5f5f5] print:bg-gray-200 text-[10px] font-black text-[#555555] print:text-black uppercase tracking-wider">
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
                <tbody className="divide-y divide-[#e2ebd9] print:divide-gray-300">
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
                      <tr key={pCode} className="hover:bg-[#f8faf6] print:hover:bg-transparent">
                        <td className="py-2 px-4 text-blue-700 print:text-blue-700 font-black">IT Team</td>
                        <td className="py-2 px-4 font-black">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 print:bg-blue-100 print:text-blue-800 border border-blue-200">
                            {pCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-[#101010] print:text-black font-semibold">{info?.title || `${pCode} Profile`}</td>
                        <td className="py-2 px-4 text-center text-[#555555] font-bold">{item.memberCount ?? 0}</td>
                        <td className="py-2 px-4 text-center text-[#555555] font-bold">{item.projectCount ?? 0}</td>
                        <td className="py-2 px-4 text-right text-[#101010] font-bold">
                          {sym}{(item.grossRevenue ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-rose-700 font-bold">
                          -{sym}{(item.platformFee ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-[#436320] font-black">
                          {sym}{(item.netRevenue ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* IT Subtotal */}
                  <tr className="bg-[#f8faf6] print:bg-gray-100 font-black border-t border-b border-[#e2ebd9] print:border-gray-400">
                    <td colSpan={3} className="py-2 px-4 text-[#101010] uppercase text-[11px]">
                      💻 Subtotal — IT Division (PR + WR + HW)
                    </td>
                    <td className="py-2 px-4 text-center text-[#101010]">
                      {revenueSummary.itTeam?.activeMembers ?? revenueSummary.itRevenue?.memberCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-center text-[#101010]">
                      {revenueSummary.itTeam?.totalProjects ?? revenueSummary.itRevenue?.projectCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-right text-[#101010] font-black">
                      {sym}{(revenueSummary.itTeam?.grossRevenue ?? revenueSummary.itRevenue?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-rose-700 font-black">
                      -{sym}{(revenueSummary.itTeam?.platformFee ?? revenueSummary.itRevenue?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-[#436320] font-black text-sm">
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
                      <tr key={pCode} className="hover:bg-[#f8faf6] print:hover:bg-transparent">
                        <td className="py-2 px-4 text-purple-700 print:text-purple-700 font-black">SMM Team</td>
                        <td className="py-2 px-4 font-black">
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 print:bg-purple-100 print:text-purple-800 border border-purple-200">
                            {pCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-[#101010] print:text-black font-semibold">{info?.title || `${pCode} Profile`}</td>
                        <td className="py-2 px-4 text-center text-[#555555] font-bold">{item.memberCount ?? 0}</td>
                        <td className="py-2 px-4 text-center text-[#555555] font-bold">{item.projectCount ?? 0}</td>
                        <td className="py-2 px-4 text-right text-[#101010] font-bold">
                          {sym}{(item.grossRevenue ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-rose-700 font-bold">
                          -{sym}{(item.platformFee ?? 0).toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right text-[#436320] font-black">
                          {sym}{(item.netRevenue ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {/* SMM Subtotal */}
                  <tr className="bg-[#f8faf6] print:bg-gray-100 font-black border-t border-b border-[#e2ebd9] print:border-gray-400">
                    <td colSpan={3} className="py-2 px-4 text-[#101010] uppercase text-[11px]">
                      📱 Subtotal — SMM Division (RR + DR)
                    </td>
                    <td className="py-2 px-4 text-center text-[#101010]">
                      {revenueSummary.smmTeam?.activeMembers ?? revenueSummary.smmRevenue?.memberCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-center text-[#101010]">
                      {revenueSummary.smmTeam?.totalProjects ?? revenueSummary.smmRevenue?.projectCount ?? 0}
                    </td>
                    <td className="py-2 px-4 text-right text-[#101010] font-black">
                      {sym}{(revenueSummary.smmTeam?.grossRevenue ?? revenueSummary.smmRevenue?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-rose-700 font-black">
                      -{sym}{(revenueSummary.smmTeam?.platformFee ?? revenueSummary.smmRevenue?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-right text-[#436320] font-black text-sm">
                      {sym}{(revenueSummary.smmTeam?.netRevenue ?? revenueSummary.smmRevenue?.finalNetRevenue ?? 0).toLocaleString()}
                    </td>
                  </tr>

                  {/* Grand Total All Teams */}
                  <tr className="bg-[#f3f8ef] print:bg-gray-200 font-black text-sm border-t-2 border-[#8cc540] print:border-black">
                    <td colSpan={3} className="py-3 px-4 text-[#101010] uppercase">
                      🌟 Grand Total — All Teams (IT + SMM)
                    </td>
                    <td className="py-3 px-4 text-center text-[#101010]">
                      {(revenueSummary.itTeam?.activeMembers ?? revenueSummary.itRevenue?.memberCount ?? 0) +
                        (revenueSummary.smmTeam?.activeMembers ?? revenueSummary.smmRevenue?.memberCount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-center text-[#101010]">
                      {(revenueSummary.itTeam?.totalProjects ?? revenueSummary.itRevenue?.projectCount ?? 0) +
                        (revenueSummary.smmTeam?.totalProjects ?? revenueSummary.smmRevenue?.projectCount ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#101010] font-black">
                      {sym}{(revenueSummary.totalGrossRevenue ?? revenueSummary.grandTotal?.grossRevenue ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-700 font-black">
                      -{sym}{(revenueSummary.totalPlatformFee ?? revenueSummary.grandTotal?.platformFeeAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-[#436320] text-base font-black">
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
          <h3 className="text-sm font-black text-[#101010] print:text-black uppercase tracking-wider">
            Complete Team Standings & Scores
          </h3>

          <div className="rounded-2xl border border-[#e2ebd9] print:border-black overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#e2ebd9] print:border-black bg-[#f5f5f5] print:bg-gray-200 text-[10px] font-black text-[#555555] print:text-black uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#e2ebd9] print:divide-gray-300">
                {rankings.map((m) => {
                  const gross = m.revenueGenerated ?? 0;
                  const net = Math.round(gross * 0.8);
                  return (
                    <tr key={m.userId} className={m.rank === 1 ? 'bg-[#f3f8ef] font-bold' : 'hover:bg-[#f8faf6]'}>
                      <td className="py-3 px-3 font-black">
                        {m.rank === 1 ? '🥇 #1' : m.rank === 2 ? '🥈 #2' : m.rank === 3 ? '🥉 #3' : `#${m.rank}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#101010]">
                        {m.userName}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          ['PR', 'WR', 'HW'].includes(m.profileCode || '')
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {m.profileCode || (m.team === 'IT' ? 'PR' : 'RR')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-[#101010]">
                        {m.finalScoreDisplay}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#436320]">{m.achievementPercentage.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-right text-[#101010] font-semibold">
                        {sym}{gross.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-[#436320] font-black">
                        {sym}{net.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">{m.projectClosed}</td>
                      <td className="py-3 px-3 text-center font-semibold">{m.upsells}</td>
                      <td className="py-3 px-3 text-center font-semibold text-amber-600">
                        {m.clientRating > 0 ? `${m.clientRating.toFixed(1)} ★` : '0 ★'}
                      </td>
                      <td className="py-3 px-3 text-center">{m.followupsCompleted}</td>
                      <td className="py-3 px-3 text-center">{m.repeatClients}</td>
                      <td className="py-3 px-3 font-bold text-[#101010]">{m.performanceBand}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Corporate Signatures & Authentication Stamp */}
        <div className="pt-8 border-t border-[#e2ebd9] print:border-black grid grid-cols-2 gap-8 text-xs text-[#666666] print:text-black">
          <div>
            <p className="font-bold text-[#101010] print:text-black">Prepared By:</p>
            <p className="mt-6 border-t border-[#e2ebd9] print:border-black pt-1 font-medium">
              IT SMM Tigers Automated Scoring Engine
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#101010] print:text-black">Authorized & Approved:</p>
            <p className="mt-6 border-t border-[#e2ebd9] print:border-black pt-1 font-medium">
              Leadership & Operations Command
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

