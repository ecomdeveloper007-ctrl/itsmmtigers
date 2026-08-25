import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  UserProfile,
  KPIConfig,
  PerformancePeriod,
  PerformanceRecord,
  AuditLog,
  AppSettings,
  UserRole,
} from '../types';
import { DEFAULT_KPIS, DEFAULT_SETTINGS, sanitizeNumber } from './calculationService';

// Fallback Local Storage Keys for resilience & speed
const LS_KEYS = {
  USERS: 'tiger_users_v2',
  KPIS: 'tiger_kpis_v2',
  PERIODS: 'tiger_periods_v2',
  RECORDS: 'tiger_records_v2',
  SETTINGS: 'tiger_settings_v2',
  AUDIT: 'tiger_audit_v2',
};

// Initial Seed Users
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_superadmin',
    userId: 'superadmin',
    name: 'Chief Admin (Tiger Command)',
    email: 'superadmin@itsmmtigers.com',
    role: 'super_admin',
    status: 'active',
    department: 'Leadership & Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-01-01',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_admin',
    userId: 'admin',
    name: 'Aditi Roy (Ops Admin)',
    email: 'admin@itsmmtigers.com',
    role: 'admin',
    status: 'active',
    department: 'Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-03-15',
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_divya',
    userId: 'divya.bhardwaj',
    name: 'Divya Bhardwaj',
    email: 'divya@itsmmtigers.com',
    role: 'team_member',
    status: 'active',
    department: 'SMM Enterprise',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-05-10',
    createdAt: '2025-05-10T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_mohita',
    userId: 'mohita.sharma',
    name: 'Mohita Sharma',
    email: 'mohita@itsmmtigers.com',
    role: 'team_member',
    status: 'active',
    department: 'SMM Growth',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-06-01',
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_naveen',
    userId: 'naveen.jakhar',
    name: 'Naveen Jakhar',
    email: 'naveen@itsmmtigers.com',
    role: 'team_member',
    status: 'active',
    department: 'SMM Accounts',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-07-15',
    createdAt: '2025-07-15T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_rahul',
    userId: 'rahul.verma',
    name: 'Rahul Verma',
    email: 'rahul@itsmmtigers.com',
    role: 'team_member',
    status: 'active',
    department: 'SMM Creative & Client',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-08-01',
    createdAt: '2025-08-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_priya',
    userId: 'priya.patel',
    name: 'Priya Patel',
    email: 'priya@itsmmtigers.com',
    role: 'team_member',
    status: 'active',
    department: 'SMM Strategy',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-09-10',
    createdAt: '2025-09-10T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
];

// Initial Performance Periods (August 2026 Week 1-4)
export const INITIAL_PERIODS: PerformancePeriod[] = [
  {
    id: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    weekNumber: 1,
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    status: 'active',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'period_2026_08_w2',
    month: 'August',
    year: 2026,
    weekName: 'Week 2',
    weekNumber: 2,
    startDate: '2026-08-08',
    endDate: '2026-08-14',
    status: 'active',
    createdAt: '2026-08-08T00:00:00.000Z',
  },
  {
    id: 'period_2026_08_w3',
    month: 'August',
    year: 2026,
    weekName: 'Week 3',
    weekNumber: 3,
    startDate: '2026-08-15',
    endDate: '2026-08-21',
    status: 'active',
    createdAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'period_2026_08_w4',
    month: 'August',
    year: 2026,
    weekName: 'Week 4',
    weekNumber: 4,
    startDate: '2026-08-22',
    endDate: '2026-08-28',
    status: 'active',
    createdAt: '2026-08-22T00:00:00.000Z',
  },
];

