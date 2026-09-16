import { SalesEmployee, SalesPerformanceRecord, SalesProfileCode } from '../types/sales';
import { PermissionService } from '../services/permissionService';

/**
 * Check if the user is strictly Super Admin
 */
export function isUserSuperAdmin(
  user?: { role?: string; email?: string; userId?: string; uid?: string; id?: string; isSuperAdmin?: boolean } | null
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  const role = (user.role || '').toLowerCase().replace(/[\s_-]/g, '');
  const email = (user.email || '').toLowerCase().trim();
  const userId = (user.userId || user.id || user.uid || '').toLowerCase().trim();
  return (
    role === 'superadmin' ||
    role.includes('super') ||
    email === 'prakash.choudhary@coozmoo.com' ||
    email === 'ecomdeveloper007@gmail.com' ||
    email.startsWith('prakash.choudhary') ||
    email.startsWith('ecomdeveloper007') ||
    email.includes('super') ||
    userId === 'prakash.choudhary' ||
    userId === 'ecomdeveloper007' ||
    userId === 'user_superadmin_prakash' ||
    userId === 'user_superadmin_ecomdev' ||
    userId.includes('superadmin') ||
    userId.includes('super_admin') ||
    userId.includes('ecomdev')
  );
}

/**
 * Check if the user has Administrator or Super Administrator privileges
 */
export function isUserAdminOrSuperAdmin(
  user?: { role?: string; email?: string; userId?: string; uid?: string; id?: string; isSuperAdmin?: boolean; isAdmin?: boolean } | null
): boolean {
  if (!user) return false;
  if (user.isAdmin === true || user.isSuperAdmin === true) return true;
  if (isUserSuperAdmin(user)) return true;
  const role = (user.role || '').toLowerCase().replace(/[\s_-]/g, '');
  const email = (user.email || '').toLowerCase().trim();
  const userId = (user.userId || user.id || user.uid || '').toLowerCase().trim();
  return (
    role === 'admin' ||
    role === 'administrator' ||
    role === 'superadmin' ||
    role === 'manager' ||
    role.includes('admin') ||
    role.includes('super') ||
    email.includes('admin') ||
    email.includes('super') ||
    email === 'ecomdeveloper007@gmail.com' ||
    email === 'prakash.choudhary@coozmoo.com' ||
    userId === 'ecomdeveloper007' ||
    userId === 'prakash.choudhary' ||
    userId.includes('admin') ||
    userId.includes('super')
  );
}

/**
 * Admin and Super Admin permissions (delegated to PermissionService)
 */
export function canUserManageSalesMembers(user?: { role?: string; email?: string; userId?: string } | null): boolean {
  return PermissionService.checkUserPermission(user as any, 'sales.members', 'edit');
}

export function canUserManageSalesConfig(user?: { role?: string; email?: string; userId?: string } | null): boolean {
  return PermissionService.checkUserPermission(user as any, 'sales.kpi_config', 'edit');
}

export function canUserImportExport(user?: { role?: string; email?: string; userId?: string } | null): boolean {
  return PermissionService.checkUserPermission(user as any, 'sales.performance_records', 'create');
}

export function canUserViewAllReports(user?: { role?: string; email?: string; userId?: string } | null): boolean {
  return PermissionService.checkUserPermission(user as any, 'sales.reports', 'view');
}

/**
 * Find the SalesEmployee corresponding to the current authenticated user
 */
export function findMatchingSalesEmployee(
  user: { uid?: string; userId?: string; email?: string; name?: string } | null | undefined,
  employees: SalesEmployee[]
): SalesEmployee | undefined {
  if (!user) return undefined;
  const uId = (user.uid || '').trim().toLowerCase();
  const userId = (user.userId || '').trim().toLowerCase();
  const email = (user.email || '').trim().toLowerCase();
  const name = (user.name || '').trim().toLowerCase();

  return employees.find((e) => {
    if (!e) return false;
    const eId = (e.id || '').trim().toLowerCase();
    const eUserId = (e.userId || '').trim().toLowerCase();
    const eEmail = (e.email || '').trim().toLowerCase();
    const eName = (e.name || '').trim().toLowerCase();

    return (
      (eId && (eId === uId || eId === userId)) ||
      (eUserId && (eUserId === userId || eUserId === uId)) ||
      (email && eEmail && email === eEmail) ||
      (name && eName && name === eName)
    );
  });
}

