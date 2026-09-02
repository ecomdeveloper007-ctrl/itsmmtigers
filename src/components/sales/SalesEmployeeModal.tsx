import React, { useState, useEffect } from 'react';
import { useSales } from '../../context/SalesContext';
import { SalesEmployee, SalesProfileCode, SalesDepartment, SALES_PROFILES_META } from '../../types/sales';
import { X, UserPlus, CheckCircle2, User, Mail, Calendar, Building, Sparkles, Trash2 } from 'lucide-react';

export const SalesEmployeeModal: React.FC = () => {
  const {
    isSalesEmployeeModalOpen,
    closeSalesEmployeeModal,
    editingSalesEmployee,
    saveSalesEmployee,
    deleteSalesEmployee,
  } = useSales();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<SalesDepartment>('IT');
  const [profileCode, setProfileCode] = useState<SalesProfileCode>('PR');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingSalesEmployee) {
      setName(editingSalesEmployee.name);
      setEmail(editingSalesEmployee.email);
      setDepartment(editingSalesEmployee.department);
      setProfileCode(editingSalesEmployee.profileCode);
      setJoiningDate(editingSalesEmployee.joiningDate || new Date().toISOString().split('T')[0]);
      setStatus(editingSalesEmployee.status);
      setAvatarUrl(editingSalesEmployee.avatarUrl || '');
    } else {
      setName('');
      setEmail('');
      setDepartment('IT');
      setProfileCode('PR');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setStatus('active');
      setAvatarUrl('');
    }
    setError('');
  }, [isSalesEmployeeModalOpen, editingSalesEmployee]);

  // Handle department change to adjust profile code accordingly
  const handleDepartmentChange = (dept: SalesDepartment) => {
    setDepartment(dept);
    if (dept === 'IT' && !['PR', 'WR', 'HW'].includes(profileCode)) {
      setProfileCode('PR');
    } else if (dept === 'SMM' && !['DR', 'RR'].includes(profileCode)) {
      setProfileCode('DR');
    }
  };

  const handleProfileChange = (code: SalesProfileCode) => {
    setProfileCode(code);
    if (['PR', 'WR', 'HW'].includes(code)) {
      setDepartment('IT');
    } else {
      setDepartment('SMM');
    }
  };

  if (!isSalesEmployeeModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide the employee full name.');
      return;
    }

    if (!email.trim()) {
      setError('Please provide the employee email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const emp: SalesEmployee = {
        id: editingSalesEmployee?.id || `sales_emp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: name.trim(),
        email: email.trim(),
        department,
        profileCode,
        joiningDate,
        status,
        avatarUrl:
          avatarUrl.trim() ||
          editingSalesEmployee?.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: editingSalesEmployee?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const ok = await saveSalesEmployee(emp);
      if (ok) {
        closeSalesEmployeeModal();
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8cc540]/20 flex items-center justify-center text-[#436320] border border-[#8cc540]/40">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#101010] tracking-tight">
                {editingSalesEmployee ? 'Edit Sales Employee' : 'Add Sales Employee'}
              </h2>
              <p className="text-xs text-[#666666]">
                Assign to IT or SMM Department and specific profile
              </p>
            </div>
          </div>
          <button
            onClick={closeSalesEmployeeModal}
            className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Rohit Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g., rohit.sharma@itsmmtigers.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value as SalesDepartment)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                <option value="IT">IT Sales</option>
                <option value="SMM">SMM Sales</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">
                Profile Code <span className="text-rose-500">*</span>
              </label>
              <select
                value={profileCode}
                onChange={(e) => handleProfileChange(e.target.value as SalesProfileCode)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                {department === 'IT' ? (
                  <>
                    <option value="PR">PR - Solutions & Delivery</option>
                    <option value="WR">WR - Web Arch & Eng</option>
                    <option value="HW">HW - Cloud & Infra</option>
                  </>
                ) : (
                  <>
                    <option value="DR">DR - Direct Response</option>
                    <option value="RR">RR - Retainers & Growth</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">Joining Date</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">Avatar URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e2ebd9]">
            {editingSalesEmployee ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete ${editingSalesEmployee.name} from the Sales roster?`)) {
                    await deleteSalesEmployee(editingSalesEmployee.id);
                    closeSalesEmployeeModal();
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeSalesEmployeeModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f5f5f5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingSalesEmployee ? 'Save Changes' : 'Create Sales Employee'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
