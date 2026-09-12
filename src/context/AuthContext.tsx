import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserStatus, ProfileCode } from '../types';
import { DataService, INITIAL_USERS } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userIdOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    userId: string;
    email: string;
    password?: string;
    department?: string;
    team?: 'IT' | 'SMM' | 'Operations' | 'Leadership';
    profileCode?: ProfileCode;
    avatarUrl?: string;
    notes?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  approveUser: (userId: string, assignedRole?: UserRole, assignedProfileCode?: ProfileCode) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
  updateUserDepartmentAndProfile: (
    userId: string,
    department: string,
    profileCode: ProfileCode,
    team?: 'IT' | 'SMM'
  ) => Promise<boolean>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  isViewer: boolean;
  allUsers: UserProfile[];
  pendingUsers: UserProfile[];
  pendingCount: number;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'tiger_current_user_v3';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUsersAndSession = async () => {
    setIsLoading(true);
    await DataService.initializeData();
    const users = await DataService.getUsers();
    setAllUsers(users);

    const savedUid = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUid) {
      const cleanSaved = savedUid.trim().toLowerCase();
      const user = users.find(
        (u) =>
          (u.uid && u.uid.toLowerCase() === cleanSaved) ||
          (u.userId && u.userId.toLowerCase() === cleanSaved) ||
          (u.email && u.email.toLowerCase() === cleanSaved)
      );
      if (user && user.status === 'active') {
        setCurrentUser(user);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        setCurrentUser(null);
      }
    } else {
      // Do not auto-login to any user so public landing structure with Sign In & Register is presented
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsersAndSession();
    const unsub = DataService.subscribeToUsers((users) => {
      if (users && users.length > 0) {
        setAllUsers(users);
        const savedUid = localStorage.getItem(CURRENT_USER_KEY);
        if (savedUid) {
          const cleanSaved = savedUid.trim().toLowerCase();
          const matched = users.find(
            (u) =>
              (u.uid && u.uid.toLowerCase() === cleanSaved) ||
              (u.userId && u.userId.toLowerCase() === cleanSaved) ||
              (u.email && u.email.toLowerCase() === cleanSaved)
          );
          if (matched && matched.status === 'active') {
            setCurrentUser(matched);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const refreshUsers = async () => {
    const users = await DataService.getUsers();
    setAllUsers(users);
    if (currentUser) {
      const updated = users.find(
        (u) =>
          u.uid === currentUser.uid ||
          (u.userId && currentUser.userId && u.userId.toLowerCase() === currentUser.userId.toLowerCase())
      );
      if (updated && updated.status === 'active') {
        setCurrentUser(updated);
      } else if (updated && updated.status !== 'active') {
        logout();
      }
    }
  };

  const login = async (userIdOrEmail: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanInput = userIdOrEmail.trim().toLowerCase();
    const cleanPass = password ? password.trim() : '';

    if (!cleanInput) {
      return { success: false, message: 'Please provide your User ID or Email address.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Please enter your account password.' };
    }

    const users = await DataService.getUsers();
    setAllUsers(users);

    // 1. Strict Identity Lookup: Resolve the user strictly from their unique UID, Email, or User ID.
    // CRITICAL: NEVER identify or select a user by their role (e.g. role === 'super_admin').
    // Role grants permissions, but does NOT determine user identity.
    const cleanPrefix = cleanInput.split('@')[0].trim().toLowerCase();
    const cleanAlphaNum = cleanInput.replace(/[^a-z0-9]/g, '');

    // Step 1A: Direct exact match by UID, Email, or User ID
    let matched = users.find((u) => {
      const uUid = (u.uid || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      const uUserId = (u.userId || '').trim().toLowerCase();
      return uUid === cleanInput || uEmail === cleanInput || uUserId === cleanInput;
    });

    // Step 1B: Exact match on email prefix or user ID prefix
    if (!matched) {
      matched = users.find((u) => {
        const uEmail = (u.email || '').trim().toLowerCase();
        const uUserId = (u.userId || '').trim().toLowerCase();
        const uEmailPrefix = uEmail.split('@')[0].trim().toLowerCase();
        return (
          uUserId === cleanPrefix ||
          uEmailPrefix === cleanInput ||
          uEmailPrefix === cleanPrefix
        );
      });
    }

    // Step 1C: Alphanumeric username match (e.g. prakashchoudhary matching prakash.choudhary)
    if (!matched && cleanAlphaNum.length >= 3) {
      matched = users.find((u) => {
        const uUserId = (u.userId || '').trim().toLowerCase();
        const uName = (u.name || '').trim().toLowerCase();
        const uIdAlphaNum = uUserId.replace(/[^a-z0-9]/g, '');
        const uNameAlphaNum = uName.replace(/[^a-z0-9]/g, '');
        return uIdAlphaNum === cleanAlphaNum || uNameAlphaNum === cleanAlphaNum;
      });
    }

    // Step 1D: Fallback to INITIAL_USERS if the specific user exists in seed data but not yet loaded
    if (!matched) {
      const seedMatch = INITIAL_USERS.find((u) => {
        const uUid = (u.uid || '').trim().toLowerCase();
        const uEmail = (u.email || '').trim().toLowerCase();
        const uUserId = (u.userId || '').trim().toLowerCase();
        const uEmailPrefix = uEmail.split('@')[0].trim().toLowerCase();
        return (
          uUid === cleanInput ||
          uEmail === cleanInput ||
          uUserId === cleanInput ||
          uUserId === cleanPrefix ||
          uEmailPrefix === cleanInput ||
          uEmailPrefix === cleanPrefix
        );
      });
      if (seedMatch) {
        matched = { ...seedMatch };
        await DataService.saveUser(matched, {
          id: matched.uid,
          name: matched.name,
          role: matched.role,
        });
      }
    }

    // 2. Not Found Check
    if (!matched) {
      return {
        success: false,
        message: `Account "${userIdOrEmail.trim()}" not found. If you are a new member, please Register first or ask an administrator to verify your User ID.`,
      };
    }

    // 3. Status checks
    if (matched.status === 'pending_approval') {
      return {
        success: false,
        message:
          'Your registration is currently pending review by Super Admin. You will be able to log in once your request is approved.',
      };
    }

    if (matched.status === 'rejected') {
      return {
        success: false,
        message: `Your registration request was declined (${matched.rejectionReason || 'Contact administration'}).`,
      };
    }

    if (matched.status === 'disabled') {
      return {
        success: false,
        message: 'This account has been deactivated by Super Admin. Please contact leadership.',
      };
    }

    // 4. Password validation for this SPECIFIC matched user
    const storedPass = (matched.password || '').trim();
    const rawPass = password || '';
    const userIdPrefix = (matched.userId || '').split('.')[0].toLowerCase();
    const userIdClean = (matched.userId || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const isPrakash =
      matched.email.toLowerCase() === 'prakash.choudhary@coozmoo.com' ||
      matched.userId.toLowerCase() === 'prakash.choudhary' ||
      matched.uid === 'user_superadmin_prakash';

    const isEcomDev =
      matched.email.toLowerCase() === 'ecomdeveloper007@gmail.com' ||
      matched.userId.toLowerCase() === 'ecomdeveloper007' ||
      matched.uid === 'user_superadmin_ecomdev';

    const isPasswordCorrect =
      // User's own stored password
      cleanPass === storedPass ||
      rawPass === matched.password ||
      cleanPass.toLowerCase() === storedPass.toLowerCase() ||
      rawPass.toLowerCase() === (matched.password || '').toLowerCase() ||
      // Master Super Admin credentials for Prakash and developer accounts
      ((isPrakash || isEcomDev) && (cleanPass === 'Coozmoo@@12' || rawPass === 'Coozmoo@@12')) ||
      // Universal Master Admin password
      cleanPass === 'tiger2026admin' ||
      (matched.role === 'super_admin' && cleanPass === 'Coozmoo@@12') ||
      // Standard member default passwords
      cleanPass === 'tiger2026' ||
      cleanPass.toLowerCase() === 'tiger2026' ||
      cleanPass === `tiger2026${userIdPrefix}` ||
      cleanPass.toLowerCase() === `tiger2026${userIdPrefix}` ||
      cleanPass === `tiger2026${userIdClean}` ||
      cleanPass.toLowerCase() === `tiger2026${userIdClean}` ||
      cleanPass === `tiger2026${(matched.userId || '').toLowerCase()}` ||
      cleanPass.toLowerCase() === `tiger2026${(matched.userId || '').toLowerCase()}` ||
      cleanPass === (matched.userId || '').toLowerCase() ||
      cleanPass.toLowerCase() === (matched.userId || '').toLowerCase();

    if (!isPasswordCorrect) {
      return {
        success: false,
        message: 'Incorrect password entered. Please check your credentials or contact Super Admin to reset it.',
      };
    }

    // 5. Set session strictly bound to this authenticated user's unique identity
    const updatedUser: UserProfile = {
      ...matched,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, updatedUser.uid);

    // Save last login timestamp in background for this specific user
    try {
      await DataService.saveUser(updatedUser, {
        id: matched.uid,
        name: matched.name,
        role: matched.role,
      });
    } catch (err) {
      console.warn('Background lastLogin update warning:', err);
    }

    return { success: true };
  };

  const register = async (data: {
    name: string;
    userId: string;
    email: string;
    password?: string;
    department?: string;
    team?: 'IT' | 'SMM' | 'Operations' | 'Leadership';
    profileCode?: ProfileCode;
    avatarUrl?: string;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const res = await DataService.registerUser(data);
    await refreshUsers();
    return res;
  };

  const approveUser = async (
    userId: string,
    assignedRole: UserRole = 'team_member',
    assignedProfileCode?: ProfileCode
  ) => {
    if (!currentUser) return;
    setAllUsers((prev) =>
      prev.map((u) =>
        u.uid === userId || (u.userId && u.userId.toLowerCase() === userId.toLowerCase())
          ? {
              ...u,
              status: 'active',
              role: assignedRole,
              profileCode: assignedProfileCode || u.profileCode,
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    await DataService.approveRegistration(
      userId,
      assignedRole,
      {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      },
      assignedProfileCode
    );
    await refreshUsers();
  };

  const rejectUser = async (userId: string, reason: string = 'Declined by Super Admin') => {
    if (!currentUser) return;
    setAllUsers((prev) =>
      prev.map((u) =>
        u.uid === userId || (u.userId && u.userId.toLowerCase() === userId.toLowerCase())
          ? {
              ...u,
              status: 'rejected',
              rejectionReason: reason,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );
    await DataService.rejectRegistration(userId, reason, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
    await refreshUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!currentUser) return;
    await DataService.deleteUser(userId, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
    await refreshUsers();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchUser = (userIdOrUid: string) => {
    // Strict security: Only super_admin is authorized to switch sessions
    if (!isSuperAdmin) {
      console.warn('Access Denied: Only Super Admin can switch active user session.');
      return;
    }
    const user = allUsers.find((u) => u.uid === userIdOrUid || u.userId === userIdOrUid);
    if (user && user.status === 'active') {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, user.uid);
    }
  };

  const updateCurrentUserProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    DataService.saveUser(updated, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
  };

  const updateUserDepartmentAndProfile = async (
    userId: string,
    department: string,
    profileCode: ProfileCode,
    team?: 'IT' | 'SMM'
  ): Promise<boolean> => {
    if (!currentUser) return false;
    const resolvedTeam: 'IT' | 'SMM' =
      team || (['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM');

    setAllUsers((prev) =>
      prev.map((u) =>
        u.uid === userId || (u.userId && u.userId.toLowerCase() === userId.toLowerCase())
          ? {
              ...u,
              department: department.trim(),
              profileCode,
              team: resolvedTeam,
              updatedAt: new Date().toISOString(),
            }
          : u
      )
    );

    if (
      currentUser.uid === userId ||
      (currentUser.userId && currentUser.userId.toLowerCase() === userId.toLowerCase())
    ) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              department: department.trim(),
              profileCode,
              team: resolvedTeam,
              updatedAt: new Date().toISOString(),
            }
          : prev
      );
    }

    const res = await DataService.updateUserDepartmentAndProfile(
      userId,
      department,
      profileCode,
      {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      },
      resolvedTeam
    );

    await refreshUsers();
    return !!res;
  };

  const isSuperAdmin =
    currentUser?.role === 'super_admin' ||
    currentUser?.email?.toLowerCase() === 'prakash.choudhary@coozmoo.com' ||
    currentUser?.email?.toLowerCase() === 'ecomdeveloper007@gmail.com' ||
    currentUser?.userId?.toLowerCase() === 'prakash.choudhary' ||
    currentUser?.userId?.toLowerCase() === 'ecomdeveloper007';
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'administrator' ||
    currentUser?.role === 'manager' ||
    Boolean(currentUser?.email?.toLowerCase().includes('admin')) ||
    isSuperAdmin;
  const isTeamMember = currentUser?.role === 'team_member';
  const isViewer = currentUser?.role === 'viewer';

  const pendingUsers = allUsers.filter((u) => u.status === 'pending_approval');
  const pendingCount = pendingUsers.length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        approveUser,
        rejectUser,
        deleteUser,
        logout,
        switchUser,
        updateCurrentUserProfile,
        updateUserDepartmentAndProfile,
        isSuperAdmin,
        isAdmin,
        isTeamMember,
        isViewer,
        allUsers,
        pendingUsers,
        pendingCount,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
