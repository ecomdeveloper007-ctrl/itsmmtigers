import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Save,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Percent,
  Target,
  RefreshCw,
  Calendar,
  Clock,
  Zap,
  Layers,
  TrendingUp,
  Briefcase,
  Star,
  Users,
  Repeat,
  Copy,
  Divide,
  Calculator,
} from 'lucide-react';
import { KPIConfig, AppSettings } from '../../types';
import {
  validateKPIWeights,
  DEFAULT_KPIS,
  DEFAULT_SETTINGS,
  sanitizeNumber,
} from '../../services/calculationService';

type SettingsTab = 'targets' | 'matrix' | 'weights' | 'rules';
type TargetCadence = 'monthly' | 'weekly';
type TargetTeamScope = 'all' | 'it' | 'smm';

export const KPISettings: React.FC = () => {
  const {
    kpis,
    settings,
    selectedMonth,
    selectedYear,
    saveKPIConfig,
    saveAppSettings,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('targets');
  const [localKpis, setLocalKpis] = useState<KPIConfig[]>(kpis);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Target Editor State
  const [targetCadence, setTargetCadence] = useState<TargetCadence>('monthly');
  const [targetMonth, setTargetMonth] = useState<string>(selectedMonth || 'September');
  const [targetYear, setTargetYear] = useState<number>(selectedYear || 2026);
  const [targetWeek, setTargetWeek] = useState<string>('Week 1');
  const [targetTeam, setTargetTeam] = useState<TargetTeamScope>('all');

  useEffect(() => {
    setLocalKpis(kpis);
    setLocalSettings(settings);
  }, [kpis, settings]);

  const validation = validateKPIWeights(localKpis);

  // Get current active target for a KPI given the active scope in the UI
  const getCurrentScopeTarget = (kpi: KPIConfig): number => {
    const pt = kpi.periodTargets || {};
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';

    if (targetCadence === 'weekly') {
      const specificWeekKey = `week_${targetMonth}_${targetYear}_${targetWeek}${teamSuffix}`;
      if (pt[specificWeekKey] !== undefined) return pt[specificWeekKey];

      if (targetTeam === 'it' && kpi.itWeeklyTarget !== undefined && kpi.itWeeklyTarget > 0) {
        return kpi.itWeeklyTarget;
      }
      if (targetTeam === 'smm' && kpi.smmWeeklyTarget !== undefined && kpi.smmWeeklyTarget > 0) {
        return kpi.smmWeeklyTarget;
      }
      if (kpi.weeklyTarget !== undefined && kpi.weeklyTarget > 0) {
        return kpi.weeklyTarget;
      }
      return kpi.isRating ? kpi.defaultTarget : Math.round((kpi.defaultTarget / 4) * 100) / 100;
    } else {
      // Monthly
      const specificMonthKey = `month_${targetMonth}_${targetYear}${teamSuffix}`;
      if (pt[specificMonthKey] !== undefined) return pt[specificMonthKey];

      if (targetTeam === 'it' && kpi.itMonthlyTarget !== undefined && kpi.itMonthlyTarget > 0) {
        return kpi.itMonthlyTarget;
      }
      if (targetTeam === 'smm' && kpi.smmMonthlyTarget !== undefined && kpi.smmMonthlyTarget > 0) {
        return kpi.smmMonthlyTarget;
      }
      return kpi.defaultTarget;
    }
  };

  // Update target for current scope
  const handleScopeTargetChange = (kpiId: string, value: number) => {
    const cleanVal = sanitizeNumber(value);
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';

    setLocalKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id !== kpiId) return kpi;

        const currentPT = { ...(kpi.periodTargets || {}) };

        if (targetCadence === 'weekly') {
          const specificWeekKey = `week_${targetMonth}_${targetYear}_${targetWeek}${teamSuffix}`;
          currentPT[specificWeekKey] = cleanVal;

          return {
            ...kpi,
            weeklyTarget: targetTeam === 'all' ? cleanVal : kpi.weeklyTarget,
            itWeeklyTarget: targetTeam === 'it' ? cleanVal : kpi.itWeeklyTarget,
            smmWeeklyTarget: targetTeam === 'smm' ? cleanVal : kpi.smmWeeklyTarget,
            periodTargets: currentPT,
          };
        } else {
          const specificMonthKey = `month_${targetMonth}_${targetYear}${teamSuffix}`;
          currentPT[specificMonthKey] = cleanVal;

          return {
            ...kpi,
            defaultTarget: targetTeam === 'all' ? cleanVal : kpi.defaultTarget,
            itMonthlyTarget: targetTeam === 'it' ? cleanVal : kpi.itMonthlyTarget,
            smmMonthlyTarget: targetTeam === 'smm' ? cleanVal : kpi.smmMonthlyTarget,
            periodTargets: currentPT,
          };
        }
      })
    );
  };

  // Convert monthly targets to weekly (monthly / 4)
  const handleAutoDivideMonthly = () => {
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const pt = { ...(kpi.periodTargets || {}) };
        const monthlyKey = `month_${targetMonth}_${targetYear}${teamSuffix}`;
        const currentMonthTarget = pt[monthlyKey] ?? kpi.defaultTarget;
        const calculatedWeekly = kpi.isRating
          ? currentMonthTarget
          : Math.round((currentMonthTarget / 4) * 100) / 100;

        ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach((w) => {
          pt[`week_${targetMonth}_${targetYear}_${w}${teamSuffix}`] = calculatedWeekly;
        });

        return {
          ...kpi,
          weeklyTarget: targetTeam === 'all' ? calculatedWeekly : kpi.weeklyTarget,
          itWeeklyTarget: targetTeam === 'it' ? calculatedWeekly : kpi.itWeeklyTarget,
          smmWeeklyTarget: targetTeam === 'smm' ? calculatedWeekly : kpi.smmWeeklyTarget,
          periodTargets: pt,
        };
      })
    );
    addToast('info', 'Weekly Targets Computed', 'Set weekly targets = monthly target / 4 across Weeks 1-4.');
  };

  // Convert weekly targets to monthly (weekly * 4)
  const handleAutoMultiplyWeekly = () => {
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const pt = { ...(kpi.periodTargets || {}) };
        const weeklyKey = `week_${targetMonth}_${targetYear}_${targetWeek}${teamSuffix}`;
        const currentWeeklyTarget =
          pt[weeklyKey] ?? (kpi.isRating ? kpi.defaultTarget : Math.round((kpi.defaultTarget / 4) * 100) / 100);
        const calculatedMonthly = kpi.isRating ? currentWeeklyTarget : currentWeeklyTarget * 4;

        pt[`month_${targetMonth}_${targetYear}${teamSuffix}`] = calculatedMonthly;

        return {
          ...kpi,
          defaultTarget: targetTeam === 'all' ? calculatedMonthly : kpi.defaultTarget,
          itMonthlyTarget: targetTeam === 'it' ? calculatedMonthly : kpi.itMonthlyTarget,
          smmMonthlyTarget: targetTeam === 'smm' ? calculatedMonthly : kpi.smmMonthlyTarget,
          periodTargets: pt,
        };
      })
    );
    addToast('info', 'Monthly Target Computed', 'Set monthly target = weekly target * 4.');
  };

  // Copy target from active week to all 4 weeks of the month
  const handleApplyWeekToAllWeeks = () => {
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const pt = { ...(kpi.periodTargets || {}) };
        const sourceKey = `week_${targetMonth}_${targetYear}_${targetWeek}${teamSuffix}`;
        const sourceVal =
          pt[sourceKey] ?? (kpi.isRating ? kpi.defaultTarget : Math.round((kpi.defaultTarget / 4) * 100) / 100);

        ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach((w) => {
          pt[`week_${targetMonth}_${targetYear}_${w}${teamSuffix}`] = sourceVal;
        });

        return {
          ...kpi,
          periodTargets: pt,
        };
      })
    );
    addToast('success', 'Targets Copied', `Applied ${targetWeek} targets across all 4 weeks of ${targetMonth}.`);
  };

  // Weight & Name handlers
  const handleWeightChange = (id: string, newWeight: number) => {
    setLocalKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, weight: sanitizeNumber(newWeight) } : kpi))
    );
    setErrorMessage(null);
  };

  const handleNameChange = (id: string, newName: string) => {
    setLocalKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, name: newName } : kpi))
    );
  };

  const handleToggleActive = (id: string) => {
    setLocalKpis((prev) =>
      prev.map((kpi) => (kpi.id === id ? { ...kpi, active: !kpi.active } : kpi))
    );
  };

  // Reset to initial standard benchmarks
  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all KPIs & Targets to initial default values?')) {
      setLocalKpis(DEFAULT_KPIS);
      setLocalSettings(DEFAULT_SETTINGS);
      addToast('info', 'Reset Complete', 'Default KPI weights, targets, and scoring thresholds restored.');
    }
  };

  // Load IT Division Preset Benchmark Targets
  const handleLoadITPresets = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const currentPT = { ...(kpi.periodTargets || {}) };
        let itMonthly = 20;
        let itWeekly = 5;

        if (kpi.key === 'revenueGenerated') {
          itMonthly = 15000;
          itWeekly = 3750;
        } else if (kpi.key === 'projectClosed') {
          itMonthly = 20;
          itWeekly = 5;
        } else if (kpi.key === 'upsells') {
          itMonthly = 8;
          itWeekly = 2;
        } else if (kpi.key === 'clientRating') {
          itMonthly = 5;
          itWeekly = 5;
        } else if (kpi.key === 'followupsCompleted') {
          itMonthly = 30;
          itWeekly = 7.5;
        } else if (kpi.key === 'repeatClients') {
          itMonthly = 6;
          itWeekly = 1.5;
        }

        currentPT[`month_${targetMonth}_${targetYear}_it`] = itMonthly;
        ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach((w) => {
          currentPT[`week_${targetMonth}_${targetYear}_${w}_it`] = itWeekly;
        });

        return {
          ...kpi,
          itMonthlyTarget: itMonthly,
          itWeeklyTarget: itWeekly,
          periodTargets: currentPT,
        };
      })
    );
    setTargetTeam('it');
    addToast('info', 'IT Team Benchmark Presets Applied', 'Loaded software & dev target baselines.');
  };

  // Load SMM Division Preset Benchmark Targets
  const handleLoadSMMPresets = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const currentPT = { ...(kpi.periodTargets || {}) };
        let smmMonthly = 25;
        let smmWeekly = 6.25;

        if (kpi.key === 'revenueGenerated') {
          smmMonthly = 10000;
          smmWeekly = 2500;
        } else if (kpi.key === 'projectClosed') {
          smmMonthly = 25;
          smmWeekly = 6.25;
        } else if (kpi.key === 'upsells') {
          smmMonthly = 10;
          smmWeekly = 2.5;
        } else if (kpi.key === 'clientRating') {
          smmMonthly = 5;
          smmWeekly = 5;
        } else if (kpi.key === 'followupsCompleted') {
          smmMonthly = 50;
          smmWeekly = 12.5;
        } else if (kpi.key === 'repeatClients') {
          smmMonthly = 10;
          smmWeekly = 2.5;
        }

        currentPT[`month_${targetMonth}_${targetYear}_smm`] = smmMonthly;
        ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach((w) => {
          currentPT[`week_${targetMonth}_${targetYear}_${w}_smm`] = smmWeekly;
        });

        return {
          ...kpi,
          smmMonthlyTarget: smmMonthly,
          smmWeeklyTarget: smmWeekly,
          periodTargets: currentPT,
        };
      })
    );
    setTargetTeam('smm');
    addToast('info', 'SMM Team Benchmark Presets Applied', 'Loaded social media & ads target baselines.');
  };

  // Matrix inline change for a specific week
  const handleMatrixWeekTargetChange = (kpiId: string, week: string, val: number) => {
    const cleanVal = sanitizeNumber(val);
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';
    const key = `week_${targetMonth}_${targetYear}_${week}${teamSuffix}`;

    setLocalKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id !== kpiId) return kpi;
        const pt = { ...(kpi.periodTargets || {}) };
        pt[key] = cleanVal;
        return { ...kpi, periodTargets: pt };
      })
    );
  };

  // Matrix inline change for month
  const handleMatrixMonthTargetChange = (kpiId: string, val: number) => {
    const cleanVal = sanitizeNumber(val);
    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';
    const key = `month_${targetMonth}_${targetYear}${teamSuffix}`;

    setLocalKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id !== kpiId) return kpi;
        const pt = { ...(kpi.periodTargets || {}) };
        pt[key] = cleanVal;
        return { ...kpi, periodTargets: pt };
      })
    );
  };

  // Save All Changes
  const handleSave = async () => {
    if (!validation.isValid) {
      setErrorMessage(
        `Total KPI weight must equal exactly 100%. Current sum is ${validation.totalWeight}%.`
      );
      addToast('error', 'Invalid Weights', `Weights sum to ${validation.totalWeight}%, must be 100%.`);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await saveKPIConfig(localKpis);
      await saveAppSettings(localSettings);
      addToast('success', 'Targets & KPIs Saved', 'Changes successfully persisted.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save settings.');
      addToast('error', 'Error Saving', err.message || 'Network error.');
    } finally {
      setIsSaving(false);
    }
  };

  const getKPIIcon = (key: string) => {
    switch (key) {
      case 'revenueGenerated':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'projectClosed':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'upsells':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'clientRating':
        return <Star className="w-4 h-4 text-amber-600" />;
      case 'followupsCompleted':
        return <Users className="w-4 h-4 text-indigo-600" />;
      case 'repeatClients':
        return <Repeat className="w-4 h-4 text-teal-600" />;
      default:
        return <Target className="w-4 h-4 text-[#598327]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e2ebd9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#8cc540]/15 text-[#436320] border border-[#8cc540]/30 shadow-xs">
              <Target className="w-5 h-5 text-[#598327]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#101010] tracking-tight">
              KPI Config & Targets (100%)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0f4ec] text-[#436320] border border-[#8cc540]/40">
              Monthly & Weekly Cadence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5">
            Configure KPI performance targets on a monthly or weekly cadence for IT Team & SMM Team, and maintain 100% weight distribution
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#f8faf6] hover:bg-[#edf3e7] text-[#555555] hover:text-[#101010] border border-[#e2ebd9] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#888888]" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Prominent 100% Weight Indicator & Validation Banner */}
      <div
        className={`p-5 rounded-3xl border-2 transition-all shadow-sm ${
          validation.isValid
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2.5 rounded-2xl border ${
                validation.isValid
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                  : 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              }`}
            >
              {validation.isValid ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black">
                  {validation.isValid
                    ? 'Total KPI Weight: Exactly 100% (Balanced)'
                    : `Total KPI Weight: ${validation.totalWeight}% (Must Equal 100%)`}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    validation.isValid
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white animate-pulse'
                  }`}
                >
                  {validation.isValid ? '✓ Valid' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs mt-0.5 opacity-85 font-medium">
                {validation.isValid
                  ? 'All KPI scores will compute cleanly and reliably across weekly submissions and monthly leaderboards.'
                  : validation.totalWeight > 100
                  ? `Over-allocated by ${validation.totalWeight - 100}%. Please reduce weights in the Weights tab before saving.`
                  : `Under-allocated by ${100 - validation.totalWeight}%. Please allocate the remaining weight in the Weights tab.`}
              </p>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full sm:w-56 space-y-1.5 self-center">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Allocation</span>
              <span className="font-mono">{validation.totalWeight}% / 100%</span>
            </div>
            <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  validation.isValid
                    ? 'bg-emerald-600'
                    : validation.totalWeight > 100
                    ? 'bg-rose-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(validation.totalWeight, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#e2ebd9] rounded-2xl overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('targets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'targets'
              ? 'bg-[#8cc540] text-[#101010] shadow-xs'
              : 'text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] font-bold'
          }`}
        >
          <Target className="w-4 h-4 text-[#598327]" />
          <span>🎯 Monthly & Weekly Targets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-[#8cc540] text-[#101010] shadow-xs'
              : 'text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] font-bold'
          }`}
        >
          <Layers className="w-4 h-4 text-[#598327]" />
          <span>📊 4-Week Target Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'weights'
              ? 'bg-[#8cc540] text-[#101010] shadow-xs'
              : 'text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] font-bold'
          }`}
        >
          <Percent className="w-4 h-4 text-[#598327]" />
          <span>⚖️ KPI Weights ({validation.totalWeight}%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-[#8cc540] text-[#101010] shadow-xs'
              : 'text-[#666666] hover:text-[#101010] hover:bg-[#f0f4ec] font-bold'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#598327]" />
          <span>⚙️ Global Scoring Rules</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: MONTHLY & WEEKLY TARGETS
          ======================================================== */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          {/* Target Cadence & Scope Selector Control Bar */}
          <div className="p-5 rounded-3xl bg-white border border-[#e2ebd9] shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-4">
              {/* Cadence Switcher: Monthly vs Weekly */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Target Cadence:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <button
                    type="button"
                    onClick={() => setTargetCadence('monthly')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetCadence === 'monthly'
                        ? 'bg-white text-[#101010] shadow-2xs font-black border border-[#e2ebd9]'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#598327]" />
                    <span>📅 Monthly Targets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCadence('weekly')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetCadence === 'weekly'
                        ? 'bg-white text-[#101010] shadow-2xs font-black border border-[#e2ebd9]'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#598327]" />
                    <span>⏱️ Weekly Targets</span>
                  </button>
                </div>
              </div>

              {/* Team Division Scope */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#555555] uppercase tracking-wider">
                  Team Scope:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
                  <button
                    type="button"
                    onClick={() => setTargetTeam('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'all'
                        ? 'bg-white text-[#101010] shadow-2xs font-black border border-[#e2ebd9]'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    🌟 All Teams
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetTeam('it')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'it'
                        ? 'bg-blue-50 text-blue-800 shadow-2xs font-black border border-blue-200'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    💻 IT Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetTeam('smm')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'smm'
                        ? 'bg-purple-50 text-purple-800 shadow-2xs font-black border border-purple-200'
                        : 'text-[#666666] hover:text-[#101010]'
                    }`}
                  >
                    📱 SMM Team
                  </button>
                </div>
              </div>
            </div>

            {/* Scope Filter Controls: Month, Year, Week */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
              <div>
                <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                  Target Month
                </label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                >
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                  Target Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {targetCadence === 'weekly' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                    Target Week
                  </label>
                  <select
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(e.target.value)}
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#436320] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                  >
                    <option value="Week 1">Week 1</option>
                    <option value="Week 2">Week 2</option>
                    <option value="Week 3">Week 3</option>
                    <option value="Week 4">Week 4</option>
                    <option value="Week 5">Week 5</option>
                  </select>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-0 sm:col-span-1 lg:col-span-1">
                <button
                  type="button"
                  onClick={handleLoadITPresets}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Load recommended benchmarks for IT Engineers"
                >
                  💻 Load IT Presets
                </button>
                <button
                  type="button"
                  onClick={handleLoadSMMPresets}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                  title="Load recommended benchmarks for SMM Specialists"
                >
                  📱 Load SMM Presets
                </button>
              </div>
            </div>

            {/* Smart Converter Bar */}
            <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2ebd9] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#555555]">
                <Zap className="w-4 h-4 text-[#598327]" />
                <span>
                  Currently Editing:{' '}
                  <strong className="text-[#101010] font-bold">
                    {targetTeam === 'it' ? 'IT Team' : targetTeam === 'smm' ? 'SMM Team' : 'All Teams'} -{' '}
                    {targetCadence === 'monthly'
                      ? `${targetMonth} ${targetYear} (Full Month)`
                      : `${targetMonth} ${targetYear} (${targetWeek})`}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {targetCadence === 'monthly' ? (
                  <button
                    type="button"
                    onClick={handleAutoDivideMonthly}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-white hover:bg-[#f0f4ec] text-[#436320] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                    title="Auto-calculate and set weekly targets = monthly / 4"
                  >
                    <Divide className="w-3.5 h-3.5" />
                    <span>Auto-Divide to 4 Weeks (/4)</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAutoMultiplyWeekly}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-white hover:bg-[#f0f4ec] text-[#436320] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                      title="Auto-calculate and set monthly target = weekly * 4"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Auto-Multiply to Month (*4)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyWeekToAllWeeks}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-white hover:bg-[#f0f4ec] text-[#101010] border border-[#e2ebd9] transition-colors cursor-pointer shadow-2xs"
                      title="Apply this week's target values to Weeks 1-4"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply to All Weeks</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* KPI Target Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localKpis.map((kpi) => {
              const currentVal = getCurrentScopeTarget(kpi);
              const weeklyEst = kpi.isRating ? currentVal : Math.round((currentVal / 4) * 100) / 100;
              const monthlyEst = kpi.isRating ? currentVal : Math.round(currentVal * 4 * 100) / 100;

              return (
                <div
                  key={kpi.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    kpi.active
                      ? 'bg-white border-[#e2ebd9] shadow-sm'
                      : 'bg-[#f8faf6] border-[#e2ebd9] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2ebd9]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#f8faf6] border border-[#e2ebd9]">
                        {getKPIIcon(kpi.key)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#101010] leading-tight">{kpi.name}</h4>
                        <span className="text-[10px] text-[#666666] font-bold">
                          Weight: <span className="text-[#436320] font-black">{kpi.weight}%</span> • Unit: {kpi.unit}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#f8faf6] text-[#555555] border border-[#e2ebd9]">
                      {targetCadence === 'weekly' ? 'Weekly' : 'Monthly'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                        {targetCadence === 'weekly'
                          ? `Target Value for ${targetWeek} (${kpi.unit})`
                          : `Target Value for ${targetMonth} (${kpi.unit})`}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step={kpi.isRating ? '0.1' : 'any'}
                          value={currentVal ?? ''}
                          onChange={(e) => handleScopeTargetChange(kpi.id, Number(e.target.value))}
                          className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-4 py-2.5 text-base font-black text-[#101010] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-mono shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#888888]">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>

                    {/* Prorated Context helper */}
                    <div className="p-2.5 rounded-xl bg-[#f8faf6] border border-[#e2ebd9] text-[11px] text-[#666666] flex items-center justify-between">
                      {targetCadence === 'monthly' ? (
                        <span>
                          Weekly Equiv:{' '}
                          <strong className="text-[#101010] font-bold">
                            {weeklyEst} {kpi.unit}/wk
                          </strong>
                        </span>
                      ) : (
                        <span>
                          Monthly Equiv:{' '}
                          <strong className="text-[#101010] font-bold">
                            {monthlyEst} {kpi.unit}/mo
                          </strong>
                        </span>
                      )}
                      <span className="text-emerald-700 font-bold">Active</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: 4-WEEK TARGET MATRIX
          ======================================================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-[#e2ebd9] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2ebd9] pb-4">
              <div>
                <h3 className="text-base font-black text-[#101010] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#598327]" />
                  <span>Performance Period Target Matrix</span>
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Side-by-side view of Monthly targets alongside Week 1, Week 2, Week 3, and Week 4
                </p>
              </div>

              {/* Matrix Scope Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="bg-[#f8faf6] text-xs font-bold text-[#101010] rounded-xl px-3 py-2 border border-[#e2ebd9] cursor-pointer"
                >
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>

                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="bg-[#f8faf6] text-xs font-bold text-[#101010] rounded-xl px-3 py-2 border border-[#e2ebd9] cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>

                <select
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value as any)}
                  className="bg-[#f8faf6] text-xs font-bold text-[#436320] rounded-xl px-3 py-2 border border-[#8cc540]/40 cursor-pointer"
                >
                  <option value="all">🌟 All Teams</option>
                  <option value="it">💻 IT Team</option>
                  <option value="smm">📱 SMM Team</option>
                </select>
              </div>
            </div>

            {/* Interactive Target Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2ebd9] bg-[#f8faf6] text-[#555555] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">KPI Metric</th>
                    <th className="py-3 px-3">Weight</th>
                    <th className="py-3 px-3">Unit</th>
                    <th className="py-3 px-3 text-[#436320]">Monthly Target</th>
                    <th className="py-3 px-3">Week 1</th>
                    <th className="py-3 px-3">Week 2</th>
                    <th className="py-3 px-3">Week 3</th>
                    <th className="py-3 px-3">Week 4</th>
                    <th className="py-3 px-4 text-emerald-700">4-Wk Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf3e7]">
                  {localKpis.map((kpi) => {
                    const pt = kpi.periodTargets || {};
                    const teamSuffix = targetTeam !== 'all' ? `_${targetTeam}` : '';

                    const monthVal =
                      pt[`month_${targetMonth}_${targetYear}${teamSuffix}`] ??
                      (targetTeam === 'it'
                        ? kpi.itMonthlyTarget ?? kpi.defaultTarget
                        : targetTeam === 'smm'
                        ? kpi.smmMonthlyTarget ?? kpi.defaultTarget
                        : kpi.defaultTarget);

                    const w1 =
                      pt[`week_${targetMonth}_${targetYear}_Week 1${teamSuffix}`] ??
                      (kpi.isRating ? monthVal : Math.round((monthVal / 4) * 100) / 100);

                    const w2 =
                      pt[`week_${targetMonth}_${targetYear}_Week 2${teamSuffix}`] ??
                      (kpi.isRating ? monthVal : Math.round((monthVal / 4) * 100) / 100);

                    const w3 =
                      pt[`week_${targetMonth}_${targetYear}_Week 3${teamSuffix}`] ??
                      (kpi.isRating ? monthVal : Math.round((monthVal / 4) * 100) / 100);

                    const w4 =
                      pt[`week_${targetMonth}_${targetYear}_Week 4${teamSuffix}`] ??
                      (kpi.isRating ? monthVal : Math.round((monthVal / 4) * 100) / 100);

                    const weekSum = kpi.isRating ? (w1 + w2 + w3 + w4) / 4 : w1 + w2 + w3 + w4;

                    return (
                      <tr key={kpi.id} className="hover:bg-[#f8faf6] transition-colors">
                        <td className="py-3 px-4 font-bold text-[#101010] flex items-center gap-2">
                          {getKPIIcon(kpi.key)}
                          <span>{kpi.name}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#436320]">{kpi.weight}%</td>
                        <td className="py-3 px-3 text-[#666666] font-mono font-medium">{kpi.unit}</td>

                        {/* Monthly Target Input */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={monthVal ?? ''}
                            onChange={(e) =>
                              handleMatrixMonthTargetChange(kpi.id, Number(e.target.value))
                            }
                            className="w-24 bg-[#f8faf6] border border-[#8cc540]/50 rounded-lg px-2.5 py-1 text-xs font-bold text-[#101010] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                          />
                        </td>

                        {/* Week 1 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w1 ?? ''}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 1', Number(e.target.value))
                            }
                            className="w-20 bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2 py-1 text-xs font-bold text-[#101010] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                          />
                        </td>

                        {/* Week 2 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w2 ?? ''}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 2', Number(e.target.value))
                            }
                            className="w-20 bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2 py-1 text-xs font-bold text-[#101010] focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                          />
                        </td>

                        {/* Week 3 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w3 ?? ''}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 3', Number(e.target.value))
                            }
                            className="w-20 bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2 py-1 text-xs font-bold text-[#101010] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                          />
                        </td>

                        {/* Week 4 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w4 ?? ''}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 4', Number(e.target.value))
                            }
                            className="w-20 bg-[#f8faf6] border border-[#e2ebd9] rounded-lg px-2 py-1 text-xs font-bold text-[#101010] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8cc540]"
                          />
                        </td>

                        {/* Total 4-Wk Sum */}
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {kpi.isRating ? weekSum.toFixed(1) : weekSum.toLocaleString()}{' '}
                          <span className="text-[10px] text-[#888888]">{kpi.unit}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: KPI WEIGHTS & ORDER (100% Distribution)
          ======================================================== */}
      {activeTab === 'weights' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e2ebd9] bg-white p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e2ebd9] pb-3">
              <h3 className="text-sm font-black text-[#101010] uppercase tracking-wider">
                KPI Weight Breakdown (Must Total Exactly 100%)
              </h3>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  validation.isValid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                Current Total: {validation.totalWeight}%
              </span>
            </div>

            <div className="space-y-3">
              {localKpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    kpi.active
                      ? 'bg-[#f8faf6] border-[#e2ebd9]'
                      : 'bg-[#f8faf6]/50 border-[#e2ebd9] opacity-60'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* KPI Name */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                        KPI Name
                      </label>
                      <input
                        type="text"
                        value={kpi.name || ''}
                        onChange={(e) => handleNameChange(kpi.id, e.target.value)}
                        className="w-full bg-white border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#101010] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                      />
                    </div>

                    {/* Weight % */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                        Weight (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={kpi.weight ?? ''}
                          onChange={(e) => handleWeightChange(kpi.id, Number(e.target.value))}
                          className="w-full bg-white border border-[#e2ebd9] rounded-xl pl-3 pr-7 py-2 text-xs font-black text-[#436320] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 font-mono"
                        />
                        <Percent className="w-3.5 h-3.5 text-[#888888] absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-[#555555] uppercase mb-1">
                        Measurement Unit
                      </label>
                      <input
                        type="text"
                        value={kpi.unit || ''}
                        onChange={(e) =>
                          setLocalKpis((prev) =>
                            prev.map((k) => (k.id === kpi.id ? { ...k, unit: e.target.value } : k))
                          )
                        }
                        className="w-full bg-white border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(kpi.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          kpi.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                        }`}
                        title={kpi.active ? 'Disable KPI' : 'Enable KPI'}
                      >
                        {kpi.active ? 'Active' : 'Off'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: GLOBAL SCORING RULES
          ======================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e2ebd9] bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-[#101010] uppercase tracking-wider border-b border-[#e2ebd9] pb-3">
              Global Scoring & Display Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                  Currency Symbol
                </label>
                <select
                  value={localSettings.currencySymbol}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      currencySymbol: e.target.value,
                      currency: e.target.value === '$' ? 'USD' : e.target.value === '€' ? 'EUR' : 'INR',
                    })
                  }
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="AED">AED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                  Score Display Decimals
                </label>
                <select
                  value={localSettings.scoreDecimalPlaces}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      scoreDecimalPlaces: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs text-[#101010] font-medium focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40 cursor-pointer"
                >
                  <option value={2}>2 Decimal Places (Standard, e.g. 68.02)</option>
                  <option value={1}>1 Decimal Place (e.g. 68.0)</option>
                  <option value={0}>0 Decimal Places (Rounded Integer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-1.5">
                  Max Achievement Cap (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={localSettings.achievementCap ?? ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      achievementCap: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#101010] font-mono focus:outline-none focus:ring-2 focus:ring-[#8cc540]/40"
                />
                <span className="text-[10px] text-[#888888] font-medium mt-1 block">
                  Standard cap is 100% to prevent over-weighting
                </span>
              </div>
            </div>

            {/* Performance Bands Thresholds */}
            <div className="pt-4 border-t border-[#e2ebd9]">
              <h4 className="text-xs font-black text-[#101010] uppercase tracking-wider mb-3">
                Performance Rating Bands (Score Cutoffs)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">
                    Excellent Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.excellenceThreshold ?? ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        excellenceThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                    Very Good Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.veryGoodThreshold ?? ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        veryGoodThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-blue-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-700 uppercase mb-1">
                    Good Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.goodThreshold ?? ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        goodThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-3 py-2 text-xs font-bold text-amber-700 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Save Button Sticky Bottom Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2ebd9] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-30 backdrop-blur-md">
        <div className="text-xs text-[#666666] font-medium text-center sm:text-left">
          {validation.isValid ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Weight configuration balanced at 100%. Ready to save.
            </span>
          ) : (
            <span className="text-rose-700 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Weight total is {validation.totalWeight}%. Adjust weights in the Weights tab to equal 100%.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
            validation.isValid && !isSaving
              ? 'bg-[#8cc540] hover:bg-[#7db734] text-[#101010] shadow-[#8cc540]/25 transform hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Target & KPI Changes'}</span>
        </button>
      </div>
    </div>
  );
};
