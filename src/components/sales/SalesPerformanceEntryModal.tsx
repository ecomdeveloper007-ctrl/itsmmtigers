import React, { useState, useEffect } from 'react';
import { useSales } from '../../context/SalesContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  SalesPerformanceRecord,
  SalesProfileCode,
  SalesDepartment,
} from '../../types/sales';
import {
  getProfileSettings,
  calculateConversionRate,
  calculateSalesPerformanceScore,
  validateSalesPerformanceInputs,
  sanitizeSalesNumber,
} from '../../services/salesCalculationService';
import { X, CheckCircle2, AlertTriangle, Calculator, Sparkles, User, Calendar, Target, Check } from 'lucide-react';

export const SalesPerformanceEntryModal: React.FC = () => {
  const {
    isSalesEntryModalOpen,
    closeSalesEntryModal,
    editingSalesRecord,
    defaultEmpIdForEntry,
    salesEmployees,
    salesSettings,
    saveSalesPerformanceRecord,
  } = useSales();

  const { selectedMonth, selectedYear, availableMonths, availableYears } = useApp();
  const { currentUser } = useAuth();

  const [employeeId, setEmployeeId] = useState<string>('');
  const [month, setMonth] = useState<string>(selectedMonth);
  const [year, setYear] = useState<number>(selectedYear);

  // Raw inputs
  const [totalReachout, setTotalReachout] = useState<number | ''>('');
  const [orderConvert, setOrderConvert] = useState<number | ''>('');
  const [repeatOrders, setRepeatOrders] = useState<number | ''>('');
  const [followupSent, setFollowupSent] = useState<number | ''>('');
  const [managerRemarks, setManagerRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const activeEmployees = salesEmployees.filter((e) => e.status === 'active');
  
  // Find matching sales employee for current logged in user if team member
  const matchedUserEmp = currentUser?.role === 'team_member'
    ? activeEmployees.find(
        (e) =>
          (e.userId && e.userId.toLowerCase() === currentUser.userId.toLowerCase()) ||
          (e.email && currentUser.email && e.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          e.name.toLowerCase() === currentUser.name.toLowerCase() ||
          e.id === currentUser.uid
      )
    : undefined;

  const selectedEmp = activeEmployees.find((e) => e.id === employeeId) || (matchedUserEmp || activeEmployees[0]);

  const profileCode: SalesProfileCode = selectedEmp?.profileCode || 'PR';
  const department: SalesDepartment = selectedEmp?.department || (['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM');
  const profileConfig = getProfileSettings(salesSettings, profileCode);

  useEffect(() => {
    if (editingSalesRecord) {
      setEmployeeId(editingSalesRecord.employeeId);
      setMonth(editingSalesRecord.month);
      setYear(editingSalesRecord.year);
      setTotalReachout(editingSalesRecord.totalReachout);
      setOrderConvert(editingSalesRecord.orderConvert);
      setRepeatOrders(editingSalesRecord.repeatOrders);
      setFollowupSent(editingSalesRecord.followupSent);
      setManagerRemarks(editingSalesRecord.managerRemarks || '');
    } else {
      const initialEmpId = defaultEmpIdForEntry || (matchedUserEmp ? matchedUserEmp.id : (activeEmployees.length > 0 ? activeEmployees[0].id : ''));
      setEmployeeId(initialEmpId);
      setMonth(selectedMonth);
      setYear(selectedYear);
      setTotalReachout('');
      setOrderConvert('');
      setRepeatOrders('');
      setFollowupSent('');
      setManagerRemarks('');
    }
    setFormError('');
  }, [isSalesEntryModalOpen, editingSalesRecord, defaultEmpIdForEntry, selectedMonth, selectedYear, matchedUserEmp]);

  if (!isSalesEntryModalOpen) return null;

  // Live Calculations for instant feedback
  const numReachout = sanitizeSalesNumber(totalReachout);
  const numOrders = sanitizeSalesNumber(orderConvert);
  const numRepeat = sanitizeSalesNumber(repeatOrders);
  const numFollowups = sanitizeSalesNumber(followupSent);

  const liveConversionRate = calculateConversionRate(numOrders, numReachout);
  const liveScores = calculateSalesPerformanceScore(
    {
      totalReachout: numReachout,
      orderConvert: numOrders,
      repeatOrders: numRepeat,
      followupSent: numFollowups,
    },
    profileConfig
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedEmp) {
      setFormError('Please select a valid sales employee.');
      return;
    }

    const validation = validateSalesPerformanceInputs({
      totalReachout: numReachout,
      orderConvert: numOrders,
      repeatOrders: numRepeat,
      followupSent: numFollowups,
    });

    if (!validation.isValid) {
      setFormError(validation.errors.join(' '));
      return;
    }

    setIsSubmitting(true);
    try {
      const record: SalesPerformanceRecord = {
        id: editingSalesRecord?.id || `sales_rec_${selectedEmp.id}_${month}_${year}`,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        department,
        profileCode,
        month,
        year,
        monthYearKey: `${month} ${year}`,
        totalReachout: numReachout,
        orderConvert: numOrders,
        repeatOrders: numRepeat,
        followupSent: numFollowups,
        managerRemarks,
        conversionRate: liveConversionRate,
        reachoutScore: liveScores.reachoutScore,
        orderConvertScore: liveScores.orderConvertScore,
        repeatOrdersScore: liveScores.repeatOrdersScore,
        followupScore: liveScores.followupScore,
        totalPerformanceScore: liveScores.totalPerformanceScore,
        rewardEligibility: 'Eligible',
        ineligibilityReason: undefined,
        rewardLevel: 'Standard',
        rewardAmount: 0,
        submittedBy: currentUser?.name || 'Self Entry',
        createdAt: editingSalesRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveSalesPerformanceRecord(record);
      if (success) {
        closeSalesEntryModal();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit sales record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelfEntry = currentUser?.role === 'team_member' && matchedUserEmp;

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
                  ? 'Edit Sales Performance'
                  : isSelfEntry
                  ? 'Submit My Sales Performance'
                  : 'Record Monthly Sales Performance'}
              </h2>
              <p className="text-xs text-[#666666]">
                Target-adjusted 100-point performance evaluation with conversion benchmark check
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
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee & Period Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">
                Sales Employee <span className="text-rose-500">*</span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={!!editingSalesRecord || (currentUser?.role === 'team_member' && !defaultEmpIdForEntry)}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department} - {emp.profileCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={!!editingSalesRecord}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-[#101010]">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                disabled={!!editingSalesRecord}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Targets Context Banner */}
          <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black px-2 py-0.5 rounded bg-white text-[#436320] border border-[#8cc540]/40">
                {profileCode} Profile ({department} Sales)
              </span>
              <span className="text-[#555555]">
                Targets: Reachout ({profileConfig.reachoutTarget}) • Orders ({profileConfig.orderConvertTarget}) • Repeat ({profileConfig.repeatOrdersTarget}) • Follow-ups ({profileConfig.followupTarget})
              </span>
            </div>
            <div className="font-bold text-[#335017]">
              Conversion Hurdle: {profileConfig.minConversionRate}%
            </div>
          </div>

          {/* 4 Performance Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Total Reachout */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">1. Total Reachout</label>
                <span className="text-[10px] font-bold text-[#666666]">
                  Target: {profileConfig.reachoutTarget} ({profileConfig.reachoutWeight} pts)
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 200"
                value={totalReachout}
                onChange={(e) => setTotalReachout(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-sm font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
              <div className="text-[11px] text-[#555555] flex justify-between font-medium">
                <span>Achievement: {liveScores.reachoutAchievementPct}%</span>
                <span className="font-bold text-[#436320]">{liveScores.reachoutScore} / {profileConfig.reachoutWeight} pts</span>
              </div>
            </div>

            {/* 2. Order Convert */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">2. Order Convert</label>
                <span className="text-[10px] font-bold text-[#666666]">
                  Target: {profileConfig.orderConvertTarget} ({profileConfig.orderConvertWeight} pts)
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 20"
                value={orderConvert}
                onChange={(e) => setOrderConvert(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-sm font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
              <div className="text-[11px] text-[#555555] flex justify-between font-medium">
                <span>Achievement: {liveScores.orderAchievementPct}%</span>
                <span className="font-bold text-[#436320]">{liveScores.orderConvertScore} / {profileConfig.orderConvertWeight} pts</span>
              </div>
            </div>

            {/* 3. Repeat Orders */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">3. Repeat Orders</label>
                <span className="text-[10px] font-bold text-[#666666]">
                  Target: {profileConfig.repeatOrdersTarget} ({profileConfig.repeatOrdersWeight} pts)
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 8"
                value={repeatOrders}
                onChange={(e) => setRepeatOrders(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-sm font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
              <div className="text-[11px] text-[#555555] flex justify-between font-medium">
                <span>Achievement: {liveScores.repeatAchievementPct}%</span>
                <span className="font-bold text-[#436320]">{liveScores.repeatOrdersScore} / {profileConfig.repeatOrdersWeight} pts</span>
              </div>
            </div>

            {/* 4. Follow-up Sent */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#e2ebd9] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">4. Follow-up Sent</label>
                <span className="text-[10px] font-bold text-[#666666]">
                  Target: {profileConfig.followupTarget} ({profileConfig.followupWeight} pts)
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 100"
                value={followupSent}
                onChange={(e) => setFollowupSent(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-sm font-black text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
              />
              <div className="text-[11px] text-[#555555] flex justify-between font-medium">
                <span>Achievement: {liveScores.followupAchievementPct}%</span>
                <span className="font-bold text-[#436320]">{liveScores.followupScore} / {profileConfig.followupWeight} pts</span>
              </div>
            </div>
          </div>

          {/* Live Calculated Metric Cards (Clean, No Rewards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Conversion Rate */}
            <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] text-center space-y-1">
              <span className="text-[11px] font-bold text-[#666666] uppercase tracking-wider block">
                Conversion Rate
              </span>
              <span className="text-2xl font-black text-[#101010]">
                {liveConversionRate}%
              </span>
              <div className="text-[10px] font-bold">
                {liveConversionRate >= profileConfig.minConversionRate ? (
                  <span className="text-emerald-700">✓ Meets {profileConfig.minConversionRate}% Hurdle</span>
                ) : (
                  <span className="text-amber-700">Below {profileConfig.minConversionRate}% Target</span>
                )}
              </div>
            </div>

            {/* Total Performance Score */}
            <div className="p-3.5 rounded-2xl bg-[#f3f8ef] border border-[#8cc540]/40 text-center space-y-1">
              <span className="text-[11px] font-bold text-[#436320] uppercase tracking-wider block">
                Performance Score
              </span>
              <span className="text-2xl font-black text-[#101010]">
                {liveScores.totalPerformanceScore}
                <span className="text-xs text-[#598327]"> / 100 PTS</span>
              </span>
              <div className="text-[10px] font-bold text-[#666666]">
                Weighted 4-Metric Sum
              </div>
            </div>

            {/* Benchmark Status */}
            <div
              className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                liveScores.totalPerformanceScore >= 80
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : liveScores.totalPerformanceScore >= 60
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                Performance Tier
              </span>
              <span className="text-xl font-black">
                {liveScores.totalPerformanceScore >= 85
                  ? 'Top Tier'
                  : liveScores.totalPerformanceScore >= 70
                  ? 'High Performing'
                  : liveScores.totalPerformanceScore >= 50
                  ? 'On Track'
                  : 'Developing'}
              </span>
              <div className="text-[11px] font-bold">
                {liveConversionRate >= profileConfig.minConversionRate ? (
                  <span className="text-emerald-700">✓ Qualified Conversion</span>
                ) : (
                  <span className="text-amber-700">Conversion Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-[#101010]">
              Performance Notes / Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Exceeded conversion goals on IT cloud product pipeline"
              value={managerRemarks}
              onChange={(e) => setManagerRemarks(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs text-[#101010] focus:ring-2 focus:ring-[#8cc540] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2ebd9]">
            <button
              type="button"
              onClick={closeSalesEntryModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#666666] hover:bg-[#f5f5f5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-md shadow-[#8cc540]/30 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSalesRecord ? 'Update Performance' : 'Save Performance Record'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
