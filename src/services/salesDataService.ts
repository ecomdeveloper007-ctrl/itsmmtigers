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
  SalesEmployee,
  SalesPerformanceRecord,
  SalesRewardSettings,
  SalesProfileCode,
  SalesDepartment,
  SalesAuditLog,
} from '../types/sales';
import {
  DEFAULT_SALES_SETTINGS,
  computeCompleteSalesRecord,
  sanitizeSalesNumber,
} from './salesCalculationService';
import {
  isUserSuperAdmin,
  isUserAdminOrSuperAdmin,
  canUserManageRecord,
  validateRecordAccess,
  findMatchingSalesEmployee,
} from '../utils/salesAuthUtils';

const SALES_LS_KEYS = {
  EMPLOYEES: 'tiger_sales_employees_v3',
  RECORDS: 'tiger_sales_records_v3',
  SETTINGS: 'tiger_sales_settings_v3',
  DELETED_EMPLOYEES: 'tiger_sales_deleted_emp_v3',
  DELETED_RECORDS: 'tiger_sales_deleted_rec_v3',
  AUDIT_LOGS: 'tiger_sales_audit_logs_v3',
  INITIALIZED: 'tiger_sales_init_v3',
};

/**
 * Initial Seed Sales Employees (with multi-profile assignments support)
 */
