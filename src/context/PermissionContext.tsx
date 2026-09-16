import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AppRole, PermissionAction, SystemModule } from '../types/permissions';
import { UserProfile } from '../types';
import { PermissionService } from '../services/permissionService';
import { useAuth } from './AuthContext';
import { DEFAULT_APP_ROLES } from '../data/defaultRoles';

interface PermissionContextType {
  roles: AppRole[];
  activeRoles: AppRole[];
  isLoadingRoles: boolean;
  hasPermission: (sectionId: string, action?: PermissionAction) => boolean;
  canAccessSection: (sectionId: string) => boolean;
  canAccessModule: (module: SystemModule) => boolean;
  checkUserPermission: (
    targetUser: UserProfile | null | undefined,
    sectionId: string,
    action?: PermissionAction
  ) => boolean;
  createRole: (roleData: Partial<AppRole> & { id: string; name: string }) => Promise<AppRole>;
  updateRole: (roleData: Partial<AppRole> & { id: string; name: string }) => Promise<AppRole>;
  deleteRole: (roleId: string) => Promise<boolean>;
  refreshRoles: () => Promise<void>;
  enforcePermission: (sectionId: string, action: PermissionAction) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>(() => {
    try {
      const raw = localStorage.getItem('it_smm_app_roles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load initial roles from cache:', e);
    }
    return DEFAULT_APP_ROLES;
  });
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);

  const loadRoles = useCallback(async (force = false) => {
    try {
      setIsLoadingRoles(true);
      const fetched = await PermissionService.getRoles(force);
      setRoles(fetched);
    } catch (e) {
      console.warn('Error loading roles:', e);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    loadRoles(true);
    const unsub = PermissionService.subscribeToRoles((updated) => {
      if (updated && updated.length > 0) {
        setRoles(updated);
        setIsLoadingRoles(false);
      }
    });
    return () => unsub();
  }, [loadRoles]);

  // Re-fetch roles whenever authentication state changes (login, logout, role switch)
  useEffect(() => {
    if (currentUser) {
      loadRoles(true);
    }
  }, [currentUser?.uid, currentUser?.role, loadRoles]);

  const activeRoles = useMemo(() => {
    return roles.filter((r) => r.status === 'active');
  }, [roles]);

  const hasPermission = useCallback(
    (sectionId: string, action: PermissionAction = 'view'): boolean => {
      return PermissionService.checkUserPermission(currentUser, sectionId, action, roles);
    },
    [currentUser, roles]
  );

  const canAccessSection = useCallback(
    (sectionId: string): boolean => {
      return PermissionService.canAccessSection(currentUser, sectionId, roles);
    },
    [currentUser, roles]
  );

  const canAccessModule = useCallback(
    (module: SystemModule): boolean => {
      return PermissionService.canAccessModule(currentUser, module, roles);
    },
    [currentUser, roles]
  );

  const checkUserPermission = useCallback(
    (
      targetUser: UserProfile | null | undefined,
      sectionId: string,
      action: PermissionAction = 'view'
    ): boolean => {
      return PermissionService.checkUserPermission(targetUser, sectionId, action, roles);
    },
    [roles]
  );

  const createRole = useCallback(
    async (roleData: Partial<AppRole> & { id: string; name: string }): Promise<AppRole> => {
      if (!currentUser) {
        throw new Error('403 Forbidden: Authentication required.');
      }
      const saved = await PermissionService.saveRole(roleData, {
        uid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });
      await loadRoles();
      return saved;
    },
    [currentUser, loadRoles]
  );

  const updateRole = useCallback(
    async (roleData: Partial<AppRole> & { id: string; name: string }): Promise<AppRole> => {
      if (!currentUser) {
        throw new Error('403 Forbidden: Authentication required.');
      }
      const saved = await PermissionService.saveRole(roleData, {
        uid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });
      await loadRoles();
      return saved;
    },
    [currentUser, loadRoles]
  );

  const deleteRole = useCallback(
    async (roleId: string): Promise<boolean> => {
      if (!currentUser) {
        throw new Error('403 Forbidden: Authentication required.');
      }
      const success = await PermissionService.deleteRole(roleId, {
        uid: currentUser.uid,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      });
      await loadRoles();
      return success;
    },
    [currentUser, loadRoles]
  );

  const enforcePermission = useCallback(
    (sectionId: string, action: PermissionAction): void => {
      PermissionService.enforcePermission(currentUser, sectionId, action, roles);
    },
    [currentUser, roles]
  );

  return (
    <PermissionContext.Provider
      value={{
        roles,
        activeRoles,
        isLoadingRoles,
        hasPermission,
        canAccessSection,
        canAccessModule,
        checkUserPermission,
        createRole,
        updateRole,
        deleteRole,
        refreshRoles: loadRoles,
        enforcePermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
