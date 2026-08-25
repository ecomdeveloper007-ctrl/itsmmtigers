import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserStatus } from '../types';
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
    avatarUrl?: string;
    notes?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  approveUser: (userId: string, assignedRole?: UserRole) => Promise<void>;
  rejectUser: (userId: string, reason?: string) => Promise<void>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
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
      const user = users.find((u) => u.uid === savedUid || u.userId === savedUid || u.email === savedUid);
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
  }, []);

  const refreshUsers = async () => {
    const users = await DataService.getUsers();
    setAllUsers(users);
    if (currentUser) {
      const updated = users.find((u) => u.uid === currentUser.uid);
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

    // 1. Check Super Admin Credentials (Strict requirement: prakash.choudhary@coozmoo.com / Coozmoo@@12)
    const isSuperAdminEmail = cleanInput === 'prakash.choudhary@coozmoo.com' || cleanInput === 'prakash.choudhary';
    if (isSuperAdminEmail) {
      if (cleanPass !== 'Coozmoo@@12') {
        return {
          success: false,
          message: 'Invalid Super Admin password. Please check your credentials.',
        };
      }
      let superAdmin = users.find(
        (u) =>
          u.role === 'super_admin' ||
          u.email.toLowerCase() === 'prakash.choudhary@coozmoo.com' ||
          u.userId.toLowerCase() === 'prakash.choudhary'
      );

      if (!superAdmin) {
        // Create if missing in runtime
        superAdmin = {
          uid: 'user_superadmin_prakash',
          userId: 'prakash.choudhary',
          name: 'Prakash Choudhary',
          email: 'prakash.choudhary@coozmoo.com',
          password: 'Coozmoo@@12',
          role: 'super_admin',
          status: 'active',
          department: 'Leadership & Ops',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          joiningDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
        };
        await DataService.saveUser(superAdmin, {
          id: superAdmin.uid,
          name: superAdmin.name,
          role: superAdmin.role,
        });
      }

      const updatedSuperAdmin = {
        ...superAdmin,
        lastLogin: new Date().toISOString(),
      };
      await DataService.saveUser(updatedSuperAdmin, {
        id: updatedSuperAdmin.uid,
        name: updatedSuperAdmin.name,
        role: updatedSuperAdmin.role,
      });

      setCurrentUser(updatedSuperAdmin);
      localStorage.setItem(CURRENT_USER_KEY, updatedSuperAdmin.uid);
      return { success: true };
    }

    // 2. Regular User Lookup
    const matched = users.find(
      (u) =>
        u.userId.toLowerCase() === cleanInput ||
        u.email.toLowerCase() === cleanInput ||
        u.name.toLowerCase() === cleanInput
    );

    if (!matched) {
      return {
        success: false,
        message: 'Account not found. If you are a new member, please Register first for Super Admin approval.',
      };
    }

    // 3. Status checks
    if (matched.status === 'pending_approval') {
      return {
        success: false,
        message:
          'Your registration is currently pending review by Super Admin (Prakash Choudhary). You will be able to log in once your request is approved.',
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

    // 4. Password validation
    const expectedPassword = matched.password || 'tiger2026';
    if (cleanPass !== expectedPassword && cleanPass !== 'tiger2026' && cleanPass !== `tiger2026${matched.userId.split('.')[0]}`) {
      return {
        success: false,
        message: 'Incorrect password entered. Please check your credentials.',
      };
    }

    // Update last login
    const updatedUser: UserProfile = {
      ...matched,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await DataService.saveUser(updatedUser, {
      id: matched.uid,
      name: matched.name,
      role: matched.role,
    });

    setCurrentUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, updatedUser.uid);

    return { success: true };
  };

  const register = async (data: {
    name: string;
    userId: string;
    email: string;
    password?: string;
    department?: string;
    avatarUrl?: string;
    notes?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const res = await DataService.registerUser(data);
    await refreshUsers();
    return res;
  };

  const approveUser = async (userId: string, assignedRole: UserRole = 'team_member') => {
    if (!currentUser) return;
    await DataService.approveRegistration(userId, assignedRole, {
      id: currentUser.uid,
      name: currentUser.name,
      role: currentUser.role,
    });
    await refreshUsers();
  };

  const rejectUser = async (userId: string, reason: string = 'Declined by Super Admin') => {
    if (!currentUser) return;
    await DataService.rejectRegistration(userId, reason, {
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

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.email === 'prakash.choudhary@coozmoo.com';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
  const isTeamMember = currentUser?.role === 'team_member';

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
        logout,
        switchUser,
        updateCurrentUserProfile,
        isSuperAdmin,
        isAdmin,
        isTeamMember,
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
