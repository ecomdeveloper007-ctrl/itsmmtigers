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
  const sym = settings.currencySymbol || '$';

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative rounded-3xl bg-white border border-[#e2ebd9] p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Trophy className="w-48 h-48 text-[#8cc540]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#8cc540] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#101010]">{currentUser.name}</h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f3f8ef] text-[#436320] font-black border border-[#8cc540]/30 uppercase tracking-wider">
                  {currentUser.department || 'Tiger Performer'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#101010] text-white font-bold uppercase">
                  {currentUser.profileCode || 'PR'} Profile
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-1 font-medium">
                Individual Performance Dashboard for <strong className="text-[#101010]">{selectedMonth} {selectedYear}</strong>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-[#555555]">
                  Status Band:{' '}
                  <span className="text-[#436320] font-black px-2 py-0.5 rounded-md bg-[#f3f8ef] border border-[#8cc540]/40">
                    {summary?.performanceBand || 'Good'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => openDataEntryModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db438] text-[#101010] shadow-sm transition-all cursor-pointer"
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
        <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#555555] uppercase tracking-wider">
              Current Rank
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#101010]">
              {summary ? `#${summary.rank}` : 'N/A'}
            </span>
            {summary?.rank === 1 && (
              <span className="text-xs font-black text-[#436320] bg-[#8cc540]/20 px-2 py-0.5 rounded-full">🥇 Gold Leader</span>
            )}
            {summary?.rank === 2 && (
              <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">🥈 Silver</span>
            )}
            {summary?.rank === 3 && (
              <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">🥉 Bronze</span>
            )}
          </div>
          <p className="text-[11px] text-[#666666] font-medium">Based on monthly weighted score</p>
        </div>

        {/* Card 2: Final Score */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#555555] uppercase tracking-wider">
              My Final Score
            </span>
            <div className="p-2 rounded-xl bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              <Sparkles className="w-4 h-4 text-[#598327]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[#101010]">
              {summary?.finalScoreDisplay || '0.00'}
            </span>
            <span className="text-xs font-bold text-[#888888]">/ 100 PTS</span>
          </div>
          <p className="text-[11px] text-[#666666] font-medium">Calculated across 6 KPI weights</p>
        </div>

        {/* Card 3: Overall Achievement % */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#555555] uppercase tracking-wider">
              Achievement Rate
            </span>
            <div className="p-2 rounded-xl bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/30">
              <TrendingUp className="w-4 h-4 text-[#598327]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#436320]">
              {summary?.achievementPercentage ? summary.achievementPercentage.toFixed(1) : '0.0'}%
            </span>
          </div>
          <p className="text-[11px] text-[#666666] font-medium">Capped at 100% per metric</p>
        </div>

        {/* Card 4: Submissions Logged */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#555555] uppercase tracking-wider">
              Weeks Logged
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#101010]">{userRecords.length} Weeks</span>
          </div>
          <p className="text-[11px] text-[#666666] font-medium">Active for {selectedMonth} {selectedYear}</p>
        </div>
      </div>

      {/* Detailed KPI Progress Bars against Targets */}
      <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 shadow-sm space-y-5">
        <div className="border-b border-[#e2ebd9] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#101010]">KPI Target Performance & Progress</h3>
            <p className="text-xs text-[#666666] font-medium">
              Visual breakdown of actual results against monthly benchmark targets
            </p>
          </div>
          <span className="text-xs font-black text-[#436320] px-2.5 py-1 rounded-full bg-[#f3f8ef] border border-[#8cc540]/30">
            Total Weight: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue Generated */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#598327]" />
                <span className="text-xs font-black text-[#101010]">Revenue Generated (Weight: 30%)</span>
              </div>
              <span className="text-xs font-black text-[#436320]">
                {sym}{(summary?.revenueGenerated ?? 0).toLocaleString()} / {sym}
                {Number(summary?.breakdown?.['kpi_revenue']?.target ?? 10000).toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-[#8cc540] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_revenue']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_revenue']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-[#436320] font-black">
                Score: {summary?.breakdown?.['kpi_revenue']?.score?.toFixed(2) || '0.00'} / 30 pts
              </span>
            </div>
          </div>

          {/* Projects Closed */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black text-[#101010]">Projects Closed (Weight: 20%)</span>
              </div>
              <span className="text-xs font-black text-blue-700">
                {summary?.projectClosed || 0} / {summary?.breakdown?.['kpi_projects']?.target ?? 25} Projects
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_projects']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_projects']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-blue-700 font-black">
                Score: {summary?.breakdown?.['kpi_projects']?.score?.toFixed(2) || '0.00'} / 20 pts
              </span>
            </div>
          </div>

          {/* Upsells */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-black text-[#101010]">Upsells (Weight: 15%)</span>
              </div>
              <span className="text-xs font-black text-purple-700">
                {summary?.upsells || 0} / {summary?.breakdown?.['kpi_upsells']?.target ?? 10} Upsells
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_upsells']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_upsells']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-purple-700 font-black">
                Score: {summary?.breakdown?.['kpi_upsells']?.score?.toFixed(2) || '0.00'} / 15 pts
              </span>
            </div>
          </div>

          {/* Client Rating */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-[#101010]">Client Rating (Weight: 10%)</span>
              </div>
              <span className="text-xs font-black text-amber-600">
                {summary?.clientRating ? `${summary.clientRating.toFixed(1)} ★` : '0 ★'} / 5.0 ★
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_rating']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_rating']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-amber-600 font-black">
                Score: {summary?.breakdown?.['kpi_rating']?.score?.toFixed(2) || '0.00'} / 10 pts
              </span>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-[#101010]">Follow-ups Completed (Weight: 10%)</span>
              </div>
              <span className="text-xs font-black text-indigo-700">
                {summary?.followupsCompleted || 0} / {summary?.breakdown?.['kpi_followup']?.target ?? 50}
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_followup']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_followup']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-indigo-700 font-black">
                Score: {summary?.breakdown?.['kpi_followup']?.score?.toFixed(2) || '0.00'} / 10 pts
              </span>
            </div>
          </div>

          {/* Repeat Clients */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-[#101010]">Repeat Clients (Weight: 15%)</span>
              </div>
              <span className="text-xs font-black text-emerald-700">
                {summary?.repeatClients || 0} / {summary?.breakdown?.['kpi_repeat']?.target ?? 10} Clients
              </span>
            </div>
            <div className="w-full h-3 bg-[#e8efe2] rounded-full overflow-hidden p-0.5 border border-[#e2ebd9]">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary?.breakdown?.['kpi_repeat']?.achievementPercentage || 0, 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#666666] font-medium">
              <span>Progress: {summary?.breakdown?.['kpi_repeat']?.achievementPercentage?.toFixed(1) || '0.0'}%</span>
              <span className="text-emerald-700 font-black">
                Score: {summary?.breakdown?.['kpi_repeat']?.score?.toFixed(2) || '0.00'} / 15 pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Entry History Table */}
      <div className="rounded-3xl bg-white border border-[#e2ebd9] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e2ebd9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#101010]">My Submitted Weekly Performance History</h3>
            <p className="text-xs text-[#666666] font-medium">
              View your weekly logs and edit allowed records
            </p>
          </div>
          <button
            onClick={() => openDataEntryModal()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7db438] transition-colors cursor-pointer"
          >
            + Log New Week
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2ebd9] bg-[#f5f5f5] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                <th className="py-3.5 px-4">Period / Week</th>
                <th className="py-3.5 px-4">Projects</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4">Upsells</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Follow-ups</th>
                <th className="py-3.5 px-4">Repeat</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4ece0] text-xs">
              {userRecords.map((rec) => {
                const locked = isPeriodLocked(rec.periodId);
                const canEdit = !locked || isSuperAdmin;
                return (
                  <tr key={rec.id} className="hover:bg-[#f3f8ef]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#101010] whitespace-nowrap">
                      {rec.weekName} ({rec.month} {rec.year})
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#101010]">{rec.projectClosed}</td>
                    <td className="py-3.5 px-4 font-black text-[#436320]">
                      {sym}{(rec.revenueGenerated ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">{rec.upsells}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">
                      {rec.clientRating > 0 ? `${rec.clientRating.toFixed(1)} ★` : '0 ★'}
                    </td>
                    <td className="py-3.5 px-4 text-[#555555] font-medium">{rec.followupsCompleted}</td>
                    <td className="py-3.5 px-4 text-[#555555] font-medium">{rec.repeatClients}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
                          <CheckCircle className="w-3 h-3" /> Editable
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openDataEntryModal(rec, rec.periodId)}
                        disabled={!canEdit}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                          canEdit
                            ? 'bg-[#101010] hover:bg-[#333333] text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
          <div className="text-center py-10 text-[#666666]">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#8cc540]" />
            <p className="text-sm font-bold text-[#101010]">No performance logs found for {selectedMonth} {selectedYear}.</p>
            <p className="text-xs text-[#888888] mt-1">Click "+ Log New Week" to record your progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

