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
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { DataService } from '../../services/dataService';

export const UserManagement: React.FC = () => {
  const { currentUser, allUsers, refreshUsers, approveUser, rejectUser, pendingUsers, pendingCount } = useAuth();
  const { addToast } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending'>('pending');
  const [search, setSearch] = useState<string>('');
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('team_member');
  const [formDepartment, setFormDepartment] = useState<string>('IT Team');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Incomplete details or unverified member');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormUserId('');
    setFormEmail('');
    setFormPassword('tiger2026');
    setFormRole('team_member');
    setFormDepartment('SMM Growth');
    setFormStatus('active');
    setIsAddUserOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUserId(user.userId);
    setFormEmail(user.email);
    setFormPassword(user.password || 'tiger2026');
    setFormRole(user.role);
    setFormDepartment(user.department || 'SMM Growth');
    setFormStatus(user.status);
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

    const assignedTeam: 'IT' | 'SMM' =
      formDepartment && formDepartment.toLowerCase().includes('it') ? 'IT' : 'SMM';

    const userToSave: UserProfile = {
      uid: editingUser?.uid || `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: formUserId.trim().toLowerCase(),
      name: formName.trim(),
      email,
      password: formPassword.trim() || 'tiger2026',
      role: formRole,
      status: formStatus,
      department: formDepartment,
      team: assignedTeam,
      avatarUrl:
        editingUser?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
      editingUser ? 'User Updated' : 'User Created',
      `${userToSave.name} (${userToSave.userId}) has been saved successfully.`
    );
  };

  const handleApprove = async (user: UserProfile, role: UserRole = 'team_member') => {
    await approveUser(user.uid, role);
    addToast(
      'success',
      'Registration Approved',
      `${user.name} (${user.userId}) is now active and can log in to submit weekly data.`
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Team Members & Access Approvals
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
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

      {/* Tabs Bar: Pending Approvals vs All Users */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Registration Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              pendingCount > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Members ({allUsers.length})</span>
        </button>
      </div>

      {/* VIEW 1: Pending Approvals Queue */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Pending Registration Requests</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All team member registrations have been reviewed. When new candidates register via the public portal, their requests will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.uid}
                  className="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 text-amber-300 border-b border-l border-amber-500/30 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Awaiting Approval
                  </div>

                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        user.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0"
                    />
                    <div className="pr-20">
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      <p className="text-xs font-mono font-semibold text-orange-400">{user.userId}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department</span>
                      <span className="font-semibold text-slate-200">{user.department || 'SMM Operations'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registered On</span>
                      <span className="font-semibold text-slate-200">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    {user.registrationNotes && (
                      <div className="col-span-2 pt-1 border-t border-slate-800/60 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Member Note</span>
                        <p className="text-slate-300 italic text-[11px]">"{user.registrationNotes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setRejectingUser(user)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Decline
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApprove(user, 'team_member')}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        Approve Access
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
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member by name, user ID, or email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-800/40 transition-colors">
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
                          <p className="font-mono text-xs font-semibold text-orange-400">{user.userId}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.role === 'super_admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Shield className="w-3 h-3" /> Super Admin
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {user.role === 'team_member' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <User className="w-3 h-3" /> Team Member
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                        {user.status === 'pending_approval' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/50">
                            <Ban className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {user.status === 'disabled' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                        {user.department || 'SMM'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                        {user.joiningDate || '2025-01-01'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {user.status === 'pending_approval' ? (
                          <button
                            onClick={() => handleApprove(user)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold"
                          >
                            Approve
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setResetPasswordUser(user);
                                setNewPassword(user.password || 'tiger2026');
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            {user.uid !== currentUser?.uid && (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  user.status === 'active'
                                    ? 'bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300'
                                    : 'bg-slate-800 hover:bg-emerald-900/50 text-slate-400 hover:text-emerald-300'
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Edit Team Member Profile' : 'Add New Team Member'}
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Divya Bhardwaj"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    User ID (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. divya.bhardwaj"
                    value={formUserId}
                    onChange={(e) => setFormUserId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. divya@itsmmtigers.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. tiger2026"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    aria-label="Select Assigned Role"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    aria-label="Select Account Status"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="active">Active (Approved)</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Department / Team
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                  >
                    <option value="IT Team">💻 IT Team</option>
                    <option value="SMM Team">📱 SMM Team</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
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
    </div>
  );
};
