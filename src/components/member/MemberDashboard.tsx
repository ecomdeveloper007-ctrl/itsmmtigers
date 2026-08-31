import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Users,
  Repeat,
  Calendar,
  Lock,
  Edit,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { PerformanceRecord } from '../../types';

export const MemberDashboard: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const {
    records,
    periods,
    kpis,
    settings,
    selectedMonth,
    selectedYear,
    openDataEntryModal,
    getMemberSummary,
    isPeriodLocked,
  } = useApp();

  if (!currentUser) return null;

  // Get current user's computed score and summary
  const summary = getMemberSummary(currentUser.uid) || getMemberSummary(currentUser.userId);

  // Filter records submitted by current user for current month/year
  const userRecords = records
    .filter(
      (r) =>
        (r.userId === currentUser.uid || r.userId === currentUser.userId) &&
        r.month.toLowerCase() === selectedMonth.toLowerCase() &&
        r.year === selectedYear
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const kpiMap = Object.fromEntries(kpis.map((k) => [k.key, k]));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-orange-950/60 via-slate-900 to-amber-950/50 border border-orange-500/30 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Trophy className="w-48 h-48 text-orange-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-orange-500/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                  {currentUser.department || 'Tiger Performer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Performance Dashboard for <strong className="text-orange-400">{selectedMonth} {selectedYear}</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-slate-300">
                  Status Band:{' '}
                  <strong className="text-emerald-400">{summary?.performanceBand || 'Good'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => openDataEntryModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + Enter Weekly Performance
            </button>
          </div>
        </div>
      </div>

      {/* Main Scorecard / KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Current Rank */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Current Rank
            </span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {summary ? `#${summary.rank}` : 'N/A'}
            </span>
            {summary?.rank === 1 && (
              <span className="text-xs font-bold text-amber-400">🥇 Gold Leader</span>
            )}
            {summary?.rank === 2 && (
              <span className="text-xs font-bold text-slate-300">🥈 Silver</span>
            )}
            {summary?.rank === 3 && (
              <span className="text-xs font-bold text-amber-500">🥉 Bronze</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on monthly weighted score</p>
        </div>

        {/* Card 2: Final Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/15 via-slate-900 to-slate-900 border border-orange-500/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">
              My Final Score
            </span>
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-black text-orange-400">
              {summary?.finalScoreDisplay || '0.00'}
            </span>
            <span className="text-xs font-bold text-slate-500">/ 100 PTS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculated across 6 KPI weights</p>
        </div>

        {/* Card 3: Overall Achievement % */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Achievement Rate
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {summary?.achievementPercentage ? summary.achievementPercentage.toFixed(1) : '0.0'}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Capped at 100% per metric</p>
        </div>

        {/* Card 4: Submissions Logged */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Weeks Logged
            </span>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{userRecords.length} Weeks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active for {selectedMonth} {selectedYear}</p>
        </div>
      </div>

      {/* Detailed KPI Progress Bars against Targets (Prompt 19) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">KPI Target Performance & Progress</h3>
            <p className="text-xs text-slate-400">
              Visual breakdown of actual results against monthly benchmark targets
            </p>
          </div>
          <span className="text-xs font-semibold text-orange-400">
            Total Weight: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue Generated */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Revenue Generated (Weight: 30%)</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                ${(summary?.revenueGenerated ?? 0).toLocaleString()} / $
                {Number(summary?.breakdown?.['kpi_revenue']?.target ?? 10000).toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_revenue']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_revenue']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_revenue']?.score?.toFixed(2) || '0.00'} / 30 pts
              </span>
            </div>
          </div>

          {/* Projects Closed */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white">Projects Closed (Weight: 20%)</span>
              </div>
              <span className="text-xs font-bold text-orange-400">
                {summary?.projectClosed || 0} / {summary?.breakdown['kpi_projects']?.target ?? 25} Projects
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown['kpi_projects']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_projects']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_projects']?.score?.toFixed(2) || '0.00'} / 20 pts
              </span>
            </div>
          </div>

          {/* Upsells */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Upsells (Weight: 15%)</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                {summary?.upsells || 0} / {summary?.breakdown?.['kpi_upsells']?.target ?? 10} Upsells
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_upsells']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_upsells']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_upsells']?.score?.toFixed(2) || '0.00'} / 15 pts
              </span>
            </div>
          </div>

          {/* Client Rating */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-white">Client Rating (Weight: 10%)</span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {summary?.clientRating ? `${summary.clientRating.toFixed(1)} ★` : '0 ★'} / 5.0 ★
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_rating']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_rating']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_rating']?.score?.toFixed(2) || '0.00'} / 10 pts
              </span>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Follow-ups Completed (Weight: 10%)</span>
              </div>
              <span className="text-xs font-bold text-purple-400">
                {summary?.followupsCompleted || 0} / {summary?.breakdown?.['kpi_followup']?.target ?? 50}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_followup']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_followup']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_followup']?.score?.toFixed(2) || '0.00'} / 10 pts
              </span>
            </div>
          </div>

          {/* Repeat Clients */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-white">Repeat Clients (Weight: 15%)</span>
              </div>
              <span className="text-xs font-bold text-pink-400">
                {summary?.repeatClients || 0} / {summary?.breakdown?.['kpi_repeat']?.target ?? 10} Clients
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_repeat']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Progress: {summary?.breakdown?.['kpi_repeat']?.achievementPercentage?.toFixed(2) || '0.00'}%</span>
              <span className="text-amber-400 font-semibold">
                Score: {summary?.breakdown?.['kpi_repeat']?.score?.toFixed(2) || '0.00'} / 15 pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Entry History Table (Prompt 20) */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">My Submitted Weekly Performance History</h3>
            <p className="text-xs text-slate-400">
              View your weekly logs and edit allowed records
            </p>
          </div>
          <button
            onClick={() => openDataEntryModal()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
          >
            + Log New Week
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Period / Week</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Upsells</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Follow-ups</th>
                <th className="py-3 px-4">Repeat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {userRecords.map((rec) => {
                const locked = isPeriodLocked(rec.periodId);
                const canEdit = !locked || isSuperAdmin;
                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {rec.weekName} ({rec.month} {rec.year})
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{rec.projectClosed}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ${(rec.revenueGenerated ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-400">{rec.upsells}</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-400">
                      {rec.clientRating > 0 ? `${rec.clientRating.toFixed(1)} ★` : '0 ★'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{rec.followupsCompleted}</td>
                    <td className="py-3.5 px-4 text-slate-300">{rec.repeatClients}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                          <CheckCircle className="w-3 h-3" /> Editable
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openDataEntryModal(rec, rec.periodId)}
                        disabled={!canEdit}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          canEdit
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        {canEdit ? 'Edit' : 'Locked'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {userRecords.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-orange-400" />
            <p className="text-sm font-semibold">No performance logs found for {selectedMonth} {selectedYear}.</p>
            <p className="text-xs text-slate-500 mt-1">Click "+ Log New Week" to record your progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};
