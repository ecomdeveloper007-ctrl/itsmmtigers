import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { isUserSuperAdmin, findMatchingSalesEmployee } from '../../utils/salesAuthUtils';
import { SalesProfileCode, SalesPerformanceRecord } from '../../types/sales';
import {
  getProfileSettings,
  calculateSalesPerformanceScore,
  calculateReward,
  aggregateMonthlyRecords,
} from '../../services/salesCalculationService';
import {
  Trophy,
  Award,
  Target,
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Pencil,
  Trash2,
  User,
  Zap,
} from 'lucide-react';

export const SalesMyPerformanceView: React.FC = () => {
  const {
    salesEmployees,
    salesRecords,
    salesSettings,
    openSalesEntryModal,
    deleteSalesPerformanceRecord,
    addToast,
  } = useSales();
  const { currentUser } = useAuth();
  const { selectedMonth, selectedYear } = useApp();
  const isSuperAdmin = isUserSuperAdmin(currentUser);

  const [deletingRecord, setDeletingRecord] = useState<SalesPerformanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Determine current sales member
  const currentEmp = useMemo(() => {
    return findMatchingSalesEmployee(currentUser, salesEmployees);
  }, [currentUser, salesEmployees]);

  // For Super Admin, allow viewing as any member
  const [selectedEmpIdForView, setSelectedEmpIdForView] = useState<string>(
    currentEmp?.id || (salesEmployees[0]?.id ?? '')
  );

  const activeEmp = useMemo(() => {
    if (isSuperAdmin && selectedEmpIdForView) {
      return salesEmployees.find((e) => e.id === selectedEmpIdForView) || currentEmp;
    }
    return currentEmp;
  }, [isSuperAdmin, selectedEmpIdForView, salesEmployees, currentEmp]);

  // Profiles assigned to this employee
  const assignedProfiles: SalesProfileCode[] = useMemo(() => {
    if (!activeEmp) return ['PR'];
    if (activeEmp.assignedProfiles && activeEmp.assignedProfiles.length > 0) {
      return activeEmp.assignedProfiles;
    }
    return activeEmp.profileCode ? [activeEmp.profileCode] : ['PR'];
  }, [activeEmp]);

  const [selectedProfile, setSelectedProfile] = useState<SalesProfileCode>(assignedProfiles[0] || 'PR');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // Update selectedProfile if assignedProfiles changes
  React.useEffect(() => {
    if (!assignedProfiles.includes(selectedProfile)) {
      setSelectedProfile(assignedProfiles[0] || 'PR');
    }
  }, [assignedProfiles, selectedProfile]);

  // Records for this employee, profile, and selected month/year
  const empRecords = useMemo(() => {
    if (!activeEmp) return [];
    return salesRecords.filter(
      (r) =>
        r.employeeId === activeEmp.id &&
        r.profileCode === selectedProfile &&
        r.month.toLowerCase() === selectedMonth.toLowerCase() &&
        Number(r.year) === Number(selectedYear)
    );
  }, [salesRecords, activeEmp, selectedProfile, selectedMonth, selectedYear]);

  // Separate daily vs weekly records
  const dailyRecords = useMemo(() => {
    return empRecords
      .filter((r) => r.entryType === 'daily' || Boolean(r.entryDate))
      .sort((a, b) => (b.entryDate || '').localeCompare(a.entryDate || ''));
  }, [empRecords]);

  const weeklyRecords = useMemo(() => {
    return empRecords.filter((r) => r.entryType !== 'daily' && !r.entryDate);
  }, [empRecords]);

  // Monthly Aggregation
  const monthlyRollup = useMemo(() => {
    if (!activeEmp) return null;
    return aggregateMonthlyRecords(
      empRecords,
      activeEmp.id,
      selectedProfile,
      selectedMonth,
      Number(selectedYear),
      salesSettings
    );
  }, [empRecords, activeEmp, selectedProfile, selectedMonth, selectedYear, salesSettings]);

  const config = getProfileSettings(salesSettings, selectedProfile);

  return (
    <div className="space-y-6">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8cc540]/20 border border-[#8cc540]/40 flex items-center justify-center text-[#598327] font-black text-xl shadow-xs">
            {activeEmp?.avatarUrl ? (
              <img src={activeEmp.avatarUrl} alt={activeEmp.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              activeEmp?.name?.slice(0, 2).toUpperCase() || 'SM'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#101010]">{activeEmp?.name || 'Sales Member'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#598327]/10 text-[#598327] border border-[#598327]/20">
                {activeEmp?.department || 'IT'} Dept
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#666666] bg-slate-100">
                {selectedMonth} {selectedYear}
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-0.5">
              Assigned Sales Profiles:{' '}
              {assignedProfiles.map((p) => (
                <span
                  key={p}
                  className={`inline-block ml-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                    p === selectedProfile ? 'bg-[#598327] text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Action Buttons & Admin Member Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-xs font-bold text-[#666666]">Viewing:</span>
              <select
                value={selectedEmpIdForView}
                onChange={(e) => setSelectedEmpIdForView(e.target.value)}
                className="px-3 py-1.5 bg-[#fbfdfa] border border-[#e2ebd9] rounded-xl text-xs font-bold text-[#101010] focus:outline-none focus:border-[#598327]"
              >
                {salesEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => openSalesEntryModal(undefined, activeEmp?.id, selectedProfile, 'daily')}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7cb730] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Daily</span>
          </button>

          <button
            onClick={() => openSalesEntryModal(undefined, activeEmp?.id, selectedProfile, 'weekly')}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-[#598327] text-white hover:bg-[#4d7222] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Weekly</span>
          </button>
        </div>
      </div>

      {/* Profile Selector Tabs */}
      {assignedProfiles.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-[#666666] mr-1">Select Profile:</span>
          {assignedProfiles.map((prof) => (
            <button
              key={prof}
              onClick={() => setSelectedProfile(prof)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedProfile === prof
                  ? 'bg-[#598327] text-white shadow-xs'
                  : 'bg-white border border-[#e2ebd9] text-[#666666] hover:bg-[#f8faf6]'
              }`}
            >
              Profile {prof}
            </button>
          ))}
        </div>
      )}

      {/* Target & Benchmark Cards for Selected Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Conversion Rate Benchmark */}
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#666666]">
              Conversion Rate Target
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700">
              Weight: {config.conversionWeight || 50}%
            </span>
          </div>
          <div className="text-2xl font-black text-[#101010]">
            {config.conversionTarget}%
          </div>
          <div className="text-xs text-[#666666] mt-1">
            Achieved:{' '}
            <strong className="text-[#598327]">
              {monthlyRollup ? `${monthlyRollup.conversionRate}%` : '0%'}
            </strong>
          </div>
        </div>

        {/* Follow-ups Benchmark */}
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#666666]">
              Follow-ups Target
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700">
              Weight: {config.followupWeight || 20}%
            </span>
          </div>
          <div className="text-2xl font-black text-[#101010]">
            {config.followupTarget}/wk
          </div>
          <div className="text-xs text-[#666666] mt-1">
            Total Logged:{' '}
            <strong className="text-purple-700">
              {monthlyRollup?.totalFollowups || 0}
            </strong>
          </div>
        </div>

        {/* Order Value Benchmark */}
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#666666]">
              Order Value Target
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700">
              Weight: {config.orderValueWeight || 30}%
            </span>
          </div>
          <div className="text-2xl font-black text-[#101010]">
            ₹{(config.orderValueTarget || 100000).toLocaleString('en-IN')}/wk
          </div>
          <div className="text-xs text-[#666666] mt-1">
            Total Value:{' '}
            <strong className="text-emerald-700">
              ₹{(monthlyRollup?.totalOrderValue || 0).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Monthly Score & Reward Slab */}
        <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs bg-gradient-to-br from-white to-[#fbfdfa]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#666666]">
              Performance Score
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                monthlyRollup && monthlyRollup.rewardLevel !== 'No Reward'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {monthlyRollup?.rewardLevel || 'Developing'}
            </span>
          </div>
          <div className="text-2xl font-black text-[#598327]">
            {monthlyRollup?.monthlyPerformanceScore || 0}
            <span className="text-xs text-[#888888] font-normal"> / 100</span>
          </div>
          <div className="text-xs text-[#666666] mt-1 flex items-center justify-between">
            <span>Estimated Reward:</span>
            <strong className="text-[#101010] font-black">
              ₹{(monthlyRollup?.rewardAmount || 0).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* View Mode Toggle (Daily Entries vs Weekly Rollup) */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-[#f4f7f0] p-1 rounded-xl">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white text-[#101010] shadow-xs'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            Daily Performance Entries ({dailyRecords.length})
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white text-[#101010] shadow-xs'
                : 'text-[#666666] hover:text-[#101010]'
            }`}
          >
            Weekly Rollups ({weeklyRecords.length})
          </button>
        </div>

        <span className="text-xs text-[#666666]">
          {viewMode === 'daily'
            ? 'Daily entries aggregate automatically into weekly & monthly totals.'
            : 'Consolidated weekly performance assessments.'}
        </span>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e2ebd9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fbfdfa] text-[#666666] font-black border-b border-[#e2ebd9]">
              <tr>
                <th className="py-3 px-4">Period / Date</th>
                <th className="py-3 px-4">Profile</th>
                <th className="py-3 px-4 text-center">Reachouts (0%)</th>
                <th className="py-3 px-4 text-center">Conversions</th>
                <th className="py-3 px-4 text-center">Conv. Rate (%)</th>
                <th className="py-3 px-4 text-center">Follow-ups</th>
                <th className="py-3 px-4 text-center">Order Value (₹)</th>
                <th className="py-3 px-4 text-center">Performance Score</th>
                <th className="py-3 px-4 text-center">Reward Slab</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {(viewMode === 'daily' ? dailyRecords : weeklyRecords).length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#888888]">
                    No {viewMode} performance records recorded for {selectedProfile} in {selectedMonth} {selectedYear}.
                    <div className="mt-3">
                      <button
                        onClick={() => openSalesEntryModal(undefined, activeEmp?.id, selectedProfile, viewMode)}
                        className="px-4 py-2 bg-[#598327] text-white rounded-xl text-xs font-black hover:bg-[#4d7222] transition-colors cursor-pointer"
                      >
                        + Enter First {viewMode === 'daily' ? 'Daily' : 'Weekly'} Performance
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                (viewMode === 'daily' ? dailyRecords : weeklyRecords).map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-[#f8faf6] transition-colors">
                      {/* Period / Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {rec.entryType === 'daily' && rec.entryDate ? (
                          <div>
                            <span className="font-bold text-[#101010]">{rec.entryDate}</span>
                            <span className="block text-[10px] text-[#598327] font-semibold">{rec.week}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-[#101010]">{rec.week}</span>
                            <span className="block text-[10px] text-[#888888]">{rec.month} {rec.year}</span>
                          </div>
                        )}
                      </td>

                      {/* Profile */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-800">
                          {rec.profileCode}
                        </span>
                      </td>

                      {/* Reachouts */}
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">
                        {rec.reachouts ?? rec.totalReachout ?? 0}
                      </td>

                      {/* Conversions */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#101010]">
                        {rec.conversions ?? rec.orderConvert ?? 0}
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`font-black ${
                            rec.conversionRate >= config.conversionTarget
                              ? 'text-[#598327]'
                              : 'text-amber-600'
                          }`}
                        >
                          {rec.conversionRate}%
                        </span>
                        <span className="text-[10px] text-[#888888] block">Target: {config.conversionTarget}%</span>
                      </td>

                      {/* Follow-ups */}
                      <td className="py-3 px-4 text-center font-mono text-[#101010]">
                        {rec.followups ?? rec.followupSent ?? 0}
                      </td>

                      {/* Order Value */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#101010]">
                        ₹{(rec.orderValue ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#8cc540]/20 text-[#598327] border border-[#8cc540]/40">
                          {rec.totalPerformanceScore}/100
                        </span>
                      </td>

                      {/* Reward Slab */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            rec.rewardLevel === 'Platinum'
                              ? 'bg-purple-100 text-purple-800'
                              : rec.rewardLevel === 'Gold'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.rewardLevel === 'Silver'
                              ? 'bg-slate-200 text-slate-800'
                              : rec.rewardLevel === 'Bronze'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rec.rewardLevel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openSalesEntryModal(rec, rec.employeeId, rec.profileCode, rec.entryType)}
                            title="Edit Record"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-[#666666] hover:text-[#101010] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(rec)}
                            title="Delete Record"
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Record Confirmation Modal */}
      {deletingRecord && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setDeletingRecord(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] my-auto overflow-y-auto border border-red-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center border border-red-200 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010]">Delete Performance Record</h3>
                <p className="text-xs text-[#666666]">Permanent removal confirmation</p>
              </div>
            </div>

            <div className="bg-[#fdf8f8] border border-red-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Member:</span>
                <strong className="text-[#101010] font-black">{deletingRecord.employeeName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Profile & Period:</span>
                <span className="font-bold text-[#101010]">
                  {deletingRecord.profileCode} • {deletingRecord.entryType === 'daily' ? `Daily (${deletingRecord.entryDate})` : (deletingRecord.week || 'Weekly')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666]">Month & Year:</span>
                <span className="font-bold text-[#101010]">{deletingRecord.month} {deletingRecord.year}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-red-100 text-center">
                <div>
                  <span className="text-[10px] text-[#777777] block">Reachouts</span>
                  <span className="font-bold text-[#101010]">{deletingRecord.reachouts ?? 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] block">Conv. Rate</span>
                  <span className="font-bold text-emerald-800">{deletingRecord.conversionRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#777777] block">Score</span>
                  <span className="font-black text-[#101010]">{deletingRecord.totalPerformanceScore} pts</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#777777] leading-relaxed">
              Are you sure you want to delete this performance record? This will permanently remove the metrics from reports, leaderboard, and history.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (!deletingRecord) return;
                  setIsDeleting(true);
                  try {
                    await deleteSalesPerformanceRecord(deletingRecord.id);
                    setDeletingRecord(null);
                  } catch (err: any) {
                    addToast('error', 'Deletion Failed', err?.message || 'Unable to delete record.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
