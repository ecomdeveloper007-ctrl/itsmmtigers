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
} from '../types/sales';
import {
  DEFAULT_SALES_SETTINGS,
  computeCompleteSalesRecord,
  sanitizeSalesNumber,
} from './salesCalculationService';

const SALES_LS_KEYS = {
  EMPLOYEES: 'tiger_sales_employees_v2',
  RECORDS: 'tiger_sales_records_v2',
  SETTINGS: 'tiger_sales_settings_v2',
  DELETED_EMPLOYEES: 'tiger_sales_deleted_emp_v2',
  DELETED_RECORDS: 'tiger_sales_deleted_rec_v2',
  INITIALIZED: 'tiger_sales_init_v2',
};

/**
 * Initial Seed Sales Employees
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
    joiningDate: '2024-06-01',
    status: 'active',
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

/**
 * Helper to get data from LocalStorage
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
 * Generate initial sample performance records for August and September 2026
 */
function generateInitialRecords(): SalesPerformanceRecord[] {
  const settings = DEFAULT_SALES_SETTINGS;
  const records: SalesPerformanceRecord[] = [];

  // September 2026 Records
  const sepInputs = [
    { empId: 'sales_emp_1', name: 'Rahul Sharma', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 220, orders: 23, repeat: 9, followups: 115, remarks: 'Exceeded product solutions conversion targets.' },
    { empId: 'sales_emp_2', name: 'Anjali Patel', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 195, orders: 18, repeat: 7, followups: 92, remarks: 'Strong enterprise client delivery pipeline.' },
    { empId: 'sales_emp_3', name: 'Vikram Verma', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 185, orders: 19, repeat: 8, followups: 95, remarks: 'Great web architecture solution conversion.' },
    { empId: 'sales_emp_4', name: 'Sneha Kapoor', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 170, orders: 16, repeat: 6, followups: 85, remarks: 'Good frontend tech proposal closures.' },
    { empId: 'sales_emp_5', name: 'Amit Kumar', code: 'HW' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 155, orders: 16, repeat: 7, followups: 82, remarks: 'Closed high-value cloud infra contracts.' },
    { empId: 'sales_emp_6', name: 'Divya Nair', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 270, orders: 28, repeat: 11, followups: 130, remarks: 'Outstanding paid acquisition campaign returns.' },
    { empId: 'sales_emp_7', name: 'Rohan Mehta', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 240, orders: 22, repeat: 9, followups: 110, remarks: 'Solid direct response performance.' },
    { empId: 'sales_emp_8', name: 'Pooja Joshi', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 235, orders: 24, repeat: 10, followups: 118, remarks: 'Excellent social retainer renewals.' },
    { empId: 'sales_emp_9', name: 'Priya Singh', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 210, orders: 20, repeat: 8, followups: 105, remarks: 'Consistent brand retainer growth.' },
  ];

  sepInputs.forEach((inp) => {
    records.push(
      computeCompleteSalesRecord(
        {
          id: `sales_rec_${inp.empId}_September_2026`,
          employeeId: inp.empId,
          employeeName: inp.name,
          department: inp.dept,
          profileCode: inp.code,
          month: 'September',
          year: 2026,
          totalReachout: inp.reachout,
          orderConvert: inp.orders,
          repeatOrders: inp.repeat,
          followupSent: inp.followups,
          managerRemarks: inp.remarks,
          submittedBy: 'Admin',
        },
        settings
      )
    );
  });

  // August 2026 Records (for history & comparison)
  const augInputs = [
    { empId: 'sales_emp_1', name: 'Rahul Sharma', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 205, orders: 20, repeat: 8, followups: 102, remarks: 'Target reached.' },
    { empId: 'sales_emp_2', name: 'Anjali Patel', code: 'PR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 180, orders: 16, repeat: 6, followups: 88, remarks: 'Stable performance.' },
    { empId: 'sales_emp_3', name: 'Vikram Verma', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 175, orders: 17, repeat: 7, followups: 88, remarks: 'Good reach.' },
    { empId: 'sales_emp_4', name: 'Sneha Kapoor', code: 'WR' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 160, orders: 14, repeat: 5, followups: 80, remarks: 'Solid start.' },
    { empId: 'sales_emp_5', name: 'Amit Kumar', code: 'HW' as SalesProfileCode, dept: 'IT' as SalesDepartment, reachout: 140, orders: 13, repeat: 5, followups: 75, remarks: 'Infra sales.' },
    { empId: 'sales_emp_6', name: 'Divya Nair', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 250, orders: 24, repeat: 9, followups: 115, remarks: 'Top performance in SMM.' },
    { empId: 'sales_emp_7', name: 'Rohan Mehta', code: 'DR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 225, orders: 19, repeat: 7, followups: 100, remarks: 'Good month.' },
    { empId: 'sales_emp_8', name: 'Pooja Joshi', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 215, orders: 21, repeat: 8, followups: 105, remarks: 'Retainer growth.' },
    { empId: 'sales_emp_9', name: 'Priya Singh', code: 'RR' as SalesProfileCode, dept: 'SMM' as SalesDepartment, reachout: 195, orders: 17, repeat: 7, followups: 98, remarks: 'Steady retainers.' },
  ];

  augInputs.forEach((inp) => {
    records.push(
      computeCompleteSalesRecord(
        {
          id: `sales_rec_${inp.empId}_August_2026`,
          employeeId: inp.empId,
          employeeName: inp.name,
          department: inp.dept,
          profileCode: inp.code,
          month: 'August',
          year: 2026,
          totalReachout: inp.reachout,
          orderConvert: inp.orders,
          repeatOrders: inp.repeat,
          followupSent: inp.followups,
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
   * Initialize Sales collections
   */
  static async initializeSalesData(): Promise<void> {
    try {
      const isInitialized = localStorage.getItem(SALES_LS_KEYS.INITIALIZED);
      const deletedEmp = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []);

      // Pull tombstones from Firestore if available
      if (db) {
        try {
          const tombSnap = await getDoc(doc(db, 'sales_settings', 'deleted_metadata'));
          if (tombSnap.exists()) {
            const fsDeleted = (tombSnap.data()?.deletedEmployeeIds as string[]) || [];
            for (const id of fsDeleted) {
              if (id && !deletedEmp.includes(id)) {
                deletedEmp.push(id);
              }
            }
            saveToStorage(SALES_LS_KEYS.DELETED_EMPLOYEES, deletedEmp);
          }
        } catch (e) {
          console.warn('Could not read Firestore tombstones:', e);
        }
      }

      if (!isInitialized) {
        // Seed default dataset only on absolute first setup if storage is not set
        const storedEmp = getFromStorage<SalesEmployee[] | null>(SALES_LS_KEYS.EMPLOYEES, null);
        if (storedEmp === null && deletedEmp.length === 0) {
          saveToStorage(SALES_LS_KEYS.EMPLOYEES, INITIAL_SALES_EMPLOYEES);
        }

        const storedRecords = getFromStorage<SalesPerformanceRecord[] | null>(SALES_LS_KEYS.RECORDS, null);
        if (storedRecords === null) {
          saveToStorage(SALES_LS_KEYS.RECORDS, generateInitialRecords());
        }

        const storedSettings = getFromStorage<SalesRewardSettings | null>(SALES_LS_KEYS.SETTINGS, null);
        if (!storedSettings) {
          saveToStorage(SALES_LS_KEYS.SETTINGS, DEFAULT_SALES_SETTINGS);
        }

        localStorage.setItem(SALES_LS_KEYS.INITIALIZED, 'true');
      }

      // Sync with Firestore if available (only once upon system creation)
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
              version: '2.0',
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

    try {
      if (db) {
        const snap = await getDocs(collection(db, 'sales_employees'));
        if (!snap.empty) {
          const items = snap.docs
            .map((d) => d.data() as SalesEmployee)
            .filter((e) => !isDeleted(e));
          saveToStorage(SALES_LS_KEYS.EMPLOYEES, items);
          return items;
        }
      }
    } catch (e) {
      console.warn('Firestore fetch employees failed, fallback to local storage:', e);
    }
    const local = getFromStorage<SalesEmployee[]>(SALES_LS_KEYS.EMPLOYEES, []);
    return local.filter((e) => !isDeleted(e));
  }

  static async saveEmployee(employee: SalesEmployee): Promise<SalesEmployee> {
    const all = await this.getEmployees();
    const idx = all.findIndex((e) => e.id === employee.id);
    let updated: SalesEmployee[];
    const employeeWithTimestamp: SalesEmployee = {
      ...employee,
      updatedAt: new Date().toISOString(),
    };

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

    return employeeWithTimestamp;
  }

  static async deleteEmployee(empId: string): Promise<void> {
    const cleanId = (empId || '').trim();
    if (!cleanId) return;
    const cleanIdLower = cleanId.toLowerCase();

    // 1. Collect all identifiers from local storage and firestore
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

    // 4. Remove all associated performance records for this employee
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
    moduleAssignment?: 'pm' | 'sales' | 'both';
    status?: string;
    joiningDate?: string;
  }): Promise<SalesEmployee> {
    const rawSalesProfile = user.salesProfileCode || (user.profileCode as SalesProfileCode);
    let resolvedProfile: SalesProfileCode = 'PR';
    if (rawSalesProfile && ['PR', 'WR', 'HW', 'DR', 'RR'].includes(rawSalesProfile)) {
      resolvedProfile = rawSalesProfile;
    } else if (user.salesDepartment === 'SMM' || user.team === 'SMM' || user.department?.toLowerCase().includes('smm')) {
      resolvedProfile = 'DR';
    } else {
      resolvedProfile = 'PR';
    }

    const resolvedDept: SalesDepartment =
      user.salesDepartment || (['PR', 'WR', 'HW'].includes(resolvedProfile) ? 'IT' : 'SMM');

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
      profileCode: resolvedProfile,
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

  // --- RECORDS CRUD ---
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

  static async saveRecord(record: SalesPerformanceRecord): Promise<SalesPerformanceRecord> {
    const all = await this.getRecords();
    const idx = all.findIndex((r) => r.id === record.id || (r.employeeId === record.employeeId && r.month === record.month && Number(r.year) === Number(record.year)));

    let updated: SalesPerformanceRecord[];
    const recToSave: SalesPerformanceRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
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

    return recToSave;
  }

  static async deleteRecord(recordId: string): Promise<void> {
    const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_RECORDS, []);
    if (!deleted.includes(recordId)) {
      deleted.push(recordId);
      saveToStorage(SALES_LS_KEYS.DELETED_RECORDS, deleted);
    }

    const all = await this.getRecords();
    const filtered = all.filter((r) => r.id !== recordId);
    saveToStorage(SALES_LS_KEYS.RECORDS, filtered);

    if (db) {
      try {
        await deleteDoc(doc(db, 'sales_records', recordId));
      } catch (e) {
        console.warn('Firestore delete record failed:', e);
      }
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

  static async saveSettings(settings: SalesRewardSettings): Promise<SalesRewardSettings> {
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

    return toSave;
  }

  static async resetSettingsToDefault(): Promise<SalesRewardSettings> {
    return this.saveSettings(DEFAULT_SALES_SETTINGS);
  }

  // --- SUBSCRIPTIONS ---
  static subscribeToEmployees(callback: (employees: SalesEmployee[]) => void): Unsubscribe {
    if (!db) {
      return () => {};
    }
    try {
      return onSnapshot(collection(db, 'sales_employees'), (snap) => {
        const deleted = getFromStorage<string[]>(SALES_LS_KEYS.DELETED_EMPLOYEES, []).map((d) => (d || '').toLowerCase());
        const items = snap.docs
          .map((d) => d.data() as SalesEmployee)
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
    if (!db) {
      return () => {};
    }
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
    if (!db) {
      return () => {};
    }
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

  // --- IMPORT / EXPORT CSV ---
  static parseSalesCSV(
    csvContent: string,
    existingEmployees: SalesEmployee[],
    settings: SalesRewardSettings,
    defaultMonth: string,
    defaultYear: number
  ): { records: SalesPerformanceRecord[]; newEmployees: SalesEmployee[]; errors: string[] } {
    const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const errors: string[] = [];
    const parsedRecords: SalesPerformanceRecord[] = [];
    const newEmployeesMap = new Map<string, SalesEmployee>();

    if (lines.length <= 1) {
      errors.push('The CSV file is empty or missing data rows.');
      return { records: [], newEmployees: [], errors };
    }

    const header = lines[0].toLowerCase();
    const columns = header.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));

    // Find indices
    const nameIdx = columns.findIndex((c) => c.includes('employee') || c.includes('name'));
    const deptIdx = columns.findIndex((c) => c.includes('dept') || c.includes('department'));
    const profileIdx = columns.findIndex((c) => c.includes('profile') || c.includes('code'));
    const monthIdx = columns.findIndex((c) => c.includes('month'));
    const reachoutIdx = columns.findIndex((c) => c.includes('reachout') || c.includes('reach'));
    const orderIdx = columns.findIndex((c) => c.includes('convert') || c.includes('order'));
    const repeatIdx = columns.findIndex((c) => c.includes('repeat'));
    const followupIdx = columns.findIndex((c) => c.includes('follow') || c.includes('followup'));

    if (nameIdx === -1 || reachoutIdx === -1 || orderIdx === -1) {
      errors.push('CSV must include at least: Employee Name, Total Reachout, and Order Convert columns.');
      return { records: [], newEmployees: [], errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (row.length < 3 || !row[nameIdx]) continue;

      const empName = row[nameIdx];
      let profileCode = (profileIdx >= 0 && row[profileIdx] ? row[profileIdx].toUpperCase() : 'PR') as SalesProfileCode;
      if (!['PR', 'WR', 'HW', 'DR', 'RR'].includes(profileCode)) {
        profileCode = 'PR';
      }

      let department: SalesDepartment = ['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM';
      if (deptIdx >= 0 && row[deptIdx]) {
        const d = row[deptIdx].toUpperCase();
        if (d.includes('IT')) department = 'IT';
        else if (d.includes('SMM')) department = 'SMM';
      }

      const month = monthIdx >= 0 && row[monthIdx] ? row[monthIdx] : defaultMonth;
      const year = defaultYear;
      const reachout = sanitizeSalesNumber(row[reachoutIdx]);
      const orders = sanitizeSalesNumber(row[orderIdx]);
      const repeat = repeatIdx >= 0 ? sanitizeSalesNumber(row[repeatIdx]) : 0;
      const followups = followupIdx >= 0 ? sanitizeSalesNumber(row[followupIdx]) : 0;

      // Find or create employee
      let emp = existingEmployees.find((e) => e.name.toLowerCase() === empName.toLowerCase());
      if (!emp && !newEmployeesMap.has(empName.toLowerCase())) {
        const newEmp: SalesEmployee = {
          id: `sales_emp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: empName,
          email: `${empName.toLowerCase().replace(/\s+/g, '.')}@itsmmtigers.com`,
          department,
          profileCode,
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newEmployeesMap.set(empName.toLowerCase(), newEmp);
        emp = newEmp;
      } else if (!emp) {
        emp = newEmployeesMap.get(empName.toLowerCase());
      }

      const rec = computeCompleteSalesRecord(
        {
          id: `sales_rec_${emp?.id || 'emp'}_${month}_${year}`,
          employeeId: emp?.id || `sales_emp_${Date.now()}`,
          employeeName: empName,
          department,
          profileCode,
          month,
          year,
          totalReachout: reachout,
          orderConvert: orders,
          repeatOrders: repeat,
          followupSent: followups,
          submittedBy: 'CSV Import',
        },
        settings
      );

      parsedRecords.push(rec);
    }

    return {
      records: parsedRecords,
      newEmployees: Array.from(newEmployeesMap.values()),
      errors,
    };
  }
}