/**
 * Validate if the authenticated user has permission to edit or delete a given performance record
 * Super Admin can edit/delete any record.
 * Sales Member can ONLY edit/delete their own performance record.
 */
export function canUserManageRecord(
  record: SalesPerformanceRecord,
  user: { uid?: string; userId?: string; email?: string; name?: string; role?: string; isSuperAdmin?: boolean } | null | undefined,
  employees: SalesEmployee[],
  canManageOthers?: boolean
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true || isUserSuperAdmin(user) || canManageOthers === true) return true;
  if (canManageOthers === undefined && PermissionService.checkUserPermission(user as any, 'sales.performance_records', 'edit')) {
    return true;
  }

  const matchedEmp = findMatchingSalesEmployee(user, employees);
  const recEmpId = (record.employeeId || '').trim().toLowerCase();
  const recEmpName = (record.employeeName || '').trim().toLowerCase();
  const uId = (user.uid || '').trim().toLowerCase();
  const userId = (user.userId || '').trim().toLowerCase();
  const uName = (user.name || '').trim().toLowerCase();
  const uEmail = (user.email || '').trim().toLowerCase();

  if (matchedEmp) {
    const matchedEmpId = (matchedEmp.id || '').trim().toLowerCase();
    const matchedEmpName = (matchedEmp.name || '').trim().toLowerCase();
    const matchedEmpEmail = (matchedEmp.email || '').trim().toLowerCase();
    if (
      recEmpId === matchedEmpId ||
      (matchedEmpName && recEmpName === matchedEmpName) ||
      (matchedEmpEmail && recEmpId === matchedEmpEmail)
    ) {
      return true;
    }
  }

  return (
    recEmpId === uId ||
    recEmpId === userId ||
    recEmpId === `sales_emp_${uId}` ||
    recEmpId === `sales_emp_${userId}` ||
    recEmpId === uEmail ||
    (uName && recEmpName === uName)
  );
}

/**
 * Validate if the authenticated user can record or modify performance for a target employee and profile
 */
export function validateRecordAccess(
  user: { uid?: string; userId?: string; email?: string; name?: string; role?: string } | null | undefined,
  targetEmployeeId: string,
  profileCode: SalesProfileCode,
  employees: SalesEmployee[],
  canManageOthers?: boolean
): { allowed: boolean; message?: string } {
  if (!user) {
    return { allowed: false, message: '403 Forbidden: Authentication required to perform this action.' };
  }

  // Super Admin or users with explicit manage permission can submit/edit for any team member
  if (
    isUserSuperAdmin(user) ||
    canManageOthers === true ||
    (canManageOthers === undefined && PermissionService.checkUserPermission(user as any, 'sales.performance_records', 'create'))
  ) {
    return { allowed: true };
  }

  const matchedEmp = findMatchingSalesEmployee(user, employees);
  const targetIdLower = (targetEmployeeId || '').trim().toLowerCase();
  const uIdLower = (user.uid || '').trim().toLowerCase();
  const uUserIdLower = (user.userId || '').trim().toLowerCase();
  const uEmailLower = (user.email || '').trim().toLowerCase();
  const uNameLower = (user.name || '').trim().toLowerCase();

  const isSelf =
    (matchedEmp && (
      targetIdLower === matchedEmp.id.toLowerCase() ||
      targetIdLower === (matchedEmp.userId || '').toLowerCase() ||
      targetIdLower === (matchedEmp.email || '').toLowerCase() ||
      targetIdLower === (matchedEmp.name || '').toLowerCase()
    )) ||
    targetIdLower === uIdLower ||
    targetIdLower === uUserIdLower ||
    targetIdLower === `sales_emp_${uIdLower}` ||
    targetIdLower === `sales_emp_${uUserIdLower}` ||
    targetIdLower === uEmailLower ||
    targetIdLower === uNameLower;

  if (!isSelf) {
    return {
      allowed: false,
      message: '403 Forbidden: Security Violation. You cannot enter, edit, or delete performance records for other sales members.',
    };
  }

  return { allowed: true };
}

