import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Building,
  Sparkles,
  Calendar,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { SalesEmployee, SalesProfileCode } from '../../types/sales';

export const SalesEmployeesView: React.FC = () => {
  const {
    salesEmployees,
    salesRecords,
    salesSettings,
    openSalesEmployeeModal,
    deleteSalesEmployee,
    openSalesEntryModal,
    setSelectedEmployeeForDetail,
  } = useSales();

  const { selectedMonth, selectedYear } = useApp();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'all' | 'IT' | 'SMM'>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | SalesProfileCode>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingEmployee, setDeletingEmployee] = useState<SalesEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  let filtered = salesEmployees;

  if (deptFilter !== 'all') {
    filtered = filtered.filter((e) => e.department === deptFilter);
  }
  if (profileFilter !== 'all') {
    filtered = filtered.filter((e) => e.profileCode === profileFilter);
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter((e) => e.status === statusFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.profileCode.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }

  const handleDeleteClick = (e: React.MouseEvent, emp: SalesEmployee) => {
    e.stopPropagation();
    setDeletingEmployee(emp);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    try {
      await deleteSalesEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
    } catch (err) {
      console.error('Delete employee error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40">
              Team Directory
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • {salesEmployees.length} Total Sales Reps
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Employees & Profile Assignments
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Manage reps mapped to IT (PR, WR, HW) and SMM (DR, RR) functional sales profiles
          </p>
        </div>

        <button
          onClick={() => openSalesEmployeeModal()}
          className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Sales Employee</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search reps by name, email, profile..."
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const currentRecord = salesRecords.find(
            (r) =>
              r.employeeId === emp.id &&
              r.month.toLowerCase() === selectedMonth.toLowerCase() &&
              Number(r.year) === Number(selectedYear)
          );

          return (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployeeForDetail(emp)}
              className="bg-white rounded-3xl border border-[#e2ebd9] p-5 shadow-xs hover:border-[#8cc540] transition-all cursor-pointer group space-y-4"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      emp.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={emp.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#e2ebd9] group-hover:ring-[#8cc540] transition-all shadow-xs"
                  />
                  <div>
                    <h3 className="font-black text-sm text-[#101010] group-hover:text-[#436320] transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-[11px] text-[#666666]">{emp.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          emp.department === 'IT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {emp.department} Sales
                      </span>
                      <span className="px-2 py-0.5 rounded font-black text-[10px] bg-[#f3f8ef] text-[#436320] border border-[#8cc540]/40">
                        {emp.profileCode} Profile
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openSalesEmployeeModal(emp)}
                    className="p-1.5 rounded-lg text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5]"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, emp)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Performance Status for Selected Month */}
              <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-xs">
                {currentRecord ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#666666] block">
                        {selectedMonth} {selectedYear} Score
                      </span>
                      <span className="font-black text-sm text-[#101010]">
                        {currentRecord.totalPerformanceScore} PTS
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold ml-1">
                        ({currentRecord.conversionRate}% Conv.)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#666666] block">Conversions</span>
                      <span className="font-black text-xs text-[#436320]">
                        {currentRecord.orderConvert} Orders
                      </span>
                      <span className="text-[10px] text-[#777777] block font-medium">
                        {currentRecord.repeatOrders} Repeat • {currentRecord.totalReachout} Leads
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#777777]">
                      No performance record for {selectedMonth}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSalesEntryModal(undefined, emp.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#8cc540] text-[#101010] hover:bg-[#7db734] cursor-pointer"
                    >
                      + Enter
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] text-[#777777]">
                  Joined: {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
                <span className="text-xs font-bold text-[#436320] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permanent Deletion Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#101010]">Permanently Delete Sales Employee</h3>
                <p className="text-xs text-[#666666]">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#666666] font-medium">Employee:</span>
                <span className="font-bold text-[#101010]">{deletingEmployee.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666] font-medium">Email:</span>
                <span className="font-medium text-[#101010]">{deletingEmployee.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666] font-medium">Department & Profile:</span>
                <span className="font-bold text-[#436320]">{deletingEmployee.department} Sales ({deletingEmployee.profileCode})</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-medium">
              Deleting this sales employee will also permanently purge all their monthly performance records across IT and SMM sales logs.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2ebd9]">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f5f5f5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Permanent Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
