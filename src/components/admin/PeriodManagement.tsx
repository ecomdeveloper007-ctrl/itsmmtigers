import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Lock,
  Unlock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Target,
  Filter,
  Search,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { PerformancePeriod, PeriodStatus } from '../../types';

export const PeriodManagement: React.FC = () => {
  const {
    periods,
    savePeriod,
    togglePeriodLock,
    setActiveTab,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [formMonth, setFormMonth] = useState<string>(selectedMonth || 'September');
  const [formYear, setFormYear] = useState<number>(selectedYear || 2026);
  const [formWeekName, setFormWeekName] = useState<string>('Week 5');
  const [formWeekNumber, setFormWeekNumber] = useState<number>(5);
  const [formStartDate, setFormStartDate] = useState<string>('2026-08-29');
  const [formEndDate, setFormEndDate] = useState<string>('2026-08-31');
  const [formStatus, setFormStatus] = useState<PeriodStatus>('active');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    period: PerformancePeriod | null;
    targetStatus: PeriodStatus;
  }>({
    isOpen: false,
    period: null,
    targetStatus: 'locked',
  });

  // Filters
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'locked' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      if (selectedMonthFilter !== 'all' && p.month !== selectedMonthFilter) return false;
      if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.weekName.toLowerCase().includes(query);
        const matchesMonth = `${p.month} ${p.year}`.toLowerCase().includes(query);
        if (!matchesName && !matchesMonth) return false;
      }
      return true;
    });
  }, [periods, selectedMonthFilter, selectedStatusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = periods.length;
    const locked = periods.filter((p) => p.status === 'locked').length;
    const active = periods.filter((p) => p.status !== 'locked').length;
    return { total, locked, active };
  }, [periods]);

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();

    const periodId = `period_${formYear}_${formMonth.toLowerCase()}_w${formWeekNumber}`;

    const newPeriod: PerformancePeriod = {
      id: periodId,
      month: formMonth,
      year: formYear,
      weekName: formWeekName.trim(),
      weekNumber: Number(formWeekNumber),
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      createdAt: new Date().toISOString(),
    };

    await savePeriod(newPeriod);
    setIsAddOpen(false);
  };

  const handleOpenConfirm = (period: PerformancePeriod) => {
    const nextStatus: PeriodStatus = period.status === 'locked' ? 'active' : 'locked';
    setConfirmModal({
      isOpen: true,
      period,
      targetStatus: nextStatus,
    });
  };

  const handleConfirmToggleLock = async () => {
    if (!confirmModal.period) return;
    await togglePeriodLock(confirmModal.period.id, confirmModal.targetStatus);
    setConfirmModal({ isOpen: false, period: null, targetStatus: 'locked' });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30 shadow-xs">
              <Calendar className="w-5 h-5 text-[#598327]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              Performance Periods & Week Lock
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4ec] text-[#436320] border border-[#8cc540]/40">
              Admin Controls
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
            Create performance tracking weeks and lock past periods to prevent unauthorized member modifications
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center gap-2 shadow-xs transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#101010]" />
          <span>Create New Week / Month</span>
        </button>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#e2ebd9] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#666666] uppercase tracking-wider block">
              Total Tracking Weeks
            </span>
            <span className="text-2xl font-black text-[#101010] mt-1 block">
              {stats.total}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-[#598327]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e2ebd9] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Open for Data Entry
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {stats.active}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Unlock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e2ebd9] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Locked from Member Edits
            </span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">
              {stats.locked}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by week or month..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[#101010] placeholder:text-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-[#555555]">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            <span className="font-bold">Status:</span>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] text-xs font-bold text-[#101010] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
          >
            <option value="all">All Statuses ({stats.total})</option>
            <option value="active">Open Only ({stats.active})</option>
            <option value="locked">Locked Only ({stats.locked})</option>
          </select>

          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="bg-[#f8faf6] border border-[#e2ebd9] text-xs font-bold text-[#101010] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
          >
            <option value="all">All Months</option>
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Periods Table */}
      <div className="rounded-3xl border border-[#e2ebd9] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2ebd9] bg-[#f8faf6] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                <th className="py-4 px-5">Period / Week</th>
                <th className="py-4 px-4">Month & Year</th>
                <th className="py-4 px-4">Start Date</th>
                <th className="py-4 px-4">End Date</th>
                <th className="py-4 px-4">Lock Status</th>
                <th className="py-4 px-5 text-right">Actions & Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3e7] text-xs">
              {filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#888888]">
                    No performance periods found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((p) => {
                  const isLocked = p.status === 'locked';

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isLocked ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-[#f8faf6]'
                      }`}
                    >
                      <td className="py-4 px-5 font-bold text-[#101010] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#101010]">{p.weekName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#f0f4ec] text-[#436320] border border-[#8cc540]/30">
                            Week #{p.weekNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#101010] whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8faf6] border border-[#e2ebd9] text-[#436320] font-black">
                          {p.month} {p.year}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#555555] whitespace-nowrap font-medium">
                        {p.startDate}
                      </td>
                      <td className="py-4 px-4 text-[#555555] whitespace-nowrap font-medium">
                        {p.endDate}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-300">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Locked from Member Edits</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300">
                            <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Open for Data Entry</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMonth(p.month);
                            setSelectedYear(p.year);
                            setActiveTab('kpi-settings');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f8faf6] text-[#436320] border border-[#e2ebd9] hover:bg-[#edf3e7] hover:text-[#101010] transition-all cursor-pointer shadow-2xs"
                          title="Set weekly or monthly targets for this period"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Set Targets</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenConfirm(p)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                            isLocked
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900'
                              : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 hover:text-amber-950'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Unlock Period</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Lock Period</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Prompt Modal */}
      {confirmModal.isOpen && confirmModal.period && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setConfirmModal({ isOpen: false, period: null, targetStatus: 'locked' })}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-xl overflow-y-auto p-4 sm:p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  confirmModal.targetStatus === 'locked'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                }`}
              >
                {confirmModal.targetStatus === 'locked' ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <Unlock className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010]">
                  {confirmModal.targetStatus === 'locked' ? 'Lock Performance Period?' : 'Unlock Performance Period?'}
                </h3>
                <span className="text-xs text-[#666666] font-medium">
                  {confirmModal.period.weekName} ({confirmModal.period.month} {confirmModal.period.year})
                </span>
              </div>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              {confirmModal.targetStatus === 'locked'
                ? 'Locking this period will freeze all performance submissions. Team members will be unable to add, edit, or resubmit their metrics for this week.'
                : 'Unlocking this period will re-enable submissions and allow team members to submit or update their performance metrics for this week.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e2ebd9]">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, period: null, targetStatus: 'locked' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f8faf6] hover:text-[#101010] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleLock}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                  confirmModal.targetStatus === 'locked'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {confirmModal.targetStatus === 'locked' ? 'Confirm Lock' : 'Confirm Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Period Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-[#e2ebd9] bg-[#f8faf6] z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#8cc540]/20 text-[#436320]">
                  <Calendar className="w-5 h-5 text-[#598327]" />
                </span>
                <h3 className="text-base font-black text-[#101010]">
                  Create New Tracking Period
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Month *
                  </label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    aria-label="Select Target Month"
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-bold focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                  >
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formYear ?? ''}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Week Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Week 5 or Week 1"
                    value={formWeekName || ''}
                    onChange={(e) => setFormWeekName(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formWeekNumber ?? ''}
                    onChange={(e) => setFormWeekNumber(Number(e.target.value))}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate || ''}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate || ''}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2ebd9]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f8faf6] hover:text-[#101010] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1 text-[#101010]" />
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
