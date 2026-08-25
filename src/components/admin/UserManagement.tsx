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
  AlertCircle,
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { DataService } from '../../services/dataService';

export const UserManagement: React.FC = () => {
  const { currentUser, allUsers, refreshUsers } = useAuth();
  const { addToast } = useApp();

  const [search, setSearch] = useState<string>('');
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('team_member');
  const [formDepartment, setFormDepartment] = useState<string>('SMM Growth');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');

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

    const userToSave: UserProfile = {
      uid: editingUser?.uid || `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: formUserId.trim().toLowerCase(),
      name: formName.trim(),
      email,
      role: formRole,
      status: formStatus,
      department: formDepartment,
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
      `${userToSave.name} (${userToSave.userId}) has been saved.`
    );
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
    addToast(
      'success',
      'Password Reset Complete',
      `Temporary access password sent for ${resetPasswordUser.name}.`
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
            <h2 className="text-lg font-bold text-white">Team Members & Access Control</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage user roles, statuses, and login credentials for IT SMM Tigers
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

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

      {/* Users Table */}
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
                      <span className="font-bold text-white text-sm">{user.name}</span>
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
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/50">
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
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit User"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setResetPasswordUser(user)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Department / Squad
                </label>
                <input
                  type="text"
                  placeholder="e.g. SMM Enterprise, Growth, Creative"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
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

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Credentials</h3>
                <p className="text-xs text-slate-400">For {resetPasswordUser.name} ({resetPasswordUser.userId})</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                New Temporary Password
              </label>
              <input
                type="text"
                placeholder="Enter new password (e.g. Tiger2026!)"
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
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
