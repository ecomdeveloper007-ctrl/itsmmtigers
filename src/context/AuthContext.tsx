import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { DataService, INITIAL_USERS } from '../services/dataService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userIdOrEmail: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (profile: Partial<UserProfile>) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
  allUsers: UserProfile[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'tiger_current_user_v2';

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
      const user = users.find((u) => u.uid === savedUid || u.userId === savedUid);
      if (user && user.status === 'active') {
        setCurrentUser(user);
      } else {
        // Default to Super Admin on fresh view for comprehensive review
        const superAdmin = users.find((u) => u.role === 'super_admin');
        if (superAdmin) {
          setCurrentUser(superAdmin);
          localStorage.setItem(CURRENT_USER_KEY, superAdmin.uid);
        }
      }
    } else {
      // Default to Super Admin for immediate demo readiness
      const superAdmin = users.find((u) => u.role === 'super_admin');
      if (superAdmin) {
        setCurrentUser(superAdmin);
        localStorage.setItem(CURRENT_USER_KEY, superAdmin.uid);
      }
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
      if (updated) setCurrentUser(updated);
    }
  };

  const login = async (userIdOrEmail: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = userIdOrEmail.trim().toLowerCase();
    const users = await DataService.getUsers();
    setAllUsers(users);

    const matched = users.find(
      (u) =>
        u.userId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.name.toLowerCase() === cleanId
    );

    if (!matched) {
      return {
        success: false,
        message: 'Invalid User ID or Email. Please check credentials or select a quick-login profile below.',
      };
    }

    if (matched.status === 'disabled') {
      return {
        success: false,
        message: 'This account has been disabled by the Super Admin. Please contact leadership.',
      };
    }

    // Update last login timestamp
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchUser = (userIdOrUid: string) => {
    const user = allUsers.find((u) => u.uid === userIdOrUid || u.userId === userIdOrUid);
    if (user) {
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

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;
  const isTeamMember = currentUser?.role === 'team_member';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        switchUser,
        updateCurrentUserProfile,
        isSuperAdmin,
        isAdmin,
        isTeamMember,
        allUsers,
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
