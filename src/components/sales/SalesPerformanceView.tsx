import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calculator,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Filter,
  Lock,
} from 'lucide-react';
import { SalesPerformanceRecord, SalesProfileCode } from '../../types/sales';
import { canUserManageRecord, isUserAdminOrSuperAdmin } from '../../utils/salesAuthUtils';

const WEEKS_OPTIONS = ['all', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

export const SalesPerformanceView: React.FC = () => {
  const {
    salesRecords,
    salesSettings,
    openSalesEntryModal,
    deleteSalesPerformanceRecord,
    setSelectedEmployeeForDetail,
    salesEmployees,
    setIsSalesImportModalOpen,
    selectedWeek,
    setSelectedWeek,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | 'IT' | 'SMM'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | SalesProfileCode>('all');

  // Filter records by selected month and year
  let records = salesRecords.filter(
    (r) => r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear)
  );

  if (selectedWeek !== 'all') {
    records = records.filter((r) => r.week === selectedWeek);
  }
  if (deptFilter !== 'all') {
    records = records.filter((r) => r.department === deptFilter);
  }
  if (profileFilter !== 'all') {
    records = records.filter((r) => r.profileCode === profileFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    records = records.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.profileCode.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        (r.week && r.week.toLowerCase().includes(q)) ||
        (r.managerRemarks && r.managerRemarks.toLowerCase().includes(q))
    );
  }

  const handleDelete = async (e: React.MouseEvent, rec: SalesPerformanceRecord) => {
    e.stopPropagation();
    if (!canUserManageRecord(rec, currentUser, salesEmployees)) {
      alert('Security Violation: You can only delete your own performance records.');
      return;
    }
    if (confirm(`Delete weekly record for ${rec.employeeName} (${rec.profileCode} - ${rec.week || 'Weekly'})?`)) {
      await deleteSalesPerformanceRecord(rec.id);
    }
  };

  const handleRowClick = (empId: string) => {
    const emp = salesEmployees.find((e) => e.id === empId);
    if (emp) setSelectedEmployeeForDetail(emp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Weekly Performance
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear} ({records.length} Submissions)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Performance Records by Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            50% Conversion • 20% Follow-ups • 30% Order Value • 0% Reachouts weight
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openSalesEntryModal()}
            className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enter Performance</span>
          </button>
          <button
            onClick={() => setIsSalesImportModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#598327]" />
            <span>CSV Actions</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search by name, profile, week..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl text-xs font-medium text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Filter */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Weeks</option>
            <option value="Week 1">Week 1</option>
            <option value="Week 2">Week 2</option>
            <option value="Week 3">Week 3</option>
            <option value="Week 4">Week 4</option>
            <option value="Week 5">Week 5</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT Sales</option>
            <option value="SMM">SMM Sales</option>
          </select>

          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Profiles</option>
            <option value="PR">PR (IT Solutions)</option>
            <option value="WR">WR (IT Web Arch)</option>
            <option value="HW">HW (IT Cloud Infra)</option>
            <option value="DR">DR (SMM Direct Response)</option>
            <option value="RR">RR (SMM Retainers)</option>
          </select>
        </div>
      </div>

      {/* Performance Records Table */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
              <tr>
                <th className="p-4">Week</th>
                <th className="p-4">Sales Member</th>
                <th className="p-4">Profile & Dept</th>
                <th className="p-4 text-right">Reachouts (0%)</th>
                <th className="p-4 text-right">Conv. Rate (50%)</th>
                <th className="p-4 text-right">Follow-ups (20%)</th>
                <th className="p-4 text-right">Order Value (30%)</th>
                <th className="p-4 text-right">Total Score</th>
                <th className="p-4 text-right">Reward</th>
                <th className="p-4 text-center">Benchmark</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ec]">
              {records.length > 0 ? (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => handleRowClick(rec.employeeId)}
                    className="hover:bg-[#f8faf6] cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                        {rec.week || 'Week 1'}
                      </span>
                    </td>

                    <td className="p-4 font-black text-[#101010]">
                      <div>{rec.employeeName}</div>
                      {rec.managerRemarks && (
                        <div className="text-[10px] text-[#777777] font-normal truncate max-w-[180px]">
                          "{rec.managerRemarks}"
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            rec.department === 'IT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {rec.department}
                        </span>
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                          {rec.profileCode}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right font-medium text-[#101010]">
                      <div>{rec.reachouts ?? rec.totalReachout}</div>
                      <div className="text-[10px] text-[#777777]">0% wt</div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-black text-emerald-800 text-sm">
                        {rec.conversionRate}%
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        {rec.conversionScore ?? rec.orderConvertScore}/50 pts ({rec.conversions ?? rec.orderConvert} ord)
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-bold text-blue-900">
                        {rec.followups ?? rec.followupSent}
                      </div>
                      <div className="text-[10px] text-blue-700 font-medium">
                        {rec.followupsScore ?? rec.followupScore}/20 pts
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-bold text-amber-900">
                        ${(rec.orderValue || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">
                        {rec.orderValueScore ?? 0}/30 pts
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <span className="font-black text-base text-[#101010]">
                        {rec.totalPerformanceScore}
                      </span>
                      <span className="text-[10px] text-[#598327] font-bold block">/ 100 PTS</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-black text-sm text-[#436320]">
                        {salesSettings.currencySymbol}{(rec.rewardAmount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-[#666666]">
                        {rec.rewardLevel}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                          rec.rewardEligibility === 'Eligible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                        title={rec.ineligibilityReason || 'Eligible'}
                      >
                        {rec.rewardEligibility === 'Eligible' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Pass
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Benchmark Fail
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {canUserManageRecord(rec, currentUser, salesEmployees) ? (
                          <>
                            <button
                              onClick={() => openSalesEntryModal(rec)}
                              className="p-1.5 rounded-lg text-[#666666] hover:text-[#101010] hover:bg-[#edf4e8] transition-colors cursor-pointer"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, rec)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200"
                            title="Read-only: Record belongs to another sales member"
                          >
                            <Lock className="w-2.5 h-2.5" /> Read Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-[#777777]">
                    No performance records found for {selectedMonth} {selectedYear} ({selectedWeek}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
