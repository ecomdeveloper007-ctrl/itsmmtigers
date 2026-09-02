import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  getProfileSettings,
  calculateSalesHistoryComparison,
} from '../../services/salesCalculationService';
import {
  X,
  User,
  Calendar,
  Building,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Trash2,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

export const SalesEmployeeDetailModal: React.FC = () => {
  const {
    selectedEmployeeForDetail,
    setSelectedEmployeeForDetail,
    salesRecords,
    salesSettings,
    openSalesEntryModal,
    openSalesEmployeeModal,
    deleteSalesEmployee,
  } = useSales();

  const { selectedMonth, selectedYear, addToast } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedEmployeeForDetail) return null;

  const emp = selectedEmployeeForDetail;
  const config = getProfileSettings(salesSettings, emp.profileCode);

  // Current month's record
  const currentRecord = salesRecords.find(
    (r) =>
      r.employeeId === emp.id &&
      r.month.toLowerCase() === selectedMonth.toLowerCase() &&
      Number(r.year) === Number(selectedYear)
  );

  // History across all months
  const history = calculateSalesHistoryComparison(salesRecords, emp.id);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${emp.name} from the Sales system? All sales profile mappings will be removed.`)) {
      setIsDeleting(true);
      try {
        const success = await deleteSalesEmployee(emp.id);
        if (success) {
          setSelectedEmployeeForDetail(null);
        }
      } catch (err) {
        addToast('error', 'Delete Failed', 'Could not delete sales employee.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header / Profile Hero */}
        <div className="flex items-start justify-between border-b border-[#e2ebd9] pb-6 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                emp.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt={emp.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#8cc540] shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-[#101010] tracking-tight">{emp.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    emp.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {emp.status}
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
                <span>{emp.email}</span>
                <span>•</span>
                <span className="font-bold text-[#101010]">{emp.department} Sales</span>
                <span>•</span>
                <span className="font-bold text-[#436320]">{emp.profileCode} Profile</span>
              </p>
              <p className="text-[11px] text-[#777777] mt-1">
                Joined: {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedEmployeeForDetail(null);
                openSalesEmployeeModal(emp);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#444444] bg-[#f8faf6] hover:bg-[#edf4e8] border border-[#e2ebd9] flex items-center gap-1.5 cursor-pointer"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#598327]" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              title="Delete Sales Employee"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
            <button
              onClick={() => setSelectedEmployeeForDetail(null)}
              className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5] cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Month Active Scorecard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#101010] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#598327]" />
              <span>Current Evaluation: {selectedMonth} {selectedYear}</span>
            </h3>

            {currentRecord ? (
              <button
                onClick={() => {
                  setSelectedEmployeeForDetail(null);
                  openSalesEntryModal(currentRecord);
                }}
                className="text-xs font-bold text-[#436320] hover:underline cursor-pointer"
              >
                ✏️ Edit Submission
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedEmployeeForDetail(null);
                  openSalesEntryModal(undefined, emp.id);
                }}
                className="px-3 py-1 rounded-lg text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7db734] cursor-pointer"
              >
                + Enter Performance
              </button>
            )}
          </div>

          {currentRecord ? (
            <div className="space-y-4">
              {/* Primary Score & Target Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 text-center space-y-1">
                  <span className="text-xs font-bold text-[#436320] uppercase">Performance Score</span>
                  <div className="text-3xl font-black text-[#101010]">
                    {currentRecord.totalPerformanceScore}
                    <span className="text-sm font-bold text-[#598327]"> / 100 PTS</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#666666]">Target-Weighted Total</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] text-center space-y-1 shadow-xs">
                  <span className="text-xs font-bold text-[#666666] uppercase">Conversion Rate</span>
                  <div className="text-3xl font-black text-[#101010]">
                    {currentRecord.conversionRate}%
                  </div>
                  <div className="text-[10px] font-bold">
                    {currentRecord.conversionRate >= config.minConversionRate ? (
                      <span className="text-emerald-700">✓ Meets {config.minConversionRate}% Threshold</span>
                    ) : (
                      <span className="text-rose-600">✗ Below {config.minConversionRate}% Required</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#e2ebd9] text-center space-y-1 shadow-xs">
                  <span className="text-xs font-bold text-[#666666] uppercase">Orders & Repeat</span>
                  <div className="text-2xl font-black text-[#101010]">
                    {currentRecord.orderConvert} Orders
                  </div>
                  <div className="text-xs font-bold text-[#436320]">
                    {currentRecord.repeatOrders} Repeat Clients ({currentRecord.totalReachout} Leads)
                  </div>
                </div>
              </div>

              {/* 4 Inputs Target-vs-Actual Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#777777] block">Reachouts</span>
                  <span className="text-base font-black text-[#101010]">{currentRecord.totalReachout}</span>
                  <span className="text-[10px] text-[#555555] block">Target: {config.reachoutTarget} ({currentRecord.reachoutScore} pts)</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#777777] block">Orders Converted</span>
                  <span className="text-base font-black text-[#101010]">{currentRecord.orderConvert}</span>
                  <span className="text-[10px] text-[#555555] block">Target: {config.orderConvertTarget} ({currentRecord.orderConvertScore} pts)</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#777777] block">Repeat Orders</span>
                  <span className="text-base font-black text-[#101010]">{currentRecord.repeatOrders}</span>
                  <span className="text-[10px] text-[#555555] block">Target: {config.repeatOrdersTarget} ({currentRecord.repeatOrdersScore} pts)</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e2ebd9]">
                  <span className="text-[10px] font-bold text-[#777777] block">Follow-ups Sent</span>
                  <span className="text-base font-black text-[#101010]">{currentRecord.followupSent}</span>
                  <span className="text-[10px] text-[#555555] block">Target: {config.followupTarget} ({currentRecord.followupScore} pts)</span>
                </div>
              </div>

              {currentRecord.managerRemarks && (
                <div className="p-3 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] text-xs">
                  <span className="font-bold text-[#436320]">Manager Remarks: </span>
                  <span className="text-[#444444]">{currentRecord.managerRemarks}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center text-xs text-[#666666]">
              No performance record has been submitted for {emp.name} in {selectedMonth} {selectedYear}.
            </div>
          )}
        </div>

        {/* Historical Monthly Performance Records & Trends */}
        <div className="space-y-3 pt-4 border-t border-[#e2ebd9]">
          <h3 className="text-base font-black text-[#101010] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#598327]" />
            <span>Monthly Performance History & Progression</span>
          </h3>

          {history.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                  <tr>
                    <th className="p-3">Month / Year</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3 text-right">Score Change</th>
                    <th className="p-3 text-right">Conversion</th>
                    <th className="p-3 text-right">Orders</th>
                    <th className="p-3 text-right">Repeat</th>
                    <th className="p-3 text-right">Follow-ups</th>
                    <th className="p-3 text-center">Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4ec]">
                  {history.map((h, idx) => (
                    <tr key={`${h.month}_${h.year}`} className="hover:bg-[#f8faf6]">
                      <td className="p-3 font-bold text-[#101010]">
                        {h.month} {h.year}
                      </td>
                      <td className="p-3 text-right font-black text-[#101010]">
                        {h.score} pts
                      </td>
                      <td className="p-3 text-right font-bold">
                        {h.scoreChange !== undefined ? (
                          h.scoreChange > 0 ? (
                            <span className="text-emerald-700 flex items-center justify-end gap-0.5">
                              <ArrowUpRight className="w-3.5 h-3.5" /> +{h.scoreChange}
                            </span>
                          ) : h.scoreChange < 0 ? (
                            <span className="text-rose-600 flex items-center justify-end gap-0.5">
                              <ArrowDownRight className="w-3.5 h-3.5" /> {h.scoreChange}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center justify-end gap-0.5">
                              <Minus className="w-3 h-3" /> 0.0
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-[#101010]">
                        {h.conversionRate}%
                      </td>
                      <td className="p-3 text-right text-[#101010] font-medium">
                        {h.orders}
                      </td>
                      <td className="p-3 text-right text-[#101010] font-medium">
                        {h.repeatOrders}
                      </td>
                      <td className="p-3 text-right text-[#101010] font-medium">
                        {h.reachouts}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            h.conversionRate >= config.minConversionRate
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {h.conversionRate >= config.minConversionRate ? 'Target Met' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#f8faf6] text-xs text-center text-[#666666]">
              No past historical records logged for this employee.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#e2ebd9] flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Member from Sales</span>
          </button>
          <button
            onClick={() => setSelectedEmployeeForDetail(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#101010] text-white hover:bg-[#222222] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
