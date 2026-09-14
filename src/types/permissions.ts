export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'import'
  | 'export'
  | 'manage';

export type SystemModule = 'pm' | 'sales' | 'admin';

export interface ModuleSectionDef {
  id: string; // e.g. 'pm.dashboard', 'sales.performance_records', 'admin.roles_permissions'
  module: SystemModule;
  label: string;
  description: string;
  supportedActions: PermissionAction[];
}

export type ActionPermissions = {
  [key in PermissionAction]?: boolean;
};

export type RolePermissions = {
  [sectionId: string]: ActionPermissions;
};

export interface UserPermissionOverride {
  allowed?: {
    [sectionId: string]: PermissionAction[];
  };
  denied?: {
    [sectionId: string]: PermissionAction[];
  };
}

export interface AppRole {
  id: string; // 'super_admin' | 'admin' | 'team_member' | 'sales_member' | 'viewer' | custom slug
  name: string;
  description: string;
  status: 'active' | 'inactive';
  isSystem?: boolean; // built-in roles cannot be deleted
  permissions: RolePermissions;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Full catalogue of sections and supported actions across all system modules
 */
export const SYSTEM_MODULE_SECTIONS: ModuleSectionDef[] = [
  // -------------------------------------------------------------
  // PROJECT MANAGEMENT (PM) MODULE
  // -------------------------------------------------------------
  {
    id: 'pm.dashboard',
    module: 'pm',
    label: 'Dashboard',
    description: 'View Project Management KPI summary, podium, and team comparison',
    supportedActions: ['view'],
  },
  {
    id: 'pm.leaderboard',
    module: 'pm',
    label: 'Leaderboard',
    description: 'View division rankings, scorecards, and tie-breakers',
    supportedActions: ['view'],
  },
  {
    id: 'pm.my_performance',
    module: 'pm',
    label: 'My Performance',
    description: 'View personal scorecard and submit weekly PM metrics',
    supportedActions: ['view', 'create', 'edit'],
  },
  {
    id: 'pm.submissions',
    module: 'pm',
    label: 'Team Submission & Data',
    description: 'View, edit, delete, import and export all team weekly submissions',
    supportedActions: ['view', 'create', 'edit', 'delete', 'import', 'export'],
  },
  {
    id: 'pm.members',
    module: 'pm',
    label: 'Team Members & Approvals',
    description: 'Review registration requests, approve/reject members, and assign profiles',
    supportedActions: ['view', 'create', 'edit', 'delete', 'approve'],
  },
  {
    id: 'pm.kpis',
    module: 'pm',
    label: 'KPI Config',
    description: 'Configure KPI weights (100% sum), targets, and active metrics',
    supportedActions: ['view', 'edit', 'manage'],
  },
  {
    id: 'pm.week_lock',
    module: 'pm',
    label: 'Week Lock',
    description: 'Manage weekly performance periods, lock weeks, and deadlines',
    supportedActions: ['view', 'edit', 'manage'],
  },
  {
    id: 'pm.winner',
    module: 'pm',
    label: 'Announce Winner',
    description: 'Trigger winner celebrations, declare monthly champions, and broadcast podium',
    supportedActions: ['view', 'manage'],
  },
  {
    id: 'pm.reports',
    module: 'pm',
    label: 'Monthly R&R Report',
    description: 'View monthly performance summaries and export formal R&R reports',
    supportedActions: ['view', 'export'],
  },
  {
    id: 'pm.audit_logs',
    module: 'pm',
    label: 'Audit Logs',
    description: 'Review full audit trail of PM data modifications and score updates',
    supportedActions: ['view', 'export'],
  },

  // -------------------------------------------------------------
  // SALES MODULE
  // -------------------------------------------------------------
  {
    id: 'sales.dashboard',
    module: 'sales',
    label: 'Dashboard',
    description: 'View Sales division revenue overview, progress bars, and high-level charts',
    supportedActions: ['view'],
  },
  {
    id: 'sales.my_performance',
    module: 'sales',
    label: 'My Performance',
    description: 'View personal sales breakdown, targets, and achievement metrics',
    supportedActions: ['view'],
  },
  {
    id: 'sales.performance_entry',
    module: 'sales',
    label: 'Performance Entry',
    description: 'Log daily reachouts, calls, and weekly sales metrics',
    supportedActions: ['view', 'create', 'edit'],
  },
  {
    id: 'sales.performance_records',
    module: 'sales',
    label: 'Performance Records',
    description: 'View comprehensive sales records table, edit or export records',
    supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
  },
  {
    id: 'sales.leaderboard',
    module: 'sales',
    label: 'Leaderboard',
    description: 'View Sales division rankings and tiered achievers',
    supportedActions: ['view'],
  },
  {
    id: 'sales.members',
    module: 'sales',
    label: 'Sales Members',
    description: 'Manage sales roster, departments (IT/SMM), and assigned profiles',
    supportedActions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'sales.targets',
    module: 'sales',
    label: 'Profiles & Targets',
    description: 'Configure profile-level benchmarks (PR, WR, HW, RR, DR) and revenue goals',
    supportedActions: ['view', 'edit', 'manage'],
  },
  {
    id: 'sales.rewards',
    module: 'sales',
    label: 'KPI Targets & Rewards Settings',
    description: 'Set up reward tiers, consistency bonus, and target bonus rates',
    supportedActions: ['view', 'edit', 'manage'],
  },
  {
    id: 'sales.reports',
    module: 'sales',
    label: 'Reports & Analytics',
    description: 'Review detailed sales performance and compensation breakdown reports',
    supportedActions: ['view', 'export'],
  },
  {
    id: 'sales.import_export',
    module: 'sales',
    label: 'Import / Export',
    description: 'Bulk CSV / Excel import and export for sales performance data',
    supportedActions: ['view', 'import', 'export'],
  },
  {
    id: 'sales.audit_logs',
    module: 'sales',
    label: 'Audit Logs',
    description: 'Track all sales performance entries, edits, and administrative adjustments',
    supportedActions: ['view', 'export'],
  },

  // -------------------------------------------------------------
  // ADMINISTRATION MODULE
  // -------------------------------------------------------------
  {
    id: 'admin.users',
    module: 'admin',
    label: 'User Management',
    description: 'Manage user profiles, accounts, registration approvals, and role assignments',
    supportedActions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'],
  },
  {
    id: 'admin.roles_permissions',
    module: 'admin',
    label: 'Roles & Permissions',
    description: 'Super Admin control over roles, section access, and granular actions',
    supportedActions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'admin.settings',
    module: 'admin',
    label: 'System Settings',
    description: 'Configure company branding, scoring decimal precision, and thresholds',
    supportedActions: ['view', 'edit'],
  },
];
