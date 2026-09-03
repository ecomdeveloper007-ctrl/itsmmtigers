import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  SalesEmployee,
  SalesPerformanceRecord,
  SalesRewardSettings,
  SalesProfileCode,
  SalesDepartment,
  SalesLeaderboardItem,
  SalesDashboardSummary,
  SalesDepartmentSummary,
  SalesProfileSummary,
  SalesAuditLog,
} from '../types/sales';
import { SalesDataService, INITIAL_SALES_EMPLOYEES } from '../services/salesDataService';
import {
  DEFAULT_SALES_SETTINGS,
  calculateSalesLeaderboard,
  calculateSalesDashboardSummary,
  getDepartmentPerformance,
  getProfilePerformance,
  computeCompleteSalesRecord,
} from '../services/salesCalculationService';
import { isUserSuperAdmin, findMatchingSalesEmployee } from '../utils/salesAuthUtils';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';

export type SalesTab =
  | 'sales-dashboard'
  | 'sales-employees'
  | 'sales-performance'
  | 'sales-leaderboard'
  | 'sales-analytics'
  | 'sales-history'
  | 'sales-reports'
  | 'sales-audit'
  | 'sales-settings';

export type ActiveModule = 'pm' | 'sales';

interface SalesContextType {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  salesActiveTab: SalesTab;
  setSalesActiveTab: (tab: SalesTab) => void;

  // Data
  salesEmployees: SalesEmployee[];
  salesRecords: SalesPerformanceRecord[];
  salesSettings: SalesRewardSettings;
  auditLogs: SalesAuditLog[];
  isLoading: boolean;

  // Filters
  selectedWeek: string; // 'all' | 'Week 1' | 'Week 2' ...
  setSelectedWeek: (week: string) => void;
  selectedDepartment: 'all' | 'IT' | 'SMM';
  setSelectedDepartment: (dept: 'all' | 'IT' | 'SMM') => void;
  selectedProfile: 'all' | SalesProfileCode;
  setSelectedProfile: (prof: 'all' | SalesProfileCode) => void;
  selectedRewardLevel: string;
  setSelectedRewardLevel: (lvl: string) => void;
  salesSearchQuery: string;
  setSalesSearchQuery: (query: string) => void;

  // Computed views
  salesLeaderboardData: {
    items: SalesLeaderboardItem[];
    top3: SalesLeaderboardItem[];
    winner?: SalesLeaderboardItem;
  };
  salesDashboardSummary: SalesDashboardSummary;
  itDepartmentSummary: SalesDepartmentSummary;
  smmDepartmentSummary: SalesDepartmentSummary;
  profileSummaries: Record<SalesProfileCode, SalesProfileSummary>;

  // Modals
  isSalesEntryModalOpen: boolean;
  openSalesEntryModal: (record?: SalesPerformanceRecord, defaultEmpId?: string, defaultProfile?: SalesProfileCode) => void;
  closeSalesEntryModal: () => void;
  editingSalesRecord: SalesPerformanceRecord | null;
  defaultEmpIdForEntry: string | null;
  defaultProfileForEntry: SalesProfileCode | null;

  isSalesEmployeeModalOpen: boolean;
  openSalesEmployeeModal: (emp?: SalesEmployee) => void;
  closeSalesEmployeeModal: () => void;
  editingSalesEmployee: SalesEmployee | null;

  isSalesImportModalOpen: boolean;
  setIsSalesImportModalOpen: (open: boolean) => void;

  selectedEmployeeForDetail: SalesEmployee | null;
  setSelectedEmployeeForDetail: (emp: SalesEmployee | null) => void;

