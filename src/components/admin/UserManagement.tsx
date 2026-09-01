import React, { useState } from 'react';
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
  Sparkles,
  AlertCircle,
  Copy,
  Eye,
  CheckCheck,
  Camera,
  Upload,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Briefcase,
  Layers,
  Building2,
  ArrowRight,
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  UserStatus,
  ProfileCode,
  ALL_PROFILES,
  ALL_PROFILES_LIST,
  PROFILE_DEPARTMENT_PRESETS,
  getDefaultDepartmentForProfile,
} from '../../types';
import { DataService } from '../../services/dataService';
import { MemberProfileAdminModal } from './MemberProfileAdminModal';

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

  const [activeSubTab, setActiveSubTab] = useState<'profile_wise' | 'all' | 'pending'>('profile_wise');
  const [selectedProfileFilter, setSelectedProfileFilter] = useState<ProfileCode | 'ALL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [inspectingUser, setInspectingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Quick Department Modal state
  const [quickDeptUser, setQuickDeptUser] = useState<UserProfile | null>(null);
  const [quickDeptProfileCode, setQuickDeptProfileCode] = useState<ProfileCode>('PR');
  const [quickDepartment, setQuickDepartment] = useState<string>('');
  const [isCustomDept, setIsCustomDept] = useState<boolean>(false);
  const [isSavingQuickDept, setIsSavingQuickDept] = useState<boolean>(false);

  // Pending role assignment mapping (userId -> UserRole)
  const [pendingApprovalRoles, setPendingApprovalRoles] = useState<Record<string, UserRole>>({});
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('team_member');
  const [formProfileCode, setFormProfileCode] = useState<ProfileCode>('PR');
  const [formDepartment, setFormDepartment] = useState<string>('IT Solutions & Product Delivery (PR)');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string>(PRESET_AVATARS[0]);
  const formFileInputRef = React.useRef<HTMLInputElement>(null);

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Incomplete details or unverified member');

  const [viewCredentialsUser, setViewCredentialsUser] = useState<UserProfile | null>(null);

  const filteredUsers = allUsers.filter(
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
    setIsCustomDept(false);
  };

  const handleQuickSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDeptUser) return;
    if (!quickDepartment.trim()) {
      addToast('error', 'Department Required', 'Please choose or type a department.');
      return;
    }
    setIsSavingQuickDept(true);
    try {
      const success = await updateUserDepartmentAndProfile(
        quickDeptUser.uid,
        quickDepartment.trim(),
        quickDeptProfileCode
      );
      if (success) {
        addToast(
          'success',
          'Department & Profile Updated',
          `${quickDeptUser.name} reassigned to ${quickDeptProfileCode} profile in "${quickDepartment.trim()}".`
        );
        setQuickDeptUser(null);
      } else {
        addToast('error', 'Update Failed', 'Could not update user department.');
      }
    } catch (err) {
      addToast('error', 'Error', 'Failed to update department.');
    } finally {
      setIsSavingQuickDept(false);
    }
  };

  const handleInlineDeptChange = async (user: UserProfile, newProfileCode: ProfileCode, newDept: string) => {
    try {
      const success = await updateUserDepartmentAndProfile(user.uid, newDept, newProfileCode);
      if (success) {
        addToast(
          'success',
          'Department Updated',
          `${user.name} updated to ${newProfileCode}: "${newDept}".`
        );
      }
    } catch (err) {
      addToast('error', 'Failed', 'Could not update department.');
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUserId('');
    setFormEmail('');
    setFormPassword('tiger2026');
    setFormRole('team_member');
    setFormProfileCode('PR');
    setFormDepartment(getDefaultDepartmentForProfile('PR'));
    setFormStatus('active');
    setFormAvatarUrl(PRESET_AVATARS[0]);
    setIsAddUserOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUserId(user.userId);
    setFormEmail(user.email);
    setFormPassword(user.password || 'tiger2026');
    setFormRole(user.role);
    const resolvedCode: ProfileCode =
      user.profileCode ||
      (user.team === 'IT' || user.department?.toLowerCase().includes('it') ? 'PR' : 'RR');
    setFormProfileCode(resolvedCode);
    setFormDepartment(user.department || getDefaultDepartmentForProfile(resolvedCode));
    setFormStatus(user.status);
    setFormAvatarUrl(user.avatarUrl || PRESET_AVATARS[0]);
    setIsAddUserOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formName.trim() || !formUserId.trim()) {
      addToast('error', 'Required fields missing', 'Please fill in Name and User ID.');
      return;
    }

    const email = formEmail.trim() || `${formUserId.toLowerCase().replace(/\s+/g, '.')}@itsmmtigers.com`;

    const assignedTeam: 'IT' | 'SMM' = ['PR', 'WR', 'HW'].includes(formProfileCode) ? 'IT' : 'SMM';

    const cleanPassword = formPassword.trim() || 'tiger2026';

    const userToSave: UserProfile = {
      uid: editingUser?.uid || `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: formUserId.trim().toLowerCase(),
      name: formName.trim(),
      email,
      password: cleanPassword,
      role: formRole,
      status: formStatus,
      department: formDepartment.trim(),
      profileCode: formProfileCode,
      team: assignedTeam,
      avatarUrl: formAvatarUrl || editingUser?.avatarUrl || PRESET_AVATARS[0],
      joiningDate: editingUser?.joiningDate || new Date().toISOString().split('T')[0],
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DataService.saveUser(userToSave, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });

    await refreshUsers();
    setIsAddUserOpen(false);
    addToast(
      'success',
      editingUser ? 'User Updated' : 'Direct Member Created',
      `${userToSave.name} saved! Profile: ${userToSave.profileCode} | Department: "${userToSave.department}"`
    );
  };

  const handleApprove = async (user: UserProfile, role: UserRole = 'team_member') => {
    try {
      setApprovingUserId(user.uid);
      await approveUser(user.uid, role);
      addToast(
        'success',
        'Registration Approved',
        `${user.name} (${user.userId}) is now active and can log in to submit weekly data.`
      );
    } catch (e) {
      console.error('Error approving user:', e);
      addToast('error', 'Approval Failed', 'An error occurred while approving the member. Please try again.');
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingUser) return;
    await rejectUser(rejectingUser.uid, rejectReason);
    addToast(
      'info',
      'Registration Rejected',
      `Request for ${rejectingUser.name} has been rejected.`
    );
    setRejectingUser(null);
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (!currentUser) return;
    const newStatus: UserStatus = user.status === 'active' ? 'disabled' : 'active';
    await DataService.toggleUserStatus(user.uid, newStatus, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
    await refreshUsers();
    addToast(
      'info',
      newStatus === 'active' ? 'Account Enabled' : 'Account Disabled',
      `${user.name}'s status is now ${newStatus}.`
    );
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !currentUser) return;
    if (!newPassword.trim()) {
      addToast('error', 'Missing password', 'Please provide a valid new password.');
      return;
    }
    const updated = {
      ...resetPasswordUser,
      password: newPassword.trim(),
      updatedAt: new Date().toISOString(),
    };
    await DataService.saveUser(updated, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
    await refreshUsers();
    addToast(
      'success',
      'Password Updated',
      `Password for ${resetPasswordUser.name} has been updated to "${newPassword.trim()}".`
    );
    setResetPasswordUser(null);
    setNewPassword('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser || !currentUser) return;
    if (deletingUser.uid === currentUser.uid) {
      addToast('error', 'Cannot delete self', 'You cannot delete your own active administrator account.');
      setDeletingUser(null);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUser(deletingUser.uid);
      addToast(
        'success',
        'Member Profile Deleted',
        `${deletingUser.name} (${deletingUser.userId}) was permanently deleted from team database.`
      );
      setDeletingUser(null);
    } catch (err) {
      addToast('error', 'Delete failed', 'Failed to delete member profile. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-750 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-indigo-500/25 text-indigo-300 border border-indigo-500/40">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Team Members & Access Approvals
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Super Admin Gate: Review registrations and manage team member access credentials
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Direct Add Member
        </button>
      </div>

      {/* Tabs Bar: Profile-Wise vs Pending Approvals vs All Users */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profile_wise')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile_wise'
              ? 'bg-blue-500/25 text-blue-200 border border-blue-400/60 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Profile-Wise Department Manager</span>
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-orange-500/25 text-orange-200 border border-orange-400/60 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Members ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              pendingCount > 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200'
            }`}
          >
            {pendingCount}
          </span>
        </button>
      </div>

      {/* VIEW 0: Profile-Wise Department Manager */}
      {activeSubTab === 'profile_wise' && (
        <div className="space-y-6">
          {/* Explanatory Banner & Quick Stats */}
          <div className="bg-gradient-to-r from-blue-950/50 via-slate-900/80 to-purple-950/50 border border-slate-700 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <Layers className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Profile-Wise Department & Role Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl font-normal leading-relaxed">
                Organize members by their profile specializations (PR, WR, HW for IT Team; RR, DR for SMM Team). You can update each member's department assignment directly using the presets or custom designations below.
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto bg-slate-950/80 p-2.5 rounded-2xl border border-slate-700 shrink-0">
              <div className="text-center px-3.5 py-1 border-r border-slate-700">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">IT Profiles</div>
                <div className="text-sm font-black text-blue-300">
                  {allUsers.filter((u) => ['PR', 'WR', 'HW'].includes(u.profileCode || (u.team === 'IT' || u.department?.toLowerCase().includes('it') ? 'PR' : 'RR'))).length}
                </div>
              </div>
              <div className="text-center px-3.5 py-1">
                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">SMM Profiles</div>
                <div className="text-sm font-black text-purple-300">
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
                  ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
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
                        ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/30'
                        : 'bg-purple-600 text-white font-black shadow-md shadow-purple-500/30'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{isIT ? '💻' : '📱'}</span>
                  <span>{code} Profile</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-200'
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
                    className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl"
                  >
                    {/* Profile Header */}
                    <div
                      className={`p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isIT ? 'bg-blue-950/40' : 'bg-purple-950/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                            isIT
                              ? 'bg-blue-500/25 text-blue-200 border border-blue-400/50'
                              : 'bg-purple-500/25 text-purple-200 border border-purple-400/50'
                          }`}
                        >
                          {code} Profile
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {prof?.title || code}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                isIT
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                              }`}
                            >
                              {isIT ? 'IT Solutions' : 'SMM Strategy'}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                            {prof?.description || ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs text-slate-300 font-medium">
                          {members.length} {members.length === 1 ? 'member' : 'members'} assigned
                        </span>
                      </div>
                    </div>

                    {/* Members List in this profile */}
                    {members.length === 0 ? (
                      <div className="p-8 text-center space-y-2">
                        <p className="text-xs text-slate-300 font-medium">
                          No team members are currently assigned to {code} ({prof?.title}).
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Use "Direct Add Member" or reassign existing members from other profiles.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800">
                        {members.map((user) => (
                          <div
                            key={user.uid}
                            className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Member Identifiers */}
                            <div className="flex items-center gap-3.5 min-w-0 sm:min-w-[240px]">
                              <img
                                src={user.avatarUrl || PRESET_AVATARS[0]}
                                alt={user.name}
                                className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                                    {user.name}
                                  </h5>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                                      user.status === 'active'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                        : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Active' : 'Pending'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 font-mono flex items-center gap-1 mt-0.5 truncate">
                                  <span className="text-orange-400 font-bold">{user.userId}</span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-slate-300 capitalize">{user.role.replace('_', ' ')}</span>
                                </p>
                              </div>
                            </div>

                            {/* Department Assignment & Quick Selector */}
                            <div className="flex-1 max-w-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                  Department Designation:
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Select preset or type custom
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={user.department || getDefaultDepartmentForProfile(code)}
                                  onChange={(e) =>
                                    handleInlineDeptChange(user, code, e.target.value)
                                  }
                                  aria-label={`Change department for ${user.name}`}
                                  className="flex-1 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium cursor-pointer"
                                >
                                  <optgroup label={`${code} Profile Recommended Presets`} className="bg-slate-900 text-white">
                                    {(PROFILE_DEPARTMENT_PRESETS[code] || []).map((preset) => (
                                      <option key={preset} value={preset} className="bg-slate-900 text-white">
                                        {preset}
                                      </option>
                                    ))}
                                  </optgroup>
                                  {user.department &&
                                    !(PROFILE_DEPARTMENT_PRESETS[code] || []).includes(user.department) && (
                                      <option value={user.department} className="bg-slate-900 text-white">
                                        📌 Current: {user.department}
                                      </option>
                                    )}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => openQuickDeptModal(user)}
                                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-orange-500/20 text-slate-200 hover:text-orange-300 border border-slate-700 hover:border-orange-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                                  title="Change Profile or Type Custom Department"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Reassign / Custom</span>
                                </button>
                              </div>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex items-center justify-end gap-1.5 self-end lg:self-center shrink-0">
                              <button
                                onClick={() => setInspectingUser(user)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                                title="Inspect Member Performance Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                                title="Full Profile Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* VIEW 1: Pending Approvals Queue */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-slate-750 bg-slate-900/80 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Pending Registration Requests</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                All team member registrations have been reviewed. When new candidates register via the public portal, their requests will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.uid}
                  className="rounded-3xl border border-amber-500/40 bg-slate-900/95 p-5 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 text-amber-200 border-b border-l border-amber-500/40 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Awaiting Approval
                  </div>

                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        user.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/40 shrink-0"
                    />
                    <div className="pr-20">
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      <p className="text-xs font-mono font-bold text-orange-400">{user.userId}</p>
                      <p className="text-xs text-slate-300">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Department & Profile</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-100">{user.department || 'SMM Operations'}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                            ['PR', 'WR', 'HW'].includes(user.profileCode || '')
                              ? 'bg-blue-900/80 text-blue-200 border border-blue-600'
                              : 'bg-purple-900/80 text-purple-200 border border-purple-600'
                          }`}
                        >
                          {user.profileCode || (user.department?.toLowerCase().includes('it') ? 'PR' : 'RR')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Registered On</span>
                      <span className="font-semibold text-slate-100">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    {user.registrationNotes && (
                      <div className="col-span-2 pt-1 border-t border-slate-800 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Member Note</span>
                        <p className="text-slate-200 italic text-[11px]">"{user.registrationNotes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-300">Assign Role on Approval:</span>
                      <select
                        value={pendingApprovalRoles[user.uid] || 'team_member'}
                        onChange={(e) =>
                          setPendingApprovalRoles((prev) => ({
                            ...prev,
                            [user.uid]: e.target.value as UserRole,
                          }))
                        }
                        className="bg-slate-950 border border-slate-700 text-xs text-orange-300 font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="team_member" className="bg-slate-900 text-white">Team Member</option>
                        <option value="viewer" className="bg-slate-900 text-white">Viewer (Read-Only)</option>
                        <option value="admin" className="bg-slate-900 text-white">Admin</option>
                        <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setRejectingUser(user)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-950 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Decline
                      </button>

                      <button
                        disabled={approvingUserId === user.uid}
                        onClick={() =>
                          handleApprove(user, pendingApprovalRoles[user.uid] || 'team_member')
                        }
                        className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {approvingUserId === user.uid ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Approve as {(pendingApprovalRoles[user.uid] || 'team_member').replace('_', ' ')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: All Users Table */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member by name, user ID, or email..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-750 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-950 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">User ID / Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white text-sm block">{user.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-mono text-xs font-bold text-orange-400">{user.userId}</p>
                          <p className="text-[11px] text-slate-300">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.role === 'super_admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-200 border border-amber-400/50">
                            <Shield className="w-3 h-3" /> Super Admin
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/25 text-blue-200 border border-blue-400/50">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {user.role === 'team_member' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/50">
                            <User className="w-3 h-3" /> Team Member
                          </span>
                        )}
                        {user.role === 'viewer' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/25 text-purple-200 border border-purple-400/50">
                            <Eye className="w-3 h-3" /> Viewer (Read-Only)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-200 border border-emerald-500/50">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                        {user.status === 'pending_approval' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950 text-amber-200 border border-amber-500/50">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950 text-rose-200 border border-rose-500/50">
                            <Ban className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {user.status === 'disabled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-600">
                            <XCircle className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-200">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-white block text-xs">
                              {user.department || 'IT Team'}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase inline-block mt-0.5 ${
                                ['PR', 'WR', 'HW'].includes(user.profileCode || '')
                                  ? 'bg-blue-900/80 text-blue-200 border border-blue-600'
                                  : 'bg-purple-900/80 text-purple-200 border border-purple-600'
                              }`}
                            >
                              {user.profileCode || (user.team === 'IT' || user.department?.toLowerCase().includes('it') ? 'PR' : 'RR')} Profile
                            </span>
                          </div>
                          <button
                            onClick={() => openQuickDeptModal(user)}
                            className="p-1 px-2 rounded-lg bg-slate-800 hover:bg-orange-500/25 text-slate-200 hover:text-orange-200 border border-slate-700 hover:border-orange-500/50 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 shrink-0"
                            title="Update Department & Profile"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Update</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                        {user.joiningDate || '2025-01-01'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 text-[11px] font-medium">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {user.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(user)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/25 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-500/40 text-xs font-bold"
                          >
                            Approve
                          </button>
                        ) : (
                          <>
                            {isSuperAdmin && (
                              <button
                                onClick={() => setInspectingUser(user)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/25 text-slate-200 hover:text-indigo-300 border border-slate-700 transition-colors cursor-pointer"
                                title="Inspect Member Profile"
                              >
                                <User className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setViewCredentialsUser(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-500/25 text-slate-200 hover:text-orange-300 border border-slate-700 transition-colors cursor-pointer"
                              title="View & Copy Login Credentials"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setResetPasswordUser(user);
                                setNewPassword(user.password || 'tiger2026');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/25 text-slate-200 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            {user.uid !== currentUser?.uid && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer ${
                                    user.status === 'active'
                                      ? 'bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200'
                                      : 'bg-slate-800 hover:bg-emerald-900/50 text-slate-300 hover:text-emerald-200'
                                  }`}
                                  title={user.status === 'active' ? 'Disable Account' : 'Enable Account'}
                                >
                                  {user.status === 'active' ? (
                                    <XCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => setDeletingUser(user)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                                  title="Delete Member Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-950/80">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divya Bhardwaj"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    User ID (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. divya.bhardwaj"
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. divya@itsmmtigers.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. tiger2026"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    aria-label="Select Assigned Role"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                  >
                    <option value="team_member" className="bg-slate-900 text-white">Team Member (Data Entry)</option>
                    <option value="viewer" className="bg-slate-900 text-white">Viewer (Read-Only / Stakeholder)</option>
                    <option value="admin" className="bg-slate-900 text-white">Admin</option>
                    <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Profile Picture Selector in Modal */}
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-750">
                  <img
                    src={formAvatarUrl || PRESET_AVATARS[0]}
                    alt="avatar-preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-orange-500/50 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormAvatarUrl(url)}
                          className={`relative rounded-lg overflow-hidden shrink-0 ring-2 transition-all cursor-pointer ${
                            formAvatarUrl === url ? 'ring-orange-500 scale-105' : 'ring-slate-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`avatar-${idx}`} className="w-7 h-7 object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={formFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setFormAvatarUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => formFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1 cursor-pointer border border-slate-700"
                      >
                        <Upload className="w-3 h-3 text-orange-400" />
                        <span>Upload Custom Photo</span>
                      </button>
                      <input
                        type="url"
                        placeholder="or paste image URL"
                        value={formAvatarUrl.startsWith('data:') ? '' : formAvatarUrl}
                        onChange={(e) => setFormAvatarUrl(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    aria-label="Select Account Status"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="active" className="bg-slate-900 text-white">Active (Approved)</option>
                    <option value="pending_approval" className="bg-slate-900 text-white">Pending Approval</option>
                    <option value="disabled" className="bg-slate-900 text-white">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Profile Specialization *
                  </label>
                  <select
                    value={formProfileCode}
                    onChange={(e) => {
                      const code = e.target.value as ProfileCode;
                      setFormProfileCode(code);
                      setFormDepartment(getDefaultDepartmentForProfile(code));
                    }}
                    aria-label="Select Member Profile"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                  >
                    <option value="PR" className="bg-slate-900 text-white">💻 PR - IT Solutions & Product Delivery</option>
                    <option value="WR" className="bg-slate-900 text-white">💻 WR - IT Web Architecture & Eng</option>
                    <option value="HW" className="bg-slate-900 text-white">💻 HW - IT Cloud Infra & Hardware</option>
                    <option value="RR" className="bg-slate-900 text-white">📱 RR - SMM Retainers & Reach</option>
                    <option value="DR" className="bg-slate-900 text-white">📱 DR - SMM Direct Response & Conversion</option>
                  </select>
                </div>
              </div>

              {/* Department Assignment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Department Designation *
                  </label>
                  <span className="text-[10px] text-slate-300 font-medium">
                    Team: {['PR', 'WR', 'HW'].includes(formProfileCode) ? '💻 IT' : '📱 SMM'}
                  </span>
                </div>
                <select
                  value={
                    (PROFILE_DEPARTMENT_PRESETS[formProfileCode] || []).includes(formDepartment)
                      ? formDepartment
                      : 'custom'
                  }
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setFormDepartment(e.target.value);
                    }
                  }}
                  aria-label="Select Department Preset"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                >
                  <optgroup label={`${formProfileCode} Recommended Presets`} className="bg-slate-900 text-white">
                    {(PROFILE_DEPARTMENT_PRESETS[formProfileCode] || []).map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                  <option value="custom" className="bg-slate-900 text-white">✏️ Enter Custom Department Name...</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Type department designation..."
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/30 cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Update Member Department
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assign profile-wise department for <span className="text-orange-400 font-semibold">{quickDeptUser.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickDeptUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSaveDept} className="p-6 space-y-5">
              {/* User Summary Card */}
              <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <img
                  src={quickDeptUser.avatarUrl || PRESET_AVATARS[0]}
                  alt={quickDeptUser.name}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{quickDeptUser.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      {quickDeptUser.userId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Current: <span className="text-slate-200 font-medium">{quickDeptUser.department || 'N/A'}</span> ({quickDeptUser.profileCode || 'PR'})
                  </p>
                </div>
              </div>

              {/* 1. Select Profile Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
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
                              ? 'bg-blue-950/50 border-blue-500/70 ring-2 ring-blue-500/40 text-white'
                              : 'bg-purple-950/50 border-purple-500/70 ring-2 ring-purple-500/40 text-white'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded uppercase ${
                              isIT ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {code} Profile
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {isIT ? '💻 IT Team' : '📱 SMM Team'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-1 truncate">
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
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Department Assignment
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDept(!isCustomDept)}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-medium cursor-pointer"
                  >
                    {isCustomDept ? '← Use Presets' : '✏️ Type Custom Department'}
                  </button>
                </div>

                {!isCustomDept ? (
                  <div className="space-y-2">
                    <select
                      value={quickDepartment}
                      onChange={(e) => setQuickDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium cursor-pointer"
                    >
                      {(PROFILE_DEPARTMENT_PRESETS[quickDeptProfileCode] || []).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Recommended department titles tailored for the {quickDeptProfileCode} profile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={quickDepartment}
                      onChange={(e) => setQuickDepartment(e.target.value)}
                      placeholder="e.g. IT Solutions & Technical Delivery (PR)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                    <p className="text-[11px] text-slate-400">
                      Enter any specialized or custom department designation for this member.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit & Cancel */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickDeptUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickDept}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-orange-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingQuickDept ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Decline Registration</h3>
                <p className="text-xs text-slate-400">For {rejectingUser.name} ({rejectingUser.email})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Reason for Declining
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-500 text-white hover:bg-rose-600 shadow-md cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">For {resetPasswordUser.name} ({resetPasswordUser.userId})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="text"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetPasswordUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-md cursor-pointer"
              >
                Save New Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View & Copy Credentials Modal */}
      {viewCredentialsUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Member Login Credentials</h3>
                  <p className="text-xs text-slate-400">{viewCredentialsUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewCredentialsUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">User ID (Username):</span>
                <span className="font-mono font-bold text-orange-400">{viewCredentialsUser.userId}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-mono font-semibold text-slate-200">{viewCredentialsUser.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Login Password:</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {viewCredentialsUser.password || 'tiger2026'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Assigned Team:</span>
                <span className="font-semibold text-slate-200">{viewCredentialsUser.department || 'IT Team'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">
                  {viewCredentialsUser.status || 'active'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
              💡 <strong>Login Tip:</strong> The member can log in using either their <strong>User ID</strong> (<code>{viewCredentialsUser.userId}</code>) or <strong>Email</strong> (<code>{viewCredentialsUser.email}</code>) and their assigned password.
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => {
                  const creds = `IT SMM Tigers Login Credentials:\nName: ${viewCredentialsUser.name}\nUser ID: ${viewCredentialsUser.userId}\nEmail: ${viewCredentialsUser.email}\nPassword: ${viewCredentialsUser.password || 'tiger2026'}\nTeam: ${viewCredentialsUser.department || 'IT Team'}`;
                  navigator.clipboard.writeText(creds);
                  addToast('success', 'Copied to Clipboard', 'Credentials copied to clipboard!');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
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
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 bg-rose-500/10 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Member Profile</h3>
                <p className="text-xs text-rose-300">Permanent Action Warning</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white font-bold">{deletingUser.name}</strong> (
                <span className="font-mono text-orange-400">{deletingUser.userId}</span>)?
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-300">{deletingUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-300">{deletingUser.department || 'IT Team'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="text-slate-300 capitalize">{deletingUser.role.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300">
                ⚠️ This will permanently remove their credentials and access profile from both local storage and cloud Firestore database.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
