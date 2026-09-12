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
  RotateCw,
  AlertTriangle,
  Database,
  CheckCircle,
  Briefcase,
  DollarSign,
  TrendingUp,
  Star,
  User,
  Calendar,
} from 'lucide-react';
import { PerformanceRecord } from '../../types';
import { DataService, INITIAL_RECORDS } from '../../services/dataService';

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

  // Aggregate metrics for filtered records
  const stats = useMemo(() => {
    const totalProjects = filteredRecords.reduce((sum, r) => sum + (r.projectClosed || 0), 0);
    const totalGross = filteredRecords.reduce((sum, r) => sum + (r.revenueGenerated || 0), 0);
    const totalNet = Math.round(totalGross * 0.8);
    const totalUpsells = filteredRecords.reduce((sum, r) => sum + (r.upsells || 0), 0);
    return { totalProjects, totalGross, totalNet, totalUpsells };
  }, [filteredRecords]);

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
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-[#598327]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              Team Performance Submissions & Data
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Database Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
            Master records for{' '}
            <span className="text-[#101010] font-bold">
              {selectedMonth} {selectedYear}
            </span>{' '}
            • <span className="font-semibold text-[#101010]">{filteredRecords.length}</span> submissions in view
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setShowPurgeModal(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Wipe and purge all submitted performance records from the database"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Clear All Records</span>
              </button>

              <button
                onClick={onOpenImportModal}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-[#f5f5f5] text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#598327]" />
                <span>Import CSV</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-[#f5f5f5] text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#598327]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openDataEntryModal()}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center gap-1.5 shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Submission</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics for Active View */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Submissions</span>
            <FileSpreadsheet className="w-4 h-4 text-[#598327]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-[#101010]">{filteredRecords.length}</span>
            <span className="text-[11px] text-[#888888] font-bold">records</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Net Revenue (80%)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              ${stats.totalNet.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#888888]">net</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Projects Closed</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-[#101010]">{stats.totalProjects}</span>
            <span className="text-[11px] text-[#888888] font-bold">closed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Total Upsells</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-[#101010]">{stats.totalUpsells}</span>
            <span className="text-[11px] text-[#888888] font-bold">units</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#e2ebd9] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team member name or user ID..."
            className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl pl-9 pr-4 py-2 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-[#666666] font-bold px-1 whitespace-nowrap">Week Filter:</span>
          {['all', 'Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w) => (
            <button
              key={w}
              onClick={() => setFilterWeek(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterWeek === w
                  ? 'bg-[#8cc540] text-[#101010] shadow-xs font-black'
                  : 'bg-[#f8faf6] text-[#555555] hover:text-[#101010] hover:bg-[#edf3e7] border border-[#e2ebd9]'
              }`}
            >
              {w === 'all' ? 'All Weeks' : w}
            </button>
          ))}
        </div>
      </div>

      {/* Master Data Table */}
      <div className="rounded-3xl border border-[#e2ebd9] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2ebd9] bg-[#f8faf6] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                <th className="py-3.5 px-4">Team Member</th>
                <th className="py-3.5 px-4">Week / Period</th>
                <th className="py-3.5 px-4 text-center">Projects</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4 text-center">Upsells</th>
                <th className="py-3.5 px-4 text-center">Rating</th>
                <th className="py-3.5 px-4 text-center">Follow-ups</th>
                <th className="py-3.5 px-4 text-center">Repeat</th>
                <th className="py-3.5 px-4">Submitted By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf3e7] text-xs">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#f8faf6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#101010] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[#101010] font-bold text-sm">{rec.userName}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                          ['PR', 'WR', 'HW'].includes(rec.profileCode || '')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {rec.profileCode || 'PR'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-[#f0f4ec] text-[#436320] border border-[#e2ebd9] font-bold text-[11px]">
                      {rec.weekName} • {rec.month} {rec.year}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#101010] text-center">
                    <span className="px-2 py-0.5 rounded-md bg-[#f5f5f5] text-[#101010] border border-[#e5e5e5] font-bold">
                      {rec.projectClosed}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-black text-emerald-700 text-sm">
                      ${Math.round(rec.revenueGenerated * 0.8).toLocaleString()} net
                    </div>
                    <div className="text-[10px] text-[#888888] font-medium">
                      ${rec.revenueGenerated.toLocaleString()} gross (-20%)
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-black text-cyan-800 text-center">
                    {rec.upsells}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {rec.clientRating > 0 ? rec.clientRating.toFixed(1) : '0.0'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#555555] font-semibold text-center">
                    {rec.followupsCompleted}
                  </td>
                  <td className="py-3.5 px-4 text-[#555555] font-semibold text-center">
                    {rec.repeatClients}
                  </td>
                  <td className="py-3.5 px-4 text-[#666666] text-[11px] truncate max-w-[120px] font-mono">
                    {rec.submittedBy}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => openDataEntryModal(rec, rec.periodId)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#f0f4ec] text-[#555555] hover:text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
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
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer shadow-xs"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(rec.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#888888] hover:text-rose-600 border border-[#e2ebd9] hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
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
          <div className="text-center py-12 text-[#888888] space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f0f4ec] text-[#598327] flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#101010]">No performance records found for this filter.</p>
            <p className="text-xs text-[#666666]">Try changing the week filter or search query above.</p>
          </div>
        )}
      </div>

      {/* Purge All Records Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101010]">Clear All Performance Data</h3>
                <p className="text-xs text-rose-600 font-semibold">Permanent Database Action</p>
              </div>
            </div>

            <p className="text-xs text-[#555555] leading-relaxed">
              This will permanently delete all performance submissions across all weeks, months, and team members from both Cloud Firestore and local storage.
            </p>

            <div className="bg-[#fdf7f7] p-3 rounded-xl border border-rose-100 text-[11px] text-[#555555] space-y-1">
              <p>• Database Collection: <span className="font-mono text-[#101010] font-semibold">performanceRecords</span></p>
              <p>• Total records to purge: <span className="font-bold text-rose-600">{records.length}</span></p>
              <p>• User accounts, passwords, and KPI weights will remain safe.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#f5f5f5] text-[#555555] border border-[#e2ebd9] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Purge Everything</span>
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