// Initial Performance Records matching the test data
// Divya Bhardwaj: Total -> Projects: 14, Rev: 6272, Upsell: 6, Rating: 5, Followup: 55, Repeat: 6 -> Final 68.02
// Mohita Sharma: Total -> Projects: 13, Rev: 5790, Upsell: 8, Rating: 5, Followup: 26, Repeat: 4 -> Final 60.97
// Naveen Jakhar: Total -> Projects: 8, Rev: 4275, Upsell: 5, Rating: 5, Followup: 3, Repeat: 3 -> Final 41.83
export const INITIAL_RECORDS: PerformanceRecord[] = [
  // Divya Bhardwaj (Week 1 - Week 4)
  {
    id: 'rec_divya_w1',
    userId: 'user_divya',
    userName: 'Divya Bhardwaj',
    periodId: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    projectClosed: 4,
    revenueGenerated: 1500,
    upsells: 2,
    clientRating: 5,
    followupsCompleted: 15,
    repeatClients: 2,
    notes: 'Strong campaign launches and retainer renewal',
    submittedBy: 'divya.bhardwaj',
    createdAt: '2026-08-07T18:00:00.000Z',
    updatedAt: '2026-08-07T18:00:00.000Z',
  },
  {
    id: 'rec_divya_w2',
    userId: 'user_divya',
    userName: 'Divya Bhardwaj',
    periodId: 'period_2026_08_w2',
    month: 'August',
    year: 2026,
    weekName: 'Week 2',
    projectClosed: 3,
    revenueGenerated: 1772,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 12,
    repeatClients: 1,
    notes: 'Organic reach packages closed',
    submittedBy: 'divya.bhardwaj',
    createdAt: '2026-08-14T18:00:00.000Z',
    updatedAt: '2026-08-14T18:00:00.000Z',
  },
  {
    id: 'rec_divya_w3',
    userId: 'user_divya',
    userName: 'Divya Bhardwaj',
    periodId: 'period_2026_08_w3',
    month: 'August',
    year: 2026,
    weekName: 'Week 3',
    projectClosed: 4,
    revenueGenerated: 1600,
    upsells: 2,
    clientRating: 5,
    followupsCompleted: 18,
    repeatClients: 2,
    notes: 'Influencer campaign cross-sell',
    submittedBy: 'divya.bhardwaj',
    createdAt: '2026-08-21T18:00:00.000Z',
    updatedAt: '2026-08-21T18:00:00.000Z',
  },
  {
    id: 'rec_divya_w4',
    userId: 'user_divya',
    userName: 'Divya Bhardwaj',
    periodId: 'period_2026_08_w4',
    month: 'August',
    year: 2026,
    weekName: 'Week 4',
    projectClosed: 3,
    revenueGenerated: 1400,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 10,
    repeatClients: 1,
    notes: 'Month-end deliverables completed',
    submittedBy: 'divya.bhardwaj',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  },

  // Mohita Sharma (Week 1 - Week 4)
  {
    id: 'rec_mohita_w1',
    userId: 'user_mohita',
    userName: 'Mohita Sharma',
    periodId: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    projectClosed: 3,
    revenueGenerated: 1400,
    upsells: 2,
    clientRating: 5,
    followupsCompleted: 6,
    repeatClients: 1,
    notes: 'Brand audit signups',
    submittedBy: 'mohita.sharma',
    createdAt: '2026-08-07T17:30:00.000Z',
    updatedAt: '2026-08-07T17:30:00.000Z',
  },
  {
    id: 'rec_mohita_w2',
    userId: 'user_mohita',
    userName: 'Mohita Sharma',
    periodId: 'period_2026_08_w2',
    month: 'August',
    year: 2026,
    weekName: 'Week 2',
    projectClosed: 4,
    revenueGenerated: 1590,
    upsells: 3,
    clientRating: 5,
    followupsCompleted: 8,
    repeatClients: 1,
    notes: 'Growth tier upgrade',
    submittedBy: 'mohita.sharma',
    createdAt: '2026-08-14T17:30:00.000Z',
    updatedAt: '2026-08-14T17:30:00.000Z',
  },
  {
    id: 'rec_mohita_w3',
    userId: 'user_mohita',
    userName: 'Mohita Sharma',
    periodId: 'period_2026_08_w3',
    month: 'August',
    year: 2026,
    weekName: 'Week 3',
    projectClosed: 3,
    revenueGenerated: 1300,
    upsells: 2,
    clientRating: 5,
    followupsCompleted: 7,
    repeatClients: 1,
    notes: 'Video marketing upsell package',
    submittedBy: 'mohita.sharma',
    createdAt: '2026-08-21T17:30:00.000Z',
    updatedAt: '2026-08-21T17:30:00.000Z',
  },
  {
    id: 'rec_mohita_w4',
    userId: 'user_mohita',
    userName: 'Mohita Sharma',
    periodId: 'period_2026_08_w4',
    month: 'August',
    year: 2026,
    weekName: 'Week 4',
    projectClosed: 3,
    revenueGenerated: 1500,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 5,
    repeatClients: 1,
    notes: 'E-commerce social push',
    submittedBy: 'mohita.sharma',
    createdAt: '2026-08-25T11:00:00.000Z',
    updatedAt: '2026-08-25T11:00:00.000Z',
  },

  // Naveen Jakhar (Week 1 - Week 4)
  {
    id: 'rec_naveen_w1',
    userId: 'user_naveen',
    userName: 'Naveen Jakhar',
    periodId: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    projectClosed: 2,
    revenueGenerated: 1000,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 1,
    repeatClients: 1,
    notes: 'Local businesses digital ads setup',
    submittedBy: 'naveen.jakhar',
    createdAt: '2026-08-07T16:00:00.000Z',
    updatedAt: '2026-08-07T16:00:00.000Z',
  },
  {
    id: 'rec_naveen_w2',
    userId: 'user_naveen',
    userName: 'Naveen Jakhar',
    periodId: 'period_2026_08_w2',
    month: 'August',
    year: 2026,
    weekName: 'Week 2',
    projectClosed: 2,
    revenueGenerated: 1100,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 1,
    repeatClients: 1,
    notes: 'Ad creatives refresh',
    submittedBy: 'naveen.jakhar',
    createdAt: '2026-08-14T16:00:00.000Z',
    updatedAt: '2026-08-14T16:00:00.000Z',
  },
  {
    id: 'rec_naveen_w3',
    userId: 'user_naveen',
    userName: 'Naveen Jakhar',
    periodId: 'period_2026_08_w3',
    month: 'August',
    year: 2026,
    weekName: 'Week 3',
    projectClosed: 2,
    revenueGenerated: 1175,
    upsells: 2,
    clientRating: 5,
    followupsCompleted: 0,
    repeatClients: 0,
    notes: 'Lead gen optimizations',
    submittedBy: 'naveen.jakhar',
    createdAt: '2026-08-21T16:00:00.000Z',
    updatedAt: '2026-08-21T16:00:00.000Z',
  },
  {
    id: 'rec_naveen_w4',
    userId: 'user_naveen',
    userName: 'Naveen Jakhar',
    periodId: 'period_2026_08_w4',
    month: 'August',
    year: 2026,
    weekName: 'Week 4',
    projectClosed: 2,
    revenueGenerated: 1000,
    upsells: 1,
    clientRating: 5,
    followupsCompleted: 1,
    repeatClients: 1,
    notes: 'Content scheduling',
    submittedBy: 'naveen.jakhar',
    createdAt: '2026-08-25T12:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
  },

  // Rahul Verma (Week 1 - Week 3)
  {
    id: 'rec_rahul_w1',
    userId: 'user_rahul',
    userName: 'Rahul Verma',
    periodId: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    projectClosed: 2,
    revenueGenerated: 950,
    upsells: 1,
    clientRating: 4.5,
    followupsCompleted: 10,
    repeatClients: 1,
    notes: 'Reels strategy contracts',
    submittedBy: 'rahul.verma',
    createdAt: '2026-08-07T15:00:00.000Z',
    updatedAt: '2026-08-07T15:00:00.000Z',
  },
  {
    id: 'rec_rahul_w2',
    userId: 'user_rahul',
    userName: 'Rahul Verma',
    periodId: 'period_2026_08_w2',
    month: 'August',
    year: 2026,
    weekName: 'Week 2',
    projectClosed: 3,
    revenueGenerated: 1200,
    upsells: 2,
    clientRating: 4.8,
    followupsCompleted: 14,
    repeatClients: 1,
    notes: 'SEO & social blend bundle',
    submittedBy: 'rahul.verma',
    createdAt: '2026-08-14T15:00:00.000Z',
    updatedAt: '2026-08-14T15:00:00.000Z',
  },

  // Priya Patel (Week 1 - Week 2)
  {
    id: 'rec_priya_w1',
    userId: 'user_priya',
    userName: 'Priya Patel',
    periodId: 'period_2026_08_w1',
    month: 'August',
    year: 2026,
    weekName: 'Week 1',
    projectClosed: 3,
    revenueGenerated: 1150,
    upsells: 1,
    clientRating: 4.7,
    followupsCompleted: 8,
    repeatClients: 1,
    notes: 'Brand positioning audits',
    submittedBy: 'priya.patel',
    createdAt: '2026-08-07T14:30:00.000Z',
    updatedAt: '2026-08-07T14:30:00.000Z',
  },
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    userId: 'user_superadmin',
    userName: 'Chief Admin (Tiger Command)',
    userRole: 'super_admin',
    action: 'System Initialized',
    entityType: 'settings',
    entityId: 'settings_default',
    details: 'Configured default IT SMM Tigers KPI weights and August 2026 periods',
    timestamp: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'log_002',
    userId: 'user_divya',
    userName: 'Divya Bhardwaj',
    userRole: 'team_member',
    action: 'Performance Submitted',
    entityType: 'performance',
    entityId: 'rec_divya_w4',
    details: 'Submitted Week 4 performance (Projects: 3, Revenue: $1,400)',
    timestamp: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'log_003',
    userId: 'user_admin',
    userName: 'Aditi Roy (Ops Admin)',
    userRole: 'admin',
    action: 'Leaderboard Verified',
    entityType: 'performance',
    entityId: 'august_2026_board',
    details: 'Verified August 2026 performance standing (Leader: Divya Bhardwaj - 68.02)',
    timestamp: '2026-08-25T12:30:00.000Z',
  },
];

