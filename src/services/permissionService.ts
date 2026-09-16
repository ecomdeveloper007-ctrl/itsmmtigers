import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  AppRole,
  PermissionAction,
  RolePermissions,
  SystemModule,
  SYSTEM_MODULE_SECTIONS,
} from '../types/permissions';
import { UserProfile } from '../types';
import { DEFAULT_APP_ROLES, createOmnipotentPermissions } from '../data/defaultRoles';
import { isUserSuperAdmin } from '../utils/salesAuthUtils';

const LS_ROLES_KEY = 'tiger_roles_v2';

/**
 * Storage helpers
 */
function getRolesFromStorage(): AppRole[] {
  try {
    const raw = localStorage.getItem(LS_ROLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached roles:', e);
  }
  return DEFAULT_APP_ROLES;
}

function saveRolesToStorage(roles: AppRole[]): void {
  try {
    localStorage.setItem(LS_ROLES_KEY, JSON.stringify(roles));
  } catch (e) {
    console.warn('Failed to cache roles in localStorage:', e);
  }
}

export class PermissionService {
  private static cachedRoles: AppRole[] = [];
  private static isInitialized = false;

  /**
   * Initialize and seed default system roles in Firestore and LocalStorage
   */
  public static async initializeRoles(force = false): Promise<AppRole[]> {
    if (!force && this.isInitialized && this.cachedRoles.length > 0) {
      return this.cachedRoles;
    }

    try {
      const rolesCol = collection(db, 'roles');
      const snap = await getDocs(rolesCol);

      if (!snap.empty) {
        const fetched: AppRole[] = [];
        snap.forEach((d) => {
          fetched.push(d.data() as AppRole);
        });

        // Ensure all built-in roles are preserved
        let updated = false;
        for (const defaultRole of DEFAULT_APP_ROLES) {
          const foundIndex = fetched.findIndex((r) => r.id === defaultRole.id);
          if (foundIndex === -1) {
            await setDoc(doc(db, 'roles', defaultRole.id), defaultRole);
            fetched.push(defaultRole);
            updated = true;
          } else if (defaultRole.id === 'super_admin') {
            // Verify super_admin is set to Omnipotent (all permissions true)
            const omnipotent = createOmnipotentPermissions();
            fetched[foundIndex] = {
              ...fetched[foundIndex],
              permissions: omnipotent,
              status: 'active',
              isSystem: true,
            };
            await setDoc(doc(db, 'roles', 'super_admin'), fetched[foundIndex], { merge: true });
          }
        }

        const sorted = this.sortRoles(fetched);
        this.cachedRoles = sorted;
        saveRolesToStorage(sorted);
        this.isInitialized = true;
        return sorted;
      } else {
        // First run: seed all default roles
        for (const role of DEFAULT_APP_ROLES) {
          await setDoc(doc(db, 'roles', role.id), role);
        }
        const sorted = this.sortRoles(DEFAULT_APP_ROLES);
        this.cachedRoles = sorted;
        saveRolesToStorage(sorted);
        this.isInitialized = true;
        return sorted;
      }
    } catch (error) {
      console.warn('Firebase error initializing roles, using local fallback:', error);
      const local = getRolesFromStorage();
      this.cachedRoles = local;
      this.isInitialized = true;
      return local;
    }
  }

  /**
   * Subscribe to real-time role updates
   */
  public static subscribeToRoles(callback: (roles: AppRole[]) => void): Unsubscribe {
    try {
      const rolesCol = collection(db, 'roles');
      return onSnapshot(
        rolesCol,
        (snapshot) => {
          const roles: AppRole[] = [];
          snapshot.forEach((docSnap) => {
            roles.push(docSnap.data() as AppRole);
          });

          if (roles.length > 0) {
            // Sort: super_admin first, then admin, team_member, sales_member, viewer, then customs
            const sorted = this.sortRoles(roles);
            this.cachedRoles = sorted;
            saveRolesToStorage(sorted);
            callback(sorted);
          } else {
            callback(this.cachedRoles.length > 0 ? this.cachedRoles : DEFAULT_APP_ROLES);
          }
        },
        (error) => {
          console.warn('Firestore roles subscription error:', error);
          callback(this.cachedRoles.length > 0 ? this.cachedRoles : getRolesFromStorage());
        }
      );
    } catch (e) {
      console.warn('Failed to attach roles onSnapshot:', e);
      callback(this.cachedRoles.length > 0 ? this.cachedRoles : getRolesFromStorage());
      return () => {};
    }
  }

  /**
   * Fetch all roles
   */
  public static async getRoles(force = false): Promise<AppRole[]> {
    if (!force && this.cachedRoles.length > 0) {
      return this.cachedRoles;
    }
    return this.initializeRoles(force);
  }

  /**
   * Fetch a role by ID
   */
  public static async getRoleById(roleId: string): Promise<AppRole | undefined> {
    const roles = await this.getRoles();
    return roles.find((r) => r.id === roleId);
  }

  /**
   * Create or update a role.
   * Super Admin only.
   */
  public static async saveRole(
    roleData: Partial<AppRole> & { id: string; name: string },
    actor: { uid: string; name: string; email?: string; role?: string }
  ): Promise<AppRole> {
    if (!isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin is authorized to create or modify roles.');
    }

    const roles = await this.getRoles();
    const existingIndex = roles.findIndex((r) => r.id === roleData.id);
    const existing = existingIndex >= 0 ? roles[existingIndex] : null;

    // Super Admin safeguard: Permissions for 'super_admin' role cannot be stripped
    let finalPermissions = roleData.permissions || existing?.permissions || {};
    if (roleData.id === 'super_admin') {
      finalPermissions = createOmnipotentPermissions();
    }

    const now = new Date().toISOString();
    const updatedRole: AppRole = {
      id: roleData.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: roleData.name.trim(),
      description: roleData.description || existing?.description || '',
      status: roleData.status || existing?.status || 'active',
      isSystem: existing?.isSystem ?? roleData.isSystem ?? false,
      permissions: finalPermissions,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      createdBy: existing?.createdBy || actor.name,
      updatedBy: actor.name,
    };

    // Prevent deactivation of super_admin
    if (updatedRole.id === 'super_admin') {
      updatedRole.status = 'active';
    }

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'roles', updatedRole.id), updatedRole);
    } catch (e) {
      console.warn('Firestore error saving role, using local storage fallback:', e);
    }

    // Update local list
    const updatedList = existingIndex >= 0
      ? roles.map((r) => (r.id === updatedRole.id ? updatedRole : r))
      : [...roles, updatedRole];

    const sorted = this.sortRoles(updatedList);
    this.cachedRoles = sorted;
    saveRolesToStorage(sorted);

    // Record Audit Log Entry
    try {
      const { DataService } = await import('./dataService');
      await DataService.logAudit({
        userId: actor.uid,
        userName: actor.name,
        userRole: (actor.role as any) || 'super_admin',
        action: existing ? 'UPDATE_ROLE' : 'CREATE_ROLE',
        entityType: 'settings',
        entityId: updatedRole.id,
        details: `${actor.name} ${existing ? 'updated' : 'created'} role "${updatedRole.name}" (${updatedRole.id}) with status ${updatedRole.status}.`,
        oldValue: existing ? { name: existing.name, status: existing.status } : null,
        newValue: { name: updatedRole.name, status: updatedRole.status },
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log for role save:', auditErr);
    }

    return updatedRole;
  }

  /**
   * Delete a role.
   * Super Admin only. System roles cannot be deleted.
   */
  public static async deleteRole(
    roleId: string,
    actor: { uid: string; name: string; email?: string; role?: string }
  ): Promise<boolean> {
    if (!isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin is authorized to delete roles.');
    }

    const roles = await this.getRoles();
    const targetRole = roles.find((r) => r.id === roleId);

    if (!targetRole) {
      throw new Error(`Role "${roleId}" not found.`);
    }

    if (targetRole.isSystem || roleId === 'super_admin' || roleId === 'admin' || roleId === 'team_member' || roleId === 'sales_member') {
      throw new Error(`Cannot delete built-in system role "${targetRole.name}". You may deactivate it instead.`);
    }

    // Check if any users currently have this role
    try {
      const { DataService } = await import('./dataService');
      const users = await DataService.getUsers();
      const assignedUsers = users.filter((u) => u.role === roleId);
      if (assignedUsers.length > 0) {
        throw new Error(
          `Cannot delete role "${targetRole.name}". There are ${assignedUsers.length} user(s) currently assigned to this role. Reassign them first.`
        );
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes('Cannot delete role')) throw checkErr;
    }

    try {
      await deleteDoc(doc(db, 'roles', roleId));
    } catch (e) {
      console.warn('Firestore error deleting role:', e);
    }

    const filtered = roles.filter((r) => r.id !== roleId);
    this.cachedRoles = filtered;
    saveRolesToStorage(filtered);

    // Record Audit Log Entry
    try {
      const { DataService } = await import('./dataService');
      await DataService.logAudit({
        userId: actor.uid,
        userName: actor.name,
        userRole: (actor.role as any) || 'super_admin',
        action: 'DELETE_ROLE',
        entityType: 'settings',
        entityId: roleId,
        details: `${actor.name} deleted custom role "${targetRole.name}" (${roleId}).`,
        oldValue: targetRole,
        newValue: null,
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log for role delete:', auditErr);
    }

    return true;
  }

  // =========================================================================
  // PERMISSION EVALUATION ENGINE
  // =========================================================================

  /**
   * Core permission verification logic.
   * Supports:
   * 1. Super Admin unrestricted omnipotent access.
   * 2. Strict Super Admin protection for 'admin.roles_permissions'.
   * 3. User-specific permission overrides (denied takes precedence over allowed).
   * 4. Role-based permission matrix lookup.
   */
  public static checkUserPermission(
    user: UserProfile | null | undefined,
    sectionId: string,
    action: PermissionAction = 'view',
    providedRoles?: AppRole[]
  ): boolean {
    if (!user) return false;

    // 1. Super Admin has unrestricted, omnipotent access to everything
    if (isUserSuperAdmin(user)) {
      return true;
    }

    // 2. Strict Super Admin Protection:
    // Only an authorized Super Admin can ever access Roles & Permissions.
    if (sectionId === 'admin.roles_permissions') {
      return false;
    }

    // 3. User-Specific Overrides
    if (user.permissionOverride) {
      // 3a. Denied override takes highest precedence
      const deniedActions = user.permissionOverride.denied?.[sectionId];
      if (deniedActions && deniedActions.includes(action)) {
        return false;
      }

      // 3b. Allowed override grants access directly
      const allowedActions = user.permissionOverride.allowed?.[sectionId];
      if (allowedActions && allowedActions.includes(action)) {
        return true;
      }
    }

    // 4. Role-based lookup
    const roles = providedRoles && providedRoles.length > 0 ? providedRoles : (this.cachedRoles.length > 0 ? this.cachedRoles : getRolesFromStorage());
    const rawRoleId = (user.role || 'team_member').trim();
    const roleId = rawRoleId.toLowerCase().replace(/[\s-]/g, '_');
    const role = roles.find((r) => {
      const rId = r.id.toLowerCase().trim();
      return rId === roleId || rId === rawRoleId.toLowerCase();
    });

    if (!role) {
      // Fallback for legacy role strings
      if (roleId === 'admin') {
        const adminRole = roles.find((r) => r.id === 'admin') || DEFAULT_APP_ROLES[1];
        return adminRole.permissions[sectionId]?.[action] === true;
      }
      return false;
    }

    // If role is deactivated, deny access
    if (role.status === 'inactive') {
      return false;
    }

    const secPerms = role.permissions?.[sectionId];
    if (!secPerms) return false;
    return secPerms[action] === true;
  }

  /**
   * Check if a user can access a section (has at least 'view' permission)
   */
  public static canAccessSection(
    user: UserProfile | null | undefined,
    sectionId: string,
    providedRoles?: AppRole[]
  ): boolean {
    return this.checkUserPermission(user, sectionId, 'view', providedRoles);
  }

  /**
   * Check if a user can access a module (has view permission for at least one section in that module)
   */
  public static canAccessModule(
    user: UserProfile | null | undefined,
    module: SystemModule,
    providedRoles?: AppRole[]
  ): boolean {
    if (!user) return false;
    if (isUserSuperAdmin(user)) return true;

    const sections = SYSTEM_MODULE_SECTIONS.filter((s) => s.module === module);
    return sections.some((s) => this.checkUserPermission(user, s.id, 'view', providedRoles));
  }

  /**
   * Backend & API Action Enforcement.
   * Throws 403 Forbidden error if unauthorized.
   */
  public static enforcePermission(
    user: UserProfile | null | undefined,
    sectionId: string,
    action: PermissionAction = 'view',
    providedRoles?: AppRole[]
  ): void {
    const isAllowed = this.checkUserPermission(user, sectionId, action, providedRoles);
    if (!isAllowed) {
      const errorMsg = `403 Forbidden: You do not have permission to perform '${action}' on '${sectionId}'.`;
      console.error(errorMsg, { user: user?.email, role: user?.role, sectionId, action });
      throw new Error(errorMsg);
    }
  }

  /**
   * Helper to sort roles logically
   */
  private static sortRoles(roles: AppRole[]): AppRole[] {
    const order: Record<string, number> = {
      super_admin: 1,
      admin: 2,
      team_member: 3,
      sales_member: 4,
      viewer: 5,
    };
    return [...roles].sort((a, b) => {
      const orderA = order[a.id] || 99;
      const orderB = order[b.id] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }
}

export const permissionService = PermissionService;

