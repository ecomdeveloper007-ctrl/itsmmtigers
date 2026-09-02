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
  isLoading: boolean;

  // Filters
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
  openSalesEntryModal: (record?: SalesPerformanceRecord, defaultEmpId?: string) => void;
  closeSalesEntryModal: () => void;
  editingSalesRecord: SalesPerformanceRecord | null;
  defaultEmpIdForEntry: string | null;

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
  saveSalesPerformanceRecord: (record: SalesPerformanceRecord) => Promise<boolean>;
  deleteSalesPerformanceRecord: (recordId: string) => Promise<boolean>;
  saveSalesRewardSettings: (settings: SalesRewardSettings) => Promise<boolean>;
  resetSalesRewardSettings: () => Promise<boolean>;
  importSalesCSV: (csvText: string) => Promise<{ success: boolean; count: number; errors: string[] }>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'IT' | 'SMM'>('all');
  const [selectedProfile, setSelectedProfile] = useState<'all' | SalesProfileCode>('all');
  const [selectedRewardLevel, setSelectedRewardLevel] = useState<string>('all');
  const [salesSearchQuery, setSalesSearchQuery] = useState<string>('');

  // Modals
  const [isSalesEntryModalOpen, setIsSalesEntryModalOpen] = useState<boolean>(false);
  const [editingSalesRecord, setEditingSalesRecord] = useState<SalesPerformanceRecord | null>(null);
  const [defaultEmpIdForEntry, setDefaultEmpIdForEntry] = useState<string | null>(null);

  const [isSalesEmployeeModalOpen, setIsSalesEmployeeModalOpen] = useState<boolean>(false);
  const [editingSalesEmployee, setEditingSalesEmployee] = useState<SalesEmployee | null>(null);

  const [isSalesImportModalOpen, setIsSalesImportModalOpen] = useState<boolean>(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<SalesEmployee | null>(null);

  const refreshSalesData = async () => {
    setIsLoading(true);
    try {
      await SalesDataService.initializeSalesData();
      const [fetchedEmp, fetchedRecs, fetchedSettings] = await Promise.all([
        SalesDataService.getEmployees(),
        SalesDataService.getRecords(),
        SalesDataService.getSettings(),
      ]);

      setSalesEmployees(fetchedEmp);
      setSalesRecords(fetchedRecs);
      setSalesSettings(fetchedSettings);
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
      selectedYear
    );
  }, [salesEmployees, salesRecords, salesSettings, selectedMonth, selectedYear]);

  // Compute Department Summaries
  const itDepartmentSummary = useMemo(() => {
    const currentRecs = salesRecords.filter(
      (r) => r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear)
    );
    return getDepartmentPerformance(currentRecs, salesEmployees, 'IT', salesSettings);
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, salesSettings]);

  const smmDepartmentSummary = useMemo(() => {
    const currentRecs = salesRecords.filter(
      (r) => r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear)
    );
    return getDepartmentPerformance(currentRecs, salesEmployees, 'SMM', salesSettings);
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, salesSettings]);

  // Compute Profile Summaries
  const profileSummaries = useMemo(() => {
    const currentRecs = salesRecords.filter(
      (r) => r.month.toLowerCase() === selectedMonth.toLowerCase() && Number(r.year) === Number(selectedYear)
    );
    const codes: SalesProfileCode[] = ['PR', 'WR', 'HW', 'DR', 'RR'];
    const res: Record<SalesProfileCode, SalesProfileSummary> = {} as any;
    codes.forEach((code) => {
      res[code] = getProfilePerformance(currentRecs, salesEmployees, code, salesSettings);
    });
    return res;
  }, [salesRecords, salesEmployees, selectedMonth, selectedYear, salesSettings]);

  // Modal handlers
  const openSalesEntryModal = (record?: SalesPerformanceRecord, defaultEmpId?: string) => {
    setEditingSalesRecord(record || null);
    setDefaultEmpIdForEntry(defaultEmpId || null);
    setIsSalesEntryModalOpen(true);
  };

  const closeSalesEntryModal = () => {
    setIsSalesEntryModalOpen(false);
    setEditingSalesRecord(null);
    setDefaultEmpIdForEntry(null);
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
  const saveSalesEmployee = async (employee: SalesEmployee): Promise<boolean> => {
    try {
      await SalesDataService.saveEmployee(employee);
      const updated = await SalesDataService.getEmployees();
      setSalesEmployees(updated);
      addToast('success', 'Sales Employee Saved', `${employee.name} (${employee.profileCode}) profile is ready.`);
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save sales employee');
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
      await SalesDataService.deleteEmployee(empId);
      const [updatedEmp, updatedRecs] = await Promise.all([
        SalesDataService.getEmployees(),
        SalesDataService.getRecords(),
      ]);
      setSalesEmployees(updatedEmp);
      setSalesRecords(updatedRecs);
      addToast('info', 'Sales Employee Removed', 'Employee permanently deleted from Sales roster.');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to delete sales employee');
      return false;
    }
  };

  const saveSalesPerformanceRecord = async (record: SalesPerformanceRecord): Promise<boolean> => {
    try {
      const computed = computeCompleteSalesRecord(
        {
          ...record,
          submittedBy: currentUser?.name || 'Manager',
        },
        salesSettings
      );
      await SalesDataService.saveRecord(computed);
      const updated = await SalesDataService.getRecords();
      setSalesRecords(updated);
      addToast(
        'success',
        'Sales Performance Recorded',
        `Score: ${computed.totalPerformanceScore} PTS • Conversion: ${computed.conversionRate}% • Reward: ${computed.rewardLevel}`
      );
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save sales performance');
      return false;
    }
  };

  const deleteSalesPerformanceRecord = async (recordId: string): Promise<boolean> => {
    try {
      setSalesRecords((prev) => prev.filter((r) => r.id !== recordId));
      await SalesDataService.deleteRecord(recordId);
      addToast('info', 'Performance Record Deleted');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to delete record');
      return false;
    }
  };

  const saveSalesRewardSettings = async (settings: SalesRewardSettings): Promise<boolean> => {
    try {
      await SalesDataService.saveSettings(settings);
      setSalesSettings(settings);

      // Recompute all records with new settings
      const existing = await SalesDataService.getRecords();
      const recomputed = existing.map((r) => computeCompleteSalesRecord(r, settings));
      for (const rec of recomputed) {
        await SalesDataService.saveRecord(rec);
      }
      setSalesRecords(recomputed);

      addToast('success', 'Sales Settings Updated', 'Target rules and reward slabs have been recalibrated.');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save sales settings');
      return false;
    }
  };

  const resetSalesRewardSettings = async (): Promise<boolean> => {
    try {
      await SalesDataService.resetSettingsToDefault();
      setSalesSettings(DEFAULT_SALES_SETTINGS);
      addToast('info', 'Settings Reset', 'Sales targets and weights reset to factory default standards.');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to reset settings');
      return false;
    }
  };

  const importSalesCSV = async (
    csvText: string
  ): Promise<{ success: boolean; count: number; errors: string[] }> => {
    try {
      const parsed = SalesDataService.parseSalesCSV(
        csvText,
        salesEmployees,
        salesSettings,
        selectedMonth,
        selectedYear
      );

      if (parsed.errors.length > 0 && parsed.records.length === 0) {
        return { success: false, count: 0, errors: parsed.errors };
      }

      // Save new employees
      for (const newEmp of parsed.newEmployees) {
        await SalesDataService.saveEmployee(newEmp);
      }

      // Save records
      for (const rec of parsed.records) {
        await SalesDataService.saveRecord(rec);
      }

      const updatedEmp = await SalesDataService.getEmployees();
      const updatedRecs = await SalesDataService.getRecords();
      setSalesEmployees(updatedEmp);
      setSalesRecords(updatedRecs);

      addToast('success', 'CSV Import Completed', `Imported ${parsed.records.length} sales performance records.`);
      return { success: true, count: parsed.records.length, errors: parsed.errors };
    } catch (e: any) {
      console.error(e);
      return { success: false, count: 0, errors: [e.message || 'Unknown import error'] };
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
        isLoading,
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