export const INITIAL_SALES_EMPLOYEES: SalesEmployee[] = [
  // IT Team - PR Profile
  {
    id: 'sales_emp_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    profileCode: 'PR',
    assignedProfiles: ['PR', 'WR'],
    joiningDate: '2024-02-10',
    status: 'active',
    createdAt: '2024-02-10T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sales_emp_2',
    name: 'Anjali Patel',
    email: 'anjali.patel@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    profileCode: 'PR',
    assignedProfiles: ['PR'],
    joiningDate: '2024-04-15',
    status: 'active',
    createdAt: '2024-04-15T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },

  // IT Team - WR Profile
  {
    id: 'sales_emp_3',
    name: 'Vikram Verma',
    email: 'vikram.verma@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    profileCode: 'WR',
    assignedProfiles: ['WR', 'HW'],
    joiningDate: '2024-05-01',
    status: 'active',
    createdAt: '2024-05-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sales_emp_4',
    name: 'Sneha Kapoor',
    email: 'sneha.kapoor@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    profileCode: 'WR',
    assignedProfiles: ['WR'],
    joiningDate: '2024-06-20',
    status: 'active',
    createdAt: '2024-06-20T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },

  // IT Team - HW Profile
  {
    id: 'sales_emp_5',
    name: 'Amit Kumar',
    email: 'amit.kumar@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'IT',
    profileCode: 'HW',
    assignedProfiles: ['HW', 'PR', 'WR'],
    joiningDate: '2024-07-01',
    status: 'active',
    createdAt: '2024-07-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },

  // SMM Team - DR Profile
  {
    id: 'sales_emp_6',
    name: 'Divya Nair',
    email: 'divya.nair@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'SMM',
    profileCode: 'DR',
    assignedProfiles: ['DR', 'RR'],
    joiningDate: '2024-03-01',
    status: 'active',
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sales_emp_7',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    department: 'SMM',
    profileCode: 'DR',
    assignedProfiles: ['DR'],
    joiningDate: '2024-08-01',
    status: 'active',
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },

  // SMM Team - RR Profile
  {
    id: 'sales_emp_8',
    name: 'Pooja Joshi',
    email: 'pooja.joshi@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'SMM',
    profileCode: 'RR',
    assignedProfiles: ['RR', 'DR'],
    joiningDate: '2024-01-15',
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'sales_emp_9',
    name: 'Priya Singh',
    email: 'priya.singh@itsmmtigers.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'SMM',
    profileCode: 'RR',
    assignedProfiles: ['RR'],
    joiningDate: '2024-06-01',
    status: 'active',
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

/**
 * LocalStorage Helpers
 */
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

/**
 * Generate initial weekly sample performance records
 */
function generateInitialRecords(): SalesPerformanceRecord[] {
  const settings = DEFAULT_SALES_SETTINGS;
  const records: SalesPerformanceRecord[] = [];

  // Seed weekly data for Week 1 (Sep 1 - Sep 7)
  const week1Inputs = [
    { empId: 'sales_emp_1', name: 'Rahul Sharma', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 210, conversions: 22, followups: 105, orderValue: 110000, remarks: 'Strong enterprise pipeline closed.' },
    { empId: 'sales_emp_1', name: 'Rahul Sharma', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 160, conversions: 14, followups: 82, orderValue: 85000, remarks: 'Web architecture contracts.' },
    { empId: 'sales_emp_2', name: 'Anjali Patel', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 190, conversions: 18, followups: 95, orderValue: 95000, remarks: 'Consistent product solutions delivery.' },
    { empId: 'sales_emp_3', name: 'Vikram Verma', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 175, conversions: 17, followups: 90, orderValue: 88000, remarks: 'Full stack development closures.' },
    { empId: 'sales_emp_4', name: 'Sneha Kapoor', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 165, conversions: 15, followups: 85, orderValue: 80000, remarks: 'Frontend proposal renewals.' },
    { empId: 'sales_emp_5', name: 'Amit Kumar', code: 'HW' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachouts: 145, conversions: 15, followups: 78, orderValue: 130000, remarks: 'High value cloud infrastructure deal.' },
    { empId: 'sales_emp_6', name: 'Divya Nair', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachouts: 260, conversions: 28, followups: 125, orderValue: 82000, remarks: 'Paid ad campaign acquisition boost.' },
    { empId: 'sales_emp_7', name: 'Rohan Mehta', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachouts: 230, conversions: 21, followups: 105, orderValue: 72000, remarks: 'Direct response sales stable.' },
    { empId: 'sales_emp_8', name: 'Pooja Joshi', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachouts: 220, conversions: 23, followups: 110, orderValue: 160000, remarks: 'Social retainer contract extensions.' },
    { empId: 'sales_emp_9', name: 'Priya Singh', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachouts: 200, conversions: 19, followups: 100, orderValue: 145000, remarks: 'Brand retainer additions.' },
  ];

  week1Inputs.forEach((inp) => {
    records.push(
      computeCompleteSalesRecord(
        {
          id: `sales_rec_${inp.empId}_${inp.code}_Week_1_September_2026`,
          employeeId: inp.empId,
          employeeName: inp.name,
          department: inp.dept,
          profileCode: inp.code,
          week: 'Week 1',
          weekStartDate: '2026-09-01',
          weekEndDate: '2026-09-07',
          month: 'September',
          year: 2026,
          reachouts: inp.reachouts,
          conversions: inp.conversions,
          followups: inp.followups,
          orderValue: inp.orderValue,
          managerRemarks: inp.remarks,
          submittedBy: 'Admin',
        },
        settings
      )
    );
  });

  return records;
}

export class SalesDataService {
  /**
   * Initialize Sales Data store
   */
  static async initializeSalesStore(): Promise<void> {
    try {
      const isInitialized = localStorage.getItem(SALES_LS_KEYS.INITIALIZED);
      const deletedEmp = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []);

      if (!isInitialized) {
        const storedEmployees = getFromStorage<SalesEmployee[] | null>(SALES_LS_KEYS.EMPLOYEES, null);
        if (!storedEmployees || storedEmployees.length === 0) {
          const freshEmployees = INITIAL_SALES_EMPLOYEES.filter(
            (e) => !deletedEmp.includes(e.id) && !deletedEmp.includes(e.name.toLowerCase())
          );
          saveToStorage(SALES_LS_KEYS.EMPLOYEES, freshEmployees);
        }

        const storedRecords = getFromStorage<SalesPerformanceRecord[] | null>(SALES_LS_KEYS.RECORDS, null);
        if (!storedRecords || storedRecords.length === 0) {
          saveToStorage(SALES_LS_KEYS.RECORDS, generateInitialRecords());
        }

        const storedSettings = getFromStorage<SalesRewardSettings | null>(SALES_LS_KEYS.SETTINGS, null);
        if (!storedSettings) {
          saveToStorage(SALES_LS_KEYS.SETTINGS, DEFAULT_SALES_SETTINGS);
        }

        localStorage.setItem(SALES_LS_KEYS.INITIALIZED, 'true');
      }

      // Sync with Firestore if connected
      if (db) {
        try {
          const initMarkerSnap = await getDoc(doc(db, 'sales_settings', 'system_init_marker'));
          if (!initMarkerSnap.exists()) {
            const empSnap = await getDocs(collection(db, 'sales_employees'));
            if (empSnap.empty && deletedEmp.length === 0) {
              for (const emp of INITIAL_SALES_EMPLOYEES) {
                await setDoc(doc(db, 'sales_employees', emp.id), emp);
              }
            }

            const settingsSnap = await getDoc(doc(db, 'sales_settings', 'global_config'));
            if (!settingsSnap.exists()) {
              await setDoc(doc(db, 'sales_settings', 'global_config'), DEFAULT_SALES_SETTINGS);
            }

            const recSnap = await getDocs(collection(db, 'sales_records'));
            if (recSnap.empty && deletedEmp.length === 0) {
              const initialRecs = generateInitialRecords();
              for (const rec of initialRecs) {
                await setDoc(doc(db, 'sales_records', rec.id), rec);
              }
            }

            await setDoc(doc(db, 'sales_settings', 'system_init_marker'), {
              initializedAt: new Date().toISOString(),
              version: '3.0',
            });
          }
        } catch (fsErr) {
          console.warn('Firestore sales initialization warning (using local fallback):', fsErr);
        }
      }
    } catch (e) {
      console.warn('Error during sales data initialization:', e);
    }
  }

  // --- EMPLOYEES CRUD ---
  static async getEmployees(): Promise<SalesEmployee[]> {
    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []).map((d) => (d || '').toLowerCase());

    const isDeleted = (e: SalesEmployee) => {
      if (!e) return true;
      const id = (e.id || '').toLowerCase();
      const uid = (e.userId || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const name = (e.name || '').toLowerCase();
      return (
        deleted.includes(id) ||
        (uid && deleted.includes(uid)) ||
        (email && deleted.includes(email)) ||
        (name && deleted.includes(name))
      );
    };

    const normalizeEmployee = (e: SalesEmployee): SalesEmployee => {
      const assigned = e.assignedProfiles && e.assignedProfiles.length > 0
        ? e.assignedProfiles
        : [e.profileCode || 'PR'];
      return {
        ...e,
        assignedProfiles: assigned,
        profileCode: assigned[0] || e.profileCode || 'PR',
      };
    };

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'sales_employees'));
        if (!snap.empty) {
          const items = snap.docs
            .map((d) => normalizeEmployee(d.data() as SalesEmployee))
            .filter((e) => !isDeleted(e));
          saveToStorage(SALES_LS_KEYS.EMPLOYEES, items);
          return items;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch employees failed, fallback to local storage:', e);
    }
    const local = getFromStorage<SalesEmployee[]>(SALES_LS_KEYS.EMPLOYEES, []);
    return local.map(normalizeEmployee).filter((e) => !isDeleted(e));
  }

  static async saveEmployee(employee: SalesEmployee, actor?: { id: string; name: string; role: string }): Promise<SalesEmployee> {
    if (!actor || !isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin can create or update sales members and profile assignments.');
    }

    const all = await this.getEmployees();
    const idx = all.findIndex((e) => e.id === employee.id);

    const assigned = employee.assignedProfiles && employee.assignedProfiles.length > 0
      ? employee.assignedProfiles
      : [employee.profileCode || 'PR'];

    const employeeWithTimestamp: SalesEmployee = {
      ...employee,
      assignedProfiles: assigned,
      profileCode: assigned[0],
      updatedAt: new Date().toISOString(),
    };

    let updated: SalesEmployee[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = employeeWithTimestamp;
    } else {
      updated = [employeeWithTimestamp, ...all];
    }

    saveToStorage(SALES_LS_KEYS.EMPLOYEES, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'sales_employees', employee.id), employeeWithTimestamp);
      } catch (e) {
        console.warn('Firestore save employee failed:', e);
      }
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: idx >= 0 ? 'UPDATE_SALES_EMPLOYEE' : 'CREATE_SALES_EMPLOYEE',
        entityType: 'employee',
        entityId: employee.id,
        details: `${actor.name} ${idx >= 0 ? 'updated' : 'created'} Sales member ${employee.name} with profiles: ${assigned.join(', ')}`,
        newValue: employeeWithTimestamp,
      });
    }

    return employeeWithTimestamp;
  }

  static async deleteEmployee(empId: string, actor?: { id: string; name: string; role: string }): Promise<void> {
    if (!actor || !isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin can delete sales members.');
    }

    const cleanId = (empId || '').trim();
    if (!cleanId) return;
    const cleanIdLower = cleanId.toLowerCase();

    // 1. Collect all identifiers
    const all = getFromStorage<SalesEmployee[]>(SALES_LS_KEYS.EMPLOYEES, []);
    const targetEmp = all.find(
      (e) =>
        (e.id && e.id.toLowerCase() === cleanIdLower) ||
        (e.userId && e.userId.toLowerCase() === cleanIdLower) ||
        (e.email && e.email.toLowerCase() === cleanIdLower) ||
        (e.name && e.name.toLowerCase() === cleanIdLower)
    );

    // 2. Add to tombstone deleted list
    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []);
    const addTombstone = (val?: string) => {
      if (!val) return;
      const v = val.trim();
      if (v && !deleted.includes(v)) deleted.push(v);
      const vl = v.toLowerCase();
      if (vl && !deleted.includes(vl)) deleted.push(vl);
    };

    addTombstone(cleanId);
    if (targetEmp) {
      addTombstone(targetEmp.id);
      addTombstone(targetEmp.userId);
      addTombstone(targetEmp.email);
      addTombstone(targetEmp.name);
    }
    saveToStorage(SALES_LS_KEYS.DELETED_EMPLOYEES, deleted);

    // 3. Filter employees from local storage
    const deletedLower = deleted.map((d) => (d || '').toLowerCase());
    const filteredEmployees = all.filter((e) => {
      if (!e) return false;
      const id = (e.id || '').toLowerCase();
      const uid = (e.userId || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const name = (e.name || '').toLowerCase();
      return (
        !deletedLower.includes(id) &&
        (!uid || !deletedLower.includes(uid)) &&
        (!email || !deletedLower.includes(email)) &&
        (!name || !deletedLower.includes(name))
      );
    });
    saveToStorage(SALES_LS_KEYS.EMPLOYEES, filteredEmployees);

    // 4. Remove all associated performance records
    const allRecords = getFromStorage<SalesPerformanceRecord[]>(SALES_LS_KEYS.RECORDS, []);
    const deletedRecIds = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_RECORDS, []);

    const remainingRecords = allRecords.filter((r) => {
      if (!r) return false;
      const empIdentifier = (r.employeeId || '').toLowerCase();
      const empName = (r.employeeName || '').toLowerCase();
      const isMatched =
        deletedLower.includes(empIdentifier) ||
        deletedLower.includes(empName) ||
        empIdentifier === cleanIdLower ||
        (targetEmp && (empIdentifier === targetEmp.id.toLowerCase() || empName === targetEmp.name.toLowerCase()));
      if (isMatched) {
        if (!deletedRecIds.includes(r.id)) deletedRecIds.push(r.id);
        return false;
      }
      return true;
    });
    saveToStorage(SALES_LS_KEYS.RECORDS, remainingRecords);
    saveToStorage(SALES_LS_KEYS.DELETED_RECORDS, deletedRecIds);

    // 5. Clean up from Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'sales_employees', cleanId)).catch(() => {});
        if (targetEmp && targetEmp.id && targetEmp.id !== cleanId) {
          await deleteDoc(doc(db, 'sales_employees', targetEmp.id)).catch(() => {});
        }

        const empSnap = await getDocs(collection(db, 'sales_employees'));
        for (const docSnap of empSnap.docs) {
          const d = docSnap.data() as SalesEmployee;
          const docIdLower = docSnap.id.toLowerCase();
          const dIdLower = (d.id || '').toLowerCase();
          const dUidLower = (d.userId || '').toLowerCase();
          const dEmailLower = (d.email || '').toLowerCase();
          const dNameLower = (d.name || '').toLowerCase();

          if (
            deletedLower.includes(docIdLower) ||
            deletedLower.includes(dIdLower) ||
            (dUidLower && deletedLower.includes(dUidLower)) ||
            (dEmailLower && deletedLower.includes(dEmailLower)) ||
            (dNameLower && deletedLower.includes(dNameLower))
          ) {
            await deleteDoc(docSnap.ref).catch(() => {});
          }
        }

        const recSnap = await getDocs(collection(db, 'sales_records'));
        for (const rDoc of recSnap.docs) {
          const rData = rDoc.data() as SalesPerformanceRecord;
          const rEmpIdLower = (rData.employeeId || '').toLowerCase();
          const rEmpNameLower = (rData.employeeName || '').toLowerCase();
          if (
            deletedLower.includes(rEmpIdLower) ||
            deletedLower.includes(rEmpNameLower) ||
            rEmpIdLower === cleanIdLower ||
            deletedRecIds.includes(rDoc.id)
          ) {
            await deleteDoc(rDoc.ref).catch(() => {});
          }
        }

        await setDoc(
          doc(db, 'sales_settings', 'deleted_metadata'),
          {
            deletedEmployeeIds: deleted,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      } catch (e) {
        console.warn('Firestore delete sales employee/records warning:', e);
      }
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'DELETE_SALES_EMPLOYEE',
        entityType: 'employee',
        entityId: cleanId,
        details: `${actor.name} permanently deleted Sales member (${targetEmp?.name || cleanId}) and purged records.`,
      });
    }
  }

  /**
   * Sync a UserProfile into Sales Employees roster
   */
  static async syncUserToSales(user: {
    uid: string;
    userId: string;
    name: string;
    email: string;
    avatarUrl?: string;
    department?: string;
    team?: 'IT' | 'SMM' | 'Operations' | 'Leadership';
    profileCode?: string;
    salesDepartment?: 'IT' | 'SMM';
    salesProfileCode?: SalesProfileCode;
    salesAssignedProfiles?: SalesProfileCode[];
    moduleAssignment?: 'pm' | 'sales' | 'both';
    status?: string;
    joiningDate?: string;
  }): Promise<SalesEmployee> {
    const rawProfiles = user.salesAssignedProfiles && user.salesAssignedProfiles.length > 0
      ? user.salesAssignedProfiles
      : user.salesProfileCode
      ? [user.salesProfileCode]
      : [(['PR', 'WR', 'HW'].includes(user.profileCode as any) ? (user.profileCode as SalesProfileCode) : 'PR')];

    const resolvedDept: SalesDepartment =
      user.salesDepartment || (['PR', 'WR', 'HW'].includes(rawProfiles[0]) ? 'IT' : 'SMM');

    // Unmark from deleted if re-assigning
    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []);
    const cleanId = (user.uid || user.userId).trim();
    const updatedDeleted = deleted.filter(
      (d) =>
        d.toLowerCase() !== cleanId.toLowerCase() &&
        d.toLowerCase() !== user.userId.toLowerCase() &&
        d.toLowerCase() !== user.name.toLowerCase()
    );
    saveToStorage(SALES_LS_KEYS.DELETED_EMPLOYEES, updatedDeleted);

    const empId = user.uid.startsWith('sales_emp_') ? user.uid : `sales_emp_${user.userId.replace(/[^a-z0-9]/gi, '_')}`;

    const emp: SalesEmployee = {
      id: empId,
      userId: user.userId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      department: resolvedDept,
      profileCode: rawProfiles[0] || 'PR',
      assignedProfiles: rawProfiles,
      moduleAssignment: user.moduleAssignment || 'both',
      joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
      status: user.status === 'disabled' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.saveEmployee(emp);
  }

  static async unassignUserFromSales(userIdOrEmpId: string): Promise<void> {
    await this.deleteEmployee(userIdOrEmpId);
  }

  // --- RECORDS CRUD (WEEKLY PERFORMANCE) ---
  static async getRecords(): Promise<SalesPerformanceRecord[]> {
    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_RECORDS, []);
    const deletedEmp = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []).map((d) => (d || '').toLowerCase());

    const isRecordDeleted = (r: SalesPerformanceRecord) => {
      if (!r) return true;
      if (deleted.includes(r.id)) return true;
      const empId = (r.employeeId || '').toLowerCase();
      const empName = (r.employeeName || '').toLowerCase();
      return deletedEmp.includes(empId) || deletedEmp.includes(empName);
    };

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'sales_records'));
        if (!snap.empty) {
          const items = snap.docs
            .map((d) => d.data() as SalesPerformanceRecord)
            .filter((r) => !isRecordDeleted(r));
          saveToStorage(SALES_LS_KEYS.RECORDS, items);
          return items;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch records failed, fallback to local storage:', e);
    }
    const local = getFromStorage<SalesPerformanceRecord[]>(SALES_LS_KEYS.RECORDS, []);
    return local.filter((r) => !isRecordDeleted(r));
  }

  /**
   * Save Weekly Performance Record with Unique Constraint:
   * (Employee + Profile + Week + Month + Year) is unique.
   * Enforces backend-level authorization for own-data-only.
   */
  static async saveRecord(
    record: SalesPerformanceRecord,
    actor?: { id: string; name: string; role: string; userId?: string; email?: string }
  ): Promise<SalesPerformanceRecord> {
    const all = await this.getRecords();
    const employees = await this.getEmployees();

    // Backend-level security check
    if (actor) {
      const accessCheck = validateRecordAccess(actor, record.employeeId, record.profileCode, employees);
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.message || '403 Forbidden: Access Denied.');
      }

      // If record is updating an existing record, verify that the existing record belongs to the actor as well
      const existingById = all.find((r) => r.id === record.id);
      if (existingById && !isUserSuperAdmin(actor)) {
        if (!canUserManageRecord(existingById, actor, employees)) {
          throw new Error('403 Forbidden: You cannot overwrite another member\'s performance record.');
        }
      }
    }

    // Unique match key: employeeId + profileCode + week + month + year
    const idx = all.findIndex(
      (r) =>
        r.id === record.id ||
        (r.employeeId === record.employeeId &&
          r.profileCode === record.profileCode &&
          r.week === record.week &&
          r.month === record.month &&
          Number(r.year) === Number(record.year))
    );

    let updated: SalesPerformanceRecord[];
    const recToSave: SalesPerformanceRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      // If updating matched record by key, also verify ownership of old record if not Super Admin
      if (actor && !isUserSuperAdmin(actor)) {
        if (!canUserManageRecord(all[idx], actor, employees)) {
          throw new Error('403 Forbidden: You cannot overwrite another member\'s performance record.');
        }
      }
      updated = [...all];
      updated[idx] = recToSave;
    } else {
      updated = [recToSave, ...all];
    }

    saveToStorage(SALES_LS_KEYS.RECORDS, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'sales_records', recToSave.id), recToSave);
      } catch (e) {
        console.warn('Firestore save record failed:', e);
      }
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: idx >= 0 ? 'UPDATE_PERFORMANCE_RECORD' : 'CREATE_PERFORMANCE_RECORD',
        entityType: 'record',
        entityId: recToSave.id,
        details: `${actor.name} ${idx >= 0 ? 'updated' : 'entered'} ${recToSave.profileCode} (${recToSave.week}, ${recToSave.month} ${recToSave.year}) performance for ${recToSave.employeeName} (Score: ${recToSave.totalPerformanceScore}/100)`,
        newValue: recToSave,
      });
    }

    return recToSave;
  }

  static async deleteRecord(
    recordId: string,
    actor?: { id: string; name: string; role: string; userId?: string; email?: string }
  ): Promise<void> {
    const all = await this.getRecords();
    const targetRec = all.find((r) => r.id === recordId);
    const employees = await this.getEmployees();

    if (actor && targetRec && !isUserSuperAdmin(actor)) {
      if (!canUserManageRecord(targetRec, actor, employees)) {
        throw new Error('403 Forbidden: You cannot delete another member\'s performance record.');
      }
    }

    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_RECORDS, []);
    if (!deleted.includes(recordId)) {
      deleted.push(recordId);
      saveToStorage(SALES_LS_KEYS.DELETED_RECORDS, deleted);
    }

    const filtered = all.filter((r) => r.id !== recordId);
    saveToStorage(SALES_LS_KEYS.RECORDS, filtered);

    if (db) {
      try {
        await deleteDoc(doc(db, 'sales_records', recordId));
      } catch (e) {
        console.warn('Firestore delete record failed:', e);
      }
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'DELETE_PERFORMANCE_RECORD',
        entityType: 'record',
        entityId: recordId,
        details: `${actor.name} deleted performance record for ${targetRec?.employeeName || recordId} (${targetRec?.profileCode || ''} - ${targetRec?.week || ''}).`,
      });
    }
  }

  // --- SETTINGS CRUD ---
  static async getSettings(): Promise<SalesRewardSettings> {
    try {
      if (db) {
        const snap = await getDoc(doc(db, 'sales_settings', 'global_config'));
        if (snap.exists()) {
          const data = snap.data() as SalesRewardSettings;
          saveToStorage(SALES_LS_KEYS.SETTINGS, data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch settings failed:', e);
    }
    return getFromStorage<SalesRewardSettings>(SALES_LS_KEYS.SETTINGS, DEFAULT_SALES_SETTINGS);
  }

  static async saveSettings(
    settings: SalesRewardSettings,
    actor?: { id: string; name: string; role: string; email?: string }
  ): Promise<SalesRewardSettings> {
    if (!actor || !isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin can update targets, KPIs, and reward settings.');
    }

    const prev = await this.getSettings();
    const toSave: SalesRewardSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(SALES_LS_KEYS.SETTINGS, toSave);

    if (db) {
      try {
        await setDoc(doc(db, 'sales_settings', 'global_config'), toSave);
      } catch (e) {
        console.warn('Firestore save settings failed:', e);
      }
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'UPDATE_SALES_SETTINGS',
        entityType: 'settings',
        entityId: 'global_config',
        details: `${actor.name} updated Sales Targets, Scoring Weights, and Reward Slabs.`,
        previousValue: prev,
        newValue: toSave,
      });
    }

    return toSave;
  }

  static async resetSettingsToDefault(actor?: { id: string; name: string; role: string; email?: string }): Promise<SalesRewardSettings> {
    if (!actor || !isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin can reset sales targets and settings.');
    }
    return this.saveSettings(DEFAULT_SALES_SETTINGS, actor);
  }

  /**
   * Import Performance Records from CSV with Super Admin validation
   */
  static async importSalesCSV(
    csvText: string,
    actor?: { id: string; name: string; role: string; email?: string }
  ): Promise<{ success: boolean; count: number; errors: string[] }> {
    if (!actor || !isUserSuperAdmin(actor)) {
      throw new Error('403 Forbidden: Only Super Admin can import sales records via CSV.');
    }

    const employees = await this.getEmployees();
    const settings = await this.getSettings();
    const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length < 2) {
      return { success: false, count: 0, errors: ['CSV content is empty or contains only header.'] };
    }

    const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1);
    const errors: string[] = [];
    let savedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const lineNum = i + 2;
      const cols = rows[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 4) {
        errors.push(`Row ${lineNum}: Insufficient columns.`);
        continue;
      }

      const rowObj: Record<string, string> = {};
      header.forEach((h, idx) => {
        rowObj[h] = cols[idx] || '';
      });

      const empName = rowObj['employee'] || rowObj['name'] || rowObj['sales member'] || cols[0];
      const code = (rowObj['profile'] || rowObj['profilecode'] || cols[2] || 'PR').toUpperCase() as SalesProfileCode;
      const month = rowObj['month'] || cols[3] || 'September';
      const year = Number(rowObj['year']) || 2026;
      const week = rowObj['week'] || 'Week 1';
      const reachouts = Number(rowObj['total reachout'] || rowObj['reachout'] || rowObj['reachouts'] || cols[4] || 0);
      const conversions = Number(rowObj['order convert'] || rowObj['conversions'] || rowObj['orders'] || cols[5] || 0);
      const followups = Number(rowObj['follow-up sent'] || rowObj['followup sent'] || rowObj['followups'] || cols[7] || 0);
      const orderValue = Number(rowObj['order value'] || rowObj['ordervalue'] || rowObj['value'] || 0);

      const emp = employees.find(
        (e) => e.name.toLowerCase() === empName.toLowerCase() || (e.email && e.email.toLowerCase() === empName.toLowerCase())
      );

      if (!emp) {
        errors.push(`Row ${lineNum}: Member "${empName}" not found in Sales roster.`);
        continue;
      }

      const recordToCompute: SalesPerformanceRecord = {
        id: `sales_rec_${emp.id}_${code}_${week.replace(' ', '_')}_${month}_${year}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: ['PR', 'WR', 'HW'].includes(code) ? 'IT' : 'SMM',
        profileCode: code,
        week,
        month,
        year,
        monthYearKey: `${month} ${year}`,
        reachouts,
        conversions,
        followups,
        orderValue,
        conversionRate: 0,
        reachoutScore: 0,
        conversionScore: 0,
        followupScore: 0,
        orderValueScore: 0,
        totalPerformanceScore: 0,
        rewardEligibility: 'Not Eligible',
        rewardLevel: 'Standard',
        rewardAmount: 0,
        submittedBy: actor.name || 'Admin Import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const computed = computeCompleteSalesRecord(recordToCompute, settings);
      await this.saveRecord(computed, actor);
      savedCount++;
    }

    if (actor) {
      this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'IMPORT_SALES_RECORDS',
        entityType: 'record',
        entityId: 'csv_bulk_import',
        details: `${actor.name} imported ${savedCount} performance records via CSV.`,
      });
    }

    return {
      success: savedCount > 0,
      count: savedCount,
      errors,
    };
  }

  // --- AUDIT LOGS ---
  static async getAuditLogs(): Promise<SalesAuditLog[]> {
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'sales_audit_logs'));
        if (!snap.empty) {
          const logs = snap.docs.map((d) => d.data() as SalesAuditLog);
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          saveToStorage(SALES_LS_KEYS.AUDIT_LOGS, logs);
          return logs;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch audit logs failed:', e);
    }
    const local = getFromStorage<SalesAuditLog[]>(SALES_LS_KEYS.AUDIT_LOGS, []);
    return local.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async logAudit(entry: Omit<SalesAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const newLog: SalesAuditLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };

    const existing = getFromStorage<SalesAuditLog[]>(SALES_LS_KEYS.AUDIT_LOGS, []);
    const updated = [newLog, ...existing].slice(0, 500); // Keep latest 500
    saveToStorage(SALES_LS_KEYS.AUDIT_LOGS, updated);

    if (db) {
      try {
        await setDoc(doc(db, 'sales_audit_logs', newLog.id), newLog);
      } catch (e) {
        console.warn('Firestore audit log failed:', e);
      }
    }
  }

  // --- SECURITY VALIDATION ---
  /**
   * Validate if a user can record/edit performance for a specific profile and employee
   */
  static validatePerformancePermission(
    currentUser: { uid?: string; userId?: string; email?: string; name?: string; role?: string } | null | undefined,
    targetEmployeeId: string,
    profileCode: SalesProfileCode,
    employees: SalesEmployee[]
  ): { allowed: boolean; message?: string } {
    return validateRecordAccess(currentUser, targetEmployeeId, profileCode, employees);
  }

  // --- SUBSCRIPTIONS ---
  static subscribeToEmployees(callback: (employees: SalesEmployee[]) => void): Unsubscribe {
    if (!db) return () => {};
    try {
      return onSnapshot(collection(db, 'sales_employees'), (snap) => {
        const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []).map((d) => (d || '').toLowerCase());
        const items = snap.docs
          .map((d) => {
            const data = d.data() as SalesEmployee;
            const assigned = data.assignedProfiles && data.assignedProfiles.length > 0
              ? data.assignedProfiles
              : [data.profileCode || 'PR'];
            return {
              ...data,
              assignedProfiles: assigned,
              profileCode: assigned[0],
            };
          })
          .filter((e) => {
            if (!e) return false;
            const id = (e.id || '').toLowerCase();
            const uid = (e.userId || '').toLowerCase();
            const email = (e.email || '').toLowerCase();
            const name = (e.name || '').toLowerCase();
            return (
              !deleted.includes(id) &&
              (!uid || !deleted.includes(uid)) &&
              (!email || !deleted.includes(email)) &&
              (!name || !deleted.includes(name))
            );
          });
        saveToStorage(SALES_LS_KEYS.EMPLOYEES, items);
        callback(items);
      });
    } catch (e) {
      console.warn('Subscription error for sales employees:', e);
      return () => {};
    }
  }

  static subscribeToRecords(callback: (records: SalesPerformanceRecord[]) => void): Unsubscribe {
    if (!db) return () => {};
    try {
      return onSnapshot(collection(db, 'sales_records'), (snap) => {
        const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_RECORDS, []);
        const deletedEmp = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []).map((d) => (d || '').toLowerCase());
        const items = snap.docs
          .map((d) => d.data() as SalesPerformanceRecord)
          .filter((r) => {
            if (!r) return false;
            if (deleted.includes(r.id)) return false;
            const empId = (r.employeeId || '').toLowerCase();
            const empName = (r.employeeName || '').toLowerCase();
            return !deletedEmp.includes(empId) && !deletedEmp.includes(empName);
          });
        saveToStorage(SALES_LS_KEYS.RECORDS, items);
        callback(items);
      });
    } catch (e) {
      console.warn('Subscription error for sales records:', e);
      return () => {};
    }
  }

  static subscribeToSettings(callback: (settings: SalesRewardSettings) => void): Unsubscribe {
    if (!db) return () => {};
    try {
      return onSnapshot(doc(db, 'sales_settings', 'global_config'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SalesRewardSettings;
          saveToStorage(SALES_LS_KEYS.SETTINGS, data);
          callback(data);
        }
      });
    } catch (e) {
      console.warn('Subscription error for sales settings:', e);
      return () => {};
    }
  }
}
