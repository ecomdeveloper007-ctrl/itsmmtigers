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
  onSnapshot,
  Unsubscribe,
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
  UserStatus,
} from '../types';
import { DEFAULT_KPIS, DEFAULT_SETTINGS, sanitizeNumber } from './calculationService';

// Fallback Local Storage Keys for resilience & speed
const LS_KEYS = {
  USERS: 'tiger_users_v2',
  DELETED_USERS: 'tiger_deleted_users_v2',
  KPIS: 'tiger_kpis_v2',
  PERIODS: 'tiger_periods_v2',
  RECORDS: 'tiger_records_v2',
  DELETED_RECORDS: 'tiger_deleted_records_v2',
  SETTINGS: 'tiger_settings_v2',
  AUDIT: 'tiger_audit_v2',
};

// Initial Seed Users
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_superadmin_prakash',
    userId: 'prakash.choudhary',
    name: 'Prakash Choudhary',
    email: 'prakash.choudhary@coozmoo.com',
    password: 'Coozmoo@@12',
    role: 'super_admin',
    status: 'active',
    department: 'Leadership & Ops',
    team: 'Leadership',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2024-01-01',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_admin',
    userId: 'admin',
    name: 'Aditi Roy (Ops Admin)',
    email: 'admin@itsmmtigers.com',
    password: 'tiger2026admin',
    role: 'admin',
    status: 'active',
    department: 'Operations',
    team: 'Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-03-15',
    createdAt: '2025-03-15T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  // --- SMM TEAM MEMBERS ---
  {
    uid: 'user_divya',
    userId: 'divya.bhardwaj',
    name: 'Divya Bhardwaj',
    email: 'divya@itsmmtigers.com',
    password: 'tiger2026divya',
    role: 'team_member',
    status: 'active',
    department: 'SMM Enterprise',
    team: 'SMM',
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
    password: 'tiger2026mohita',
    role: 'team_member',
    status: 'active',
    department: 'SMM Growth',
    team: 'SMM',
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
    password: 'tiger2026naveen',
    role: 'team_member',
    status: 'active',
    department: 'SMM Accounts',
    team: 'SMM',
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
    password: 'tiger2026rahul',
    role: 'team_member',
    status: 'active',
    department: 'SMM Creative & Client',
    team: 'SMM',
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
    password: 'tiger2026priya',
    role: 'team_member',
    status: 'active',
    department: 'SMM Strategy',
    team: 'SMM',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-09-10',
    createdAt: '2025-09-10T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  // --- IT TEAM MEMBERS ---
  {
    uid: 'user_amitabh',
    userId: 'amitabh.sharma',
    name: 'Amitabh Sharma',
    email: 'amitabh@itsmmtigers.com',
    password: 'tiger2026amitabh',
    role: 'team_member',
    status: 'active',
    department: 'IT Solutions & Architecture',
    team: 'IT',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-02-10',
    createdAt: '2025-02-10T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_rohan',
    userId: 'rohan.gupta',
    name: 'Rohan Gupta',
    email: 'rohan@itsmmtigers.com',
    password: 'tiger2026rohan',
    role: 'team_member',
    status: 'active',
    department: 'IT Engineering & Apps',
    team: 'IT',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-04-01',
    createdAt: '2025-04-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_sneha',
    userId: 'sneha.joshi',
    name: 'Sneha Joshi',
    email: 'sneha@itsmmtigers.com',
    password: 'tiger2026sneha',
    role: 'team_member',
    status: 'active',
    department: 'IT Cloud & DevOps',
    team: 'IT',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-05-15',
    createdAt: '2025-05-15T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    uid: 'user_vikas',
    userId: 'vikas.mehra',
    name: 'Vikas Mehra',
    email: 'vikas@itsmmtigers.com',
    password: 'tiger2026vikas',
    role: 'team_member',
    status: 'active',
    department: 'IT Support & Security',
    team: 'IT',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2025-06-20',
    createdAt: '2025-06-20T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  // --- VIEW-ONLY GUEST / EXECUTIVE VIEWER ---
  {
    uid: 'user_viewer_guest',
    userId: 'viewer',
    name: 'Executive Stakeholder',
    email: 'viewer@itsmmtigers.com',
    password: 'tiger2026viewer',
    role: 'viewer',
    status: 'active',
    department: 'Executive Review',
    team: 'Leadership',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joiningDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
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

// Initial Performance Records (Clean Slate - No hardcoded dummy data)
export const INITIAL_RECORDS: PerformanceRecord[] = [];

// Initial Audit Logs (Clean Slate)
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

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
      const deletedSet = this.getDeletedUserIds();
      const initialNonDeleted = INITIAL_USERS.filter(
        (u) =>
          !deletedSet.has(u.uid.toLowerCase()) &&
          !deletedSet.has(u.userId.toLowerCase()) &&
          !deletedSet.has(u.email.toLowerCase())
      );
      saveToStorage(LS_KEYS.USERS, initialNonDeleted);
    }
    if (!localStorage.getItem(LS_KEYS.KPIS)) {
      saveToStorage(LS_KEYS.KPIS, DEFAULT_KPIS);
    }
    if (!localStorage.getItem(LS_KEYS.PERIODS)) {
      saveToStorage(LS_KEYS.PERIODS, INITIAL_PERIODS);
    }
    if (!localStorage.getItem(LS_KEYS.RECORDS)) {
      const deletedRecordSet = this.getDeletedRecordIds();
      const initialNonDeletedRecords = INITIAL_RECORDS.filter(
        (r) => !deletedRecordSet.has(r.id.toLowerCase())
      );
      saveToStorage(LS_KEYS.RECORDS, initialNonDeletedRecords);
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

  public static getDeletedUserIds(): Set<string> {
    const raw = getFromStorage<string[]>(LS_KEYS.DELETED_USERS, []);
    return new Set((raw || []).map((id) => String(id).trim().toLowerCase()).filter(Boolean));
  }

  public static addDeletedUserIds(ids: string[]) {
    const current = getFromStorage<string[]>(LS_KEYS.DELETED_USERS, []);
    const set = new Set((current || []).map((id) => String(id).trim().toLowerCase()).filter(Boolean));
    for (const id of ids) {
      if (id && id.trim()) {
        set.add(id.trim().toLowerCase());
      }
    }
    saveToStorage(LS_KEYS.DELETED_USERS, Array.from(set));
  }

  public static unmarkDeletedUserId(id: string) {
    const current = getFromStorage<string[]>(LS_KEYS.DELETED_USERS, []);
    const clean = (id || '').trim().toLowerCase();
    const updated = (current || []).filter((x) => String(x).trim().toLowerCase() !== clean);
    saveToStorage(LS_KEYS.DELETED_USERS, updated);
  }

  public static consolidateUsers(rawUsers: (Partial<UserProfile> & { uid?: string; userId?: string; email?: string })[]): UserProfile[] {
    const deletedSet = this.getDeletedUserIds();
    const isDeleted = (u: Partial<UserProfile> & { uid?: string; userId?: string; email?: string }) => {
      if (!u) return true;
      if (u.uid && deletedSet.has(u.uid.toLowerCase())) return true;
      if (u.userId && deletedSet.has(u.userId.toLowerCase())) return true;
      if (u.email && deletedSet.has(u.email.toLowerCase())) return true;
      return false;
    };

    const map = new Map<string, UserProfile>();

    for (const raw of rawUsers) {
      if (!raw || isDeleted(raw)) continue;

      const rawUserId = (raw.userId || raw.uid || '').trim().toLowerCase();
      const normalizedUserId = rawUserId || (raw.email ? raw.email.split('@')[0].trim().toLowerCase() : `user_${Date.now()}`);
      const uid = raw.uid || `user_${normalizedUserId.replace(/[^a-z0-9]/g, '_')}`;

      if (deletedSet.has(uid.toLowerCase()) || deletedSet.has(normalizedUserId.toLowerCase())) {
        continue;
      }

      const item: UserProfile = {
        uid,
        userId: normalizedUserId,
        name: (raw.name || normalizedUserId || 'Team Member').trim(),
        email: (raw.email || `${normalizedUserId}@itsmmtigers.com`).trim().toLowerCase(),
        password: (raw.password || '').trim() || 'tiger2026',
        role: raw.role || 'team_member',
        status: raw.status || 'active',
        department: raw.department || 'IT Team',
        team: raw.team || (raw.department?.toLowerCase().includes('it') ? 'IT' : 'SMM'),
        avatarUrl:
          raw.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joiningDate: raw.joiningDate || new Date().toISOString().split('T')[0],
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
        registrationNotes: raw.registrationNotes,
        rejectionReason: raw.rejectionReason,
        approvedBy: raw.approvedBy,
        approvedAt: raw.approvedAt,
        lastLogin: raw.lastLogin,
      };

      // Match existing by normalized keys
      const existingKey = Array.from(map.keys()).find((k) => {
        const ex = map.get(k);
        if (!ex) return false;
        return (
          ex.uid === item.uid ||
          ex.userId.toLowerCase() === item.userId.toLowerCase() ||
          ex.email.toLowerCase() === item.email.toLowerCase()
        );
      });

      if (existingKey) {
        const existing = map.get(existingKey)!;
        // Status resolution: if either is active/approved, active takes precedence over pending_approval
        let resolvedStatus: UserStatus = item.status;
        if (existing.status === 'active' || item.status === 'active' || existing.approvedAt || item.approvedAt) {
          resolvedStatus = 'active';
        } else if (existing.status === 'disabled' || item.status === 'disabled') {
          resolvedStatus = 'disabled';
        } else if (existing.status === 'rejected' || item.status === 'rejected') {
          resolvedStatus = 'rejected';
        } else {
          resolvedStatus = 'pending_approval';
        }

        const merged: UserProfile = {
          ...existing,
          ...item,
          uid: existing.uid || item.uid,
          userId: existing.userId || item.userId,
          status: resolvedStatus,
          approvedBy: item.approvedBy || existing.approvedBy,
          approvedAt: item.approvedAt || existing.approvedAt,
          role: item.role || existing.role || 'team_member',
          password:
            item.password && item.password !== 'tiger2026'
              ? item.password
              : existing.password || item.password || 'tiger2026',
        };
        map.set(existingKey, merged);
      } else {
        map.set(item.userId.toLowerCase(), item);
      }
    }

    return Array.from(map.values());
  }

  public static async getUsers(): Promise<UserProfile[]> {
    const rawList: (Partial<UserProfile> & { uid?: string; userId?: string; email?: string })[] = [];

    // 1. Read existing local storage users if available
    const localUsers = getFromStorage<UserProfile[] | null>(LS_KEYS.USERS, null);
    if (localUsers && Array.isArray(localUsers) && localUsers.length > 0) {
      rawList.push(...localUsers);
    } else {
      rawList.push(...INITIAL_USERS);
    }

    // 2. Fetch Firestore users
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const deletedSet = this.getDeletedUserIds();
        for (const docSnap of snap.docs) {
          const cloudData = docSnap.data() as Partial<UserProfile>;
          const cloudUser: Partial<UserProfile> = {
            ...cloudData,
            uid: cloudData.uid || docSnap.id,
            userId: cloudData.userId || docSnap.id,
          };
          if (
            deletedSet.has(docSnap.id.toLowerCase()) ||
            (cloudUser.uid && deletedSet.has(cloudUser.uid.toLowerCase())) ||
            (cloudUser.userId && deletedSet.has(cloudUser.userId.toLowerCase()))
          ) {
            deleteDoc(docSnap.ref).catch(() => {});
          } else {
            rawList.push(cloudUser);
          }
        }
      }
    } catch (e) {
      console.warn('Firestore getUsers error, fallback to resilient local cache:', e);
    }

    const finalUsers = this.consolidateUsers(rawList);
    saveToStorage(LS_KEYS.USERS, finalUsers);
    return finalUsers;
  }

  public static async saveUser(user: UserProfile, actor: { id: string; name: string; role: UserRole }): Promise<void> {
    const rawUserId = (user.userId || user.uid || '').trim().toLowerCase();
    const normalizedUserId = rawUserId || (user.email ? user.email.split('@')[0].trim().toLowerCase() : `user_${Date.now()}`);
    const uid = user.uid || `user_${normalizedUserId.replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    // Remove from deleted list if intentionally saving/updating
    this.unmarkDeletedUserId(normalizedUserId);
    this.unmarkDeletedUserId(uid);
    if (user.email) this.unmarkDeletedUserId(user.email);

    const cleanUser: UserProfile = {
      ...user,
      uid,
      userId: normalizedUserId,
      name: (user.name || normalizedUserId).trim(),
      email: (user.email || `${normalizedUserId}@itsmmtigers.com`).trim().toLowerCase(),
      password: (user.password || '').trim() || 'tiger2026',
      status: user.status || 'active',
      role: user.role || 'team_member',
      department: user.department || 'IT Team',
      team: user.team || (user.department?.toLowerCase().includes('it') ? 'IT' : 'SMM'),
      avatarUrl:
        user.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joiningDate: user.joiningDate || new Date().toISOString().split('T')[0],
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update Local Storage cache for instantaneous availability
    const users = getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
    const idx = users.findIndex(
      (u) =>
        u.uid === cleanUser.uid ||
        (u.userId && u.userId.toLowerCase() === cleanUser.userId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === cleanUser.email.toLowerCase())
    );
    const isNew = idx < 0;
    if (idx >= 0) {
      users[idx] = cleanUser;
    } else {
      users.push(cleanUser);
    }
    saveToStorage(LS_KEYS.USERS, users);

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'users', cleanUser.uid), cleanUser, { merge: true });
    } catch (e) {
      console.warn('Firestore saveUser error, stored locally:', e);
    }

    // 3. Audit Log (non-blocking)
    try {
      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: isNew ? 'User Created' : 'User Updated',
        entityType: 'user',
        entityId: cleanUser.uid,
        details: `${isNew ? 'Created' : 'Updated'} user ${cleanUser.name} (${cleanUser.userId}, Role: ${cleanUser.role}, Status: ${cleanUser.status})`,
        newValue: cleanUser,
      });
    } catch (err) {
      console.warn('Audit log save error:', err);
    }
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

  public static async deleteUser(
    userId: string,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const rawUsers = getFromStorage<UserProfile[]>(LS_KEYS.USERS, []);
    const targetUser = rawUsers.find(
      (x) =>
        x.uid === userId ||
        (x.userId && x.userId.toLowerCase() === userId.toLowerCase()) ||
        (x.email && x.email.toLowerCase() === userId.toLowerCase())
    );

    // 1. Record in persistent tombstone blacklist so they are never re-seeded
    const idsToTombstone: string[] = [userId];
    if (targetUser) {
      if (targetUser.uid) idsToTombstone.push(targetUser.uid);
      if (targetUser.userId) idsToTombstone.push(targetUser.userId);
      if (targetUser.email) idsToTombstone.push(targetUser.email);
    }
    this.addDeletedUserIds(idsToTombstone);

    // 2. Remove immediately from local storage cache
    const updatedUsers = rawUsers.filter(
      (x) =>
        x.uid !== userId &&
        x.userId?.toLowerCase() !== userId.toLowerCase() &&
        x.email?.toLowerCase() !== userId.toLowerCase() &&
        (targetUser ? x.uid !== targetUser.uid && x.userId?.toLowerCase() !== targetUser.userId.toLowerCase() : true)
    );
    saveToStorage(LS_KEYS.USERS, updatedUsers);

    // 3. Purge thoroughly from Firestore
    try {
      if (targetUser?.uid) {
        await deleteDoc(doc(db, 'users', targetUser.uid)).catch(() => {});
      }
      if (targetUser?.userId) {
        await deleteDoc(doc(db, 'users', targetUser.userId)).catch(() => {});
      }
      await deleteDoc(doc(db, 'users', userId)).catch(() => {});

      // Query and purge all matching Firestore documents in 'users' collection
      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const d = docSnap.data() as Partial<UserProfile>;
        const docIdLower = docSnap.id.toLowerCase();
        const dUid = (d.uid || '').toLowerCase();
        const dUserId = (d.userId || '').toLowerCase();
        const dEmail = (d.email || '').toLowerCase();
        const searchLower = userId.toLowerCase();
        const targetUidLower = (targetUser?.uid || '').toLowerCase();
        const targetUserIdLower = (targetUser?.userId || '').toLowerCase();
        const targetEmailLower = (targetUser?.email || '').toLowerCase();

        if (
          docIdLower === searchLower ||
          (targetUidLower && docIdLower === targetUidLower) ||
          (targetUserIdLower && docIdLower === targetUserIdLower) ||
          dUid === searchLower ||
          (targetUidLower && dUid === targetUidLower) ||
          dUserId === searchLower ||
          (targetUserIdLower && dUserId === targetUserIdLower) ||
          (dEmail && (dEmail === searchLower || (targetEmailLower && dEmail === targetEmailLower)))
        ) {
          await deleteDoc(docSnap.ref).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Firestore deleteUser error:', e);
    }

    // 4. Log Audit
    if (targetUser) {
      try {
        await this.logAudit({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'User Deleted',
          entityType: 'user',
          entityId: targetUser.uid,
          details: `Permanently deleted member profile: ${targetUser.name} (${targetUser.userId}, Role: ${targetUser.role})`,
          oldValue: targetUser,
        });
      } catch (err) {
        console.warn('Audit log save error:', err);
      }
    }
  }

  public static async registerUser(registrationData: {
    name: string;
    userId: string;
    email: string;
    password?: string;
    department?: string;
    avatarUrl?: string;
    notes?: string;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    const cleanUserId = registrationData.userId.trim().toLowerCase();
    const cleanEmail = registrationData.email.trim().toLowerCase();

    // If re-registering, unmark from deleted
    this.unmarkDeletedUserId(cleanUserId);
    this.unmarkDeletedUserId(cleanEmail);

    const users = await this.getUsers();
    const existing = users.find(
      (u) => u.userId.toLowerCase() === cleanUserId || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.status === 'pending_approval') {
        return {
          success: false,
          message: 'An application with this User ID or Email is already pending Super Admin approval.',
        };
      }
      return {
        success: false,
        message: 'A user with this User ID or Email already exists. Please choose a different one or sign in.',
      };
    }

    const assignedTeam: 'IT' | 'SMM' =
      registrationData.department && registrationData.department.toLowerCase().includes('it')
        ? 'IT'
        : 'SMM';

    const newUser: UserProfile = {
      uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: cleanUserId,
      name: registrationData.name.trim(),
      email: cleanEmail,
      password: registrationData.password || 'tiger2026',
      role: 'team_member',
      status: 'pending_approval',
      department: registrationData.department || (assignedTeam === 'IT' ? 'IT Team' : 'SMM Team'),
      team: assignedTeam,
      avatarUrl:
        registrationData.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joiningDate: new Date().toISOString().split('T')[0],
      registrationNotes: registrationData.notes || 'Registered through public onboarding portal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', newUser.uid), newUser);
    } catch (e) {
      console.warn('Firestore registerUser error:', e);
    }

    users.push(newUser);
    saveToStorage(LS_KEYS.USERS, users);

    await this.logAudit({
      userId: newUser.uid,
      userName: newUser.name,
      userRole: 'team_member',
      action: 'Registration Request Submitted',
      entityType: 'user',
      entityId: newUser.uid,
      details: `New registration submitted by ${newUser.name} (${newUser.userId}, ${newUser.email}, Dept: ${newUser.department}). Pending Super Admin Prakash Choudhary approval.`,
      newValue: newUser,
    });

    return { success: true, user: newUser };
  }

  public static async approveRegistration(
    userId: string,
    assignedRole: UserRole,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const cleanUserId = (userId || '').trim().toLowerCase();
    this.unmarkDeletedUserId(cleanUserId);

    const users = await this.getUsers();
    const target = users.find(
      (u) =>
        u.uid === userId ||
        (u.uid && u.uid.toLowerCase() === cleanUserId) ||
        (u.userId && u.userId.toLowerCase() === cleanUserId) ||
        (u.email && u.email.toLowerCase() === cleanUserId)
    );

    if (!target) {
      console.warn('approveRegistration: user not found for id:', userId);
      return;
    }

    const updatedUser: UserProfile = {
      ...target,
      status: 'active',
      role: assignedRole,
      approvedBy: actor.name,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update Local Storage cache
    const rawList = [...users];
    const idx = rawList.findIndex((u) => u.uid === target.uid || u.userId.toLowerCase() === target.userId.toLowerCase());
    if (idx >= 0) {
      rawList[idx] = updatedUser;
    } else {
      rawList.push(updatedUser);
    }
    const consolidated = this.consolidateUsers(rawList);
    saveToStorage(LS_KEYS.USERS, consolidated);

    // 2. Persist to Firestore across potential document keys
    try {
      if (updatedUser.uid) {
        await setDoc(doc(db, 'users', updatedUser.uid), updatedUser, { merge: true }).catch(() => {});
      }
      if (updatedUser.userId && updatedUser.userId !== updatedUser.uid) {
        await setDoc(doc(db, 'users', updatedUser.userId), updatedUser, { merge: true }).catch(() => {});
      }

      // Query all matching docs in Firestore to ensure complete synchronization
      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const d = docSnap.data() as Partial<UserProfile>;
        const docIdLower = docSnap.id.toLowerCase();
        const dUid = (d.uid || '').toLowerCase();
        const dUserId = (d.userId || '').toLowerCase();
        const dEmail = (d.email || '').toLowerCase();

        if (
          docIdLower === cleanUserId ||
          docIdLower === target.uid.toLowerCase() ||
          docIdLower === target.userId.toLowerCase() ||
          dUid === cleanUserId ||
          dUid === target.uid.toLowerCase() ||
          dUserId === cleanUserId ||
          dUserId === target.userId.toLowerCase() ||
          (target.email && dEmail === target.email.toLowerCase())
        ) {
          await setDoc(docSnap.ref, updatedUser, { merge: true }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Firestore approveRegistration error:', e);
    }

    // 3. Log Audit
    try {
      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'Registration Approved',
        entityType: 'user',
        entityId: updatedUser.uid,
        details: `Super Admin ${actor.name} approved registration for ${updatedUser.name} (${updatedUser.userId}) with role ${assignedRole}`,
        newValue: updatedUser,
      });
    } catch (err) {
      console.warn('Audit log error on approveRegistration:', err);
    }
  }

  public static async rejectRegistration(
    userId: string,
    reason: string,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const cleanUserId = (userId || '').trim().toLowerCase();
    const users = await this.getUsers();
    const target = users.find(
      (u) =>
        u.uid === userId ||
        (u.uid && u.uid.toLowerCase() === cleanUserId) ||
        (u.userId && u.userId.toLowerCase() === cleanUserId) ||
        (u.email && u.email.toLowerCase() === cleanUserId)
    );

    if (!target) {
      console.warn('rejectRegistration: user not found for id:', userId);
      return;
    }

    const updatedUser: UserProfile = {
      ...target,
      status: 'rejected',
      rejectionReason: reason || 'Application declined by Super Admin',
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately update Local Storage cache
    const rawList = [...users];
    const idx = rawList.findIndex((u) => u.uid === target.uid || u.userId.toLowerCase() === target.userId.toLowerCase());
    if (idx >= 0) {
      rawList[idx] = updatedUser;
    } else {
      rawList.push(updatedUser);
    }
    const consolidated = this.consolidateUsers(rawList);
    saveToStorage(LS_KEYS.USERS, consolidated);

    // 2. Persist to Firestore across potential document keys
    try {
      if (updatedUser.uid) {
        await setDoc(doc(db, 'users', updatedUser.uid), updatedUser, { merge: true }).catch(() => {});
      }
      if (updatedUser.userId && updatedUser.userId !== updatedUser.uid) {
        await setDoc(doc(db, 'users', updatedUser.userId), updatedUser, { merge: true }).catch(() => {});
      }

      const snap = await getDocs(collection(db, 'users'));
      for (const docSnap of snap.docs) {
        const d = docSnap.data() as Partial<UserProfile>;
        const docIdLower = docSnap.id.toLowerCase();
        const dUid = (d.uid || '').toLowerCase();
        const dUserId = (d.userId || '').toLowerCase();
        const dEmail = (d.email || '').toLowerCase();

        if (
          docIdLower === cleanUserId ||
          docIdLower === target.uid.toLowerCase() ||
          docIdLower === target.userId.toLowerCase() ||
          dUid === cleanUserId ||
          dUid === target.uid.toLowerCase() ||
          dUserId === cleanUserId ||
          dUserId === target.userId.toLowerCase() ||
          (target.email && dEmail === target.email.toLowerCase())
        ) {
          await setDoc(docSnap.ref, updatedUser, { merge: true }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Firestore rejectRegistration error:', e);
    }

    // 3. Log Audit
    try {
      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'Registration Rejected',
        entityType: 'user',
        entityId: updatedUser.uid,
        details: `Registration for ${updatedUser.name} (${updatedUser.userId}) was rejected: ${reason}`,
        newValue: updatedUser,
      });
    } catch (err) {
      console.warn('Audit log error on rejectRegistration:', err);
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
    const localPeriods = getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
    const periodMap = new Map<string, PerformancePeriod>();

    // 1. Baseline periods
    for (const p of INITIAL_PERIODS) {
      periodMap.set(p.id, { ...p });
    }

    // 2. Local storage periods
    for (const p of localPeriods) {
      if (p.id) periodMap.set(p.id, { ...p });
    }

    // 3. Firestore periods
    try {
      const snap = await getDocs(collection(db, 'performancePeriods'));
      if (!snap.empty) {
        for (const docSnap of snap.docs) {
          const cloudPeriod = docSnap.data() as PerformancePeriod;
          periodMap.set(cloudPeriod.id, cloudPeriod);
        }
      } else {
        // Seed firestore with initial periods
        for (const p of INITIAL_PERIODS) {
          await setDoc(doc(db, 'performancePeriods', p.id), p);
        }
      }
    } catch (e) {
      console.warn('Firestore getPeriods error:', e);
    }

    const finalPeriods = Array.from(periodMap.values()).sort(
      (a, b) => b.year - a.year || a.weekNumber - b.weekNumber
    );
    saveToStorage(LS_KEYS.PERIODS, finalPeriods);
    return finalPeriods;
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

  public static getDeletedRecordIds(): Set<string> {
    const raw = getFromStorage<string[]>(LS_KEYS.DELETED_RECORDS, []);
    return new Set((raw || []).map((id) => String(id).trim().toLowerCase()).filter(Boolean));
  }

  public static addDeletedRecordIds(ids: string[]) {
    const current = getFromStorage<string[]>(LS_KEYS.DELETED_RECORDS, []);
    const set = new Set((current || []).map((id) => String(id).trim().toLowerCase()).filter(Boolean));
    for (const id of ids) {
      if (id && id.trim()) {
        set.add(id.trim().toLowerCase());
      }
    }
    saveToStorage(LS_KEYS.DELETED_RECORDS, Array.from(set));
  }

  public static unmarkDeletedRecordId(id: string) {
    const current = getFromStorage<string[]>(LS_KEYS.DELETED_RECORDS, []);
    const clean = (id || '').trim().toLowerCase();
    const updated = (current || []).filter((x) => String(x).trim().toLowerCase() !== clean);
    saveToStorage(LS_KEYS.DELETED_RECORDS, updated);
  }

  public static consolidateRecords(rawRecords: (Partial<PerformanceRecord> & { id?: string })[]): PerformanceRecord[] {
    const deletedSet = this.getDeletedRecordIds();
    const map = new Map<string, PerformanceRecord>();

    for (const raw of rawRecords) {
      if (!raw || !raw.id) continue;
      const recId = String(raw.id).trim();
      const recIdLower = recId.toLowerCase();

      if (deletedSet.has(recIdLower)) {
        continue;
      }

      const item: PerformanceRecord = {
        id: recId,
        userId: raw.userId || '',
        userName: raw.userName || 'Team Member',
        periodId: raw.periodId || '',
        month: raw.month || 'August',
        year: raw.year || 2026,
        weekName: raw.weekName || 'Week 1',
        projectClosed: sanitizeNumber(raw.projectClosed),
        revenueGenerated: sanitizeNumber(raw.revenueGenerated),
        upsells: sanitizeNumber(raw.upsells),
        clientRating: sanitizeNumber(raw.clientRating, true),
        followupsCompleted: sanitizeNumber(raw.followupsCompleted),
        repeatClients: sanitizeNumber(raw.repeatClients),
        notes: raw.notes || '',
        submittedBy: raw.submittedBy || 'system',
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
      };

      const existing = map.get(recIdLower);
      if (existing) {
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const incomingTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        if (incomingTime >= existingTime) {
          map.set(recIdLower, { ...existing, ...item });
        }
      } else {
        map.set(recIdLower, item);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  public static async getRecords(): Promise<PerformanceRecord[]> {
    const rawList: (Partial<PerformanceRecord> & { id?: string })[] = [];
    const deletedSet = this.getDeletedRecordIds();

    // 1. Read existing local storage records
    const localRecords = getFromStorage<PerformanceRecord[] | null>(LS_KEYS.RECORDS, null);
    if (localRecords && Array.isArray(localRecords)) {
      for (const r of localRecords) {
        if (r && r.id && !deletedSet.has(String(r.id).trim().toLowerCase())) {
          rawList.push(r);
        }
      }
    } else {
      // First time initialization: use INITIAL_RECORDS that are not deleted
      for (const r of INITIAL_RECORDS) {
        if (!deletedSet.has(r.id.toLowerCase())) {
          rawList.push(r);
        }
      }
    }

    // 2. Query Firestore records
    try {
      const snap = await getDocs(collection(db, 'performanceRecords'));
      if (!snap.empty) {
        for (const docSnap of snap.docs) {
          const cloudRecord = docSnap.data() as Partial<PerformanceRecord>;
          const recId = cloudRecord.id || docSnap.id;
          const recIdLower = String(recId || '').trim().toLowerCase();
          const docIdLower = docSnap.id.trim().toLowerCase();

          if (deletedSet.has(recIdLower) || deletedSet.has(docIdLower)) {
            // Actively purge ghost document from firestore
            deleteDoc(docSnap.ref).catch(() => {});
          } else {
            rawList.push({
              ...cloudRecord,
              id: recId,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Firestore getRecords error, fallback to resilient local cache:', e);
    }

    const finalRecords = this.consolidateRecords(rawList);
    saveToStorage(LS_KEYS.RECORDS, finalRecords);
    return finalRecords;
  }

  public static async saveRecord(
    record: PerformanceRecord,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const cleanId = String(record.id).trim();
    this.unmarkDeletedRecordId(cleanId);

    // Sanitize all numeric fields automatically to guarantee 0 for empty/NaN
    const cleanRecord: PerformanceRecord = {
      ...record,
      id: cleanId,
      projectClosed: sanitizeNumber(record.projectClosed),
      revenueGenerated: sanitizeNumber(record.revenueGenerated),
      upsells: sanitizeNumber(record.upsells),
      clientRating: sanitizeNumber(record.clientRating, true),
      followupsCompleted: sanitizeNumber(record.followupsCompleted),
      repeatClients: sanitizeNumber(record.repeatClients),
      updatedAt: new Date().toISOString(),
      createdAt: record.createdAt || new Date().toISOString(),
    };

    // 1. Immediately update local storage
    const currentRecords = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, []);
    const cleanIdLower = cleanId.toLowerCase();
    const rawList = [...currentRecords.filter((r) => String(r.id).trim().toLowerCase() !== cleanIdLower), cleanRecord];
    const consolidated = this.consolidateRecords(rawList);
    saveToStorage(LS_KEYS.RECORDS, consolidated);

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'performanceRecords', cleanRecord.id), cleanRecord);
    } catch (e) {
      console.warn('Firestore saveRecord error:', e);
    }

    // 3. Log Audit
    const isNew = !currentRecords.some((r) => String(r.id).trim().toLowerCase() === cleanIdLower);
    const oldVal = currentRecords.find((r) => String(r.id).trim().toLowerCase() === cleanIdLower);

    try {
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
    } catch (err) {
      console.warn('Audit log error on saveRecord:', err);
    }
  }

  public static async deleteRecord(
    recordId: string,
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    const cleanId = String(recordId || '').trim();
    const cleanIdLower = cleanId.toLowerCase();

    // 1. Mark as deleted in tombstone storage
    this.addDeletedRecordIds([cleanId]);

    // 2. Immediately update local storage
    const currentRecords = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, []);
    const existing = currentRecords.find((r) => String(r.id).trim().toLowerCase() === cleanIdLower);
    const filtered = currentRecords.filter((r) => String(r.id).trim().toLowerCase() !== cleanIdLower);
    const consolidated = this.consolidateRecords(filtered);
    saveToStorage(LS_KEYS.RECORDS, consolidated);

    // 3. Multi-doc Firestore deletion to eliminate any matching doc IDs or data IDs
    try {
      if (cleanId) {
        await deleteDoc(doc(db, 'performanceRecords', cleanId)).catch(() => {});
      }
      const snap = await getDocs(collection(db, 'performanceRecords'));
      for (const docSnap of snap.docs) {
        const d = docSnap.data() as Partial<PerformanceRecord>;
        const dId = String(d.id || '').trim().toLowerCase();
        if (docSnap.id.toLowerCase() === cleanIdLower || dId === cleanIdLower) {
          await deleteDoc(docSnap.ref).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Firestore deleteRecord error:', e);
    }

    // 4. Log Audit
    if (existing) {
      try {
        await this.logAudit({
          userId: actor.id,
          userName: actor.name,
          userRole: actor.role,
          action: 'Performance Record Deleted',
          entityType: 'performance',
          entityId: cleanId,
          details: `Deleted record of ${existing.userName} for ${existing.weekName} ${existing.month} ${existing.year}`,
          oldValue: existing,
        });
      } catch (err) {
        console.warn('Audit log error on deleteRecord:', err);
      }
    }
  }

  public static async purgeAllPerformanceRecords(
    actor: { id: string; name: string; role: UserRole }
  ): Promise<void> {
    // 1. Wipe local storage records and deleted records list
    saveToStorage(LS_KEYS.RECORDS, []);
    saveToStorage(LS_KEYS.DELETED_RECORDS, []);

    // 2. Delete all docs in Firestore performanceRecords
    try {
      const snap = await getDocs(collection(db, 'performanceRecords'));
      for (const d of snap.docs) {
        await deleteDoc(d.ref).catch(() => {});
      }
    } catch (e) {
      console.warn('Firestore purgeAllPerformanceRecords error:', e);
    }

    // 3. Log Audit
    try {
      await this.logAudit({
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        action: 'All Performance Records Cleared',
        entityType: 'performance',
        entityId: 'all',
        details: 'Admin purged all performance submissions from database.',
      });
    } catch (err) {
      console.warn('Audit log error on purgeAllPerformanceRecords:', err);
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

  // ================= REAL-TIME BACKEND SUBSCRIPTIONS =================

  public static subscribeToRecords(callback: (records: PerformanceRecord[]) => void): Unsubscribe {
    try {
      return onSnapshot(
        collection(db, 'performanceRecords'),
        (snapshot) => {
          const rawList: (Partial<PerformanceRecord> & { id?: string })[] = [];
          const deletedSet = this.getDeletedRecordIds();

          if (!snapshot.empty) {
            for (const d of snapshot.docs) {
              const cloudRecord = d.data() as Partial<PerformanceRecord>;
              const recId = cloudRecord.id || d.id;
              const recIdLower = String(recId || '').trim().toLowerCase();
              const docIdLower = d.id.trim().toLowerCase();

              if (
                deletedSet.has(recIdLower) ||
                deletedSet.has(docIdLower) ||
                (cloudRecord.id && deletedSet.has(String(cloudRecord.id).trim().toLowerCase()))
              ) {
                // Delete persistent ghost document from firestore
                deleteDoc(d.ref).catch(() => {});
              } else {
                rawList.push({
                  ...cloudRecord,
                  id: recId,
                });
              }
            }
          } else {
            const cached = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, []);
            rawList.push(...cached);
          }

          const consolidated = this.consolidateRecords(rawList);
          saveToStorage(LS_KEYS.RECORDS, consolidated);
          callback(consolidated);
        },
        (error) => {
          console.warn('Real-time records subscription warning:', error);
          const cached = getFromStorage<PerformanceRecord[]>(LS_KEYS.RECORDS, []);
          const consolidated = this.consolidateRecords(cached);
          callback(consolidated);
        }
      );
    } catch (e) {
      console.warn('Failed to attach records listener:', e);
      return () => {};
    }
  }

  public static subscribeToPeriods(callback: (periods: PerformancePeriod[]) => void): Unsubscribe {
    try {
      return onSnapshot(
        collection(db, 'performancePeriods'),
        (snapshot) => {
          if (!snapshot.empty) {
            const periods = snapshot.docs.map((d) => d.data() as PerformancePeriod);
            const sorted = periods.sort((a, b) => b.year - a.year || a.weekNumber - b.weekNumber);
            saveToStorage(LS_KEYS.PERIODS, sorted);
            callback(sorted);
          } else {
            const cached = getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
            callback(cached);
          }
        },
        (error) => {
          console.warn('Real-time periods subscription warning:', error);
          const cached = getFromStorage<PerformancePeriod[]>(LS_KEYS.PERIODS, INITIAL_PERIODS);
          callback(cached);
        }
      );
    } catch (e) {
      console.warn('Failed to attach periods listener:', e);
      return () => {};
    }
  }

  public static subscribeToKPIs(callback: (kpis: KPIConfig[]) => void): Unsubscribe {
    try {
      return onSnapshot(
        collection(db, 'kpiSettings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const kpis = snapshot.docs
              .map((d) => d.data() as KPIConfig)
              .sort((a, b) => a.order - b.order);
            saveToStorage(LS_KEYS.KPIS, kpis);
            callback(kpis);
          } else {
            const cached = getFromStorage<KPIConfig[]>(LS_KEYS.KPIS, DEFAULT_KPIS);
            callback(cached);
          }
        },
        (error) => {
          console.warn('Real-time KPIs subscription warning:', error);
          const cached = getFromStorage<KPIConfig[]>(LS_KEYS.KPIS, DEFAULT_KPIS);
          callback(cached);
        }
      );
    } catch (e) {
      console.warn('Failed to attach KPIs listener:', e);
      return () => {};
    }
  }

  public static subscribeToSettings(callback: (settings: AppSettings) => void): Unsubscribe {
    try {
      return onSnapshot(
        doc(db, 'settings', 'global'),
        (snapshot) => {
          if (snapshot.exists()) {
            const settings = snapshot.data() as AppSettings;
            saveToStorage(LS_KEYS.SETTINGS, settings);
            callback(settings);
          } else {
            const cached = getFromStorage<AppSettings>(LS_KEYS.SETTINGS, DEFAULT_SETTINGS);
            callback(cached);
          }
        },
        (error) => {
          console.warn('Real-time settings subscription warning:', error);
          const cached = getFromStorage<AppSettings>(LS_KEYS.SETTINGS, DEFAULT_SETTINGS);
          callback(cached);
        }
      );
    } catch (e) {
      console.warn('Failed to attach settings listener:', e);
      return () => {};
    }
  }

  public static subscribeToAuditLogs(callback: (logs: AuditLog[]) => void): Unsubscribe {
    try {
      return onSnapshot(
        query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100)),
        (snapshot) => {
          if (!snapshot.empty) {
            const logs = snapshot.docs.map((d) => d.data() as AuditLog);
            saveToStorage(LS_KEYS.AUDIT, logs);
            callback(logs);
          }
        },
        (error) => {
          console.warn('Real-time audit log subscription warning:', error);
        }
      );
    } catch (e) {
      console.warn('Failed to attach audit listener:', e);
      return () => {};
    }
  }

  public static subscribeToUsers(callback: (users: UserProfile[]) => void): Unsubscribe {
    try {
      return onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const rawList: (Partial<UserProfile> & { uid?: string; userId?: string; email?: string })[] = [];
          if (!snapshot.empty) {
            for (const d of snapshot.docs) {
              const data = d.data() as UserProfile;
              rawList.push({
                ...data,
                uid: data.uid || d.id,
                userId: data.userId || d.id,
              });
            }
          } else {
            const cached = getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
            rawList.push(...cached);
          }

          const consolidated = this.consolidateUsers(rawList);
          saveToStorage(LS_KEYS.USERS, consolidated);
          callback(consolidated);
        },
        (error) => {
          console.warn('Real-time users subscription warning:', error);
          const cached = getFromStorage<UserProfile[]>(LS_KEYS.USERS, INITIAL_USERS);
          const consolidated = this.consolidateUsers(cached);
          callback(consolidated);
        }
      );
    } catch (e) {
      console.warn('Failed to attach users listener:', e);
      return () => {};
    }
  }
}
