import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  User,
  KeyRound,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  X,
  Save,
  Clock,
  Check,
  Ban,
  UserCheck,
  AlertCircle,
  Copy,
  Eye,
  Trash2,
  AlertTriangle,
  Briefcase,
  Layers,
  Building2,
  ArrowRight,
  Filter,
  Camera,
  Upload,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  UserStatus,
  ProfileCode,
  ModuleAssignment,
  ALL_PROFILES,
  PROFILE_DEPARTMENT_PRESETS,
  getDefaultDepartmentForProfile,
} from '../../types';
import { DataService } from '../../services/dataService';
import { SalesDataService } from '../../services/salesDataService';
import { MemberProfileAdminModal } from './MemberProfileAdminModal';
import { usePermissions } from '../../context/PermissionContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

export const UserManagement: React.FC = () => {
  const {
    currentUser,
    allUsers,
    refreshUsers,
    approveUser,
    rejectUser,
    deleteUser,
    pendingUsers,
    pendingCount,
    isSuperAdmin,
    updateUserDepartmentAndProfile,
  } = useAuth();
  const { addToast } = useApp();
  const { roles, hasPermission } = usePermissions();

  // Primary navigation: 'members' vs 'approvals'
  const [primaryTab, setPrimaryTab] = useState<'members' | 'approvals'>('members');
  // Secondary subview inside 'members': 'profile_matrix' vs 'directory'
  const [membersView, setMembersView] = useState<'profile_matrix' | 'directory'>('profile_matrix');

  const [selectedProfileFilter, setSelectedProfileFilter] = useState<ProfileCode | 'ALL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<'ALL' | 'pm' | 'sales' | 'both'>('ALL');

  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Quick Department & Module Modal state
  const [quickDeptUser, setQuickDeptUser] = useState<UserProfile | null>(null);
  const [quickDeptProfileCode, setQuickDeptProfileCode] = useState<ProfileCode>('PR');
  const [quickDepartment, setQuickDepartment] = useState<string>('');
  const [quickModuleAssignment, setQuickModuleAssignment] = useState<ModuleAssignment>('both');
  const [isCustomDept, setIsCustomDept] = useState<boolean>(false);
  const [isSavingQuickDept, setIsSavingQuickDept] = useState<boolean>(false);

  // Pending role & module assignment mapping
  const [pendingApprovalRoles, setPendingApprovalRoles] = useState<Record<string, UserRole>>({});
  const [pendingApprovalModules, setPendingApprovalModules] = useState<
    Record<
      string,
      {
        module: ModuleAssignment;
        salesDept: 'IT' | 'SMM';
        salesProfile: 'PR' | 'WR' | 'HW' | 'DR' | 'RR';
      }
    >
  >({});
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('team_member');
  const [formProfileCode, setFormProfileCode] = useState<ProfileCode>('PR');
  const [formDepartment, setFormDepartment] = useState<string>('IT Solutions & Product Delivery (PR)');
  const [formModuleAssignment, setFormModuleAssignment] = useState<ModuleAssignment>('both');
  const [formSalesDepartment, setFormSalesDepartment] = useState<'IT' | 'SMM'>('IT');
  const [formSalesProfileCode, setFormSalesProfileCode] = useState<'PR' | 'WR' | 'HW' | 'DR' | 'RR'>('PR');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>(PRESET_AVATARS[0]);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File', 'Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setFormAvatarUrl(result);
        addToast('success', 'Photo Loaded', 'Profile photo preview updated.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Incomplete details or unverified member');

  const [viewCredentialsUser, setViewCredentialsUser] = useState<UserProfile | null>(null);

  // Filtered members for directory table
  const filteredUsers = allUsers
    .filter((u) => {
      if (moduleFilter === 'ALL') return true;
      const userMod = u.moduleAssignment || 'both';
      return userMod === moduleFilter;
    })
    .filter((u) => {
      if (statusFilter === 'ALL') return true;
      return (u.status || 'active') === statusFilter;
    })
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  const openQuickDeptModal = (user: UserProfile) => {
    const code: ProfileCode =
      user.profileCode ||
      (user.team === 'IT' || user.department?.toLowerCase().includes('it') ? 'PR' : 'RR');
    setQuickDeptUser(user);
    setQuickDeptProfileCode(code);
    setQuickDepartment(user.department || getDefaultDepartmentForProfile(code));
    setQuickModuleAssignment(user.moduleAssignment || 'both');
    setIsCustomDept(false);
  };

  const handleQuickSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDeptUser || !currentUser) return;
    if (!quickDepartment.trim()) {
      addToast('error', 'Department Required', 'Please choose or type a department.');
      return;
    }

    setIsSavingQuickDept(true);
    try {
      const isIT = ['PR', 'WR', 'HW'].includes(quickDeptProfileCode);
      const updatedProfile: UserProfile = {
        ...quickDeptUser,
        profileCode: quickDeptProfileCode,
        department: quickDepartment.trim(),
        team: isIT ? 'IT' : 'SMM',
        moduleAssignment: quickModuleAssignment,
      };

      const res = await updateUserDepartmentAndProfile(
        quickDeptUser.uid,
        quickDeptProfileCode,
        quickDepartment.trim(),
        quickModuleAssignment
      );

      if (res && res.success) {
        if (quickModuleAssignment === 'both' || quickModuleAssignment === 'sales') {
          const salesDept: 'IT' | 'SMM' = isIT ? 'IT' : 'SMM';
          const salesProf = quickDeptProfileCode as 'PR' | 'WR' | 'HW' | 'DR' | 'RR';
          await SalesDataService.syncUserToSales({
            ...updatedProfile,
            salesDepartment: salesDept,
            salesProfileCode: salesProf,
          });
        }
        addToast(
          'success',
          'Department & Profile Updated',
          `${quickDeptUser.name} is now assigned to ${quickDeptProfileCode} profile (${quickDepartment}).`
        );
        setQuickDeptUser(null);
        await refreshUsers();
      } else {
        addToast('error', 'Update Failed', res?.message || 'Could not update user department.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Error Saving', err?.message || 'Network error.');
    } finally {
      setIsSavingQuickDept(false);
    }
  };

  const handleInlineModuleChange = async (user: UserProfile, newMod: ModuleAssignment) => {
    if (!currentUser) return;
    try {
      const code: ProfileCode =
        user.profileCode ||
        (user.team === 'IT' || user.department?.toLowerCase().includes('it') ? 'PR' : 'RR');
      const dept = user.department || getDefaultDepartmentForProfile(code);

      const res = await updateUserDepartmentAndProfile(user.uid, code, dept, newMod);
      if (res && res.success) {
        if (newMod === 'both' || newMod === 'sales') {
          const isIT = ['PR', 'WR', 'HW'].includes(code);
          const salesDept: 'IT' | 'SMM' = isIT ? 'IT' : 'SMM';
          const salesProf = code as 'PR' | 'WR' | 'HW' | 'DR' | 'RR';
          await SalesDataService.syncUserToSales({
            ...user,
            moduleAssignment: newMod,
            salesDepartment: salesDept,
            salesProfileCode: salesProf,
          });
        }
        addToast('success', 'Access Scope Updated', `${user.name} access updated to ${newMod.toUpperCase()}.`);
        await refreshUsers();
      } else {
        addToast('error', 'Update Failed', res?.message || 'Could not update module.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Error', err?.message || 'Could not update module.');
    }
  };

  const handleApprove = async (
    user: UserProfile,
    role: UserRole = 'team_member',
    moduleAssignment: ModuleAssignment = 'both',
    salesDept: 'IT' | 'SMM' = 'IT',
    salesProfile: 'PR' | 'WR' | 'HW' | 'DR' | 'RR' = 'PR'
  ) => {
    setApprovingUserId(user.uid);
    try {
      const res = await approveUser(user.uid, role, moduleAssignment);
      if (res.success) {
        if (moduleAssignment === 'both' || moduleAssignment === 'sales') {
          await SalesDataService.syncUserToSales({
            ...user,
            moduleAssignment,
            status: 'active',
            salesDepartment: salesDept,
            salesProfileCode: salesProfile,
          });
        }
        addToast('success', 'Member Approved', `${user.name} has been approved and granted access.`);
        await refreshUsers();
      } else {
        addToast('error', 'Approval Failed', res.message || 'Could not approve member.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Approval Error', err.message || 'Could not approve member.');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingUser) return;
    try {
      const res = await rejectUser(rejectingUser.uid, rejectReason);
      if (res.success) {
        addToast('info', 'Registration Declined', `${rejectingUser.name}'s registration has been declined.`);
        setRejectingUser(null);
        await refreshUsers();
      } else {
        addToast('error', 'Action Failed', res.message || 'Could not decline registration.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Decline Error', err.message || 'Could not decline registration.');
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormUserId('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('team_member');
    setFormProfileCode('PR');
    setFormDepartment('IT Solutions & Product Delivery (PR)');
    setFormModuleAssignment('both');
    setFormSalesDepartment('IT');
    setFormSalesProfileCode('PR');
    setFormStatus('active');
    setFormAvatarUrl(PRESET_AVATARS[0]);
    setIsAddUserOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUserId(user.userId);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormProfileCode(user.profileCode || 'PR');
    setFormDepartment(user.department || getDefaultDepartmentForProfile(user.profileCode || 'PR'));
    setFormModuleAssignment(user.moduleAssignment || 'both');
    setFormSalesDepartment(user.salesDepartment || (user.team === 'IT' ? 'IT' : 'SMM'));
    setFormSalesProfileCode((user.salesProfileCode || (user.team === 'IT' ? 'PR' : 'DR')) as any);
    setFormStatus(user.status || 'active');
    setFormAvatarUrl(user.avatarUrl || PRESET_AVATARS[0]);
    setIsAddUserOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUserId.trim()) {
      addToast('error', 'Validation Error', 'Full name and User ID are required.');
      return;
    }

    const isIT = ['PR', 'WR', 'HW'].includes(formProfileCode);
    const updatedUser: UserProfile = {
      uid: editingUser ? editingUser.uid : `user_${Date.now()}`,
      userId: formUserId.trim().toLowerCase(),
      name: formName.trim(),
      email: formEmail.trim().toLowerCase() || `${formUserId.trim().toLowerCase()}@coozmoo.com`,
      password: formPassword.trim() || (editingUser?.password || 'tiger2026'),
      role: formRole,
      status: formStatus,
      profileCode: formProfileCode,
      department: formDepartment.trim() || getDefaultDepartmentForProfile(formProfileCode),
      team: isIT ? 'IT' : 'SMM',
      moduleAssignment: formModuleAssignment,
      salesDepartment: formSalesDepartment,
      salesProfileCode: formSalesProfileCode,
      avatarUrl: formAvatarUrl,
      joiningDate: editingUser?.joiningDate || new Date().toISOString().split('T')[0],
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const actor = {
      id: currentUser?.uid || 'admin',
      name: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'admin',
    };

    try {
      await DataService.saveUser(updatedUser, actor);
      if (formModuleAssignment === 'both' || formModuleAssignment === 'sales') {
        await SalesDataService.syncUserToSales({
          ...updatedUser,
          salesDepartment: formSalesDepartment,
          salesProfileCode: formSalesProfileCode,
        });
      }
      addToast(
        'success',
        editingUser ? 'Profile Updated' : 'Member Created',
        `${updatedUser.name} has been ${editingUser ? 'updated' : 'created'} successfully.`
      );
      setIsAddUserOpen(false);
      await refreshUsers();
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Save Failed', err.message || 'Could not save member profile.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword.trim()) return;
    const actor = {
      id: currentUser?.uid || 'admin',
      name: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'admin',
    };
    try {
      const updated = { ...resetPasswordUser, password: newPassword.trim() };
      await DataService.saveUser(updated, actor);
      addToast('success', 'Password Updated', `Password for ${resetPasswordUser.name} has been updated.`);
      setResetPasswordUser(null);
      await refreshUsers();
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Reset Failed', err.message || 'Could not update password.');
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'disabled' : 'active';
    const actor = {
      id: currentUser?.uid || 'admin',
      name: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'admin',
    };
    try {
      const updated = { ...user, status: nextStatus };
      await DataService.saveUser(updated, actor);
      addToast('info', 'Status Changed', `${user.name} is now ${nextStatus}.`);
      await refreshUsers();
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Error', err.message || 'Could not change status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await deleteUser(deletingUser.uid);
      if (res.success) {
        addToast('success', 'User Deleted', `${deletingUser.name} was permanently removed.`);
        setDeletingUser(null);
        await refreshUsers();
      } else {
        addToast('error', 'Delete Failed', res.message || 'Could not delete user.');
      }
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Delete Error', err.message || 'Could not delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30 shadow-xs">
              <Users className="w-5 h-5 text-[#598327]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              Team Members & Approvals
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {allUsers.length} Total Users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
            Manage member profile specializations (PR, WR, HW, RR, DR), system access roles, and pending registration approvals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPermission('pm.members', 'create') && (
            <button
              onClick={handleCreateUser}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center gap-1.5 shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Immediate Attention Callout Banner if Pending Registrations Exist */}
      {pendingCount > 0 && primaryTab !== 'approvals' && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-300">
              <Clock className="w-5 h-5 animate-pulse text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">
                {pendingCount} Registration Request{pendingCount === 1 ? '' : 's'} Awaiting Review
              </h4>
              <p className="text-xs text-amber-800/90 font-medium">
                New team members have registered and are waiting for role approval and department assignments.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPrimaryTab('approvals')}
            className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs transition-colors"
          >
            <span>Review Pending Approvals ({pendingCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Navigation Separation: [Team Members] vs [Approvals] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#e2ebd9] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrimaryTab('members')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              primaryTab === 'members'
                ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                : 'bg-white text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] border border-[#e2ebd9]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#101010]/10">
              {allUsers.filter((u) => u.status !== 'pending_approval').length}
            </span>
          </button>

          <button
            onClick={() => setPrimaryTab('approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer relative ${
              primaryTab === 'approvals'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-[#666666] hover:text-[#101010] hover:bg-amber-50/50 border border-[#e2ebd9]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Approvals</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                pendingCount > 0
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pendingCount}
            </span>
          </button>
        </div>

        {/* View Toggle if on Members Tab */}
        {primaryTab === 'members' && (
          <div className="flex items-center gap-1.5 bg-[#f8faf6] p-1 rounded-xl border border-[#e2ebd9] self-start sm:self-auto">
            <span className="text-[10px] text-[#888888] font-bold uppercase px-2">Layout:</span>
            <button
              onClick={() => setMembersView('profile_matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                membersView === 'profile_matrix'
                  ? 'bg-white text-[#101010] border border-[#e2ebd9] shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#598327]" />
              <span>Profile Matrix</span>
            </button>
            <button
              onClick={() => setMembersView('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                membersView === 'directory'
                  ? 'bg-white text-[#101010] border border-[#e2ebd9] shadow-xs'
                  : 'text-[#666666] hover:text-[#101010]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#598327]" />
              <span>All Members Table</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          TAB 1: TEAM MEMBERS
          ======================================================== */}
      {primaryTab === 'members' && (
        <div className="space-y-6">
          {/* VIEW A: PROFILE-WISE MATRIX */}
          {membersView === 'profile_matrix' && (
            <div className="space-y-6">
              {/* Explanatory Banner & Quick Breakdown */}
              <div className="bg-white border border-[#e2ebd9] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      <Layers className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-[#101010]">
                      Profile-Wise Specialization & Department Matrix
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] max-w-2xl font-normal leading-relaxed">
                    Organize members by their profile specializations (PR, WR, HW for IT Team; RR, DR for SMM Team). You can update each member's department assignment directly using the presets or custom designations.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-stretch md:self-auto bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9] shrink-0">
                  <div className="text-center px-3.5 py-1 border-r border-[#e2ebd9]">
                    <div className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">IT Profiles</div>
                    <div className="text-sm font-black text-blue-700">
                      {allUsers.filter((u) => ['PR', 'WR', 'HW'].includes(u.profileCode || (u.team === 'IT' || u.department?.toLowerCase().includes('it') ? 'PR' : 'RR'))).length}
                    </div>
                  </div>
                  <div className="text-center px-3.5 py-1">
                    <div className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">SMM Profiles</div>
                    <div className="text-sm font-black text-purple-700">
                      {allUsers.filter((u) => ['RR', 'DR'].includes(u.profileCode || (u.team === 'IT' || u.department?.toLowerCase().includes('it') ? 'PR' : 'RR'))).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedProfileFilter('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedProfileFilter === 'ALL'
                      ? 'bg-[#8cc540] text-[#101010] font-black shadow-xs'
                      : 'bg-white border border-[#e2ebd9] text-[#555555] hover:text-[#101010]'
                  }`}
                >
                  All Profiles ({allUsers.length})
                </button>
                {(['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[]).map((code) => {
                  const count = allUsers.filter(
                    (u) =>
                      (u.profileCode ||
                        (u.team === 'IT' || u.department?.toLowerCase().includes('it') ? 'PR' : 'RR')) === code
                  ).length;
                  const isSelected = selectedProfileFilter === code;
                  const isIT = ['PR', 'WR', 'HW'].includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedProfileFilter(code)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? isIT
                            ? 'bg-blue-600 text-white font-black shadow-sm'
                            : 'bg-purple-600 text-white font-black shadow-sm'
                          : 'bg-white border border-[#e2ebd9] text-[#555555] hover:text-[#101010]'
                      }`}
                    >
                      <span>{isIT ? '💻' : '📱'}</span>
                      <span>{code} Profile</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? 'bg-black/20 text-white' : 'bg-[#f0f4ec] text-[#436320]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Profile Groups */}
              <div className="space-y-6">
                {(['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[])
                  .filter((code) => selectedProfileFilter === 'ALL' || selectedProfileFilter === code)
                  .map((code) => {
                    const prof = ALL_PROFILES[code];
                    const isIT = ['PR', 'WR', 'HW'].includes(code);
                    const members = allUsers.filter(
                      (u) =>
                        (u.profileCode ||
                          (u.team === 'IT' || u.department?.toLowerCase().includes('it') ? 'PR' : 'RR')) === code
                    );

                    return (
                      <div
                        key={code}
                        className="rounded-3xl border border-[#e2ebd9] bg-white overflow-hidden shadow-sm"
                      >
                        {/* Profile Header */}
                        <div
                          className={`p-4 sm:p-5 border-b border-[#e2ebd9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isIT ? 'bg-blue-50/50' : 'bg-purple-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                                isIT
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-purple-100 text-purple-800 border border-purple-200'
                              }`}
                            >
                              {code} Profile
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-[#101010] flex items-center gap-2">
                                {prof?.title || code}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    isIT
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}
                                >
                                  {isIT ? 'IT Solutions' : 'SMM Strategy'}
                                </span>
                              </h4>
                              <p className="text-xs text-[#666666] mt-0.5 line-clamp-1">
                                {prof?.description || ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs text-[#555555] font-semibold">
                              {members.length} {members.length === 1 ? 'member' : 'members'} assigned
                            </span>
                          </div>
                        </div>

                        {/* Members List in this profile */}
                        {members.length === 0 ? (
                          <div className="p-8 text-center text-[#888888]">
                            <p className="text-xs font-medium">No members currently assigned to {code} profile.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#edf3e7]">
                            {members.map((u) => (
                              <div
                                key={u.uid}
                                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f8faf6] transition-colors"
                              >
                                <div className="flex items-center gap-3.5">
                                  <img
                                    src={u.avatarUrl || PRESET_AVATARS[0]}
                                    alt={u.name}
                                    className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#e2ebd9]"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-sm font-black text-[#101010]">{u.name}</h5>
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f0f4ec] text-[#436320] font-bold">
                                        {u.userId}
                                      </span>
                                      {u.role === 'super_admin' && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                          Super Admin
                                        </span>
                                      )}
                                      {u.role === 'admin' && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                          Admin
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] mt-1">
                                      <span className="text-[#333333] font-medium">{u.email}</span>
                                      <span>•</span>
                                      <span className="text-[#101010] font-semibold">{u.department || 'IT Solutions'}</span>
                                      <span>•</span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                          (u.moduleAssignment || 'both') === 'both'
                                            ? 'bg-purple-50 text-purple-700'
                                            : (u.moduleAssignment || 'both') === 'pm'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-emerald-50 text-emerald-700'
                                        }`}
                                      >
                                        {(u.moduleAssignment || 'both') === 'both'
                                          ? '⚡ Both Modules'
                                          : (u.moduleAssignment || 'both') === 'pm'
                                          ? '💻 PM Only'
                                          : '💼 Sales Only'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-auto">
                                  {hasPermission('pm.members', 'edit') && (
                                    <>
                                      <button
                                        onClick={() => openQuickDeptModal(u)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#f0f4ec] text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                      >
                                        <Building2 className="w-3.5 h-3.5 text-[#598327]" />
                                        <span>Update Dept & Profile</span>
                                      </button>

                                      <button
                                        onClick={() => openEditModal(u)}
                                        className="p-1.5 rounded-xl bg-white hover:bg-[#f0f4ec] text-[#555555] hover:text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                                        title="Edit User Details"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIEW B: ALL MEMBERS TABLE DIRECTORY */}
          {membersView === 'directory' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e2ebd9] shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search || ''}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, user ID, or email..."
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl pl-9 pr-4 py-2 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Module Scope Filter */}
                  <div className="flex items-center gap-1 bg-[#f8faf6] p-1 rounded-xl border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#888888] font-bold uppercase px-1.5">Scope:</span>
                    {(
                      [
                        { id: 'ALL', label: 'All' },
                        { id: 'both', label: '⚡ Both' },
                        { id: 'pm', label: '💻 PM' },
                        { id: 'sales', label: '💼 Sales' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setModuleFilter(t.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          moduleFilter === t.id
                            ? 'bg-white text-[#101010] border border-[#e2ebd9] shadow-2xs'
                            : 'text-[#666666] hover:text-[#101010]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1 bg-[#f8faf6] p-1 rounded-xl border border-[#e2ebd9]">
                    <span className="text-[10px] text-[#888888] font-bold uppercase px-1.5">Status:</span>
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'active', label: 'Active' },
                      { id: 'disabled', label: 'Disabled' },
                      { id: 'rejected', label: 'Rejected' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatusFilter(s.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          statusFilter === s.id
                            ? 'bg-white text-[#101010] border border-[#e2ebd9] shadow-2xs'
                            : 'text-[#666666] hover:text-[#101010]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="rounded-3xl border border-[#e2ebd9] bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2ebd9] bg-[#f8faf6] text-[11px] font-black text-[#555555] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Name</th>
                        <th className="py-3.5 px-4">User ID / Email</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Module Assignment</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Department & Profile</th>
                        <th className="py-3.5 px-4">Joining Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf3e7] text-xs">
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="hover:bg-[#f8faf6] transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl || PRESET_AVATARS[0]}
                                alt={user.name}
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#e2ebd9]"
                              />
                              <div>
                                <span className="font-bold text-[#101010] text-sm block">{user.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div>
                              <p className="font-mono text-xs font-bold text-[#436320]">{user.userId}</p>
                              <p className="text-[11px] text-[#666666]">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {user.role === 'super_admin' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                <Shield className="w-3 h-3 text-amber-600" /> Super Admin
                              </span>
                            )}
                            {user.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                <Shield className="w-3 h-3 text-blue-600" /> Admin
                              </span>
                            )}
                            {user.role === 'team_member' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <User className="w-3 h-3 text-emerald-600" /> Team Member
                              </span>
                            )}
                            {user.role === 'viewer' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                <Eye className="w-3 h-3 text-purple-600" /> Viewer (Read-Only)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  (user.moduleAssignment || 'both') === 'both'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : (user.moduleAssignment || 'both') === 'pm'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {(user.moduleAssignment || 'both') === 'both'
                                  ? '⚡ Both'
                                  : (user.moduleAssignment || 'both') === 'pm'
                                  ? '💻 PM'
                                  : '💼 Sales'}
                              </span>
                              <div className="flex items-center gap-1">
                                {(
                                  [
                                    { id: 'pm', label: 'PM' },
                                    { id: 'sales', label: 'Sales' },
                                    { id: 'both', label: 'Both' },
                                  ] as const
                                ).map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => handleInlineModuleChange(user, m.id)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                      (user.moduleAssignment || 'both') === m.id
                                        ? 'bg-[#8cc540] text-[#101010] font-black'
                                        : 'bg-[#f8faf6] text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                                    }`}
                                    title={`Switch to ${m.label}`}
                                  >
                                    {m.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {user.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> Active
                              </span>
                            )}
                            {user.status === 'pending_approval' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3" /> Pending Review
                              </span>
                            )}
                            {user.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <Ban className="w-3 h-3" /> Rejected
                              </span>
                            )}
                            {user.status === 'disabled' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                                <XCircle className="w-3 h-3" /> Disabled
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-[#101010]">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="font-semibold text-[#101010] block text-xs">
                                  {user.department || 'IT Team'}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase inline-block mt-0.5 ${
                                    ['PR', 'WR', 'HW'].includes(user.profileCode || '')
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}
                                >
                                  {user.profileCode || (user.team === 'IT' || user.department?.toLowerCase().includes('it') ? 'PR' : 'RR')} Profile
                                </span>
                              </div>
                              {hasPermission('pm.members', 'edit') && (
                                <button
                                  onClick={() => openQuickDeptModal(user)}
                                  className="p-1 px-2 rounded-lg bg-white hover:bg-[#f0f4ec] text-[#555555] hover:text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs"
                                  title="Update Department & Profile"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Update</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-[#666666] font-medium">
                            {user.joiningDate || '2025-01-01'}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                            {user.status === 'pending_approval' ? (
                              hasPermission('pm.members', 'approve') && (
                                <button
                                  onClick={() => handleApprove(user)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                                >
                                  Approve
                                </button>
                              )
                            ) : (
                              <>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => setInspectingUser(user)}
                                    className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-[#666666] hover:text-indigo-700 border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                                    title="Inspect Member Profile"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setViewCredentialsUser(user)}
                                  className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-[#666666] hover:text-amber-700 border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                                  title="View & Copy Login Credentials"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {hasPermission('pm.members', 'edit') && (
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="p-1.5 rounded-lg bg-white hover:bg-[#f0f4ec] text-[#666666] hover:text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                                    title="Edit User"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {hasPermission('pm.members', 'edit') && (
                                  <button
                                    onClick={() => {
                                      setResetPasswordUser(user);
                                      setNewPassword(user.password || 'tiger2026');
                                    }}
                                    className="p-1.5 rounded-lg bg-white hover:bg-amber-50 text-[#666666] hover:text-amber-700 border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                                    title="Reset Password"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {user.uid !== currentUser?.uid && (
                                  <>
                                    {hasPermission('pm.members', 'edit') && (
                                      <button
                                        onClick={() => handleToggleStatus(user)}
                                        className={`p-1.5 rounded-lg border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs ${
                                          user.status === 'active'
                                            ? 'bg-white hover:bg-rose-50 text-[#666666] hover:text-rose-600'
                                            : 'bg-white hover:bg-emerald-50 text-[#666666] hover:text-emerald-600'
                                        }`}
                                        title={user.status === 'active' ? 'Disable Account' : 'Enable Account'}
                                      >
                                        {user.status === 'active' ? (
                                          <XCircle className="w-3.5 h-3.5" />
                                        ) : (
                                          <CheckCircle className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}

                                    {hasPermission('pm.members', 'delete') && (
                                      <button
                                        onClick={() => setDeletingUser(user)}
                                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-[#888888] hover:text-rose-600 border border-[#e2ebd9] hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                                        title="Delete Member Profile"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-[#888888]">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#8cc540]" />
                    <p className="text-sm font-bold text-[#101010]">No members found.</p>
                    <p className="text-xs text-[#666666]">Try adjusting your search query or status filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: PENDING APPROVALS
          ======================================================== */}
      {primaryTab === 'approvals' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-amber-950">
                  Pending Registration Approval Requests
                </h3>
              </div>
              <p className="text-xs text-amber-900/80 max-w-2xl font-medium leading-relaxed">
                Review self-registered team members, assign their authorized access role (Team Member, Admin, Viewer), designate their project management and sales scope, and verify their department profile.
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-white border border-amber-200 font-bold text-xs text-amber-900 shadow-2xs">
              {pendingCount} Pending Request{pendingCount === 1 ? '' : 's'}
            </div>
          </div>

          {/* Pending Users Grid */}
          {pendingUsers.length === 0 ? (
            <div className="bg-white border border-[#e2ebd9] rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-[#101010]">All Caught Up!</h4>
              <p className="text-xs text-[#666666] max-w-md mx-auto">
                There are currently no pending registration requests awaiting administrative approval. All team members have been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingUsers.map((user) => (
                <div
                  key={user.uid}
                  className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-md space-y-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Awaiting Approval
                  </div>

                  {/* Member Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={user.avatarUrl || PRESET_AVATARS[0]}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-[#101010] truncate">{user.name}</h4>
                      <p className="text-xs font-mono font-bold text-[#436320]">{user.userId}</p>
                      <p className="text-xs text-[#666666] truncate mt-0.5">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#f0f4ec] text-[#436320]">
                          Requested: {user.department || 'IT Team'}
                        </span>
                        <span className="text-[10px] text-[#888888]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Configuration Controls */}
                  <div className="bg-[#f8faf6] p-4 rounded-2xl border border-[#e2ebd9] space-y-3.5 text-xs">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#666666] mb-1">
                        Assign Access Role:
                      </label>
                      <select
                        value={pendingApprovalRoles[user.uid] || 'team_member'}
                        onChange={(e) =>
                          setPendingApprovalRoles((prev) => ({
                            ...prev,
                            [user.uid]: e.target.value as UserRole,
                          }))
                        }
                        className="w-full bg-white border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                      >
                        {roles.length > 0 ? (
                          roles
                            .filter((r) => r.status === 'active' && (isSuperAdmin || r.id !== 'super_admin'))
                            .map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} {r.isSystem ? '(System)' : ''}
                              </option>
                            ))
                        ) : (
                          <>
                            <option value="team_member">Team Member (Submit & View Own Data)</option>
                            <option value="admin">Admin (Manage Data & Reports)</option>
                            <option value="viewer">Viewer (Read-Only Access)</option>
                            {isSuperAdmin && <option value="super_admin">Super Admin (Full Control)</option>}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Module Assignment */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#666666] mb-1">
                        Module Access Scope:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'both', label: '⚡ Both' },
                          { id: 'pm', label: '💻 PM Only' },
                          { id: 'sales', label: '💼 Sales Only' },
                        ].map((m) => {
                          const currentMod =
                            pendingApprovalModules[user.uid]?.module ||
                            user.moduleAssignment ||
                            'both';
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() =>
                                setPendingApprovalModules((prev) => ({
                                  ...prev,
                                  [user.uid]: {
                                    module: m.id as ModuleAssignment,
                                    salesDept: prev[user.uid]?.salesDept || 'IT',
                                    salesProfile: prev[user.uid]?.salesProfile || 'PR',
                                  },
                                }))
                              }
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center ${
                                currentMod === m.id
                                  ? 'bg-[#8cc540] text-[#101010] font-black shadow-2xs'
                                  : 'bg-white text-[#666666] hover:text-[#101010] border border-[#e2ebd9]'
                              }`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      onClick={() => setRejectingUser(user)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Decline / Reject</span>
                    </button>

                    <button
                      disabled={approvingUserId === user.uid}
                      onClick={() => {
                        const assignedRole = pendingApprovalRoles[user.uid] || 'team_member';
                        const modConfig = pendingApprovalModules[user.uid] || {
                          module: user.moduleAssignment || 'both',
                          salesDept: user.salesDepartment || (user.team === 'IT' ? 'IT' : 'SMM'),
                          salesProfile: (user.salesProfileCode || (user.team === 'IT' ? 'PR' : 'DR')) as any,
                        };
                        handleApprove(
                          user,
                          assignedRole,
                          modConfig.module,
                          modConfig.salesDept,
                          modConfig.salesProfile
                        );
                      }}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center gap-1.5 shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {approvingUserId === user.uid ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Approve & Grant Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODALS (Clean Light Aesthetic)
          ======================================================== */}

      {/* Add / Edit User Modal */}
      {isAddUserOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsAddUserOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-[#e2ebd9] bg-[#f8faf6] z-10">
              <h3 className="text-base font-black text-[#101010]">
                {editingUser ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
                {/* Profile Avatar Selection */}
              <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2.5">
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider">
                  Member Profile Photo
                </label>
                <div className="flex items-center gap-3.5">
                  <div className="relative group shrink-0">
                    <img
                      src={formAvatarUrl || PRESET_AVATARS[0]}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#8cc540] shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      title="Upload Photo"
                    >
                      <Camera className="w-4 h-4 text-[#8cc540]" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      onChange={handleAvatarFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#8cc540]/15 text-[#3d591d] border border-[#8cc540]/30 hover:bg-[#8cc540]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-[#598327]" />
                        <span>Upload Photo</span>
                      </button>
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={formAvatarUrl || ''}
                        onChange={(e) => setFormAvatarUrl(e.target.value)}
                        className="flex-1 min-w-[130px] bg-white border border-[#e2ebd9] rounded-lg px-2.5 py-1 text-xs text-[#101010] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                      />
                    </div>
                    {/* Preset Avatars Row */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                      <span className="text-[10px] text-[#666666] font-semibold shrink-0">Presets:</span>
                      {PRESET_AVATARS.slice(0, 7).map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormAvatarUrl(url)}
                          className={`w-6 h-6 rounded-lg overflow-hidden shrink-0 ring-1 transition-all cursor-pointer ${
                            formAvatarUrl === url ? 'ring-2 ring-[#8cc540] scale-110' : 'ring-[#e2ebd9] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divya Bhardwaj"
                  value={formName || ''}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    User ID (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. divya.bhardwaj"
                    value={formUserId || ''}
                    onChange={(e) => setFormUserId(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. divya@coozmoo.com"
                    value={formEmail || ''}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  placeholder="Set account password (defaults to tiger2026)"
                  value={formPassword || ''}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium cursor-pointer"
                  >
                    {roles.length > 0 ? (
                      roles
                        .filter((r) => r.status === 'active' && (isSuperAdmin || r.id !== 'super_admin'))
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} {r.isSystem ? '(System)' : ''}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="team_member">Team Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer (Read-Only)</option>
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                    Profile Code
                  </label>
                  <select
                    value={formProfileCode}
                    onChange={(e) => {
                      const code = e.target.value as ProfileCode;
                      setFormProfileCode(code);
                      setFormDepartment(getDefaultDepartmentForProfile(code));
                    }}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium cursor-pointer"
                  >
                    <option value="PR">PR (IT Solutions)</option>
                    <option value="WR">WR (IT Web Architecture)</option>
                    <option value="HW">HW (IT Hardware & Cloud)</option>
                    <option value="RR">RR (SMM Strategy)</option>
                    <option value="DR">DR (SMM Performance Ads)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formDepartment || ''}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Module Assignment
                </label>
                <select
                  value={formModuleAssignment}
                  onChange={(e) => setFormModuleAssignment(e.target.value as ModuleAssignment)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium cursor-pointer"
                >
                  <option value="both">Both (Project Management & Sales)</option>
                  <option value="pm">PM Only (Project Management)</option>
                  <option value="sales">Sales Only (Sales CRM)</option>
                </select>
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#e2ebd9] bg-[#f8faf6] z-10">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 inline mr-1" />
                Save User
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Quick Department & Profile Modal */}
      {quickDeptUser && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setQuickDeptUser(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#e2ebd9] bg-[#f8faf6] z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30">
                  <Building2 className="w-5 h-5 text-[#598327]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#101010]">Update Member Department</h3>
                  <p className="text-xs text-[#666666]">
                    Assign profile-wise department for <span className="text-[#101010] font-bold">{quickDeptUser.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickDeptUser(null)}
                className="p-2 rounded-xl text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSaveDept} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
                {/* User Summary Card */}
              <div className="flex items-center gap-3 bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9]">
                <img
                  src={quickDeptUser.avatarUrl || PRESET_AVATARS[0]}
                  alt={quickDeptUser.name}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#e2ebd9] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#101010] truncate">{quickDeptUser.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#f0f4ec] text-[#436320] font-bold">
                      {quickDeptUser.userId}
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] truncate mt-0.5">
                    Current: <span className="text-[#101010] font-medium">{quickDeptUser.department || 'N/A'}</span> ({quickDeptUser.profileCode || 'PR'})
                  </p>
                </div>
              </div>

              {/* 1. Select Profile Code */}
              <div>
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-2">
                  1. Select Member Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[]).map((code) => {
                    const prof = ALL_PROFILES[code];
                    const isSelected = quickDeptProfileCode === code;
                    const isIT = ['PR', 'WR', 'HW'].includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setQuickDeptProfileCode(code);
                          if (!isCustomDept) {
                            setQuickDepartment(getDefaultDepartmentForProfile(code));
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? isIT
                              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                              : 'bg-purple-50 border-purple-400 ring-2 ring-purple-300'
                            : 'bg-[#f8faf6] border-[#e2ebd9] hover:border-[#8cc540]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded uppercase ${
                              isIT ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {code} Profile
                          </span>
                          <span className="text-[10px] text-[#666666] font-semibold">
                            {isIT ? '💻 IT Team' : '📱 SMM Team'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-[#101010] mt-1 truncate">
                          {prof?.title || code}
                        </h5>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Select Department Preset or Enter Custom */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider">
                    2. Department Assignment
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDept(!isCustomDept)}
                    className="text-[11px] text-[#598327] hover:underline font-bold cursor-pointer"
                  >
                    {isCustomDept ? '← Use Presets' : '✏️ Type Custom Department'}
                  </button>
                </div>

                {!isCustomDept ? (
                  <select
                    value={quickDepartment || ''}
                    onChange={(e) => setQuickDepartment(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium cursor-pointer"
                  >
                    {(PROFILE_DEPARTMENT_PRESETS[quickDeptProfileCode] || []).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={quickDepartment || ''}
                    onChange={(e) => setQuickDepartment(e.target.value)}
                    placeholder="e.g. IT Solutions & Technical Delivery (PR)"
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium"
                  />
                )}
              </div>

              {/* 3. Module Assignment */}
              <div className="space-y-2 pt-2 border-t border-[#e2ebd9]">
                <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider">
                  3. Module Assignment (Access Scope)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'both', label: '⚡ Both', desc: 'PM + Sales' },
                    { id: 'pm', label: '💻 PM Only', desc: 'Project Mgmt' },
                    { id: 'sales', label: '💼 Sales Only', desc: 'Sales CRM' },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setQuickModuleAssignment(mod.id as ModuleAssignment)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        quickModuleAssignment === mod.id
                          ? 'bg-[#8cc540]/20 border-[#8cc540] text-[#101010] ring-1 ring-[#8cc540]'
                          : 'bg-[#f8faf6] border-[#e2ebd9] text-[#666666]'
                      }`}
                    >
                      <span className="text-xs font-bold block text-[#101010]">{mod.label}</span>
                      <span className="text-[10px] text-[#666666] block mt-0.5">{mod.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit & Cancel (Pinned) */}
            <div className="flex-shrink-0 flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[#e2ebd9] bg-[#f8faf6] z-10">
              <button
                type="button"
                onClick={() => setQuickDeptUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingQuickDept}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] disabled:opacity-50 text-[#101010] shadow-md shadow-[#8cc540]/25 flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingQuickDept ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Update Department & Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Reject Request Modal */}
      {rejectingUser && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setRejectingUser(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010]">Decline Registration</h3>
                <p className="text-xs text-[#666666]">For {rejectingUser.name} ({rejectingUser.email})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                Reason for Declining
              </label>
              <input
                type="text"
                value={rejectReason || ''}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setResetPasswordUser(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-4 overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010]">Reset Account Password</h3>
                <p className="text-xs text-[#666666]">For {resetPasswordUser.name} ({resetPasswordUser.userId})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101010] uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="text"
                placeholder="Enter new password"
                value={newPassword || ''}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-mono focus:ring-2 focus:ring-[#8cc540]/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetPasswordUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 cursor-pointer"
              >
                Save New Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View & Copy Credentials Modal */}
      {viewCredentialsUser && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setViewCredentialsUser(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 space-y-5 overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#101010]">Member Login Credentials</h3>
                  <p className="text-xs text-[#666666]">{viewCredentialsUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewCredentialsUser(null)}
                className="p-1.5 rounded-xl text-[#888888] hover:text-[#101010] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-[#f8faf6] p-4 rounded-2xl border border-[#e2ebd9] text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span className="text-[#666666]">User ID (Username):</span>
                <span className="font-mono font-bold text-[#101010]">{viewCredentialsUser.userId}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span className="text-[#666666]">Email Address:</span>
                <span className="font-mono font-semibold text-[#101010]">{viewCredentialsUser.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span className="text-[#666666]">Login Password:</span>
                <span className="font-mono font-bold text-[#436320] bg-[#f0f4ec] px-2 py-0.5 rounded border border-[#e2ebd9]">
                  {viewCredentialsUser.password || 'tiger2026'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#e2ebd9]">
                <span className="text-[#666666]">Assigned Department:</span>
                <span className="font-semibold text-[#101010]">{viewCredentialsUser.department || 'IT Team'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#666666]">Account Status:</span>
                <span className="font-bold text-emerald-700 uppercase text-[10px]">
                  {viewCredentialsUser.status || 'active'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
              💡 <strong>Login Tip:</strong> The member can log in using either their <strong>User ID</strong> (<code>{viewCredentialsUser.userId}</code>) or <strong>Email</strong> (<code>{viewCredentialsUser.email}</code>) and their assigned password.
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => {
                  const creds = `IT SMM Tigers Login Credentials:\nName: ${viewCredentialsUser.name}\nUser ID: ${viewCredentialsUser.userId}\nEmail: ${viewCredentialsUser.email}\nPassword: ${viewCredentialsUser.password || 'tiger2026'}\nTeam: ${viewCredentialsUser.department || 'IT Team'}`;
                  navigator.clipboard.writeText(creds);
                  addToast('success', 'Copied to Clipboard', 'Credentials copied to clipboard!');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] flex items-center justify-center gap-1.5 shadow-md shadow-[#8cc540]/20 cursor-pointer transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Credentials Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Restricted Member Profile Modal */}
      {inspectingUser && (
        <MemberProfileAdminModal
          member={inspectingUser}
          onClose={() => setInspectingUser(null)}
          onEditUser={(user) => {
            setInspectingUser(null);
            openEditModal(user);
          }}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setDeletingUser(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-white border border-[#e2ebd9] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b border-[#e2ebd9] bg-rose-50 flex items-center gap-3 flex-shrink-0">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#101010]">Delete Member Profile</h3>
                <p className="text-xs text-rose-600 font-semibold">Permanent Action Warning</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto overscroll-contain flex-1">
              <p className="text-[#555555] leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#101010] font-bold">{deletingUser.name}</strong> (
                <span className="font-mono text-[#436320]">{deletingUser.userId}</span>)?
              </p>

              <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Email:</span>
                  <span className="font-mono text-[#101010] font-medium">{deletingUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Department:</span>
                  <span className="text-[#101010] font-medium">{deletingUser.department || 'IT Team'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Role:</span>
                  <span className="text-[#101010] capitalize font-medium">{deletingUser.role.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                ⚠️ This will permanently remove their credentials and access profile from both local storage and cloud database.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#f8faf6] hover:bg-[#edf3e7] text-[#555555] border border-[#e2ebd9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
