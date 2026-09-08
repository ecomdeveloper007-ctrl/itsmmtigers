import React, { useState, useEffect, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import {
  SalesRewardSettings,
  SalesProfileCode,
  SalesProfileTargetConfig,
  SALES_PROFILES_META,
} from '../../types/sales';
import {
  sanitizeSalesNumber,
  getProfileSettings,
  DEFAULT_SALES_SETTINGS,
  formatSalesCurrency,
} from '../../services/salesCalculationService';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Layers,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Divide,
  Calculator,
  Copy,
  TrendingUp,
  Users,
  Building,
  ShieldCheck,
  DollarSign,
  Percent,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Award,
} from 'lucide-react';

type TargetCadence = 'monthly' | 'weekly';
type TargetScope = 'all' | SalesProfileCode | 'it_dept' | 'smm_dept';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKS_LIST = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

interface SalesKPITargetsEditorProps {
  onSaved?: () => void;
}

export const SalesKPITargetsEditor: React.FC<SalesKPITargetsEditorProps> = ({ onSaved }) => {
  const { salesSettings, saveSalesRewardSettings, resetSalesRewardSettings, selectedMonth, selectedYear } = useSales();

  const [targetCadence, setTargetCadence] = useState<TargetCadence>('weekly');
  const [targetScope, setTargetScope] = useState<TargetScope>('PR');
  const [targetMonth, setTargetMonth] = useState<string>(selectedMonth || 'September');
  const [targetYear, setTargetYear] = useState<number>(selectedYear || 2026);
  const [targetWeek, setTargetWeek] = useState<string>('Week 1');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  const [localSettings, setLocalSettings] = useState<SalesRewardSettings>(() =>
    JSON.parse(JSON.stringify(salesSettings || DEFAULT_SALES_SETTINGS))
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (salesSettings) {
      setLocalSettings(JSON.parse(JSON.stringify(salesSettings)));
    }
  }, [salesSettings]);

  // Profiles affected by current scope
  const targetProfiles: SalesProfileCode[] = useMemo(() => {
    if (targetScope === 'all') return ['PR', 'WR', 'HW', 'DR', 'RR'];
    if (targetScope === 'it_dept') return ['PR', 'WR', 'HW'];
    if (targetScope === 'smm_dept') return ['DR', 'RR'];
    return [targetScope];
  }, [targetScope]);

  // Primary representative profile for form display
  const primaryProfileCode: SalesProfileCode = useMemo(() => {
    return targetProfiles[0] || 'PR';
  }, [targetProfiles]);

  const currentConfig: SalesProfileTargetConfig = useMemo(() => {
    return (
      localSettings.profiles?.[primaryProfileCode] ||
      DEFAULT_SALES_SETTINGS.profiles[primaryProfileCode] ||
      DEFAULT_SALES_SETTINGS.profiles.PR
    );
  }, [localSettings, primaryProfileCode]);

  // Get current target for a specific profile in current cadence/period
  const getProfileTargetValue = (
    profileCode: SalesProfileCode,
    metricKey: 'conversionTarget' | 'followupTarget' | 'orderValueTarget' | 'reachoutBenchmark'
  ): number => {
    const pConfig = localSettings.profiles?.[profileCode] || DEFAULT_SALES_SETTINGS.profiles[profileCode];
    const pt = pConfig.periodTargets || localSettings.periodTargets || {};

    if (targetCadence === 'weekly') {
      const specificWeekKey = `week_${targetMonth}_${targetYear}_${targetWeek}_${profileCode}`;
      const fallbackWeekKey = `week_${targetMonth}_${targetYear}_${targetWeek}`;
      const targetObj = pt[specificWeekKey] || pt[fallbackWeekKey];
      if (targetObj && targetObj[metricKey] !== undefined) {
        return Number(targetObj[metricKey]);
      }

      if (metricKey === 'conversionTarget') {
        return pConfig.weeklyConversionTarget ?? pConfig.conversionTarget ?? 10;
      }
      if (metricKey === 'followupTarget') {
        return pConfig.weeklyFollowupTarget ?? pConfig.followupTarget ?? 100;
      }
      if (metricKey === 'orderValueTarget') {
        return pConfig.weeklyOrderValueTarget ?? pConfig.orderValueTarget ?? 100000;
      }
      if (metricKey === 'reachoutBenchmark') {
        return pConfig.weeklyReachoutBenchmark ?? pConfig.reachoutBenchmark ?? 200;
      }
    } else {
      // Monthly
      const specificMonthKey = `month_${targetMonth}_${targetYear}_${profileCode}`;
      const fallbackMonthKey = `month_${targetMonth}_${targetYear}`;
      const targetObj = pt[specificMonthKey] || pt[fallbackMonthKey];
      if (targetObj && targetObj[metricKey] !== undefined) {
        return Number(targetObj[metricKey]);
      }

      if (metricKey === 'conversionTarget') {
        return pConfig.monthlyConversionTarget ?? pConfig.conversionTarget ?? 10;
      }
      if (metricKey === 'followupTarget') {
        return pConfig.monthlyFollowupTarget ?? (pConfig.followupTarget ? pConfig.followupTarget * 4 : 400);
      }
      if (metricKey === 'orderValueTarget') {
        return pConfig.monthlyOrderValueTarget ?? (pConfig.orderValueTarget ? pConfig.orderValueTarget * 4 : 400000);
      }
      if (metricKey === 'reachoutBenchmark') {
        return pConfig.monthlyReachoutBenchmark ?? (pConfig.reachoutBenchmark ? pConfig.reachoutBenchmark * 4 : 800);
      }
    }

    return 0;
  };

  // Update target values for all profiles in current scope
  const handleTargetChange = (
    metricKey: 'conversionTarget' | 'followupTarget' | 'orderValueTarget' | 'reachoutBenchmark',
    value: number
  ) => {
    const cleanVal = sanitizeSalesNumber(value);

    setLocalSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SalesRewardSettings;
      if (!next.periodTargets) next.periodTargets = {};

      targetProfiles.forEach((code) => {
        if (!next.profiles[code]) {
          next.profiles[code] = JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS.profiles[code]));
        }
        const cfg = next.profiles[code];
        if (!cfg.periodTargets) cfg.periodTargets = {};

        if (targetCadence === 'weekly') {
          const weekKey = `week_${targetMonth}_${targetYear}_${targetWeek}_${code}`;
          if (!cfg.periodTargets[weekKey]) cfg.periodTargets[weekKey] = {};
          cfg.periodTargets[weekKey][metricKey] = cleanVal;

          if (!next.periodTargets[weekKey]) next.periodTargets[weekKey] = {};
          next.periodTargets[weekKey][metricKey] = cleanVal;

          // Also keep profile weekly field in sync
          if (metricKey === 'conversionTarget') {
            cfg.weeklyConversionTarget = cleanVal;
            cfg.conversionTarget = cleanVal;
          } else if (metricKey === 'followupTarget') {
            cfg.weeklyFollowupTarget = cleanVal;
            cfg.followupTarget = cleanVal;
            cfg.targetFollowups = cleanVal;
          } else if (metricKey === 'orderValueTarget') {
            cfg.weeklyOrderValueTarget = cleanVal;
            cfg.orderValueTarget = cleanVal;
            cfg.targetOrderValue = cleanVal;
          } else if (metricKey === 'reachoutBenchmark') {
            cfg.weeklyReachoutBenchmark = cleanVal;
            cfg.reachoutBenchmark = cleanVal;
            cfg.reachoutTarget = cleanVal;
          }
        } else {
          // Monthly
          const monthKey = `month_${targetMonth}_${targetYear}_${code}`;
          if (!cfg.periodTargets[monthKey]) cfg.periodTargets[monthKey] = {};
          cfg.periodTargets[monthKey][metricKey] = cleanVal;

          if (!next.periodTargets[monthKey]) next.periodTargets[monthKey] = {};
          next.periodTargets[monthKey][metricKey] = cleanVal;

          // Update profile monthly fields
          if (metricKey === 'conversionTarget') {
            cfg.monthlyConversionTarget = cleanVal;
            cfg.conversionTarget = cleanVal;
          } else if (metricKey === 'followupTarget') {
            cfg.monthlyFollowupTarget = cleanVal;
          } else if (metricKey === 'orderValueTarget') {
            cfg.monthlyOrderValueTarget = cleanVal;
          } else if (metricKey === 'reachoutBenchmark') {
            cfg.monthlyReachoutBenchmark = cleanVal;
          }
        }
      });

      return next;
    });

    setFeedbackMsg(null);
  };

  // Quick Action 1: Auto-divide monthly targets by 4 to set weekly targets
  const handleAutoDivideMonthly = () => {
    setLocalSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SalesRewardSettings;
      if (!next.periodTargets) next.periodTargets = {};

      targetProfiles.forEach((code) => {
        const cfg = next.profiles[code] || JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS.profiles[code]));
        if (!cfg.periodTargets) cfg.periodTargets = {};

        const monthlyConv = getProfileTargetValue(code, 'conversionTarget');
        const monthlyFollowup = getProfileTargetValue(code, 'followupTarget');
        const monthlyOrderVal = getProfileTargetValue(code, 'orderValueTarget');
        const monthlyReachout = getProfileTargetValue(code, 'reachoutBenchmark');

        const weeklyConv = monthlyConv;
        const weeklyFollowup = Math.round((monthlyFollowup / 4) * 100) / 100;
        const weeklyOrderVal = Math.round((monthlyOrderVal / 4) * 100) / 100;
        const weeklyReachout = Math.round((monthlyReachout / 4) * 100) / 100;

        cfg.weeklyConversionTarget = weeklyConv;
        cfg.conversionTarget = weeklyConv;
        cfg.weeklyFollowupTarget = weeklyFollowup;
        cfg.followupTarget = weeklyFollowup;
        cfg.weeklyOrderValueTarget = weeklyOrderVal;
        cfg.orderValueTarget = weeklyOrderVal;
        cfg.weeklyReachoutBenchmark = weeklyReachout;
        cfg.reachoutBenchmark = weeklyReachout;

        WEEKS_LIST.forEach((w) => {
          const wKey = `week_${targetMonth}_${targetYear}_${w}_${code}`;
          cfg.periodTargets[wKey] = {
            conversionTarget: weeklyConv,
            followupTarget: weeklyFollowup,
            orderValueTarget: weeklyOrderVal,
            reachoutBenchmark: weeklyReachout,
          };
          next.periodTargets![wKey] = { ...cfg.periodTargets[wKey] };
        });

        next.profiles[code] = cfg;
      });

      return next;
    });

    setFeedbackMsg({
      type: 'info',
      text: `Auto-divided monthly targets by 4 into weekly benchmarks for ${targetMonth} ${targetYear}.`,
    });
  };

  // Quick Action 2: Auto-multiply weekly targets by 4 to set monthly targets
  const handleAutoMultiplyWeekly = () => {
    setLocalSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SalesRewardSettings;
      if (!next.periodTargets) next.periodTargets = {};

      targetProfiles.forEach((code) => {
        const cfg = next.profiles[code] || JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS.profiles[code]));
        if (!cfg.periodTargets) cfg.periodTargets = {};

        const weeklyConv = getProfileTargetValue(code, 'conversionTarget');
        const weeklyFollowup = getProfileTargetValue(code, 'followupTarget');
        const weeklyOrderVal = getProfileTargetValue(code, 'orderValueTarget');
        const weeklyReachout = getProfileTargetValue(code, 'reachoutBenchmark');

        const monthlyConv = weeklyConv;
        const monthlyFollowup = Math.round(weeklyFollowup * 4);
        const monthlyOrderVal = Math.round(weeklyOrderVal * 4);
        const monthlyReachout = Math.round(weeklyReachout * 4);

        cfg.monthlyConversionTarget = monthlyConv;
        cfg.monthlyFollowupTarget = monthlyFollowup;
        cfg.monthlyOrderValueTarget = monthlyOrderVal;
        cfg.monthlyReachoutBenchmark = monthlyReachout;

        const mKey = `month_${targetMonth}_${targetYear}_${code}`;
        cfg.periodTargets[mKey] = {
          conversionTarget: monthlyConv,
          followupTarget: monthlyFollowup,
          orderValueTarget: monthlyOrderVal,
          reachoutBenchmark: monthlyReachout,
        };
        next.periodTargets![mKey] = { ...cfg.periodTargets[mKey] };

        next.profiles[code] = cfg;
      });

      return next;
    });

    setFeedbackMsg({
      type: 'info',
      text: `Auto-multiplied weekly targets by 4 to establish monthly targets for ${targetMonth} ${targetYear}.`,
    });
  };

  // Quick Action 3: Copy selected week's targets across all 5 weeks
  const handleApplyWeekToAllWeeks = () => {
    setLocalSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SalesRewardSettings;
      if (!next.periodTargets) next.periodTargets = {};

      targetProfiles.forEach((code) => {
        const cfg = next.profiles[code] || JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS.profiles[code]));
        if (!cfg.periodTargets) cfg.periodTargets = {};

        const weeklyConv = getProfileTargetValue(code, 'conversionTarget');
        const weeklyFollowup = getProfileTargetValue(code, 'followupTarget');
        const weeklyOrderVal = getProfileTargetValue(code, 'orderValueTarget');
        const weeklyReachout = getProfileTargetValue(code, 'reachoutBenchmark');

        WEEKS_LIST.forEach((w) => {
          const wKey = `week_${targetMonth}_${targetYear}_${w}_${code}`;
          cfg.periodTargets[wKey] = {
            conversionTarget: weeklyConv,
            followupTarget: weeklyFollowup,
            orderValueTarget: weeklyOrderVal,
            reachoutBenchmark: weeklyReachout,
          };
          next.periodTargets![wKey] = { ...cfg.periodTargets[wKey] };
        });

        next.profiles[code] = cfg;
      });

      return next;
    });

    setFeedbackMsg({
      type: 'success',
      text: `Applied ${targetWeek} targets across all 5 weeks of ${targetMonth} ${targetYear}.`,
    });
  };

  // Preset benchmarks loader
  const handleLoadPresets = (dept: 'it' | 'smm' | 'all') => {
    setLocalSettings((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SalesRewardSettings;
      const codesToReset: SalesProfileCode[] =
        dept === 'it'
          ? ['PR', 'WR', 'HW']
          : dept === 'smm'
          ? ['DR', 'RR']
          : ['PR', 'WR', 'HW', 'DR', 'RR'];

      codesToReset.forEach((code) => {
        const def = DEFAULT_SALES_SETTINGS.profiles[code];
        next.profiles[code] = JSON.parse(JSON.stringify(def));
      });

      return next;
    });

    setFeedbackMsg({
      type: 'info',
      text: `Loaded standard benchmark targets for ${dept.toUpperCase()} Sales profiles.`,
    });
  };

  // Save changes
  const handleSaveTargets = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const ok = await saveSalesRewardSettings(localSettings);
      if (ok) {
        setFeedbackMsg({
          type: 'success',
          text: 'Sales KPI Targets successfully saved and applied to performance calculations.',
        });
        if (onSaved) onSaved();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: 'Failed to save sales KPI targets. Check admin authorization.',
        });
      }
    } catch (e: any) {
      setFeedbackMsg({
        type: 'error',
        text: e.message || 'Failed to save targets',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (confirm('Reset all sales KPI targets and reward settings to standard organizational defaults?')) {
      setIsSaving(true);
      await resetSalesRewardSettings();
      setLocalSettings(JSON.parse(JSON.stringify(DEFAULT_SALES_SETTINGS)));
      setIsSaving(false);
      setFeedbackMsg({
        type: 'info',
        text: 'All Sales KPI targets have been reset to standard baselines.',
      });
    }
  };

  const currSymbol = localSettings.currencySymbol || '₹';

  // Read current display values for primary profile
  const valConversion = getProfileTargetValue(primaryProfileCode, 'conversionTarget');
  const valFollowup = getProfileTargetValue(primaryProfileCode, 'followupTarget');
  const valOrderValue = getProfileTargetValue(primaryProfileCode, 'orderValueTarget');
  const valReachout = getProfileTargetValue(primaryProfileCode, 'reachoutBenchmark');

  // Computed counterparts for helpers
  const counterpartFollowup =
    targetCadence === 'weekly' ? Math.round(valFollowup * 4) : Math.round((valFollowup / 4) * 10) / 10;
  const counterpartOrderValue =
    targetCadence === 'weekly' ? Math.round(valOrderValue * 4) : Math.round((valOrderValue / 4) * 10) / 10;
  const counterpartReachout =
    targetCadence === 'weekly' ? Math.round(valReachout * 4) : Math.round((valReachout / 4) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#8cc540]/20 text-[#436320] border border-[#8cc540]/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin KPI Target Center
            </span>
            <span className="text-xs font-bold text-[#666666]">
              • Weekly & Monthly Target Calibration
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101010] tracking-tight mt-1 flex items-center gap-2.5">
            <Target className="w-7 h-7 text-[#598327]" />
            Sales KPI Targets & Benchmarks
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
            Define target conversion rates, follow-up volumes, order values, and activity benchmarks on a weekly or monthly cadence
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-[#f8faf6] hover:bg-[#edf4e8] text-[#101010] font-bold text-xs border border-[#e2ebd9] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#598327]" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveTargets}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save KPI Targets'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedbackMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Cadence, Scope & Period Control Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e2ebd9] shadow-xs space-y-4">
        {/* Row 1: Cadence and View Mode Switchers */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-4">
          {/* Target Cadence Switcher: Monthly vs Weekly */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-[#101010] uppercase tracking-wider">
              Target Cadence:
            </span>
            <div className="inline-flex p-1 rounded-2xl bg-[#f4f7f0] border border-[#e2ebd9]">
              <button
                type="button"
                onClick={() => setTargetCadence('weekly')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  targetCadence === 'weekly'
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                    : 'text-[#666666] hover:text-[#101010]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                ⏱️ Weekly Targets
              </button>
              <button
                type="button"
                onClick={() => setTargetCadence('monthly')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  targetCadence === 'monthly'
                    ? 'bg-[#8cc540] text-[#101010] shadow-sm'
                    : 'text-[#666666] hover:text-[#101010]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                📅 Monthly Targets
              </button>
            </div>
          </div>

          {/* View Mode Toggle: Cards vs 4-Week Matrix */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#666666]">Layout:</span>
            <div className="inline-flex p-1 rounded-xl bg-[#f4f7f0] border border-[#e2ebd9]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-[#101010] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#101010]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                KPI Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-[#101010] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#101010]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                4-Week Matrix View
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Profile / Scope Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-black text-[#101010] uppercase tracking-wider">
            Target Profile Scope:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setTargetScope('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                targetScope === 'all'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'bg-[#f8faf6] text-[#555555] border border-[#e2ebd9] hover:bg-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🌟 All Profiles (Global)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetScope('it_dept')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                targetScope === 'it_dept'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'bg-[#f8faf6] text-[#555555] border border-[#e2ebd9] hover:bg-white'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-cyan-600" />
              <span>💻 IT Sales (PR, WR, HW)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetScope('smm_dept')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                targetScope === 'smm_dept'
                  ? 'bg-[#101010] text-white shadow-xs'
                  : 'bg-[#f8faf6] text-[#555555] border border-[#e2ebd9] hover:bg-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-pink-600" />
              <span>📱 SMM Sales (DR, RR)</span>
            </button>

            {(['PR', 'WR', 'HW', 'DR', 'RR'] as SalesProfileCode[]).map((code) => {
              const meta = SALES_PROFILES_META[code];
              const isSelected = targetScope === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setTargetScope(code)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#101010] text-white shadow-xs'
                      : 'bg-[#f8faf6] text-[#555555] border border-[#e2ebd9] hover:bg-white'
                  }`}
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#8cc540] text-[#101010] font-black">
                    {code}
                  </span>
                  <span>{meta.name.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Period Filter & Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center pt-1">
          <div>
            <label className="block text-[10px] font-bold text-[#666666] uppercase mb-1">
              Target Month
            </label>
            <select
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540] cursor-pointer"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#666666] uppercase mb-1">
              Target Year
            </label>
            <select
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540] cursor-pointer"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {targetCadence === 'weekly' && (
            <div>
              <label className="block text-[10px] font-bold text-[#666666] uppercase mb-1">
                Target Week
              </label>
              <select
                value={targetWeek}
                onChange={(e) => setTargetWeek(e.target.value)}
                className="w-full bg-[#f8faf6] border border-[#8cc540]/60 rounded-xl px-3 py-2 text-xs font-black text-[#3d591d] focus:outline-none focus:ring-2 focus:ring-[#8cc540] cursor-pointer"
              >
                {WEEKS_LIST.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={() => handleLoadPresets('it')}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition-colors cursor-pointer"
              title="Load standard IT Sales benchmarks"
            >
              💻 IT Presets
            </button>
            <button
              type="button"
              onClick={() => handleLoadPresets('smm')}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-pink-50 text-pink-800 border border-pink-200 hover:bg-pink-100 transition-colors cursor-pointer"
              title="Load standard SMM Sales benchmarks"
            >
              📱 SMM Presets
            </button>
          </div>
        </div>

        {/* Row 4: Smart Converter & Quick Action Tools */}
        <div className="p-3.5 rounded-2xl bg-[#f4f7f0] border border-[#e2ebd9] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#436320]">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Target Scope Active:{' '}
              <strong className="text-[#101010] font-black">
                {targetScope === 'all'
                  ? 'All Profiles (PR, WR, HW, DR, RR)'
                  : targetScope === 'it_dept'
                  ? 'IT Sales (PR, WR, HW)'
                  : targetScope === 'smm_dept'
                  ? 'SMM Sales (DR, RR)'
                  : `${SALES_PROFILES_META[targetScope]?.name || targetScope}`}{' '}
                • {targetMonth} {targetYear} {targetCadence === 'weekly' ? `(${targetWeek})` : '(Full Month)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {targetCadence === 'monthly' ? (
              <button
                type="button"
                onClick={handleAutoDivideMonthly}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black bg-white hover:bg-[#edf4e8] text-[#3d591d] border border-[#e2ebd9] shadow-2xs transition-colors cursor-pointer"
                title="Auto-calculate and set weekly targets = monthly / 4"
              >
                <Divide className="w-3.5 h-3.5 text-[#598327]" />
                Auto-Divide to 4 Weeks (/4)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAutoMultiplyWeekly}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black bg-white hover:bg-[#edf4e8] text-[#3d591d] border border-[#e2ebd9] shadow-2xs transition-colors cursor-pointer"
                  title="Auto-calculate and set monthly target = weekly * 4"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#598327]" />
                  Auto-Multiply to Month (*4)
                </button>
                <button
                  type="button"
                  onClick={handleApplyWeekToAllWeeks}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black bg-white hover:bg-[#edf4e8] text-amber-800 border border-amber-200 shadow-2xs transition-colors cursor-pointer"
                  title="Apply current week's targets to all 5 weeks"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  Apply Week to All 5 Weeks
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: KPI CARDS EDITOR */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Conversion Rate Target (50% Weight) */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200/80 p-5 shadow-xs space-y-4 hover:border-emerald-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-800 border border-emerald-300">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#101010]">1. Conversion Rate Target</h4>
                  <p className="text-[11px] text-[#666666]">Primary sales closing ratio benchmark</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                50% Weight
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">
                  Target Conversion Rate ({targetCadence === 'weekly' ? `${targetWeek} (%)` : 'Monthly (%)'})
                </label>
                <span className="text-[10px] text-[#555555]">Score Weight: 50%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={valConversion}
                  onChange={(e) => handleTargetChange('conversionTarget', Number(e.target.value))}
                  className="w-full bg-[#f8faf6] border border-emerald-300 rounded-2xl px-4 py-3 text-base font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-12 shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700">
                  %
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>Closing Ratio Benchmark:</span>
                <span className="font-black text-emerald-950">{valConversion}% Converted</span>
              </div>
              <p className="text-[10px] text-emerald-800">
                Rate-based metric: remains equal between weekly and monthly scopes. Evaluated as (Conversions / Reachouts) × 100.
              </p>
            </div>
          </div>

          {/* Card 2: Follow-ups Target (20% Weight) */}
          <div className="bg-white rounded-3xl border-2 border-blue-200/80 p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100/80 flex items-center justify-center text-blue-800 border border-blue-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#101010]">2. Follow-ups Done Target</h4>
                  <p className="text-[11px] text-[#666666]">Client follow-up communications conducted</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                20% Weight
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">
                  Target Follow-ups Count ({targetCadence === 'weekly' ? `${targetWeek}` : 'Full Month'})
                </label>
                <span className="text-[10px] text-[#555555]">Score Weight: 20%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={valFollowup}
                  onChange={(e) => handleTargetChange('followupTarget', Number(e.target.value))}
                  className="w-full bg-[#f8faf6] border border-blue-300 rounded-2xl px-4 py-3 text-base font-black text-blue-950 focus:ring-2 focus:ring-blue-500 focus:outline-none pr-28 shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-700">
                  Follow-ups
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between">
              <div>
                <span className="block font-bold">
                  {targetCadence === 'weekly' ? 'Monthly Target Equivalent:' : 'Weekly Target Equivalent:'}
                </span>
                <span className="text-[10px] text-blue-800 font-medium">
                  {targetCadence === 'weekly' ? 'Based on 4-week consolidated month' : 'Prorated per individual week'}
                </span>
              </div>
              <span className="font-black text-sm text-blue-950">
                ≈ {counterpartFollowup} {targetCadence === 'weekly' ? 'Follow-ups/mo' : 'Follow-ups/wk'}
              </span>
            </div>
          </div>

          {/* Card 3: Total Order Value Target (30% Weight) */}
          <div className="bg-white rounded-3xl border-2 border-amber-200/80 p-5 shadow-xs space-y-4 hover:border-amber-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-800 border border-amber-300">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#101010]">3. Total Order Value Target</h4>
                  <p className="text-[11px] text-[#666666]">Gross closed revenue & deal value</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                30% Weight
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#101010]">
                  Target Order Value ({targetCadence === 'weekly' ? `${targetWeek} (${currSymbol})` : `Full Month (${currSymbol})`})
                </label>
                <span className="text-[10px] text-[#555555]">Score Weight: 30%</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="500"
                  value={valOrderValue}
                  onChange={(e) => handleTargetChange('orderValueTarget', Number(e.target.value))}
                  className="w-full bg-[#f8faf6] border border-amber-300 rounded-2xl px-4 py-3 text-base font-black text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none pr-12 shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-amber-700">
                  {currSymbol}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
              <div>
                <span className="block font-bold">
                  {targetCadence === 'weekly' ? 'Monthly Revenue Target:' : 'Weekly Revenue Target:'}
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  {targetCadence === 'weekly' ? 'Estimated 4-week consolidated goal' : 'Divided evenly across 4 weeks'}
                </span>
              </div>
              <span className="font-black text-sm text-amber-950">
                ≈ {currSymbol}{counterpartOrderValue.toLocaleString('en-IN')} {targetCadence === 'weekly' ? '/mo' : '/wk'}
              </span>
            </div>
          </div>

          {/* Card 4: Total Reachouts Target (0% Weight Activity Benchmark) */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-300">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">4. Total Reachouts Benchmark</h4>
                  <p className="text-[11px] text-[#666666]">Pipeline prospecting activity & outreach baseline</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                0% Weight (Activity)
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800">
                  Benchmark Reachouts Volume ({targetCadence === 'weekly' ? `${targetWeek}` : 'Full Month'})
                </label>
                <span className="text-[10px] text-slate-500">Activity Only (0%)</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={valReachout}
                  onChange={(e) => handleTargetChange('reachoutBenchmark', Number(e.target.value))}
                  className="w-full bg-[#f8faf6] border border-slate-300 rounded-2xl px-4 py-3 text-base font-black text-slate-900 focus:ring-2 focus:ring-slate-400 focus:outline-none pr-28 shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
                  Reachouts
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 flex items-center justify-between">
              <div>
                <span className="block font-bold">
                  {targetCadence === 'weekly' ? 'Monthly Outreach Equivalent:' : 'Weekly Outreach Equivalent:'}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">
                  Serves as denominator for conversion rate calculation
                </span>
              </div>
              <span className="font-black text-sm text-slate-900">
                ≈ {counterpartReachout} {targetCadence === 'weekly' ? 'Reachouts/mo' : 'Reachouts/wk'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 4-WEEK TARGET MATRIX TABLE */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-3xl border border-[#e2ebd9] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-4">
            <div>
              <h3 className="text-lg font-black text-[#101010] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#598327]" />
                Performance Period Target Matrix ({targetMonth} {targetYear})
              </h3>
              <p className="text-xs text-[#666666]">
                Side-by-side view and direct weekly calibration for each Sales KPI across all profiles
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#e2ebd9]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f8faf6] text-[#666666] font-bold uppercase text-[10px] border-b border-[#e2ebd9]">
                <tr>
                  <th className="p-3.5">Sales Profile</th>
                  <th className="p-3.5">KPI Metric</th>
                  <th className="p-3.5 text-center">Score Weight</th>
                  <th className="p-3.5 text-right bg-amber-50/50">Full Month Target</th>
                  <th className="p-3.5 text-right">Week 1</th>
                  <th className="p-3.5 text-right">Week 2</th>
                  <th className="p-3.5 text-right">Week 3</th>
                  <th className="p-3.5 text-right">Week 4</th>
                  <th className="p-3.5 text-right">Week 5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ec]">
                {targetProfiles.map((code) => {
                  const meta = SALES_PROFILES_META[code];
                  const pConfig = localSettings.profiles?.[code] || DEFAULT_SALES_SETTINGS.profiles[code];
                  const pt = pConfig.periodTargets || localSettings.periodTargets || {};

                  // Monthly values
                  const mConv = pt[`month_${targetMonth}_${targetYear}_${code}`]?.conversionTarget ?? pConfig.monthlyConversionTarget ?? pConfig.conversionTarget ?? 10;
                  const mFollowup = pt[`month_${targetMonth}_${targetYear}_${code}`]?.followupTarget ?? pConfig.monthlyFollowupTarget ?? (pConfig.followupTarget ? pConfig.followupTarget * 4 : 400);
                  const mOrderVal = pt[`month_${targetMonth}_${targetYear}_${code}`]?.orderValueTarget ?? pConfig.monthlyOrderValueTarget ?? (pConfig.orderValueTarget ? pConfig.orderValueTarget * 4 : 400000);
                  const mReachout = pt[`month_${targetMonth}_${targetYear}_${code}`]?.reachoutBenchmark ?? pConfig.monthlyReachoutBenchmark ?? (pConfig.reachoutBenchmark ? pConfig.reachoutBenchmark * 4 : 800);

                  const metrics = [
                    {
                      name: 'Conversion Rate',
                      unit: '%',
                      weight: '50%',
                      monthVal: `${mConv}%`,
                      getWeekVal: (w: string) => `${pt[`week_${targetMonth}_${targetYear}_${w}_${code}`]?.conversionTarget ?? pConfig.weeklyConversionTarget ?? pConfig.conversionTarget ?? 10}%`,
                    },
                    {
                      name: 'Follow-ups',
                      unit: 'cnt',
                      weight: '20%',
                      monthVal: `${mFollowup}`,
                      getWeekVal: (w: string) => `${pt[`week_${targetMonth}_${targetYear}_${w}_${code}`]?.followupTarget ?? pConfig.weeklyFollowupTarget ?? pConfig.followupTarget ?? 100}`,
                    },
                    {
                      name: 'Order Value',
                      unit: currSymbol,
                      weight: '30%',
                      monthVal: `${currSymbol}${mOrderVal.toLocaleString('en-IN')}`,
                      getWeekVal: (w: string) => `${currSymbol}${(pt[`week_${targetMonth}_${targetYear}_${w}_${code}`]?.orderValueTarget ?? pConfig.weeklyOrderValueTarget ?? pConfig.orderValueTarget ?? 100000).toLocaleString('en-IN')}`,
                    },
                    {
                      name: 'Reachouts',
                      unit: 'cnt',
                      weight: '0%',
                      monthVal: `${mReachout}`,
                      getWeekVal: (w: string) => `${pt[`week_${targetMonth}_${targetYear}_${w}_${code}`]?.reachoutBenchmark ?? pConfig.weeklyReachoutBenchmark ?? pConfig.reachoutBenchmark ?? 200}`,
                    },
                  ];

                  return (
                    <React.Fragment key={code}>
                      <tr className="bg-[#fcfdfa] border-t-2 border-[#e2ebd9]">
                        <td colSpan={9} className="py-2.5 px-3.5 font-black text-xs text-[#101010] bg-[#f4f7f0]">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#8cc540] text-[#101010] font-black">
                              {code}
                            </span>
                            <span>{meta.name}</span>
                            <span className="text-[11px] font-medium text-[#666666]">
                              ({pConfig.department} Sales)
                            </span>
                          </div>
                        </td>
                      </tr>
                      {metrics.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#f8faf6]">
                          <td className="p-3 pl-8 text-[#666666] font-medium text-[11px]"></td>
                          <td className="p-3 font-bold text-[#101010]">{m.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#f0f4ec] text-[#436320]">
                              {m.weight}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-amber-900 bg-amber-50/40">
                            {m.monthVal}
                          </td>
                          <td className="p-3 text-right font-bold text-[#101010]">{m.getWeekVal('Week 1')}</td>
                          <td className="p-3 text-right font-bold text-[#101010]">{m.getWeekVal('Week 2')}</td>
                          <td className="p-3 text-right font-bold text-[#101010]">{m.getWeekVal('Week 3')}</td>
                          <td className="p-3 text-right font-bold text-[#101010]">{m.getWeekVal('Week 4')}</td>
                          <td className="p-3 text-right font-bold text-[#101010]">{m.getWeekVal('Week 5')}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="p-5 rounded-3xl bg-white border border-[#e2ebd9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#555555]">
          <CheckCircle2 className="w-4 h-4 text-[#598327] shrink-0" />
          <span>
            Weights total exactly 100% (50% Conversion + 20% Follow-ups + 30% Order Value). Reachouts tracked at 0% activity weight.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveTargets}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-[#8cc540] hover:bg-[#7db734] text-[#101010] font-black text-xs shadow-md shadow-[#8cc540]/30 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Targets...' : 'Save All Targets'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
