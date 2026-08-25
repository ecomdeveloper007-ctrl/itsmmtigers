import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  KPIConfig,
  PerformancePeriod,
  PerformanceRecord,
  AppSettings,
  AuditLog,
  LeaderboardData,
  ToastMessage,
  ToastType,
  MemberPerformanceSummary,
  TeamType,
} from '../types';
import { DataService } from '../services/dataService';
import {
  DEFAULT_KPIS,
  DEFAULT_SETTINGS,
  calculateLeaderboard,
  validateKPIWeights,
  resolveUserTeam,
} from '../services/calculationService';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Data
  kpis: KPIConfig[];
  periods: PerformancePeriod[];
  records: PerformanceRecord[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  leaderboardData: LeaderboardData;
  itLeaderboardData: LeaderboardData;
  smmLeaderboardData: LeaderboardData;
  isLoading: boolean;

  // Selected filters
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedPeriodId: string; // 'all' or specific period id
  setSelectedPeriodId: (id: string) => void;
  selectedTeam: TeamType;
  setSelectedTeam: (team: TeamType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableMonths: string[];
  availableYears: number[];

  // Winner modal
  isWinnerModalOpen: boolean;
  openWinnerModal: () => void;
  closeWinnerModal: () => void;

  // Modals & Navigation
  activeTab: 'dashboard' | 'leaderboard' | 'my-performance' | 'admin-data' | 'user-management' | 'period-management' | 'kpi-settings' | 'audit-logs' | 'reports';
  setActiveTab: (tab: any) => void;
  isDataEntryModalOpen: boolean;
  openDataEntryModal: (record?: PerformanceRecord, periodId?: string) => void;
  closeDataEntryModal: () => void;
  editingRecord: PerformanceRecord | null;
  targetPeriodIdForEntry: string | null;

  // Actions
  savePerformanceRecord: (record: PerformanceRecord) => Promise<boolean>;
  deletePerformanceRecord: (recordId: string) => Promise<boolean>;
  saveKPIConfig: (kpis: KPIConfig[]) => Promise<{ success: boolean; message?: string }>;
  saveAppSettings: (settings: AppSettings) => Promise<boolean>;
  savePeriod: (period: PerformancePeriod) => Promise<boolean>;
  togglePeriodLock: (periodId: string, status: 'active' | 'locked') => Promise<boolean>;
  refreshAllData: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Helpers
  getMemberSummary: (userId: string) => MemberPerformanceSummary | undefined;
  isPeriodLocked: (periodId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, allUsers, refreshUsers } = useAuth();

  // State
  const [kpis, setKpis] = useState<KPIConfig[]>(DEFAULT_KPIS);
  const [periods, setPeriods] = useState<PerformancePeriod[]>([]);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<TeamType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard' | 'my-performance' | 'admin-data' | 'user-management' | 'period-management' | 'kpi-settings' | 'audit-logs' | 'reports'>('dashboard');
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [isDataEntryModalOpen, setIsDataEntryModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PerformanceRecord | null>(null);
  const [targetPeriodIdForEntry, setTargetPeriodIdForEntry] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [fetchedKpis, fetchedPeriods, fetchedRecords, fetchedSettings, fetchedLogs] =
        await Promise.all([
          DataService.getKPIs(),
          DataService.getPeriods(),
          DataService.getRecords(),
          DataService.getSettings(),
          DataService.getAuditLogs(),
        ]);

      setKpis(fetchedKpis);
      setPeriods(fetchedPeriods);
      setRecords(fetchedRecords);
      setSettings(fetchedSettings);
      setAuditLogs(fetchedLogs);
    } catch (e) {
      console.error('Error loading app data:', e);
      addToast('error', 'Data sync issue', 'Loaded cached offline state.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Compute available months & years from periods and records
  const { availableMonths, availableYears } = useMemo(() => {
    const monthsSet = new Set<string>(['August', 'September', 'October', 'November', 'December', 'July', 'June']);
    const yearsSet = new Set<number>([2026, 2025, 2027]);

    periods.forEach((p) => {
      if (p.month) monthsSet.add(p.month);
      if (p.year) yearsSet.add(p.year);
    });
    records.forEach((r) => {
      if (r.month) monthsSet.add(r.month);
      if (r.year) yearsSet.add(r.year);
    });

    return {
      availableMonths: Array.from(monthsSet),
      availableYears: Array.from(yearsSet).sort((a, b) => b - a),
    };
  }, [periods, records]);

  // Compute Real-Time Leaderboard with tie-breakers and metrics for currently selected team
  const leaderboardData = useMemo(() => {
    return calculateLeaderboard(
      allUsers,
      records,
      kpis,
      settings,
      selectedMonth,
      selectedYear,
      selectedPeriodId,
      selectedTeam
    );
  }, [allUsers, records, kpis, settings, selectedMonth, selectedYear, selectedPeriodId, selectedTeam]);

  // Compute dedicated IT Team Leaderboard
  const itLeaderboardData = useMemo(() => {
    return calculateLeaderboard(
      allUsers,
      records,
      kpis,
      settings,
      selectedMonth,
      selectedYear,
      selectedPeriodId,
      'it'
    );
  }, [allUsers, records, kpis, settings, selectedMonth, selectedYear, selectedPeriodId]);

  // Compute dedicated SMM Team Leaderboard
  const smmLeaderboardData = useMemo(() => {
    return calculateLeaderboard(
      allUsers,
      records,
      kpis,
      settings,
      selectedMonth,
      selectedYear,
      selectedPeriodId,
      'smm'
    );
  }, [allUsers, records, kpis, settings, selectedMonth, selectedYear, selectedPeriodId]);

  // Helpers
  const getMemberSummary = (userId: string): MemberPerformanceSummary | undefined => {
    return leaderboardData.rankings.find(
      (m) => m.userId === userId || m.userId === currentUser?.userId || m.userName === currentUser?.name
    );
  };

  const isPeriodLocked = (periodId: string): boolean => {
    const period = periods.find((p) => p.id === periodId);
    return period?.status === 'locked';
  };

  // Actions
  const openWinnerModal = () => setIsWinnerModalOpen(true);
  const closeWinnerModal = () => setIsWinnerModalOpen(false);

  const openDataEntryModal = (record?: PerformanceRecord, periodId?: string) => {
    setEditingRecord(record || null);
    setTargetPeriodIdForEntry(periodId || null);
    setIsDataEntryModalOpen(true);
  };

  const closeDataEntryModal = () => {
    setIsDataEntryModalOpen(false);
    setEditingRecord(null);
    setTargetPeriodIdForEntry(null);
  };

  const savePerformanceRecord = async (record: PerformanceRecord): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await DataService.saveRecord(record, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });

      // Update state
      const updated = await DataService.getRecords();
      setRecords(updated);
      const updatedLogs = await DataService.getAuditLogs();
      setAuditLogs(updatedLogs);

      addToast(
        'success',
        'Performance Saved Successfully',
        `Recorded for ${record.userName} (${record.weekName})`
      );
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save performance', 'Please try again.');
      return false;
    }
  };

  const deletePerformanceRecord = async (recordId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await DataService.deleteRecord(recordId, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });

      const updated = await DataService.getRecords();
      setRecords(updated);
      const updatedLogs = await DataService.getAuditLogs();
      setAuditLogs(updatedLogs);

      addToast('info', 'Record Deleted', 'The performance record was removed.');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Error deleting record');
      return false;
    }
  };

  const saveKPIConfig = async (
    newKpis: KPIConfig[]
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated' };

    const validation = validateKPIWeights(newKpis);
    if (!validation.isValid) {
      addToast('error', 'Invalid KPI Weights', 'Total KPI weight must equal 100%.');
      return { success: false, message: 'Total KPI weight must equal 100%.' };
    }

    try {
      await DataService.saveKPIs(newKpis, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });
      setKpis(newKpis);
      const updatedLogs = await DataService.getAuditLogs();
      setAuditLogs(updatedLogs);
      addToast('success', 'KPI Settings Saved', 'Weights and targets have been updated.');
      return { success: true };
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save KPIs');
      return { success: false, message: 'Failed to update KPIs in database' };
    }
  };

  const saveAppSettings = async (newSettings: AppSettings): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await DataService.saveSettings(newSettings, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });
      setSettings(newSettings);
      addToast('success', 'System Settings Updated');
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to update settings');
      return false;
    }
  };

  const savePeriod = async (period: PerformancePeriod): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await DataService.savePeriod(period, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });
      const updated = await DataService.getPeriods();
      setPeriods(updated);
      addToast('success', 'Period Saved', `${period.month} ${period.year} - ${period.weekName}`);
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save period');
      return false;
    }
  };

  const togglePeriodLock = async (
    periodId: string,
    status: 'active' | 'locked'
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await DataService.togglePeriodLock(periodId, status, {
        id: currentUser.uid,
        name: currentUser.name,
        role: currentUser.role,
      });
      const updated = await DataService.getPeriods();
      setPeriods(updated);
      addToast(
        status === 'locked' ? 'warning' : 'success',
        status === 'locked' ? 'Period Locked' : 'Period Unlocked',
        `Data entries for this period are now ${status === 'locked' ? 'locked from member edits' : 'open for submissions'}.`
      );
      return true;
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to update lock status');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        kpis,
        periods,
        records,
        settings,
        auditLogs,
        leaderboardData,
        itLeaderboardData,
        smmLeaderboardData,
        isLoading,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        selectedPeriodId,
        setSelectedPeriodId,
        selectedTeam,
        setSelectedTeam,
        searchQuery,
        setSearchQuery,
        availableMonths,
        availableYears,
        isWinnerModalOpen,
        openWinnerModal,
        closeWinnerModal,
        activeTab,
        setActiveTab,
        isDataEntryModalOpen,
        openDataEntryModal,
        closeDataEntryModal,
        editingRecord,
        targetPeriodIdForEntry,
        savePerformanceRecord,
        deletePerformanceRecord,
        saveKPIConfig,
        saveAppSettings,
        savePeriod,
        togglePeriodLock,
        refreshAllData,
        toasts,
        addToast,
        removeToast,
        getMemberSummary,
        isPeriodLocked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
