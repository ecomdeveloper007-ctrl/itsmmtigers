import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import {
  getProfileSettings,
  calculateSalesHistoryComparison,
} from '../../services/salesCalculationService';
import { canUserManageRecord } from '../../utils/salesAuthUtils';
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
  Layers,
  Plus,
} from 'lucide-react';
import { SalesProfileCode } from '../../types/sales';

export const SalesEmployeeDetailModal: React.FC = () => {
  const {
    selectedEmployeeForDetail,
    setSelectedEmployeeForDetail,
    salesRecords,
    salesSettings,
    salesEmployees,
    openSalesEntryModal,
    openSalesEmployeeModal,
    deleteSalesEmployee,
    deleteSalesPerformanceRecord,
  } = useSales();

  const { selectedMonth, selectedYear, addToast } = useApp();
  const { currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const canEditMember = hasPermission('sales.members', 'edit');
  const canDeleteMember = hasPermission('sales.members', 'delete');
  const canEditRecord = hasPermission('sales.performance_records', 'edit');
  const canDeleteRecord = hasPermission('sales.performance_records', 'delete');

  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isDeletingRec, setIsDeletingRec] = useState<boolean>(false);

  if (!selectedEmployeeForDetail) return null;

  const emp = selectedEmployeeForDetail;
  const assignedList: SalesProfileCode[] = emp.assignedProfiles && emp.assignedProfiles.length > 0
    ? emp.assignedProfiles
    : [emp.profileCode || 'PR'];

  // Current month's records for this employee (can have multiple across weeks and profiles)
  const monthRecords = salesRecords.filter(
    (r) =>
      r.employeeId === emp.id &&
      r.month.toLowerCase() === selectedMonth.toLowerCase() &&
      Number(r.year) === Number(selectedYear)
  );

  const handleDelete = async () => {
    if (!canDeleteMember) {
      addToast('error', 'Unauthorized', 'You do not have permission to delete sales members.');
      return;
    }
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={() => setSelectedEmployeeForDetail(null)}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-3xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Profile Hero (Pinned) */}
        <div className="flex-shrink-0 flex items-start justify-between border-b border-[#e2ebd9] p-4 sm:p-6 bg-[#f8faf6] z-10 gap-4">
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
              </p>

              {/* Assigned Profiles Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-bold text-slate-500">Assigned Profiles:</span>
                {assignedList.map((prof) => (
                  <span
                    key={prof}
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      ['PR', 'WR', 'HW'].includes(prof)
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {prof} Profile
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEditMember && (
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
            )}
            {canDeleteMember && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                title="Delete Sales Member"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
            <button
              onClick={() => setSelectedEmployeeForDetail(null)}
              className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#eaeaea] cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#101010] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#598327]" />
              <span>Performance Entries: {selectedMonth} {selectedYear} ({monthRecords.length})</span>
            </h3>

            <button
              onClick={() => {
                setSelectedEmployeeForDetail(null);
                openSalesEntryModal(undefined, emp.id, assignedList[0]);
              }}
              className="px-3 py-1 rounded-lg text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7db734] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Performance</span>
            </button>
          </div>

          {monthRecords.length > 0 ? (
            <div className="space-y-3">
              {monthRecords.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-200 text-slate-800">
                        {rec.week || 'Week 1'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-black ${
                          rec.department === 'IT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rec.profileCode} Profile
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-black text-[#436320]">
                        Score: {rec.totalPerformanceScore}/100
                      </span>
                      {canUserManageRecord(rec, currentUser, salesEmployees, canEditRecord || canDeleteRecord) && (
                        <>
                          {canUserManageRecord(rec, currentUser, salesEmployees, canEditRecord) && (
                            <button
                              onClick={() => {
                                setSelectedEmployeeForDetail(null);
                                openSalesEntryModal(rec);
                              }}
                              className="text-xs text-[#598327] hover:underline font-bold px-1.5 py-0.5 rounded hover:bg-[#edf4e8] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {canUserManageRecord(rec, currentUser, salesEmployees, canDeleteRecord) && (
                            deletingRecordId !== rec.id ? (
                              <button
                                onClick={() => setDeletingRecordId(rec.id)}
                                className="text-xs text-rose-500 hover:text-rose-700 font-bold px-1.5 py-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            ) : (
                            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs">
                              <span className="text-rose-700 font-bold text-[11px]">Delete?</span>
                              <button
                                disabled={isDeletingRec}
                                onClick={async () => {
                                  setIsDeletingRec(true);
                                  try {
                                    await deleteSalesPerformanceRecord(rec.id);
                                    setDeletingRecordId(null);
                                  } finally {
                                    setIsDeletingRec(false);
                                  }
                                }}
                                className="text-[11px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                              >
                                {isDeletingRec ? '...' : 'Yes'}
                              </button>
                              <button
                                disabled={isDeletingRec}
                                onClick={() => setDeletingRecordId(null)}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-[#e2ebd9]">
                      <span className="text-[10px] text-slate-500 block">Reachouts</span>
                      <span className="font-bold text-slate-800">{rec.reachouts ?? rec.totalReachout}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block">Conv. Rate</span>
                      <span className="font-bold text-emerald-900">{rec.conversionRate}% ({rec.conversions ?? rec.orderConvert} ord)</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-700 block">Follow-ups</span>
                      <span className="font-bold text-blue-900">{rec.followups ?? rec.followupSent}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-700 block">Order Value</span>
                      <span className="font-bold text-amber-900">${(rec.orderValue || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {rec.managerRemarks && (
                    <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-[#e2ebd9]">
                      "{rec.managerRemarks}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center text-xs text-[#666666]">
              No performance records recorded for {emp.name} in {selectedMonth} {selectedYear}.
            </div>
          )}
        </div>

        {/* Footer (Pinned) */}
        <div className="flex-shrink-0 flex items-center justify-end p-4 sm:p-5 border-t border-[#e2ebd9] bg-[#f8faf6] z-10">
          <button
            type="button"
            onClick={() => setSelectedEmployeeForDetail(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#101010] bg-[#8cc540] hover:bg-[#7cb334] cursor-pointer transition-all shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
