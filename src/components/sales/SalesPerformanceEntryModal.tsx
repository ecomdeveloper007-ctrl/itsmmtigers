import React, { useState, useEffect, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  SalesPerformanceRecord,
  SalesProfileCode,
  SalesDepartment,
  SalesEmployee,
  SALES_PROFILES_META,
} from '../../types/sales';
import {
  getProfileSettings,
  calculateConversionRate,
  calculateSalesPerformanceScore,
  calculateReward,
  validateSalesPerformanceInputs,
  sanitizeSalesNumber,
  getWeekFromDate,
  getMonthAndYearFromDate,
} from '../../services/salesCalculationService';
import {
  findMatchingSalesEmployee,
  canUserManageRecord,
  validateRecordAccess,
} from '../../utils/salesAuthUtils';
import { usePermissions } from '../../context/PermissionContext';
import {
  X,
  Calculator,
  Sparkles,
  Calendar,
  Lock,
  Clock,
  RotateCcw,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

const WEEKS_OPTIONS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

export const SalesPerformanceEntryModal: React.FC = () => {
  const {
    isSalesEntryModalOpen,
    closeSalesEntryModal,
    editingSalesRecord,
    defaultEmpIdForEntry,
    defaultProfileForEntry,
    defaultEntryTypeForEntry,
    salesEmployees,
    salesRecords,
    salesSettings,
    saveSalesPerformanceRecord,
    deleteSalesPerformanceRecord,
  } = useSales();

  const { selectedMonth, selectedYear, availableMonths, availableYears } = useApp();
  const { currentUser } = useAuth();

  // Mode: Daily or Weekly
  const [entryType, setEntryType] = useState<'daily' | 'weekly'>('daily');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [employeeId, setEmployeeId] = useState<string>('');
  const [profileCode, setProfileCode] = useState<SalesProfileCode>('PR');
  const [week, setWeek] = useState<string>('Week 1');
  const [month, setMonth] = useState<string>(selectedMonth);
  const [year, setYear] = useState<number>(selectedYear);

  // Raw metric inputs
  const [reachouts, setReachouts] = useState<number | ''>('');
  const [conversions, setConversions] = useState<number | ''>('');
  const [followups, setFollowups] = useState<number | ''>('');
  const [orderValue, setOrderValue] = useState<number | ''>('');
  const [managerRemarks, setManagerRemarks] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const activeEmployees = useMemo(() => salesEmployees.filter((e) => e.status === 'active'), [salesEmployees]);
  const { isSuperAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const canManageOthers = isSuperAdmin || hasPermission('sales.performance_records', 'edit');
  const isPrivileged = canManageOthers;

  // Find matching sales employee for current logged in user if team member
  const matchedUserEmp = useMemo(() => {
    const found = findMatchingSalesEmployee(currentUser, activeEmployees);
    if (found) return found;
    if (currentUser) {
      const code: SalesProfileCode = (['PR', 'WR', 'HW', 'DR', 'RR'].includes((currentUser as any).profileCode)
        ? (currentUser as any).profileCode
        : ((currentUser as any).team === 'SMM' ? 'DR' : 'PR')) as SalesProfileCode;
      const dept: SalesDepartment = ['PR', 'WR', 'HW'].includes(code) ? 'IT' : 'SMM';
      return {
        id: `sales_emp_${currentUser.uid || currentUser.userId || 'user'}`,
        userId: currentUser.userId || currentUser.uid,
        name: currentUser.name || 'Sales Member',
        email: currentUser.email || '',
        avatarUrl: currentUser.avatarUrl,
        department: dept,
        profileCode: code,
        assignedProfiles: ['PR', 'WR', 'HW', 'DR', 'RR'],
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as SalesEmployee;
    }
    return undefined;
  }, [currentUser, activeEmployees]);

  // Check if current user has edit permission for the record being edited
  const isAuthorizedToEdit = useMemo(() => {
    if (!editingSalesRecord) return true;
    return canUserManageRecord(editingSalesRecord, currentUser, salesEmployees, canManageOthers);
  }, [editingSalesRecord, currentUser, salesEmployees, canManageOthers]);

  const selectedEmp = useMemo(() => {
    if (!isPrivileged) {
      return matchedUserEmp || activeEmployees[0];
    }
    return activeEmployees.find((e) => e.id === employeeId) || (matchedUserEmp || activeEmployees[0]);
  }, [isPrivileged, matchedUserEmp, activeEmployees, employeeId]);

  // Available profiles for this employee
  const employeeProfiles: SalesProfileCode[] = useMemo(() => {
    if (!selectedEmp) return ['PR', 'WR', 'HW', 'DR', 'RR'];
    if (selectedEmp.assignedProfiles && selectedEmp.assignedProfiles.length > 0) {
      return selectedEmp.assignedProfiles;
    }
    return ['PR', 'WR', 'HW', 'DR', 'RR'];
  }, [selectedEmp]);

  const department: SalesDepartment = ['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM';
  const profileConfig = getProfileSettings(salesSettings, profileCode);

  // Check for duplicate record
  const existingDuplicateRecord = useMemo(() => {
    if (!selectedEmp) return null;
    if (editingSalesRecord) return null;

    if (entryType === 'daily') {
      return salesRecords.find(
        (r) =>
          r.entryType === 'daily' &&
          r.employeeId === selectedEmp.id &&
          r.profileCode === profileCode &&
          r.entryDate === entryDate
      ) || null;
    } else {
      return salesRecords.find(
        (r) =>
          r.entryType !== 'daily' &&
          r.employeeId === selectedEmp.id &&
          r.profileCode === profileCode &&
          r.week === week &&
          r.month.toLowerCase() === month.toLowerCase() &&
          Number(r.year) === Number(year)
      ) || null;
    }
  }, [selectedEmp, profileCode, entryType, entryDate, week, month, year, salesRecords, editingSalesRecord]);

  // When entryDate changes in daily mode, sync week, month, and year automatically
  const handleDateChange = (newDate: string) => {
    setEntryDate(newDate);
    if (newDate) {
      const computedWeek = getWeekFromDate(newDate);
      const { month: compMonth, year: compYear } = getMonthAndYearFromDate(newDate);
      setWeek(computedWeek);
      setMonth(compMonth);
      setYear(compYear);
    }
  };

  useEffect(() => {
    if (editingSalesRecord) {
      if (!canUserManageRecord(editingSalesRecord, currentUser, salesEmployees)) {
        setFormError('Security Violation: You are not authorized to edit another member\'s performance record.');
      } else {
        setFormError('');
      }
      setEntryType(editingSalesRecord.entryType || (editingSalesRecord.entryDate ? 'daily' : 'weekly'));
      if (editingSalesRecord.entryDate) {
        setEntryDate(editingSalesRecord.entryDate);
      }
      setEmployeeId(editingSalesRecord.employeeId || '');
      setProfileCode(editingSalesRecord.profileCode || 'PR');
      setWeek(editingSalesRecord.week || 'Week 1');
      setMonth(editingSalesRecord.month || selectedMonth);
      setYear(editingSalesRecord.year || selectedYear);
      setReachouts(editingSalesRecord.reachouts ?? '');
      setConversions(editingSalesRecord.conversions ?? '');
      setFollowups(editingSalesRecord.followups ?? '');
      setOrderValue(editingSalesRecord.orderValue ?? '');
      setManagerRemarks(editingSalesRecord.managerRemarks || '');
    } else {
      const initialEmpId = (!isPrivileged && matchedUserEmp)
        ? matchedUserEmp.id
        : (defaultEmpIdForEntry || (matchedUserEmp ? matchedUserEmp.id : (activeEmployees.length > 0 ? activeEmployees[0].id : '')));

      setEmployeeId(initialEmpId);

      const targetEmp = activeEmployees.find((e) => e.id === initialEmpId);
      const initialProfiles = targetEmp?.assignedProfiles && targetEmp.assignedProfiles.length > 0
        ? targetEmp.assignedProfiles
        : [targetEmp?.profileCode || 'PR'];

      const initialProfile = defaultProfileForEntry && initialProfiles.includes(defaultProfileForEntry)
        ? defaultProfileForEntry
        : initialProfiles[0] || 'PR';

      setProfileCode(initialProfile);
      setEntryType(defaultEntryTypeForEntry || 'daily');
      const todayStr = new Date().toISOString().slice(0, 10);
      setEntryDate(todayStr);
      setWeek(getWeekFromDate(todayStr));
      const my = getMonthAndYearFromDate(todayStr);
      setMonth(my.month);
      setYear(my.year);
      setReachouts('');
      setConversions('');
      setFollowups('');
      setOrderValue('');
      setManagerRemarks('');
      setFormError('');
    }
    setIsConfirmingDelete(false);
  }, [
    isSalesEntryModalOpen,
    editingSalesRecord,
    defaultEmpIdForEntry,
    defaultProfileForEntry,
    defaultEntryTypeForEntry,
    selectedMonth,
    selectedYear,
    matchedUserEmp,
    isPrivileged,
    currentUser,
    salesEmployees,
  ]);

  // Load existing duplicate values for easy updating
  const handleLoadExisting = () => {
    if (!existingDuplicateRecord) return;
    setReachouts(existingDuplicateRecord.reachouts ?? '');
    setConversions(existingDuplicateRecord.conversions ?? '');
    setFollowups(existingDuplicateRecord.followups ?? '');
    setOrderValue(existingDuplicateRecord.orderValue ?? '');
    setManagerRemarks(existingDuplicateRecord.managerRemarks || '');
    setFormError('');
  };

  // When selected employee changes, ensure profileCode is valid for that employee
  const handleEmployeeChange = (newEmpId: string) => {
    if (!isPrivileged) return;
    setEmployeeId(newEmpId);
    const emp = activeEmployees.find((e) => e.id === newEmpId);
    const profs = emp?.assignedProfiles && emp.assignedProfiles.length > 0
      ? emp.assignedProfiles
      : [emp?.profileCode || 'PR'];
    if (!profs.includes(profileCode)) {
      setProfileCode(profs[0] || 'PR');
    }
  };

  if (!isSalesEntryModalOpen) return null;

  // Live Calculations for instant feedback
  const numReachouts = sanitizeSalesNumber(reachouts);
  const numConversions = sanitizeSalesNumber(conversions);
  const numFollowups = sanitizeSalesNumber(followups);
  const numOrderValue = sanitizeSalesNumber(orderValue);

  const liveConversionRate = calculateConversionRate(numConversions, numReachouts);
  const liveScores = calculateSalesPerformanceScore(
    {
      reachouts: numReachouts,
      conversions: numConversions,
      followups: numFollowups,
      orderValue: numOrderValue,
    },
    profileConfig
  );

  const liveReward = calculateReward(liveScores.totalPerformanceScore, profileConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isAuthorizedToEdit) {
      setFormError('Security Violation: You cannot edit another member\'s performance record.');
      return;
    }

    if (!selectedEmp) {
      setFormError('Please select a valid sales employee.');
      return;
    }

    // Backend validation check
    const accessCheck = validateRecordAccess(currentUser, selectedEmp.id, profileCode, salesEmployees);
    if (!accessCheck.allowed) {
      setFormError(accessCheck.message || 'Security Violation: Access Denied.');
      return;
    }

    if (!employeeProfiles.includes(profileCode)) {
      setFormError(`Selected employee is not assigned to profile ${profileCode}.`);
      return;
    }

    const validation = validateSalesPerformanceInputs({
      reachouts: numReachouts,
      conversions: numConversions,
      followups: numFollowups,
      orderValue: numOrderValue,
    });

    if (!validation.isValid) {
      setFormError(validation.errors.join(' '));
      return;
    }

    setIsSubmitting(true);
    try {
      const recordId =
        editingSalesRecord?.id ||
        (existingDuplicateRecord ? existingDuplicateRecord.id : (
          entryType === 'daily'
            ? `sales_rec_daily_${selectedEmp.id}_${profileCode}_${entryDate}`
            : `sales_rec_${selectedEmp.id}_${profileCode}_${week.replace(/\s+/g, '_')}_${month}_${year}`
        ));

      const record: SalesPerformanceRecord = {
        id: recordId,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        department,
        profileCode,
        entryType,
        entryDate: entryType === 'daily' ? (entryDate || '') : '',
        week,
        month,
        year,
        monthYearKey: `${month} ${year}`,
        reachouts: numReachouts,
        conversions: numConversions,
        followups: numFollowups,
        orderValue: numOrderValue,
        managerRemarks: managerRemarks || '',
        conversionRate: liveConversionRate,
        reachoutScore: 0,
        conversionScore: liveScores.conversionScore,
        followupScore: liveScores.followupScore,
        orderValueScore: liveScores.orderValueScore,
        totalPerformanceScore: liveScores.totalPerformanceScore,
        rewardEligibility: liveReward.rewardEligibility,
        ineligibilityReason: liveReward.ineligibilityReason || '',
        rewardLevel: liveReward.rewardLevel || 'None',
        rewardAmount: liveReward.rewardAmount || 0,
        submittedBy: currentUser?.name || 'Self Entry',
        createdAt: editingSalesRecord?.createdAt || existingDuplicateRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const res = await saveSalesPerformanceRecord(record);
      if (res.success) {
        closeSalesEntryModal();
      } else {
        setFormError(res.message || 'Failed to submit sales record.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit sales record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelfEntry = !isPrivileged && matchedUserEmp;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={closeSalesEntryModal}
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned) */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-[#e2ebd9] p-4 sm:p-6 bg-[#f8faf6] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8cc540]/20 flex items-center justify-center text-[#436320] border border-[#8cc540]/40">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#101010] tracking-tight">
                {editingSalesRecord
                  ? `Edit ${editingSalesRecord.entryType === 'daily' ? 'Daily' : 'Weekly'} Performance`
                  : isSelfEntry
                  ? `Submit ${entryType === 'daily' ? 'Daily' : 'Weekly'} Performance`
                  : `Record ${entryType === 'daily' ? 'Daily' : 'Weekly'} Performance`}
              </h2>
              <p className="text-xs text-[#666666]">
                50% Conversion • 20% Follow-ups • 30% Order Value • 0% Reachouts weight
              </p>
            </div>
          </div>
          <button
            onClick={closeSalesEntryModal}
            className="p-2 rounded-xl text-[#666666] hover:text-[#101010] hover:bg-[#f5f5f5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with scrollable body and pinned footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
            {/* Entry Mode Switcher: Daily vs Weekly */}
            {!editingSalesRecord && (
              <div className="flex items-center justify-between bg-[#f4f7f0] p-1.5 rounded-2xl border border-[#e2ebd9]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEntryType('daily')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      entryType === 'daily'
                        ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Daily Entry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('weekly')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      entryType === 'weekly'
                        ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Weekly Entry</span>
                  </button>
                </div>
                <span className="text-[11px] font-bold text-[#598327] hidden sm:inline px-3">
                  {entryType === 'daily' ? 'Aggregates automatically into weekly totals' : 'Consolidated weekly metrics'}
                </span>
              </div>
            )}

            {/* Existing Record Notice / Duplicate Handler */}
            {existingDuplicateRecord && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 font-medium">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Existing {entryType} record found for {entryType === 'daily' ? entryDate : `${week}, ${month} ${year}`}.
                    Submitting will update this record.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadExisting}
                  className="px-2.5 py-1 bg-white rounded-lg border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Load Existing Values</span>
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
          {/* Employee & Profile Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010] flex items-center justify-between">
                <span>Sales Member <span className="text-rose-500">*</span></span>
                {!isPrivileged && (
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Locked to Account
                  </span>
                )}
              </label>
              <select
                value={employeeId || ''}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                disabled={!!editingSalesRecord || !isPrivileged}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none disabled:opacity-75 disabled:bg-slate-100"
              >
                {!isPrivileged && matchedUserEmp ? (
                  <option value={matchedUserEmp.id}>
                    {matchedUserEmp.name} ({matchedUserEmp.assignedProfiles?.join(', ') || matchedUserEmp.profileCode})
                  </option>
                ) : (
                  activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.assignedProfiles?.join(', ') || emp.profileCode})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">
                Select Profile (for this entry) <span className="text-rose-500">*</span>
              </label>
              <select
                value={profileCode || 'PR'}
                onChange={(e) => setProfileCode(e.target.value as SalesProfileCode)}
                disabled={!!editingSalesRecord || !isAuthorizedToEdit}
                className="w-full bg-[#f8faf6] border border-[#8cc540]/40 rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none disabled:opacity-75 disabled:bg-slate-100"
              >
                {employeeProfiles.map((code) => {
                  const meta = SALES_PROFILES_META[code];
                  return (
                    <option key={code} value={code}>
                      {code} - {meta?.name || code} ({meta?.department} Sales)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Period Selectors: Daily Date vs Weekly Selectors */}
          {entryType === 'daily' ? (
            <div className="bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-[#101010]">
                    Performance Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={entryDate || ''}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={!!editingSalesRecord}
                    className="w-full bg-white border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-1 focus:ring-[#8cc540]"
                  />
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e2ebd9] text-xs">
                  <span className="text-[10px] text-[#666666] font-bold block">Assigned Time Period:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#8cc540]/20 text-[#598327] font-black text-[11px]">
                      {week}
                    </span>
                    <span className="font-bold text-[#101010]">
                      {month} {year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9]">
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-[#101010]">Week</label>
                <select
                  value={week || 'Week 1'}
                  onChange={(e) => setWeek(e.target.value)}
                  disabled={!!editingSalesRecord}
                  className="w-full bg-white border border-[#e2ebd9] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#101010] focus:ring-1 focus:ring-[#8cc540]"
                >
                  {WEEKS_OPTIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-[#101010]">Month</label>
                <select
                  value={month || selectedMonth}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={!!editingSalesRecord}
                  className="w-full bg-white border border-[#e2ebd9] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#101010] focus:ring-1 focus:ring-[#8cc540]"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-[#101010]">Year</label>
                <select
                  value={year || selectedYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  disabled={!!editingSalesRecord}
                  className="w-full bg-white border border-[#e2ebd9] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#101010] focus:ring-1 focus:ring-[#8cc540]"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Metric Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: Reachouts (0% weight) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  Total Reachouts <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  0% Weight (Activity)
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 50"
                value={reachouts ?? ''}
                onChange={(e) => setReachouts(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-slate-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Denominator for conversion rate. Benchmark: {profileConfig.reachoutBenchmark || 200}/wk.
              </p>
            </div>

            {/* Metric 2: Conversions (50% weight) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-emerald-950">
                  Conversions (Orders) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  50% Weight
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 5"
                value={conversions ?? ''}
                onChange={(e) => setConversions(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                <span>Conv. Rate: {liveConversionRate}%</span>
                <span>Target: {profileConfig.conversionTarget}%</span>
              </div>
            </div>

            {/* Metric 3: Follow-ups (20% weight) */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-blue-950">
                  Follow-ups Done <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">
                  20% Weight
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 20"
                value={followups ?? ''}
                onChange={(e) => setFollowups(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-blue-800 font-semibold">
                <span>Score: {liveScores.followupScore}/20 pts</span>
                <span>Target: {profileConfig.followupTarget}/wk</span>
              </div>
            </div>

            {/* Metric 4: Order Value (30% weight) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-amber-950">
                  Total Order Value (₹) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  30% Weight
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 25000"
                value={orderValue ?? ''}
                onChange={(e) => setOrderValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-amber-800 font-semibold">
                <span>Score: {liveScores.orderValueScore}/30 pts</span>
                <span>Target: ₹{(profileConfig.orderValueTarget || 100000).toLocaleString('en-IN')}/wk</span>
              </div>
            </div>
          </div>

          {/* Live Score Evaluation Card */}
          <div className="p-4 rounded-2xl bg-[#f8faf6] border border-[#8cc540]/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#101010] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#436320]" />
                Live Performance Score Calculation
              </span>
              <span className="text-base font-black text-[#436320]">
                {liveScores.totalPerformanceScore} / 100 pts
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-[#e2ebd9]">
                <span className="text-[#666666] block">Reachouts</span>
                <span className="font-bold text-slate-700">{numReachouts} (0%)</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block">Conversion (50%)</span>
                <span className="font-bold text-emerald-900">{liveScores.conversionScore}/50</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-blue-200">
                <span className="text-blue-700 block">Follow-up (20%)</span>
                <span className="font-bold text-blue-900">{liveScores.followupScore}/20</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-amber-700 block">Value (30%)</span>
                <span className="font-bold text-amber-900">{liveScores.orderValueScore}/30</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#e2ebd9]">
              <span className="text-[#666666]">
                Reward Slab:{' '}
                <strong className="text-[#101010]">{liveReward.rewardLevel}</strong> (₹{liveReward.rewardAmount.toLocaleString('en-IN')})
              </span>
              <span
                className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  liveReward.rewardEligibility === 'Eligible'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {liveReward.rewardEligibility === 'Eligible' ? '✓ Eligible' : 'Ineligible'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">
              Remarks / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Daily client follow-ups completed, closed high-ticket enterprise order..."
              value={managerRemarks || ''}
              onChange={(e) => setManagerRemarks(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e2ebd9]">
            <div>
              {(editingSalesRecord || existingDuplicateRecord) && (
                (() => {
                  const targetRec = editingSalesRecord || existingDuplicateRecord;
                  if (!targetRec || !canUserManageRecord(targetRec, currentUser, salesEmployees)) return null;
                  return (
                    <div>
                      {!isConfirmingDelete ? (
                        <button
                          type="button"
                          disabled={isDeleting || isSubmitting}
                          onClick={() => setIsConfirmingDelete(true)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Record</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                          <span className="text-xs font-bold text-rose-700">Delete permanently?</span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={async () => {
                              setIsDeleting(true);
                              try {
                                await deleteSalesPerformanceRecord(targetRec.id);
                                setIsConfirmingDelete(false);
                                closeSalesEntryModal();
                              } finally {
                                setIsDeleting(false);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setIsConfirmingDelete(false)}
                            className="px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons (Pinned) */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-t border-[#e2ebd9] bg-[#f8faf6] z-10">
            <div>
              {/* Optional secondary helper text */}
              <span className="text-[11px] font-bold text-[#666666]">
                {entryType === 'daily' ? 'Daily entry mode' : 'Weekly entry mode'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeSalesEntryModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#eaeaea] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2 rounded-xl text-xs font-black bg-[#8cc540] text-[#101010] hover:bg-[#7cb730] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving Record...'
                  : editingSalesRecord || existingDuplicateRecord
                  ? 'Update Performance Record'
                  : `Save ${entryType === 'daily' ? 'Daily' : 'Weekly'} Performance`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
