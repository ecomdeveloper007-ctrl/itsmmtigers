import React, { useState, useEffect, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  SalesPerformanceRecord,
  SalesProfileCode,
  SalesDepartment,
  SALES_PROFILES_META,
} from '../../types/sales';
import {
  getProfileSettings,
  calculateConversionRate,
  calculateSalesPerformanceScore,
  validateSalesPerformanceInputs,
  sanitizeSalesNumber,
} from '../../services/salesCalculationService';
import {
  isUserAdminOrSuperAdmin,
  findMatchingSalesEmployee,
  canUserManageRecord,
  validateRecordAccess,
} from '../../utils/salesAuthUtils';
import { X, CheckCircle2, AlertTriangle, Calculator, Sparkles, User, Calendar, Target, Check, DollarSign, RefreshCw, Layers, Lock } from 'lucide-react';

const WEEKS_OPTIONS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

export const SalesPerformanceEntryModal: React.FC = () => {
  const {
    isSalesEntryModalOpen,
    closeSalesEntryModal,
    editingSalesRecord,
    defaultEmpIdForEntry,
    defaultProfileForEntry,
    salesEmployees,
    salesSettings,
    saveSalesPerformanceRecord,
  } = useSales();

  const { selectedMonth, selectedYear, availableMonths, availableYears } = useApp();
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();

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
  const [formError, setFormError] = useState<string>('');

  const activeEmployees = useMemo(() => salesEmployees.filter((e) => e.status === 'active'), [salesEmployees]);
  const isPrivileged = isUserAdminOrSuperAdmin(currentUser);

  // Find matching sales employee for current logged in user if team member
  const matchedUserEmp = useMemo(
    () => findMatchingSalesEmployee(currentUser, activeEmployees),
    [currentUser, activeEmployees]
  );

  // Check if current user has edit permission for the record being edited
  const isAuthorizedToEdit = useMemo(() => {
    if (!editingSalesRecord) return true;
    return canUserManageRecord(editingSalesRecord, currentUser, salesEmployees);
  }, [editingSalesRecord, currentUser, salesEmployees]);

  const selectedEmp = useMemo(() => {
    if (!isPrivileged && matchedUserEmp) {
      return matchedUserEmp;
    }
    return activeEmployees.find((e) => e.id === employeeId) || (matchedUserEmp || activeEmployees[0]);
  }, [isPrivileged, matchedUserEmp, activeEmployees, employeeId]);

  // Available profiles for this employee
  const employeeProfiles: SalesProfileCode[] = useMemo(() => {
    if (!selectedEmp) return ['PR'];
    return selectedEmp.assignedProfiles && selectedEmp.assignedProfiles.length > 0
      ? selectedEmp.assignedProfiles
      : [selectedEmp.profileCode || 'PR'];
  }, [selectedEmp]);

  const department: SalesDepartment = ['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM';
  const profileConfig = getProfileSettings(salesSettings, profileCode);

  useEffect(() => {
    if (editingSalesRecord) {
      if (!canUserManageRecord(editingSalesRecord, currentUser, salesEmployees)) {
        setFormError('Security Violation: You are not authorized to edit another member\'s performance record.');
      } else {
        setFormError('');
      }
      setEmployeeId(editingSalesRecord.employeeId);
      setProfileCode(editingSalesRecord.profileCode);
      setWeek(editingSalesRecord.week || 'Week 1');
      setMonth(editingSalesRecord.month);
      setYear(editingSalesRecord.year);
      setReachouts(editingSalesRecord.reachouts);
      setConversions(editingSalesRecord.conversions);
      setFollowups(editingSalesRecord.followups);
      setOrderValue(editingSalesRecord.orderValue);
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
      setWeek('Week 1');
      setMonth(selectedMonth);
      setYear(selectedYear);
      setReachouts('');
      setConversions('');
      setFollowups('');
      setOrderValue('');
      setManagerRemarks('');
      setFormError('');
    }
  }, [isSalesEntryModalOpen, editingSalesRecord, defaultEmpIdForEntry, defaultProfileForEntry, selectedMonth, selectedYear, matchedUserEmp, isPrivileged, currentUser, salesEmployees]);

  // When selected employee changes, ensure profileCode is valid for that employee
  const handleEmployeeChange = (newEmpId: string) => {
    if (!isPrivileged) return; // Prevent tampering by team members
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

  const meetsBenchmark = liveConversionRate >= profileConfig.minConversionRate;

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
      const recordId = editingSalesRecord?.id || `sales_rec_${selectedEmp.id}_${profileCode}_${week.replace(' ', '_')}_${month}_${year}`;
      
      const record: SalesPerformanceRecord = {
        id: recordId,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        department,
        profileCode,
        week,
        month,
        year,
        monthYearKey: `${month} ${year}`,
        reachouts: numReachouts,
        conversions: numConversions,
        followups: numFollowups,
        orderValue: numOrderValue,
        managerRemarks,
        conversionRate: liveConversionRate,
        reachoutScore: 0,
        conversionScore: liveScores.conversionScore,
        followupScore: liveScores.followupScore,
        orderValueScore: liveScores.orderValueScore,
        totalPerformanceScore: liveScores.totalPerformanceScore,
        rewardEligibility: meetsBenchmark ? 'Eligible' : 'Not Eligible',
        ineligibilityReason: meetsBenchmark ? undefined : `Conversion rate (${liveConversionRate}%) below profile benchmark (${profileConfig.minConversionRate}%)`,
        rewardLevel: 'Standard',
        rewardAmount: 0,
        submittedBy: currentUser?.name || 'Self Entry',
        createdAt: editingSalesRecord?.createdAt || new Date().toISOString(),
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl border border-[#e2ebd9] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8cc540]/20 flex items-center justify-center text-[#436320] border border-[#8cc540]/40">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#101010] tracking-tight">
                {editingSalesRecord
                  ? 'Edit Profile Performance Entry'
                  : isSelfEntry
                  ? 'Submit Weekly Performance'
                  : 'Record Weekly Profile Performance'}
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

        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                value={employeeId}
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
                value={profileCode}
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

          {/* Period Selectors: Week, Month, Year */}
          <div className="grid grid-cols-3 gap-3 bg-[#f8faf6] p-3 rounded-2xl border border-[#e2ebd9]">
            <div className="space-y-1">
              <label className="block text-[11px] font-black text-[#101010]">Week</label>
              <select
                value={week}
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
                value={month}
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
                value={year}
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

          {/* Metric Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: Reachouts (0% weight) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  Total Reachouts <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  0% Weight (Denominator)
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 100"
                value={reachouts}
                onChange={(e) => setReachouts(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-slate-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Used to compute conversion rate (Conversions / Reachouts).
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
                value={conversions}
                onChange={(e) => setConversions(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                <span>Conv. Rate: {liveConversionRate}%</span>
                <span>Target: {profileConfig.targetConversionRate ?? profileConfig.conversionTarget}%</span>
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
                value={followups}
                onChange={(e) => setFollowups(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-blue-800 font-semibold">
                <span>Score: {liveScores.followupScore}/20 pts</span>
                <span>Target: {profileConfig.targetFollowups ?? profileConfig.followupTarget}</span>
              </div>
            </div>

            {/* Metric 4: Order Value (30% weight) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-amber-950">
                  Total Order Value ($) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  30% Weight
                </span>
              </div>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 10000"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[10px] text-amber-800 font-semibold">
                <span>Score: {liveScores.orderValueScore}/30 pts</span>
                <span>Target: ${(profileConfig.targetOrderValue ?? profileConfig.orderValueTarget ?? 10000).toLocaleString()}</span>
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
                <span className="text-[#666666] block">Reachout</span>
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

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e2ebd9]">
              <span className="text-[#666666]">Benchmark Eligibility:</span>
              <span
                className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                  meetsBenchmark
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {meetsBenchmark ? '✓ Eligible for Rewards' : `✗ Ineligible (< ${profileConfig.minConversionRate}% conv)`}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">
              Notes / Manager Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Strong outbound pipeline, closed key enterprise account..."
              value={managerRemarks}
              onChange={(e) => setManagerRemarks(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2ebd9]">
            <button
              type="button"
              onClick={closeSalesEntryModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f5f5f5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl text-xs font-black bg-[#8cc540] text-white hover:bg-[#7cb334] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Record...' : editingSalesRecord ? 'Update Record' : 'Save Performance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
