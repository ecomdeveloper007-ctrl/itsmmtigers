import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';
import { SalesPerformanceRecord, SalesProfileCode } from '../../types/sales';

export const SalesPerformanceView: React.FC = () => {
  const {
    salesRecords,
    salesSettings,
    openSalesEntryModal,
    deleteSalesPerformanceRecord,
    setSelectedEmployeeForDetail,
    salesEmployees,
    setIsSalesImportModalOpen,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | 'IT' | 'SMM'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | SalesProfileCode>('all');

  // Filter records by selected month and year
  let records = salesRecords.filter(
    (r) => r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear)
  );

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
        (r.managerRemarks && r.managerRemarks.toLowerCase().includes(q))
    );
  }

  const handleDelete = async (e: React.MouseEvent, rec: SalesPerformanceRecord) => {
    e.stopPropagation();
    if (confirm(`Delete performance record for ${rec.employeeName} (${rec.month} ${rec.year})?`)) {
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
              Performance Entries
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {selectedMonth} {selectedYear} ({records.length} Submissions)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Monthly Performance Records
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Audit raw performance metrics, scores, reward tiers, and manager evaluations
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
            placeholder="Search performance records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl text-xs font-medium text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
                <th className="p-4">Sales Employee</th>
                <th className="p-4">Department & Profile</th>
                <th className="p-4 text-right">Reachout</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Repeat</th>
                <th className="p-4 text-right">Follow-ups</th>
                <th className="p-4 text-right">Conversion Rate</th>
                <th className="p-4 text-right">Performance Score</th>
                <th className="p-4 text-right">Reward Payout</th>
                <th className="p-4 text-center">Eligibility</th>
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
                      <div>{rec.totalReachout}</div>
                      <div className="text-[10px] text-[#777777]">{rec.reachoutScore} pts</div>
                    </td>

                    <td className="p-4 text-right font-black text-[#101010]">
                      <div>{rec.orderConvert}</div>
                      <div className="text-[10px] text-[#436320] font-bold">{rec.orderConvertScore} pts</div>
                    </td>

                    <td className="p-4 text-right font-medium text-[#101010]">
                      <div>{rec.repeatOrders}</div>
                      <div className="text-[10px] text-[#777777]">{rec.repeatOrdersScore} pts</div>
                    </td>

                    <td className="p-4 text-right font-medium text-[#101010]">
                      <div>{rec.followupSent}</div>
                      <div className="text-[10px] text-[#777777]">{rec.followupScore} pts</div>
                    </td>

                    <td className="p-4 text-right font-black text-emerald-700 text-sm">
                      {rec.conversionRate}%
                    </td>

                    <td className="p-4 text-right">
                      <span className="font-black text-base text-[#101010]">
                        {rec.totalPerformanceScore}
                      </span>
                      <span className="text-[10px] text-[#598327] font-bold block">/ 100 PTS</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-black text-sm text-[#436320]">
                        {salesSettings.currencySymbol}{rec.rewardAmount.toLocaleString()}
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
                            <CheckCircle2 className="w-3 h-3" /> Eligible
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Not Eligible
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openSalesEntryModal(rec)}
                          className="p-1.5 rounded-lg text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5]"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, rec)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-xs text-[#666666]">
                    No performance records submitted for {selectedMonth} {selectedYear}. Click "+ Enter Performance" to log.
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
