import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Lock,
  Unlock,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Save,
  Target,
} from 'lucide-react';
import { PerformancePeriod, PeriodStatus } from '../../types';

export const PeriodManagement: React.FC = () => {
  const { periods, savePeriod, togglePeriodLock, addToast, setActiveTab, setSelectedMonth, setSelectedYear } = useApp();

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [formMonth, setFormMonth] = useState<string>('August');
  const [formYear, setFormYear] = useState<number>(2026);
  const [formWeekName, setFormWeekName] = useState<string>('Week 5');
  const [formWeekNumber, setFormWeekNumber] = useState<number>(5);
  const [formStartDate, setFormStartDate] = useState<string>('2026-08-29');
  const [formEndDate, setFormEndDate] = useState<string>('2026-08-31');
  const [formStatus, setFormStatus] = useState<PeriodStatus>('active');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Performance Periods & Lock Control</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create new tracking weeks/months and lock periods to prevent unauthorized member modifications
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Week / Month
        </button>
      </div>

      {/* Periods List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Period / Week</th>
                <th className="py-3.5 px-4">Month & Year</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4">Lock Status</th>
                <th className="py-3.5 px-4 text-right">Lock / Unlock Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {periods.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    {p.weekName} (Week #{p.weekNumber})
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-orange-400 whitespace-nowrap">
                    {p.month} {p.year}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">{p.startDate}</td>
                  <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">{p.endDate}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {p.status === 'locked' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60">
                        <Lock className="w-3 h-3" /> Locked from Member Edits
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                        <Unlock className="w-3 h-3" /> Open for Data Entry
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMonth(p.month);
                        setSelectedYear(p.year);
                        setActiveTab('kpi-settings');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-orange-400 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer"
                      title="Set weekly or monthly targets for this period"
                    >
                      <Target className="w-3.5 h-3.5" />
                      Set Targets
                    </button>
                    <button
                      onClick={() =>
                        togglePeriodLock(p.id, p.status === 'locked' ? 'active' : 'locked')
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        p.status === 'locked'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                      }`}
                    >
                      {p.status === 'locked' ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" /> Unlock Period
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Lock Period
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Period Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">Create New Tracking Period</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Month *
                  </label>
                  <select
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    aria-label="Select Target Month"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Week Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Week 5 or Week 1"
                    value={formWeekName}
                    onChange={(e) => setFormWeekName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formWeekNumber}
                    onChange={(e) => setFormWeekNumber(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/30 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" />
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