/**
 * Helper to get data from LocalStorage
 */
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
  }
  return fallback;
}

/**
 * Helper to save data to LocalStorage
 */
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

/**
 * Service Class for Firestore & Local Persistence
 */
export class DataService {
  private static isInitialized = false;

  /**
   * Initialize and seed database if necessary
   */
  public static async initializeData(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if firestore has users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      if (usersSnap.empty) {
        // Seed users in firestore
        for (const user of INITIAL_USERS) {
          await setDoc(doc(db, 'users', user.uid), user);
        }

        // Seed KPIs
        for (const kpi of DEFAULT_KPIS) {
          await setDoc(doc(db, 'kpiSettings', kpi.id), kpi);
        }

        // Seed Periods
        for (const period of INITIAL_PERIODS) {
          await setDoc(doc(db, 'performancePeriods', period.id), period);
        }

        // Seed Records
        for (const rec of INITIAL_RECORDS) {
          await setDoc(doc(db, 'performanceRecords', rec.id), rec);
        }

        // Seed Settings
        await setDoc(doc(db, 'settings', 'global'), DEFAULT_SETTINGS);

        // Seed Audit
        for (const log of INITIAL_AUDIT_LOGS) {
          await setDoc(doc(db, 'auditLogs', log.id), log);
        }
      }
    } catch (e) {
      console.warn('Firestore initial check failed, using local storage cache fallback:', e);
    }

