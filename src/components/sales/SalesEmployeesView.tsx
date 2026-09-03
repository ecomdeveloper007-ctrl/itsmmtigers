import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
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
  Layers,
  Lock,
} from 'lucide-react';
import { SalesEmployee, SalesProfileCode } from '../../types/sales';
import { isUserAdminOrSuperAdmin } from '../../utils/salesAuthUtils';

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
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();
  const isPrivileged = isUserAdminOrSuperAdmin(currentUser);

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
    filtered = filtered.filter((e) => {
      if (e.assignedProfiles && e.assignedProfiles.length > 0) {
        return e.assignedProfiles.includes(profileFilter);
      }
      return e.profileCode === profileFilter;
    });
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
        e.department.toLowerCase().includes(q) ||
        (e.assignedProfiles && e.assignedProfiles.some((p) => p.toLowerCase().includes(q)))
    );
  }

  const handleDeleteClick = (e: React.MouseEvent, emp: SalesEmployee) => {
    e.stopPropagation();
    if (!isPrivileged) {
      alert('Security Violation: Only Super Admin and Administrators can delete sales members.');
      return;
    }
    setDeletingEmployee(emp);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deletingEmployee || !isPrivileged) return;
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
              • {salesEmployees.length} Total Sales Members
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1">
            Sales Team & Multi-Profile Assignments
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Manage reps mapped to multiple profiles (PR, WR, HW for IT; DR, RR for SMM)
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => openSalesEmployeeModal()}
            className="px-4 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Sales Member</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
          <input
            type="text"
            placeholder="Search members by name, email, profile..."
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
          const empRecords = salesRecords.filter(
            (r) =>
              r.employeeId === emp.id &&
              r.month.toLowerCase() === selectedMonth.toLowerCase() &&
              Number(r.year) === Number(selectedYear)
          );

          const totalConversions = empRecords.reduce((s, r) => s + (r.conversions || 0), 0);
          const totalReachouts = empRecords.reduce((s, r) => s + (r.reachouts || 0), 0);
          const totalOrderValue = empRecords.reduce((s, r) => s + (r.orderValue || 0), 0);
          const totalFollowups = empRecords.reduce((s, r) => s + (r.followups || 0), 0);
          const avgScore = empRecords.length > 0
            ? Math.round(empRecords.reduce((s, r) => s + (r.totalPerformanceScore || 0), 0) / empRecords.length)
            : 0;

          const assignedList = emp.assignedProfiles && emp.assignedProfiles.length > 0
            ? emp.assignedProfiles
            : [emp.profileCode || 'PR'];

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
                    
                    {/* Multi-Profile Badges */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {assignedList.map((prof) => (
                        <span
                          key={prof}
                          className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                            ['PR', 'WR', 'HW'].includes(prof)
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {isPrivileged && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openSalesEmployeeModal(emp)}
                      className="p-1.5 rounded-lg text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5] cursor-pointer"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, emp)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Performance Status for Selected Month */}
              <div className="p-3 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-xs">
                {empRecords.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#666666] block">
                          {selectedMonth} {selectedYear} ({empRecords.length} entries)
                        </span>
                        <span className="font-black text-sm text-[#101010]">
                          {avgScore} PTS Avg
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-[#666666] block">Order Value</span>
                        <span className="font-black text-xs text-[#436320]">
                          ${(totalOrderValue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-[#e2ebd9] text-[10px] text-center">
                      <div className="bg-white p-1 rounded-lg border border-[#e2ebd9]">
                        <span className="text-[#666666] block">Conversions</span>
                        <span className="font-bold text-emerald-800">{totalConversions}</span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-[#e2ebd9]">
                        <span className="text-[#666666] block">Follow-ups</span>
                        <span className="font-bold text-blue-800">{totalFollowups}</span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-[#e2ebd9]">
                        <span className="text-[#666666] block">Reachouts</span>
                        <span className="font-bold text-slate-700">{totalReachouts}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[#777777]">
                    <span className="text-[11px]">No entries in {selectedMonth} {selectedYear}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openSalesEntryModal(undefined, emp.id, assignedList[0]);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#8cc540]/20 hover:bg-[#8cc540]/30 text-[#436320] text-[10px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add Entry
                    </button>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-[#777777]">
                  Joined: {emp.joiningDate || '2025-01-01'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    emp.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {emp.status === 'active' ? 'Active Member' : 'Inactive'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Permanent Delete */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-[#101010]">
                Permanently Delete Sales Member?
              </h3>
              <p className="text-xs text-[#666666]">
                Are you sure you want to delete{' '}
                <span className="font-bold text-rose-700">{deletingEmployee.name}</span>?
                This will delete their profile from the sales roster and record an audit log.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2ebd9]">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f5f5f5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmPermanentDelete}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Permanent Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
