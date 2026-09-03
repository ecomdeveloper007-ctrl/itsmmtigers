import { SalesEmployee, SalesPerformanceRecord, SalesProfileCode } from '../types/sales';

/**
 * Check if the user is strictly Super Admin
 */
export function isUserSuperAdmin(
  user?: { role?: string; email?: string } | null
): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  return role === 'super_admin' || email === 'prakash.choudhary@coozmoo.com';
}

/**
 * Check if the user has Administrator or Super Administrator privileges
 */
export function isUserAdminOrSuperAdmin(
  user?: { role?: string; email?: string } | null
): boolean {
  return isUserSuperAdmin(user);
}

/**
 * Super Admin only permissions
 */
export function canUserManageSalesMembers(user?: { role?: string; email?: string } | null): boolean {
  return isUserSuperAdmin(user);
}

export function canUserManageSalesConfig(user?: { role?: string; email?: string } | null): boolean {
  return isUserSuperAdmin(user);
}

export function canUserImportExport(user?: { role?: string; email?: string } | null): boolean {
  return isUserSuperAdmin(user);
}

export function canUserViewAllReports(user?: { role?: string; email?: string } | null): boolean {
  return isUserSuperAdmin(user);
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
  user: { uid?: string; userId?: string; email?: string; name?: string; role?: string } | null | undefined,
  employees: SalesEmployee[]
): boolean {
  if (!user) return false;
  if (isUserSuperAdmin(user)) return true;

  const matchedEmp = findMatchingSalesEmployee(user, employees);
  const recEmpId = (record.employeeId || '').trim().toLowerCase();
  const recEmpName = (record.employeeName || '').trim().toLowerCase();
  const uId = (user.uid || '').trim().toLowerCase();
  const userId = (user.userId || '').trim().toLowerCase();
  const uName = (user.name || '').trim().toLowerCase();

  if (matchedEmp) {
    const matchedEmpId = (matchedEmp.id || '').trim().toLowerCase();
    const matchedEmpName = (matchedEmp.name || '').trim().toLowerCase();
    if (recEmpId === matchedEmpId || (matchedEmpName && recEmpName === matchedEmpName)) {
      return true;
    }
  }

  return (
    recEmpId === uId ||
    recEmpId === userId ||
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
  employees: SalesEmployee[]
): { allowed: boolean; message?: string } {
  if (!user) {
    return { allowed: false, message: '403 Forbidden: Authentication required to perform this action.' };
  }

  if (isUserSuperAdmin(user)) {
    return { allowed: true };
  }

  const matchedEmp = findMatchingSalesEmployee(user, employees);
  if (!matchedEmp) {
    return {
      allowed: false,
      message: '403 Forbidden: No sales profile linked to your account. Only registered sales members can submit performance.',
    };
  }

  const targetIdLower = (targetEmployeeId || '').trim().toLowerCase();
  const isSelf =
    targetIdLower === matchedEmp.id.toLowerCase() ||
    targetIdLower === (matchedEmp.userId || '').toLowerCase() ||
    targetIdLower === (user.uid || '').toLowerCase() ||
    targetIdLower === (user.userId || '').toLowerCase();

  if (!isSelf) {
    return {
      allowed: false,
      message: '403 Forbidden: Security Violation. You cannot enter, edit, or delete performance records for other sales members.',
    };
  }

  const assigned = matchedEmp.assignedProfiles && matchedEmp.assignedProfiles.length > 0
    ? matchedEmp.assignedProfiles
    : [matchedEmp.profileCode || 'PR'];

  if (!assigned.includes(profileCode)) {
    return {
      allowed: false,
      message: `403 Forbidden: Profile "${profileCode}" is not assigned to your account. Your assigned profiles: ${assigned.join(', ')}.`,
    };
  }

  return { allowed: true };
}