    // Ensure LocalStorage is populated
    if (!localStorage.getItem(LS_KEYS.USERS)) {
      saveToStorage(LS_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(LS_KEYS.KPIS)) {
      saveToStorage(LS_KEYS.KPIS, DEFAULT_KPIS);
    }
    if (!localStorage.getItem(LS_KEYS.PERIODS)) {
      saveToStorage(LS_KEYS.PERIODS, INITIAL_PERIODS);
    }
    if (!localStorage.getItem(LS_KEYS.RECORDS)) {
      saveToStorage(LS_KEYS.RECORDS, INITIAL_RECORDS);
    }
    if (!localStorage.getItem(LS_KEYS.SETTINGS)) {
      saveToStorage(LS_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(LS_KEYS.AUDIT)) {
      saveToStorage(LS_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    }

    this.isInitialized = true;
  }

  // ================= USERS =================

  public static async getUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const users = snap.docs.map((d) => d.data() as UserProfile);
        saveToStorage(LS_KEYS.USERS, users);
        return users;
      }
    } catch (e) {
      console.warn('Firestore getUsers error, using cache:', e);
    }
    return getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
  }

  public static async saveUser(user: UserProfile, actor: { id: string; name: string; role: UserRole }): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.uid), user);
    } catch (e) {
      console.warn('Firestore saveUser error:', e);
    }

    // Local Storage update
    const users = getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
    const idx = users.findIndex((u) => u.uid === user.uid || u.userId === user.userId);
    const isNew = idx < 0;
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveToStorage(LS_KEYS.USERS, users);

    // Audit Log
    await this.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: isNew ? 'User Created' : 'User Updated',
      entityType: 'user',
      entityId: user.uid,
      details: `${isNew ? 'Created' : 'Updated'} user ${user.name} (${user.userId}, Role: ${user.role}, Status: ${user.status})`,
      newValue: user,
    });
  }

  public static async toggleUserStatus(
    userId: string,
    newStatus: 'active' | 'disabled',
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore toggleUserStatus error:', e);
    }

    const users = getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
    const u = users.find((x) => x.uid === userId || x.userId === userId);
    if (u) {
      u.status = newStatus;
      u.updatedAt = new Date().toISOString();
      saveToStorage(LS_KEYS.USERS, users);

      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: newStatus === 'active' ? 'User Enabled' : 'User Disabled',
        entityType: 'user',
        entityId: userId,
        details: `Changed status of ${u.name} to ${newStatus}`,
      });
    }
  }

  // ================= KPIS =================

  public static async getKPIs(): Promise<KPIConfig[]> {
    try {
      const snap = await getDocs(collection(db, 'kpiSettings'));
      if (!snap.empty) {
        const kpis = snap.docs.map((d) => d.data() as KPIConfig).sort((a, b) => a.order - b.order);
        saveToStorage(LS_KEYS.KPIS, kpis);
        return kpis;
      }
    } catch (e) {
      console.warn('Firestore getKPIs error:', e);
    }
    return getFromStorage<KPIConfig[]>(LS_KEYS.KPIS, DEFAULT_KPIS);
  }

  public static async saveKPIs(
    kpis: KPIConfig[],
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      for (const kpi of kpis) {
        await setDoc(doc(db, 'kpiSettings', kpi.id), kpi);
      }
    } catch (e) {
      console.warn('Firestore saveKPIs error:', e);
    }

    saveToStorage(LS_KEYS.KPIS, kpis);

    await this.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'KPI Configuration Updated',
      entityType: 'kpi',
      entityId: 'kpi_all',
      details: `Updated KPI weights & targets (Total weight: ${kpis.filter((k) => k.active).reduce((s, k) => s + k.weight, 0)}%)`,
      newValue: kpis,
    });
  }

  // ================= PERIODS =================

  public static async getPeriods(): Promise<PerformancePeriod[]> {
    try {
      const snap = await getDocs(collection(db, 'performancePeriods'));
      if (!snap.empty) {
        const periods = snap.docs
          .map((d) => d.data() as PerformancePeriod)
          .sort((a, b) => b.year - a.year || a.weekNumber - b.weekNumber);
        saveToStorage(LS_KEYS.PERIODS, periods);
        return periods;
      }
    } catch (e) {
      console.warn('Firestore getPeriods error:', e);
    }
    return getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
  }

  public static async savePeriod(
    period: PerformancePeriod,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'performancePeriods', period.id), period);
    } catch (e) {
      console.warn('Firestore savePeriod error:', e);
    }

    const periods = getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
    const idx = periods.findIndex((p) => p.id === period.id);
    if (idx >= 0) {
      periods[idx] = period;
    } else {
      periods.push(period);
    }
    saveToStorage(LS_KEYS.PERIODS, periods);

    await this.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Performance Period Saved',
      entityType: 'period',
      entityId: period.id,
      details: `Saved period ${period.month} ${period.year} - ${period.weekName} (Status: ${period.status})`,
      newValue: period,
    });
  }

  public static async togglePeriodLock(
    periodId: string,
    newStatus: 'active' | 'locked',
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'performancePeriods', periodId), {
        status: newStatus,
      });
    } catch (e) {
      console.warn('Firestore togglePeriodLock error:', e);
    }

    const periods = getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
    const p = periods.find((x) => x.id === periodId);
    if (p) {
      p.status = newStatus;
      saveToStorage(LS_KEYS.PERIODS, periods);

      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: newStatus === 'locked' ? 'Period Locked' : 'Period Unlocked',
        entityType: 'period',
        entityId: periodId,
        details: `${newStatus === 'locked' ? 'Locked' : 'Unlocked'} ${p.month} ${p.year} - ${p.weekName}`,
      });
    }
  }

  // ================= RECORDS =================

  public static async getRecords(): Promise<PerformanceRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'performanceRecords'));
      if (!snap.empty) {
        const records = snap.docs.map((d) => d.data() as PerformanceRecord);
        saveToStorage(LS_KEYS.RECORDS, records);
        return records;
      }
    } catch (e) {
      console.warn('Firestore getRecords error:', e);
    }
    return getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, INITIAL_RECORDS);
  }

  public static async saveRecord(
    record: PerformanceRecord,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    // Sanitize all numeric fields automatically to guarantee 0 for empty/NaN
    const cleanRecord: PerformanceRecord = {
      ...record,
      projectClosed: sanitizeNumber(record.projectClosed),
      revenueGenerated: sanitizeNumber(record.revenueGenerated),
      upsells: sanitizeNumber(record.upsells),
      clientRating: sanitizeNumber(record.clientRating, true),
      followupsCompleted: sanitizeNumber(record.followupsCompleted),
      repeatClients: sanitizeNumber(record.repeatClients),
      updatedAt: new Date().toISOString(),
      createdAt: record.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'performanceRecords', cleanRecord.id), cleanRecord);
    } catch (e) {
      console.warn('Firestore saveRecord error:', e);
    }

    const records = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, INITIAL_RECORDS);
    const idx = records.findIndex((r) => r.id === cleanRecord.id);
    const isNew = idx < 0;
    const oldVal = idx >= 0 ? records[idx] : undefined;

    if (idx >= 0) {
      records[idx] = cleanRecord;
    } else {
      records.push(cleanRecord);
    }
    saveToStorage(LS_KEYS.RECORDS, records);

    await this.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: isNew ? 'Performance Record Created' : 'Performance Record Updated',
      entityType: 'performance',
      entityId: cleanRecord.id,
      details: `${isNew ? 'Added' : 'Updated'} data for ${cleanRecord.userName} (${cleanRecord.weekName}): Projects: ${cleanRecord.projectClosed}, Rev: $${cleanRecord.revenueGenerated}, Upsells: ${cleanRecord.upsells}, Rating: ${cleanRecord.clientRating}, Follow-ups: ${cleanRecord.followupsCompleted}, Repeat: ${cleanRecord.repeatClients}`,
      oldValue: oldVal,
      newValue: cleanRecord,
    });
  }

  public static async deleteRecord(
    recordId: string,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      await deleteDoc(doc(db, 'performanceRecords', recordId));
    } catch (e) {
      console.warn('Firestore deleteRecord error:', e);
    }

    const records = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, INITIAL_RECORDS);
    const existing = records.find((r) => r.id === recordId);
    const filtered = records.filter((r) => r.id !== recordId);
    saveToStorage(LS_KEYS.RECORDS, filtered);

    if (existing) {
      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'Performance Record Deleted',
        entityType: 'performance',
        entityId: recordId,
        details: `Deleted record of ${existing.userName} for ${existing.weekName} ${existing.month} ${existing.year}`,
        oldValue: existing,
      });
    }
  }

  // ================= SETTINGS =================

  public static async getSettings(): Promise<AppSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        const settings = snap.data() as AppSettings;
        saveToStorage(LS_KEYS.SETTINGS, settings);
        return settings;
      }
    } catch (e) {
      console.warn('Firestore getSettings error:', e);
    }
    return getFromStorage<AppSettings>(LS_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public static async saveSettings(
    settings: AppSettings,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
    } catch (e) {
      console.warn('Firestore saveSettings error:', e);
    }

    saveToStorage(LS_KEYS.SETTINGS, settings);

    await this.logAudit({
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: 'Application Settings Updated',
      entityType: 'settings',
      entityId: 'global',
      details: `Updated settings: Currency=${settings.currency}, Cap=${settings.achievementCap}%, Decimals=${settings.scoreDecimalPlaces}`,
      newValue: settings,
    });
  }

  // ================= AUDIT LOGS =================

  public static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(
        query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100))
      );
      if (!snap.empty) {
        const logs = snap.docs.map((d) => d.data() as AuditLog);
        saveToStorage(LS_KEYS.AUDIT, logs);
        return logs;
      }
    } catch (e) {
      console.warn('Firestore getAuditLogs error:', e);
    }
    const local = getFromStorage<AuditLog[]>(LS_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    return local.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static async logAudit(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'auditLogs', log.id), log);
    } catch (e) {
      console.warn('Firestore logAudit error:', e);
    }

    const currentLogs = getFromStorage<AuditLog[]>(LS_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
    currentLogs.unshift(log);
    if (currentLogs.length > 200) currentLogs.pop();
    saveToStorage(LS_KEYS.AUDIT, currentLogs);
  }

  // ================= CSV EXPORT / IMPORT =================

  public static generateCSV(
    records: PerformanceRecord[],
    users: UserProfile[],
    kpis: KPIConfig[]
  ): string {
    const headers = [
      'Record ID',
      'Team Member Name',
      'User ID',
      'Month',
      'Year',
      'Week',
      'Project Closed',
      'Revenue Generated ($)',
      'Upsells',
      'Client Rating',
      'Follow-up Completed',
      'Repeat Clients',
      'Notes',
      'Submitted At',
    ];

    const rows = records.map((rec) => [
      `"${rec.id}"`,
      `"${rec.userName}"`,
      `"${rec.userId}"`,
      `"${rec.month}"`,
      rec.year,
      `"${rec.weekName}"`,
      rec.projectClosed,
      rec.revenueGenerated,
      rec.upsells,
      rec.clientRating,
      rec.followupsCompleted,
      rec.repeatClients,
      `"${(rec.notes || '').replace(/"/g, '""')}"`,
      `"${rec.createdAt}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public static parseAndValidateCSV(
    csvText: string,
    users: UserProfile[],
    periods: PerformancePeriod[]
  ): {
    validRecords: PerformanceRecord[];
    invalidRows: { rowNumber: number; reason: string; raw: string }[];
    missingConvertedCount: number;
    duplicateCount: number;
    summary: {
      totalRows: number;
      validCount: number;
      invalidCount: number;
    };
  } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return {
        validRecords: [],
        invalidRows: [{ rowNumber: 1, reason: 'File is empty or only contains header', raw: '' }],
        missingConvertedCount: 0,
        duplicateCount: 0,
        summary: { totalRows: 0, validCount: 0, invalidCount: 1 },
      };
    }

    const validRecords: PerformanceRecord[] = [];
    const invalidRows: { rowNumber: number; reason: string; raw: string }[] = [];
    let missingConvertedCount = 0;
    let duplicateCount = 0;

    // Parse header
    const headerLine = lines[0].toLowerCase();
    const isStandardHeader = headerLine.includes('team member') || headerLine.includes('user') || headerLine.includes('project');

    const startIndex = isStandardHeader ? 1 : 0;
    const existingIds = new Set<string>();

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV split with quote support
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());

      if (cols.length < 5) {
        invalidRows.push({
          rowNumber: i + 1,
          reason: 'Too few columns (minimum 5 required: Name/UserId, Month, Year, Week, Performance values)',
          raw: line,
        });
        continue;
      }

      // Column matching heuristic
      // Format: RecordID, Name, UserId, Month, Year, Week, Projects, Revenue, Upsells, Rating, Followups, Repeat, Notes
      let recId = cols[0];
      let nameOrId = cols[1] || cols[0];
      let userId = cols[2] || '';
      let month = cols[3] || 'August';
      let year = Number(cols[4]) || 2026;
      let weekName = cols[5] || 'Week 1';
      let projectsRaw = cols[6];
      let revenueRaw = cols[7];
      let upsellsRaw = cols[8];
      let ratingRaw = cols[9];
      let followupsRaw = cols[10];
      let repeatRaw = cols[11];
      let notes = cols[12] || '';

      // Find user
      const matchedUser = users.find(
        (u) =>
          u.uid === userId ||
          u.userId.toLowerCase() === (userId || nameOrId).toLowerCase() ||
          u.name.toLowerCase() === nameOrId.toLowerCase()
      );

      if (!matchedUser) {
        invalidRows.push({
          rowNumber: i + 1,
          reason: `Team member not found for "${nameOrId}" / "${userId}"`,
          raw: line,
        });
        continue;
      }

      // Find period
      const matchedPeriod = periods.find(
        (p) =>
          p.month.toLowerCase() === month.toLowerCase() &&
          p.year === year &&
          p.weekName.toLowerCase() === weekName.toLowerCase()
      );

      const periodId = matchedPeriod?.id || `period_${year}_${month.toLowerCase()}_w1`;

      if (
        projectsRaw === '' ||
        revenueRaw === '' ||
        upsellsRaw === '' ||
        ratingRaw === '' ||
        followupsRaw === '' ||
        repeatRaw === ''
      ) {
        missingConvertedCount++;
      }

      const projects = sanitizeNumber(projectsRaw);
      const revenue = sanitizeNumber(revenueRaw);
      const upsells = sanitizeNumber(upsellsRaw);
      const rating = sanitizeNumber(ratingRaw, true);
      const followups = sanitizeNumber(followupsRaw);
      const repeat = sanitizeNumber(repeatRaw);

      const finalId = recId && recId.startsWith('rec_') ? recId : `rec_imp_${Date.now()}_${i}`;

      if (existingIds.has(finalId)) {
        duplicateCount++;
      }
      existingIds.add(finalId);

      validRecords.push({
        id: finalId,
        userId: matchedUser.uid,
        userName: matchedUser.name,
        periodId,
        month,
        year,
        weekName,
        projectClosed: projects,
        revenueGenerated: revenue,
        upsells,
        clientRating: rating,
        followupsCompleted: followups,
        repeatClients: repeat,
        notes,
        submittedBy: 'csv_import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      validRecords,
      invalidRows,
      missingConvertedCount,
      duplicateCount,
      summary: {
        totalRows: lines.length - (isStandardHeader ? 1 : 0),
        validCount: validRecords.length,
        invalidCount: invalidRows.length,
      },
    };
  }
}
