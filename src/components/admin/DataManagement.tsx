import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Edit,
  Filter,
  ArrowUpDown,
  Lock,
  CheckCircle,
  FileText,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { PerformanceRecord } from '../../types';
import { DataService, INITIAL_RECORDS } from '../../services/dataService';
import { Database, AlertTriangle } from 'lucide-react';

interface DataManagementProps {
  onOpenImportModal: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onOpenImportModal }) => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const {
    records,
    periods,
    kpis,
    allUsers,
    deletePerformanceRecord,
    purgeAllPerformanceRecords,
    openDataEntryModal,
    selectedMonth,
    selectedYear,
    addToast,
    refreshAllData,
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);

  const handlePurgeAll = async () => {
    setIsPurging(true);
    try {
      await purgeAllPerformanceRecords();
      setShowPurgeModal(false);
    } catch (e) {
      console.error(e);
      addToast('error', 'Purge Failed', 'Could not clear records.');
    } finally {
      setIsPurging(false);
    }
  };

  const handleRestoreDefaultRecords = async () => {
    setIsResetting(true);
    try {
      for (const rec of INITIAL_RECORDS) {
        await DataService.saveRecord(rec, {
          id: 'super_admin_restore',
          name: 'Super Admin',
          role: 'super_admin',
        });
      }
      await refreshAllData();
      addToast('success', 'Data Restored Successfully', 'All team performance records and initial user data have been reloaded.');
    } catch (e) {
      console.error(e);
      addToast('error', 'Restore failed', 'Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch =
          r.userName.toLowerCase().includes(search.toLowerCase()) ||
          r.userId.toLowerCase().includes(search.toLowerCase());
        const matchesMonth = !selectedMonth || r.month.toLowerCase() === selectedMonth.toLowerCase();
        const matchesYear = !selectedYear || r.year === selectedYear;
        const matchesWeek = filterWeek === 'all' || r.weekName === filterWeek;
        return matchesSearch && matchesMonth && matchesYear && matchesWeek;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, search, selectedMonth, selectedYear, filterWeek]);

  const handleExportCSV = () => {
    try {
      const csv = DataService.generateCSV(filteredRecords, allUsers, kpis);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `IT_SMM_Tigers_Performance_${selectedMonth}_${selectedYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'CSV Export Complete', 'Downloaded performance report.');
    } catch (e) {
      console.error(e);
      addToast('error', 'Export Failed', 'Could not generate CSV file.');
    }
  };

  const handleDelete = async (id: string) => {
    await deletePerformanceRecord(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Team Performance Submissions & Data</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Firestore Database Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master records for {selectedMonth} {selectedYear} ({filteredRecords.length} records found)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setShowPurgeModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Wipe and purge all dummy or submitted performance records from the database"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                Clear All Records
              </button>

              <button
                onClick={onOpenImportModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-orange-400" />
                Import CSV
              </button>
            </>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={() => openDataEntryModal()}
            className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Submission
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team member name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold">Filter Week:</span>
          {['all', 'Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
            <button
              key={w}
              onClick={() => setFilterWeek(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterWeek === w
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {w === 'all' ? 'All Weeks' : w}
            </button>
          ))}
        </div>
      </div>

      {/* Master Data Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Team Member</th>
                <th className="py-3.5 px-4">Week / Period</th>
                <th className="py-3.5 px-4">Projects</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4">Upsells</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Follow-ups</th>
                <th className="py-3.5 px-4">Repeat</th>
                <th className="py-3.5 px-4">Submitted By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{rec.userName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                          ['PR', 'WR', 'HW'].includes(rec.profileCode || '')
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                            : 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                        }`}
                      >
                        {rec.profileCode || 'PR'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold text-[11px]">
                      {rec.weekName} ({rec.month} {rec.year})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{rec.projectClosed}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-emerald-400">
                      ${Math.round(rec.revenueGenerated * 0.8).toLocaleString()} net
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${rec.revenueGenerated.toLocaleString()} gross (-20%)
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-cyan-400">{rec.upsells}</td>
                  <td className="py-3.5 px-4 font-semibold text-amber-400">
                    {rec.clientRating > 0 ? `${rec.clientRating.toFixed(1)} ★` : '0 ★'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{rec.followupsCompleted}</td>
                  <td className="py-3.5 px-4 text-slate-300">{rec.repeatClients}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[120px]">
                    {rec.submittedBy}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => openDataEntryModal(rec, rec.periodId)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Record"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {isSuperAdmin && (
                      <>
                        {deleteConfirmId === rec.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(rec.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30 text-orange-400" />
            <p className="text-sm font-semibold">No performance records found for this filter.</p>
          </div>
        )}
      </div>

      {/* Purge All Records Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear All Performance Data</h3>
                <p className="text-xs text-rose-400 font-medium">Permanent Database Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete all performance submissions across all weeks, months, and team members from both Cloud Firestore and local cache.
            </p>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>• Database Collection: <span className="font-mono text-slate-200">performanceRecords</span></p>
              <p>• Total records to purge: <span className="font-bold text-rose-400">{records.length}</span></p>
              <p>• User accounts and KPI targets will remain intact.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Clearing Database...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm & Purge Everything
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
