import { AppRole, PermissionAction, RolePermissions, SYSTEM_MODULE_SECTIONS } from '../types/permissions';

/**
 * Utility to generate an all-true permissions map for a role
 */
export function createOmnipotentPermissions(): RolePermissions {
  const permissions: RolePermissions = {};
  SYSTEM_MODULE_SECTIONS.forEach((section) => {
    permissions[section.id] = {};
    section.supportedActions.forEach((action) => {
      permissions[section.id]![action] = true;
    });
  });
  return permissions;
}

/**
 * Utility to generate an all-false permissions map
 */
export function createEmptyPermissions(): RolePermissions {
  const permissions: RolePermissions = {};
  SYSTEM_MODULE_SECTIONS.forEach((section) => {
    permissions[section.id] = {};
    section.supportedActions.forEach((action) => {
      permissions[section.id]![action] = false;
    });
  });
  return permissions;
}

/**
 * Default permissions for Admin role
 */
export function createAdminPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  // Project Management (Full operational access)
  perms['pm.dashboard'] = { view: true };
  perms['pm.leaderboard'] = { view: true };
  perms['pm.my_performance'] = { view: true, create: true, edit: true };
  perms['pm.submissions'] = { view: true, create: true, edit: true, delete: true, import: true, export: true };
  perms['pm.members'] = { view: true, create: true, edit: true, delete: false, approve: true };
  perms['pm.kpis'] = { view: true, edit: true, manage: true };
  perms['pm.week_lock'] = { view: true, edit: true, manage: true };
  perms['pm.winner'] = { view: true, manage: true };
  perms['pm.reports'] = { view: true, export: true };
  perms['pm.audit_logs'] = { view: true, export: true };

  // Sales (Operational & Monitoring access)
  perms['sales.dashboard'] = { view: true };
  perms['sales.my_performance'] = { view: true };
  perms['sales.performance_entry'] = { view: true, create: true, edit: true };
  perms['sales.performance_records'] = { view: true, create: true, edit: true, delete: true, export: true };
  perms['sales.leaderboard'] = { view: true };
  perms['sales.members'] = { view: true, create: true, edit: true, delete: false, manage: true };
  perms['sales.targets'] = { view: true, edit: true, manage: true };
  perms['sales.rewards'] = { view: true, edit: true, manage: true };
  perms['sales.reports'] = { view: true, export: true };
  perms['sales.import_export'] = { view: true, import: true, export: true };
  perms['sales.audit_logs'] = { view: true, export: true };

  // Administration (Users only, NOT Roles & Permissions)
  perms['admin.users'] = { view: true, create: true, edit: true, delete: false, approve: true, manage: false };
  perms['admin.roles_permissions'] = { view: false, create: false, edit: false, delete: false, manage: false };
  perms['admin.settings'] = { view: true, edit: false };

  return perms;
}

/**
 * Default permissions for Team Member role
 */
export function createTeamMemberPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  // PM Access
  perms['pm.dashboard'] = { view: true };
  perms['pm.leaderboard'] = { view: true };
  perms['pm.my_performance'] = { view: true, create: true, edit: true };
  perms['pm.reports'] = { view: true, export: false };

  // Other modules denied by default
  return perms;
}

/**
 * Default permissions for Sales Member role
 */
export function createSalesMemberPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  // Sales Access
  perms['sales.dashboard'] = { view: true };
  perms['sales.my_performance'] = { view: true };
  perms['sales.performance_entry'] = { view: true, create: true, edit: true };
  perms['sales.performance_records'] = { view: true, create: true, edit: true, delete: false, export: true };
  perms['sales.leaderboard'] = { view: true };

  // Basic PM view for team alignment
  perms['pm.dashboard'] = { view: true };
  perms['pm.leaderboard'] = { view: true };

  return perms;
}

/**
 * Default permissions for Viewer role
 */
export function createViewerPermissions(): RolePermissions {
  const perms = createEmptyPermissions();

  // Read-only dashboards and reports
  perms['pm.dashboard'] = { view: true };
  perms['pm.leaderboard'] = { view: true };
  perms['pm.my_performance'] = { view: true };
  perms['pm.reports'] = { view: true, export: false };

  perms['sales.dashboard'] = { view: true };
  perms['sales.my_performance'] = { view: true };
  perms['sales.performance_records'] = { view: true };
  perms['sales.leaderboard'] = { view: true };
  perms['sales.reports'] = { view: true, export: false };

  return perms;
}

/**
 * System Built-in Roles
 */
export const DEFAULT_APP_ROLES: AppRole[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Supreme administrator with unrestricted access to all modules, role configurations, and system data.',
    status: 'active',
    isSystem: true,
    permissions: createOmnipotentPermissions(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Operations and management lead with operational approvals, submission editing, and configuration access.',
    status: 'active',
    isSystem: true,
    permissions: createAdminPermissions(),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'team_member',
    name: 'Team Member',
    description: 'Project Management division specialist who can submit weekly metrics and view performance dashboards.',
    status: 'active',
    isSystem: true,
    permissions: createTeamMemberPermissions(),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'sales_member',
    name: 'Sales Member',
    description: 'Sales division executive who logs daily reachouts, closes, and weekly sales metrics.',
    status: 'active',
    isSystem: true,
    permissions: createSalesMemberPermissions(),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Auditor or guest with read-only visualization rights across dashboards and reports.',
    status: 'active',
    isSystem: true,
    permissions: createViewerPermissions(),
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
];