  // Actions
  saveSalesEmployee: (employee: SalesEmployee) => Promise<boolean>;
  deleteSalesEmployee: (empId: string) => Promise<boolean>;
  saveSalesPerformanceRecord: (record: SalesPerformanceRecord) => Promise<{ success: boolean; message?: string }>;
  deleteSalesPerformanceRecord: (recordId: string) => Promise<boolean>;
  saveSalesRewardSettings: (settings: SalesRewardSettings) => Promise<boolean>;
  resetSalesRewardSettings: () => Promise<boolean>;
  importSalesCSV: (csvText: string) => Promise<{ success: boolean; count: number; errors: string[] }>;
  refreshAuditLogs: () => Promise<void>;
  refreshSalesData: () => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedMonth, selectedYear, addToast } = useApp();
  const { currentUser } = useAuth();

  const [activeModule, setActiveModule] = useState<ActiveModule>('pm');
  const [salesActiveTab, setSalesActiveTab] = useState<SalesTab>('sales-dashboard');

  const [salesEmployees, setSalesEmployees] = useState<SalesEmployee[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesPerformanceRecord[]>([]);
  const [salesSettings, setSalesSettings] = useState<SalesRewardSettings>(DEFAULT_SALES_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<SalesAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'IT' | 'SMM'>('all');
  const [selectedProfile, setSelectedProfile] = useState<'all' | SalesProfileCode>('all');
  const [selectedRewardLevel, setSelectedRewardLevel] = useState<string>('all');
  const [salesSearchQuery, setSalesSearchQuery] = useState<string>('');

  // Modals
  const [isSalesEntryModalOpen, setIsSalesEntryModalOpen] = useState<boolean>(false);
  const [editingSalesRecord, setEditingSalesRecord] = useState<SalesPerformanceRecord | null>(null);
  const [defaultEmpIdForEntry, setDefaultEmpIdForEntry] = useState<string | null>(null);
  const [defaultProfileForEntry, setDefaultProfileForEntry] = useState<SalesProfileCode | null>(null);

  const [isSalesEmployeeModalOpen, setIsSalesEmployeeModalOpen] = useState<boolean>(false);
  const [editingSalesEmployee, setEditingSalesEmployee] = useState<SalesEmployee | null>(null);

  const [isSalesImportModalOpen, setIsSalesImportModalOpen] = useState<boolean>(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<SalesEmployee | null>(null);

  const refreshAuditLogs = async () => {
    try {
      const logs = await SalesDataService.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Error refreshing audit logs:', e);
    }
  };

  const refreshSalesData = async () => {
    setIsLoading(true);
    try {
      await SalesDataService.initializeSalesStore();
      const [fetchedEmp, fetchedRecs, fetchedSettings, fetchedLogs] = await Promise.all([
        SalesDataService.getEmployees(),
        SalesDataService.getRecords(),
        SalesDataService.getSettings(),
        SalesDataService.getAuditLogs(),
      ]);

      setSalesEmployees(fetchedEmp);
      setSalesRecords(fetchedRecs);
      setSalesSettings(fetchedSettings);
      setAuditLogs(fetchedLogs);
    } catch (e) {
      console.warn('Error loading sales data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSalesData();

    const unsubEmp = SalesDataService.subscribeToEmployees((emps) => {
      if (emps) setSalesEmployees(emps);
    });

    const unsubRecs = SalesDataService.subscribeToRecords((recs) => {
      if (recs) setSalesRecords(recs);
    });

    const unsubSettings = SalesDataService.subscribeToSettings((settings) => {
      if (settings) setSalesSettings(settings);
    });

    return () => {
      unsubEmp();
      unsubRecs();
      unsubSettings();
    };
  }, []);

  // Compute Leaderboard
  const salesLeaderboardData = useMemo(() => {
    return calculateSalesLeaderboard(
      salesEmployees,
      salesRecords,
      salesSettings,
      selectedMonth,
      selectedYear,
      selectedWeek,
      selectedDepartment,
      selectedProfile,
      selectedRewardLevel,
      salesSearchQuery
    );
  }, [
    salesEmployees,
    salesRecords,
    salesSettings,
    selectedMonth,
    selectedYear,
    selectedWeek,
    selectedDepartment,
    selectedProfile,
    selectedRewardLevel,
    salesSearchQuery,
  ]);

  // Compute Dashboard Summary
  const salesDashboardSummary = useMemo(() => {
    return calculateSalesDashboardSummary(
      salesEmployees,
      salesRecords,
      salesSettings,
      selectedMonth,
      selectedYear,
      selectedWeek
    );
  }, [salesEmployees, salesRecords, salesSettings, selectedMonth, selectedYear, selectedWeek]);

  // Compute Department Summaries
  const itDepartmentSummary = useMemo(() => {
    const currentRecs = salesRecords.filter((r) => {
      const matchMonth = r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear);
      if (!matchMonth) return false;
      if (selectedWeek !== 'all') return r.week === selectedWeek;
      return true;
    });
    return getDepartmentPerformance(currentRecs, salesEmployees, 'IT', salesSettings);
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, selectedWeek, salesSettings]);

  const smmDepartmentSummary = useMemo(() => {
    const currentRecs = salesRecords.filter((r) => {
      const matchMonth = r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear);
      if (!matchMonth) return false;
      if (selectedWeek !== 'all') return r.week === selectedWeek;
      return true;
    });
    return getDepartmentPerformance(currentRecs, salesEmployees, 'SMM', salesSettings);
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, selectedWeek, salesSettings]);

  // Compute Profile Summaries
  const profileSummaries = useMemo(() => {
    const currentRecs = salesRecords.filter((r) => {
      const matchMonth = r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear);
      if (!matchMonth) return false;
      if (selectedWeek !== 'all') return r.week === selectedWeek;
      return true;
    });
    const codes: SalesProfileCode[] = ['PR', 'WR', 'HW', 'DR', 'RR'];
    const res: Record<SalesProfileCode, SalesProfileSummary> = {} as any;
    codes.forEach((code) => {
      res[code] = getProfilePerformance(currentRecs, salesEmployees, code, salesSettings);
    });
    return res;
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, selectedWeek, salesSettings]);

  // Modal handlers
  const openSalesEntryModal = (
    record?: SalesPerformanceRecord,
    defaultEmpId?: string,
    defaultProfile?: SalesProfileCode
  ) => {
    setEditingSalesRecord(record || null);
    setDefaultEmpIdForEntry(defaultEmpId || null);
    setDefaultProfileForEntry(defaultProfile || null);
    setIsSalesEntryModalOpen(true);
  };

  const closeSalesEntryModal = () => {
    setIsSalesEntryModalOpen(false);
    setEditingSalesRecord(null);
    setDefaultEmpIdForEntry(null);
    setDefaultProfileForEntry(null);
  };

  const openSalesEmployeeModal = (emp?: SalesEmployee) => {
    setEditingSalesEmployee(emp || null);
    setIsSalesEmployeeModalOpen(true);
  };

  const closeSalesEmployeeModal = () => {
    setIsSalesEmployeeModalOpen(false);
    setEditingSalesEmployee(null);
  };

  // Actions
  const actor = useMemo(() => {
    return {
      id: currentUser?.uid || 'anonymous_user',
      uid: currentUser?.uid || 'anonymous_user',
      userId: currentUser?.userId,
      email: currentUser?.email,
      name: currentUser?.name || 'User',
      role: currentUser?.role || 'team_member',
    };
  }, [currentUser]);

  const saveSalesEmployee = async (employee: SalesEmployee): Promise<boolean> => {
    try {
      await SalesDataService.saveEmployee(employee, actor);
      const updated = await SalesDataService.getEmployees();
      setSalesEmployees(updated);
      refreshAuditLogs();
      addToast('success', 'Sales Employee Saved', `${employee.name} profiles updated: ${employee.assignedProfiles?.join(', ')}.`);
      return true;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to save sales employee', e.message || 'Access Denied');
      return false;
    }
  };

  const deleteSalesEmployee = async (empId: string): Promise<boolean> => {
    try {
      if (selectedEmployeeForDetail && (selectedEmployeeForDetail.id === empId || (selectedEmployeeForDetail as any).userId === empId)) {
        setSelectedEmployeeForDetail(null);
      }
      setSalesEmployees((prev) =>
        prev.filter((e) => e.id !== empId && (e as any).userId !== empId && (e.email || '').toLowerCase() !== empId.toLowerCase())
      );
      setSalesRecords((prev) =>
        prev.filter((r) => r.employeeId !== empId && (r.employeeName || '').toLowerCase() !== empId.toLowerCase())
      );
      await SalesDataService.deleteEmployee(empId, actor);
      const [updatedEmp, updatedRecs] = await Promise.all([
        SalesDataService.getEmployees(),
        SalesDataService.getRecords(),
      ]);
      setSalesEmployees(updatedEmp);
      setSalesRecords(updatedRecs);
      refreshAuditLogs();
      addToast('info', 'Sales Employee Removed', 'Employee permanently deleted from Sales roster.');
      return true;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to delete sales employee', e.message || 'Access Denied');
      return false;
    }
  };

  const saveSalesPerformanceRecord = async (
    record: SalesPerformanceRecord
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Backend/Database level security check
      if (currentUser) {
        const check = SalesDataService.validatePerformancePermission(
          currentUser,
          record.employeeId,
          record.profileCode,
          salesEmployees
        );
        if (!check.allowed) {
          addToast('error', 'Unauthorized Action', check.message || 'Access Denied');
          return { success: false, message: check.message };
        }
      }

      const computed = computeCompleteSalesRecord(
        {
          ...record,
          submittedBy: currentUser?.name || 'Team Member',
        },
        salesSettings
      );

      await SalesDataService.saveRecord(computed, actor);
      const updated = await SalesDataService.getRecords();
      setSalesRecords(updated);
      refreshAuditLogs();

      addToast(
        'success',
        'Performance Recorded',
        `${computed.profileCode} (${computed.week}): Score ${computed.totalPerformanceScore}/100 • Conv: ${computed.conversionRate}% • Reward: ${computed.rewardLevel}`
      );
      return { success: true };
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to save performance record', e.message);
      return { success: false, message: e.message };
    }
  };

  const deleteSalesPerformanceRecord = async (recordId: string): Promise<boolean> => {
    try {
      setSalesRecords((prev) => prev.filter((r) => r.id !== recordId));
      await SalesDataService.deleteRecord(recordId, actor);
      refreshAuditLogs();
      addToast('info', 'Performance Record Deleted');
      return true;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to delete record', e.message || 'Access Denied');
      return false;
    }
  };

  const saveSalesRewardSettings = async (settings: SalesRewardSettings): Promise<boolean> => {
    try {
      if (!isUserSuperAdmin(currentUser)) {
        addToast('error', 'Unauthorized Action', '403 Forbidden: Only Super Admin can modify targets, KPIs, and reward settings.');
        return false;
      }

      await SalesDataService.saveSettings(settings, actor);
      setSalesSettings(settings);

      // Recalibrate all records
      const existing = await SalesDataService.getRecords();
      const recomputed = existing.map((r) => computeCompleteSalesRecord(r, settings));
      for (const rec of recomputed) {
        await SalesDataService.saveRecord(rec, actor);
      }
      setSalesRecords(recomputed);
      refreshAuditLogs();

      addToast('success', 'Sales Settings Updated', 'Target rules, weights, and reward slabs recalibrated.');
      return true;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to save sales settings', e?.message || 'Access Denied');
      return false;
    }
  };

  const resetSalesRewardSettings = async (): Promise<boolean> => {
    try {
      if (!isUserSuperAdmin(currentUser)) {
        addToast('error', 'Unauthorized Action', '403 Forbidden: Only Super Admin can reset targets and settings.');
        return false;
      }
      await SalesDataService.resetSettingsToDefault(actor);
      setSalesSettings(DEFAULT_SALES_SETTINGS);
      refreshAuditLogs();
      addToast('info', 'Settings Reset', 'Sales targets and scoring weights reset to standards.');
      return true;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Failed to reset settings', e?.message || 'Access Denied');
      return false;
    }
  };

  const importSalesCSV = async (csvText: string): Promise<{ success: boolean; count: number; errors: string[] }> => {
    try {
      if (!isUserSuperAdmin(currentUser)) {
        addToast('error', 'Unauthorized Action', '403 Forbidden: Only Super Admin can import performance records.');
        return { success: false, count: 0, errors: ['403 Forbidden: Only Super Admin can import performance records.'] };
      }
      const res = await SalesDataService.importSalesCSV(csvText, actor);
      if (res.success) {
        const updated = await SalesDataService.getRecords();
        setSalesRecords(updated);
        refreshAuditLogs();
        addToast('success', 'Import Completed', `Imported ${res.count} records successfully.`);
      }
      return res;
    } catch (e: any) {
      console.error(e);
      addToast('error', 'Import Failed', e?.message || 'Access Denied');
      return { success: false, count: 0, errors: [e?.message || 'Access Denied'] };
    }
  };

  return (
    <SalesContext.Provider
      value={{
        activeModule,
        setActiveModule,
        salesActiveTab,
        setSalesActiveTab,
        salesEmployees,
        salesRecords,
        salesSettings,
        auditLogs,
        isLoading,
        selectedWeek,
        setSelectedWeek,
        selectedDepartment,
        setSelectedDepartment,
        selectedProfile,
        setSelectedProfile,
        selectedRewardLevel,
        setSelectedRewardLevel,
        salesSearchQuery,
        setSalesSearchQuery,
        salesLeaderboardData,
        salesDashboardSummary,
        itDepartmentSummary,
        smmDepartmentSummary,
        profileSummaries,
        isSalesEntryModalOpen,
        openSalesEntryModal,
        closeSalesEntryModal,
        editingSalesRecord,
        defaultEmpIdForEntry,
        defaultProfileForEntry,
        isSalesEmployeeModalOpen,
        openSalesEmployeeModal,
        closeSalesEmployeeModal,
        editingSalesEmployee,
        isSalesImportModalOpen,
        setIsSalesImportModalOpen,
        selectedEmployeeForDetail,
        setSelectedEmployeeForDetail,
        saveSalesEmployee,
        deleteSalesEmployee,
        saveSalesPerformanceRecord,
        deleteSalesPerformanceRecord,
        saveSalesRewardSettings,
        resetSalesRewardSettings,
        importSalesCSV,
        refreshAuditLogs,
        refreshSalesData,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
