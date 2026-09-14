import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../context/PermissionContext';
import {
  AppRole,
  PermissionAction,
  RolePermissions,
  SystemModule,
  SYSTEM_MODULE_SECTIONS,
  ModuleSectionDef,
} from '../../types/permissions';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Save,
  RotateCcw,
  Copy,
  Layers,
  Building,
  TrendingUp,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { createOmnipotentPermissions, createEmptyPermissions } from '../../data/defaultRoles';

const ACTION_LABELS: Record<PermissionAction, { label: string; badge: string; desc: string }> = {
  view: { label: 'View', badge: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Can see page and read records' },
  create: { label: 'Create', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Can submit or add new records' },
  edit: { label: 'Edit', badge: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Can modify existing records' },
  delete: { label: 'Delete', badge: 'bg-rose-50 text-rose-700 border-rose-200', desc: 'Can permanently remove records' },
  approve: { label: 'Approve', badge: 'bg-purple-50 text-purple-700 border-purple-200', desc: 'Can approve registrations or requests' },
  import: { label: 'Import', badge: 'bg-teal-50 text-teal-700 border-teal-200', desc: 'Can bulk upload CSV/Excel files' },
  export: { label: 'Export', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', desc: 'Can download CSV/Excel reports' },
  manage: { label: 'Manage', badge: 'bg-[#8cc540]/20 text-[#3d591d] border-[#8cc540]/40', desc: 'Can configure system rules and locks' },
};

const MODULE_META: Record<SystemModule, { label: string; icon: React.FC<{ className?: string }>; desc: string }> = {
  pm: {
    label: 'Project Management',
    icon: Building,
    desc: 'Dashboards, KPI targets, submissions, week lock, and R&R recognition',
  },
  sales: {
    label: 'Sales Division',
    icon: TrendingUp,
    desc: 'Sales performance, daily reachouts, weekly metrics, targets, and rewards',
  },
  admin: {
    label: 'Administration',
    icon: Settings,
    desc: 'System-wide user management, role permissions, and platform settings',
  },
};

export const RolesPermissionsManagement: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const { addToast, setActiveTab } = useApp();
  const { roles, createRole, updateRole, deleteRole, isLoadingRoles } = usePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin');
  const [activeModuleTab, setActiveModuleTab] = useState<SystemModule>('pm');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Draft permissions for the selected role
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  const [draftPermissions, setDraftPermissions] = useState<RolePermissions>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal states
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState<boolean>(false);
  const [isEditMetaModalOpen, setIsEditMetaModalOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<AppRole | null>(null);

  // New role form state
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [newRoleCloneFrom, setNewRoleCloneFrom] = useState<string>('team_member');
  const [isCreatingRole, setIsCreatingRole] = useState<boolean>(false);

  // Edit role meta form state
  const [editRoleName, setEditRoleName] = useState<string>('');
  const [editRoleDesc, setEditRoleDesc] = useState<string>('');
  const [editRoleStatus, setEditRoleStatus] = useState<'active' | 'inactive'>('active');

  // Sync draft permissions whenever selected role changes
  React.useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || {})));
      setIsDirty(false);
    }
  }, [selectedRoleId, selectedRole]);

  // Users assigned to each role
  const roleUserCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allUsers.forEach((u) => {
      const r = u.role || 'team_member';
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [allUsers]);

  const assignedUsersToSelectedRole = useMemo(() => {
    if (!selectedRole) return [];
    return allUsers.filter((u) => u.role === selectedRole.id);
  }, [allUsers, selectedRole]);

  // Sections filtered by active module
  const currentSections = useMemo(() => {
    return SYSTEM_MODULE_SECTIONS.filter((s) => s.module === activeModuleTab);
  }, [activeModuleTab]);

  const isSuperAdminRole = selectedRole?.id === 'super_admin';

  // Toggle single action permission
  const handleToggleAction = (sectionId: string, action: PermissionAction) => {
    if (isSuperAdminRole) return; // Super admin cannot be modified

    setDraftPermissions((prev) => {
      const next = { ...prev };
      const sectionPerms = { ...(next[sectionId] || {}) };
      sectionPerms[action] = !sectionPerms[action];
      next[sectionId] = sectionPerms;
      return next;
    });
    setIsDirty(true);
  };

  // Toggle all actions in a section
  const handleToggleSectionAll = (section: ModuleSectionDef, enable: boolean) => {
    if (isSuperAdminRole) return;

    setDraftPermissions((prev) => {
      const next = { ...prev };
      const sectionPerms: Record<string, boolean> = {};
      section.supportedActions.forEach((act) => {
        sectionPerms[act] = enable;
      });
      next[section.id] = sectionPerms;
      return next;
    });
    setIsDirty(true);
  };

  // Module bulk grant/revoke
  const handleBulkModule = (enable: boolean) => {
    if (isSuperAdminRole) return;

    setDraftPermissions((prev) => {
      const next = { ...prev };
      currentSections.forEach((sec) => {
        const secPerms: Record<string, boolean> = {};
        sec.supportedActions.forEach((act) => {
          secPerms[act] = enable;
        });
        next[sec.id] = secPerms;
      });
      return next;
    });
    setIsDirty(true);
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await updateRole({
        ...selectedRole,
        permissions: draftPermissions,
      });
      setIsDirty(false);
      addToast(
        'success',
        'Permissions Saved',
        `Updated permissions matrix for role: ${selectedRole.name}`
      );
    } catch (err: any) {
      addToast('error', 'Failed to Save', err.message || 'Could not update role permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset draft to current role state
  const handleResetDraft = () => {
    if (selectedRole) {
      setDraftPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || {})));
      setIsDirty(false);
    }
  };

  // Create new role
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      addToast('error', 'Required Field', 'Please enter a name for the new role.');
      return;
    }

    const cleanId = (newRoleId.trim() || newRoleName.trim())
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    if (roles.some((r) => r.id === cleanId)) {
      addToast('error', 'Duplicate ID', `A role with identifier "${cleanId}" already exists.`);
      return;
    }

    try {
      setIsCreatingRole(true);
      const sourceRole = roles.find((r) => r.id === newRoleCloneFrom);
      const initialPerms = sourceRole
        ? JSON.parse(JSON.stringify(sourceRole.permissions))
        : createEmptyPermissions();

      const created = await createRole({
        id: cleanId,
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        status: 'active',
        isSystem: false,
        permissions: initialPerms,
      });

      addToast('success', 'Role Created', `Created new custom role: ${created.name}`);
      setIsCreateRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleId('');
      setNewRoleDesc('');
      setSelectedRoleId(created.id);
    } catch (err: any) {
      addToast('error', 'Role Creation Failed', err.message || 'Could not create role.');
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Open edit metadata modal
  const handleOpenEditMeta = () => {
    if (!selectedRole) return;
    setEditRoleName(selectedRole.name);
    setEditRoleDesc(selectedRole.description);
    setEditRoleStatus(selectedRole.status);
    setIsEditMetaModalOpen(true);
  };

  // Save role metadata
  const handleSaveRoleMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!editRoleName.trim()) {
      addToast('error', 'Required Field', 'Role name cannot be empty.');
      return;
    }

    // Super Admin cannot be deactivated
    if (selectedRole.id === 'super_admin' && editRoleStatus === 'inactive') {
      addToast('error', 'Action Prevented', 'Super Admin role cannot be deactivated.');
      return;
    }

    try {
      await updateRole({
        ...selectedRole,
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
        status: editRoleStatus,
      });
      addToast('success', 'Role Updated', `Updated metadata for role: ${editRoleName}`);
      setIsEditMetaModalOpen(false);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update role.');
    }
  };

  // Delete role confirmation
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await deleteRole(roleToDelete.id);
      addToast('success', 'Role Deleted', `Successfully deleted role: ${roleToDelete.name}`);
      setRoleToDelete(null);
      setSelectedRoleId('super_admin');
    } catch (err: any) {
      addToast('error', 'Cannot Delete Role', err.message || 'Could not delete role.');
    }
  };

  // Count active permissions in module
  const countModulePermissions = (module: SystemModule) => {
    const sections = SYSTEM_MODULE_SECTIONS.filter((s) => s.module === module);
    let granted = 0;
    let total = 0;

    sections.forEach((s) => {
      s.supportedActions.forEach((a) => {
        total++;
        if (draftPermissions[s.id]?.[a]) {
          granted++;
        }
      });
    });

    return { granted, total };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Header */}
      <div className="rounded-3xl bg-white border border-[#e2ebd9] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8cc540]/15 text-[#3d591d] border border-[#8cc540]/30 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#598327]" />
              Super Admin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight">
              Role & Module Permission Management
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] max-w-3xl leading-relaxed">
              Define custom roles and configure multi-tiered permissions across Project Management,
              Sales Division, and Administration. All changes are enforced across both interface
              views and underlying API operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
            <button
              onClick={() => setIsCreateRoleModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Role</span>
            </button>
          </div>
        </div>

        {/* Roles Horizontal Selector Bar */}
        <div className="pt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-black text-[#888888] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#598327]" />
              System & Custom Roles ({roles.length})
            </h3>
            <span className="text-[11px] text-[#666666]">
              Select a role below to inspect and configure its granular permissions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {roles.map((r) => {
              const isSelected = r.id === selectedRoleId;
              const userCount = roleUserCounts[r.id] || 0;
              const isSuper = r.id === 'super_admin';

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    if (isDirty) {
                      if (window.confirm('You have unsaved permission changes. Discard and switch role?')) {
                        setSelectedRoleId(r.id);
                      }
                    } else {
                      setSelectedRoleId(r.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative group cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#101010] text-white border-[#101010] shadow-md shadow-[#101010]/15'
                      : 'bg-[#f8faf6] hover:bg-white text-[#101010] border-[#e2ebd9] hover:border-[#8cc540]/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {isSuper ? (
                          <ShieldAlert className={`w-4 h-4 ${isSelected ? 'text-[#8cc540]' : 'text-amber-600'}`} />
                        ) : (
                          <KeyRound className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8cc540]' : 'text-[#598327]'}`} />
                        )}
                        <h4 className="font-black text-sm tracking-tight truncate">{r.name}</h4>
                      </div>

                      {r.status === 'inactive' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-[11px] line-clamp-2 leading-snug ${
                        isSelected ? 'text-[#b0b0b0]' : 'text-[#666666]'
                      }`}
                    >
                      {r.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-current/10 flex items-center justify-between text-[10px] font-bold">
                    <span
                      className={`flex items-center gap-1 ${
                        isSelected ? 'text-[#8cc540]' : 'text-[#436320]'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      {userCount} member{userCount === 1 ? '' : 's'}
                    </span>

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                        r.isSystem
                          ? isSelected
                            ? 'bg-white/10 text-white'
                            : 'bg-[#f0f4ec] text-[#555555]'
                          : isSelected
                          ? 'bg-[#8cc540] text-[#101010]'
                          : 'bg-[#8cc540]/20 text-[#3d591d]'
                      }`}
                    >
                      {r.isSystem ? 'System' : 'Custom'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Role Configuration Workstation */}
      {selectedRole && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Role Details & Meta */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl bg-white border border-[#e2ebd9] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#8cc540]/20 text-[#3d591d] flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4 text-[#598327]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#101010]">{selectedRole.name}</h3>
                    <p className="text-[10px] font-mono text-[#888888]">{selectedRole.id}</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenEditMeta}
                  className="p-1.5 rounded-lg text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] transition-colors cursor-pointer"
                  title="Edit Role Name & Status"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#888888] block">Description</span>
                  <p className="text-[#333333] leading-relaxed mt-0.5">
                    {selectedRole.description || 'No description configured.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ec]">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedRole.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedRole.status === 'active' ? (
                      <>
                        <Check className="w-2.5 h-2.5" /> Active
                      </>
                    ) : (
                      <>
                        <X className="w-2.5 h-2.5" /> Deactivated
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ec]">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Type</span>
                  <span className="text-[#101010] font-bold text-[11px]">
                    {selectedRole.isSystem ? 'Built-in System Role' : 'Custom Created Role'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f0f4ec]">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Last Updated</span>
                  <span className="text-[#666666] text-[11px] font-mono">
                    {new Date(selectedRole.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#e2ebd9] space-y-2">
                {!selectedRole.isSystem && selectedRole.id !== 'super_admin' && (
                  <button
                    onClick={() => setRoleToDelete(selectedRole)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Role</span>
                  </button>
                )}
              </div>
            </div>

            {/* Assigned Users list card */}
            <div className="rounded-3xl bg-white border border-[#e2ebd9] p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-[#101010] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#598327]" />
                  Assigned Members ({assignedUsersToSelectedRole.length})
                </h4>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className="text-[10px] font-bold text-[#598327] hover:underline cursor-pointer"
                >
                  Manage →
                </button>
              </div>

              {assignedUsersToSelectedRole.length === 0 ? (
                <div className="text-center py-6 px-3 rounded-2xl bg-[#f8faf6] border border-dashed border-[#e2ebd9]">
                  <Users className="w-6 h-6 text-[#999999] mx-auto mb-1" />
                  <p className="text-xs font-bold text-[#555555]">No members assigned</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">
                    Assign users to this role in Team Members & Approvals.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {assignedUsersToSelectedRole.map((u) => (
                    <div
                      key={u.uid}
                      className="p-2.5 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] flex items-center gap-2.5 hover:bg-[#f3f8ef] transition-colors"
                    >
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#e2ebd9]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#101010] truncate leading-tight">{u.name}</p>
                        <p className="text-[10px] text-[#666666] truncate font-mono">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Permission Matrix Configurator */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl bg-white border border-[#e2ebd9] shadow-sm overflow-hidden flex flex-col">
              {/* Matrix Top Navigation Bar */}
              <div className="p-4 sm:p-6 border-b border-[#e2ebd9] bg-[#f8faf6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Module Switcher Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#edf3e7] rounded-2xl border border-[#d9e5cf] overflow-x-auto">
                  {(['pm', 'sales', 'admin'] as SystemModule[]).map((mod) => {
                    const meta = MODULE_META[mod];
                    const Icon = meta.icon;
                    const isActive = activeModuleTab === mod;
                    const stats = countModulePermissions(mod);

                    return (
                      <button
                        key={mod}
                        onClick={() => setActiveModuleTab(mod)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-[#101010] text-white shadow-xs'
                            : 'text-[#555555] hover:text-[#101010] hover:bg-white/60'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8cc540]' : 'text-[#598327]'}`} />
                        <span>{meta.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                            isActive ? 'bg-[#8cc540] text-[#101010]' : 'bg-[#e2ebd9] text-[#436320]'
                          }`}
                        >
                          {stats.granted}/{stats.total}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Save & Reset Controls */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  {isDirty && (
                    <button
                      onClick={handleResetDraft}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                  )}

                  <button
                    disabled={!isDirty || isSaving || isSuperAdminRole}
                    onClick={handleSavePermissions}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                      isDirty && !isSuperAdminRole
                        ? 'bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-[#8cc540]/25'
                        : 'bg-[#e4ece0] text-[#888888] cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving Changes...' : isDirty ? 'Save Permission Matrix' : 'Changes Saved'}</span>
                  </button>
                </div>
              </div>

              {/* Super Admin Notice Banner */}
              {isSuperAdminRole ? (
                <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black text-amber-950 block">Super Admin Permanent Safeguard</strong>
                    <p className="mt-0.5 leading-relaxed text-amber-800">
                      The Super Admin role is permanently granted unrestricted access to all modules,
                      sections, and actions to prevent system lockout and ensure unbroken administrative
                      control. These controls are locked in an enabled state.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#f8faf6] border-b border-[#e2ebd9] flex items-center justify-between gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-2 text-[#555555]">
                    <Info className="w-4 h-4 text-[#598327] flex-shrink-0" />
                    <span>
                      Configure granular action permissions for{' '}
                      <strong className="text-[#101010]">{MODULE_META[activeModuleTab].label}</strong>.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkModule(true)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#8cc540]/20 text-[#3d591d] hover:bg-[#8cc540]/30 transition-colors cursor-pointer"
                    >
                      Grant All in Module
                    </button>
                    <button
                      onClick={() => handleBulkModule(false)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Revoke All in Module
                    </button>
                  </div>
                </div>
              )}

              {/* Sections & Actions Table / Cards */}
              <div className="divide-y divide-[#f0f4ec] p-4 sm:p-6 space-y-4">
                {currentSections.map((section) => {
                  const sectionPerms = draftPermissions[section.id] || {};
                  const isSectionAllGranted = section.supportedActions.every(
                    (act) => sectionPerms[act] === true
                  );
                  const isSectionNoneGranted = section.supportedActions.every(
                    (act) => !sectionPerms[act]
                  );

                  return (
                    <div
                      key={section.id}
                      className="pt-4 first:pt-0 rounded-2xl bg-white border border-[#e2ebd9] p-4 sm:p-5 hover:border-[#8cc540]/40 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f4ec] pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-[#101010]">{section.label}</h4>
                            <span className="text-[10px] font-mono text-[#888888] px-1.5 py-0.2 rounded bg-[#f5f5f5]">
                              {section.id}
                            </span>
                          </div>
                          <p className="text-xs text-[#666666] mt-0.5">{section.description}</p>
                        </div>

                        {!isSuperAdminRole && (
                          <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] font-bold">
                            <button
                              onClick={() => handleToggleSectionAll(section, true)}
                              disabled={isSectionAllGranted}
                              className="px-2 py-0.5 rounded text-[#436320] hover:bg-[#8cc540]/20 transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              Allow All
                            </button>
                            <span className="text-[#cccccc]">|</span>
                            <button
                              onClick={() => handleToggleSectionAll(section, false)}
                              disabled={isSectionNoneGranted}
                              className="px-2 py-0.5 rounded text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Checkbox Chips Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {section.supportedActions.map((action) => {
                          const isAllowed = isSuperAdminRole ? true : Boolean(sectionPerms[action]);
                          const meta = ACTION_LABELS[action];

                          return (
                            <button
                              key={action}
                              type="button"
                              disabled={isSuperAdminRole}
                              onClick={() => handleToggleAction(section.id, action)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                isAllowed
                                  ? 'bg-[#f3f8ef] border-[#8cc540] text-[#101010] shadow-xs'
                                  : 'bg-[#fafafa] border-[#e5e5e5] text-[#888888] hover:border-[#cccccc]'
                              } ${isSuperAdminRole ? 'cursor-default opacity-90' : ''}`}
                              title={meta.desc}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs capitalize">{meta.label}</span>
                                <div
                                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                                    isAllowed
                                      ? 'bg-[#8cc540] border-[#8cc540] text-[#101010]'
                                      : 'bg-white border-[#cccccc]'
                                  }`}
                                >
                                  {isAllowed && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                              <span className="text-[9px] text-[#666666] line-clamp-1 leading-none">
                                {meta.desc.replace('Can ', '')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Action Strip */}
              {isDirty && !isSuperAdminRole && (
                <div className="p-4 bg-[#101010] text-white border-t border-[#222222] flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-[#8cc540] animate-pulse" />
                    <span className="font-bold">You have unsaved permission changes for "{selectedRole.name}".</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetDraft}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#cccccc] hover:text-white transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={handleSavePermissions}
                      className="px-5 py-2 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer"
                    >
                      {isSaving ? 'Saving...' : 'Apply & Save Permissions'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE NEW ROLE
          ======================================================== */}
      {isCreateRoleModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsCreateRoleModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#e2ebd9] bg-[#f8faf6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8cc540]/20 text-[#3d591d] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[#598327]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#101010]">Create New Role</h3>
                  <p className="text-xs text-[#666666]">Define custom role and initialize its permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRoleModalOpen(false)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Role Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sales Team Lead, Quality Auditor, IT Specialist"
                  value={newRoleName}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);
                    if (!newRoleId || newRoleId === newRoleName.toLowerCase().replace(/[^a-z0-9_]/g, '_')) {
                      setNewRoleId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                    }
                  }}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Role Identifier / Key <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. sales_lead, it_specialist"
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  required
                />
                <span className="text-[10px] text-[#888888] mt-1 block">
                  Unique internal key used in user profiles and database checks.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the responsibilities and scope of this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-3 text-xs text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Copy Initial Permissions From
                </label>
                <select
                  value={newRoleCloneFrom}
                  onChange={(e) => setNewRoleCloneFrom(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium cursor-pointer"
                >
                  <option value="team_member">Team Member (PM Submissions & Scorecard)</option>
                  <option value="sales_member">Sales Member (Sales Logs & Personal Records)</option>
                  <option value="admin">Admin (Broad Operational & Review Access)</option>
                  <option value="viewer">Viewer (Read-Only Dashboards)</option>
                  <option value="empty">Blank (No permissions initially)</option>
                </select>
                <span className="text-[10px] text-[#888888] mt-1 block">
                  You can fine-tune every individual permission after creation.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2ebd9]">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRole}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingRole ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT ROLE METADATA
          ======================================================== */}
      {isEditMetaModalOpen && selectedRole && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsEditMetaModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#e2ebd9] bg-[#f8faf6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8cc540]/20 text-[#3d591d] flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-[#598327]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#101010]">Edit Role Details</h3>
                  <p className="text-xs text-[#666666] font-mono">{selectedRole.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditMetaModalOpen(false)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-[#101010] hover:bg-[#edf3e7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleMeta} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-3 text-xs text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101010] uppercase tracking-wider mb-1">
                  Role Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRoleStatus('active')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      editRoleStatus === 'active'
                        ? 'bg-[#f3f8ef] border-[#8cc540] text-[#101010] font-bold'
                        : 'bg-[#fafafa] border-[#e5e5e5] text-[#666666]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${
                        editRoleStatus === 'active'
                          ? 'bg-[#8cc540] border-[#8cc540]'
                          : 'border-[#999999]'
                      }`}
                    />
                    <span>Active (Usable)</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedRole.id === 'super_admin'}
                    onClick={() => setEditRoleStatus('inactive')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      editRoleStatus === 'inactive'
                        ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold'
                        : 'bg-[#fafafa] border-[#e5e5e5] text-[#666666]'
                    } ${selectedRole.id === 'super_admin' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border ${
                        editRoleStatus === 'inactive'
                          ? 'bg-rose-600 border-rose-600'
                          : 'border-[#999999]'
                      }`}
                    />
                    <span>Inactive (Suspended)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2ebd9]">
                <button
                  type="button"
                  onClick={() => setIsEditMetaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/25 transition-all cursor-pointer"
                >
                  Save Role Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM ROLE DELETION
          ======================================================== */}
      {roleToDelete && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setRoleToDelete(null)}
        >
          <div
            className="relative w-full max-w-md bg-white border border-[#e2ebd9] rounded-3xl shadow-2xl p-6 overflow-hidden my-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#101010]">
                Delete Role "{roleToDelete.name}"?
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed">
                This action will permanently delete this custom role from the database. Any users
                currently assigned to this role must be reassigned first.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f0f4ec] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
