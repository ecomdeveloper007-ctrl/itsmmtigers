import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Save,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  Percent,
  Target,
  RefreshCw,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Star,
  Users,
  Repeat,
  Copy,
  Divide,
  Calculator,
} from 'lucide-react';
import { KPIConfig, AppSettings, PerformancePeriod } from '../../types';
import {
  validateKPIWeights,
  DEFAULT_KPIS,
  DEFAULT_SETTINGS,
  getEffectiveKPITarget,
  sanitizeNumber,
} from '../../services/calculationService';

type SettingsTab = 'targets' | 'matrix' | 'weights' | 'rules';
type TargetCadence = 'monthly' | 'weekly';
type TargetTeamScope = 'all' | 'it' | 'smm';

export const KPISettings: React.FC = () => {
  const {
    kpis,
    settings,
    periods,
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
  const [targetMonth, setTargetMonth] = useState<string>(selectedMonth || 'August');
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

          // If updating default/all team
          if (targetTeam === 'all') {
            return {
              ...kpi,
              weeklyTarget: cleanVal,
              periodTargets: currentPT,
            };
          } else if (targetTeam === 'it') {
            return {
              ...kpi,
              itWeeklyTarget: cleanVal,
              periodTargets: currentPT,
            };
          } else {
            return {
              ...kpi,
              smmWeeklyTarget: cleanVal,
              periodTargets: currentPT,
            };
          }
        } else {
          // Monthly
          const specificMonthKey = `month_${targetMonth}_${targetYear}${teamSuffix}`;
          currentPT[specificMonthKey] = cleanVal;

          if (targetTeam === 'all') {
            return {
              ...kpi,
              defaultTarget: cleanVal,
              periodTargets: currentPT,
            };
          } else if (targetTeam === 'it') {
            return {
              ...kpi,
              itMonthlyTarget: cleanVal,
              periodTargets: currentPT,
            };
          } else {
            return {
              ...kpi,
              smmMonthlyTarget: cleanVal,
              periodTargets: currentPT,
            };
          }
        }
      })
    );
  };

  // Quick Action: Auto-divide monthly target by 4 to set weekly targets
  const handleAutoDivideMonthly = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const monthly = getCurrentScopeTarget({ ...kpi, defaultTarget: kpi.defaultTarget });
        const weekly = kpi.isRating ? monthly : Math.round((monthly / 4) * 100) / 100;
        const currentPT = { ...(kpi.periodTargets || {}) };

        ['Week 1', 'Week 2', 'Week 3', 'Week 4'].forEach((w) => {
          const key = `week_${targetMonth}_${targetYear}_${w}${targetTeam !== 'all' ? `_${targetTeam}` : ''}`;
          currentPT[key] = weekly;
        });

        if (targetTeam === 'it') {
          return { ...kpi, itWeeklyTarget: weekly, periodTargets: currentPT };
        } else if (targetTeam === 'smm') {
          return { ...kpi, smmWeeklyTarget: weekly, periodTargets: currentPT };
        } else {
          return { ...kpi, weeklyTarget: weekly, periodTargets: currentPT };
        }
      })
    );
    addToast('info', 'Weekly Targets Calculated', `Divided monthly targets by 4 for ${targetMonth} ${targetYear}`);
  };

  // Quick Action: Auto-multiply weekly target by 4 to set monthly targets
  const handleAutoMultiplyWeekly = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const weekly = getCurrentScopeTarget(kpi);
        const monthly = kpi.isRating ? weekly : Math.round(weekly * 4 * 100) / 100;
        const currentPT = { ...(kpi.periodTargets || {}) };
        const key = `month_${targetMonth}_${targetYear}${targetTeam !== 'all' ? `_${targetTeam}` : ''}`;
        currentPT[key] = monthly;

        if (targetTeam === 'it') {
          return { ...kpi, itMonthlyTarget: monthly, periodTargets: currentPT };
        } else if (targetTeam === 'smm') {
          return { ...kpi, smmMonthlyTarget: monthly, periodTargets: currentPT };
        } else {
          return { ...kpi, defaultTarget: monthly, periodTargets: currentPT };
        }
      })
    );
    addToast('info', 'Monthly Target Calculated', `Multiplied weekly targets by 4 for ${targetMonth} ${targetYear}`);
  };

  // Quick Action: Apply selected week's target to all 4 weeks of the month
  const handleApplyWeekToAllWeeks = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const currentVal = getCurrentScopeTarget(kpi);
        const currentPT = { ...(kpi.periodTargets || {}) };

        ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].forEach((w) => {
          const key = `week_${targetMonth}_${targetYear}_${w}${targetTeam !== 'all' ? `_${targetTeam}` : ''}`;
          currentPT[key] = currentVal;
        });

        return { ...kpi, periodTargets: currentPT };
      })
    );
    addToast('success', 'Targets Copied', `Applied ${targetWeek} targets across all weeks of ${targetMonth} ${targetYear}`);
  };

  // Load IT Division Preset Benchmark Targets
  const handleLoadITPresets = () => {
    setLocalKpis((prev) =>
      prev.map((kpi) => {
        const currentPT = { ...(kpi.periodTargets || {}) };
        let itMonthly = 15;
        let itWeekly = 3.75;

        if (kpi.key === 'revenueGenerated') {
          itMonthly = 12000;
          itWeekly = 3000;
        } else if (kpi.key === 'projectClosed') {
          itMonthly = 15;
          itWeekly = 3.75;
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
        if (targetTeam === 'all') {
          return { ...kpi, defaultTarget: cleanVal, periodTargets: pt };
        } else if (targetTeam === 'it') {
          return { ...kpi, itMonthlyTarget: cleanVal, periodTargets: pt };
        } else {
          return { ...kpi, smmMonthlyTarget: cleanVal, periodTargets: pt };
        }
      })
    );
  };

  // KPI Weight change
  const handleWeightChange = (id: string, newWeight: number) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, weight: Math.max(0, newWeight) } : k))
    );
    setErrorMessage(null);
  };

  const handleNameChange = (id: string, newName: string) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, name: newName } : k))
    );
  };

  const handleToggleActive = (id: string) => {
    setLocalKpis((prev) =>
      prev.map((k) => (k.id === id ? { ...k, active: !k.active } : k))
    );
    setErrorMessage(null);
  };

  const handleResetDefaults = () => {
    setLocalKpis(DEFAULT_KPIS);
    setLocalSettings(DEFAULT_SETTINGS);
    setErrorMessage(null);
    addToast('info', 'Reset to Standard Defaults', 'Click "Save All Changes" to commit.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const val = validateKPIWeights(localKpis);
    if (!val.isValid) {
      setErrorMessage('Total KPI weight must equal exactly 100%.');
      addToast('error', 'Validation Error', 'Total KPI weight must equal 100%.');
      return;
    }

    setIsSaving(true);
    const kpiRes = await saveKPIConfig(localKpis);
    if (!kpiRes.success) {
      setErrorMessage(kpiRes.message || 'Failed to save KPI targets and weights.');
      setIsSaving(false);
      return;
    }

    await saveAppSettings(localSettings);
    setIsSaving(false);
    addToast('success', 'Targets & Settings Saved', 'All monthly/weekly targets and weights are synced in real time.');
  };

  // Helper icons for KPIs
  const getKPIIcon = (key: string) => {
    switch (key) {
      case 'revenueGenerated':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'projectClosed':
        return <Briefcase className="w-4 h-4 text-orange-400" />;
      case 'upsells':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'clientRating':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'followupsCompleted':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'repeatClients':
        return <Repeat className="w-4 h-4 text-teal-400" />;
      default:
        return <Target className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/95 p-5 rounded-3xl border border-slate-750 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Super Admin KPI & Target Management
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/25 text-amber-200 border border-amber-400/50">
                  Monthly / Weekly Cadence
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Update performance targets on monthly or weekly basis for IT Team & SMM Team with automated leaderboards
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/95 border border-slate-750 rounded-2xl overflow-x-auto shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab('targets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'targets'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 font-bold'
          }`}
        >
          <Target className="w-4 h-4" />
          🎯 Monthly & Weekly Targets
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 font-bold'
          }`}
        >
          <Layers className="w-4 h-4" />
          📊 4-Week Target Matrix
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'weights'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 font-bold'
          }`}
        >
          <Percent className="w-4 h-4" />
          ⚖️ KPI Weights ({validation.totalWeight}%)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 font-bold'
          }`}
        >
          <Sliders className="w-4 h-4" />
          ⚙️ Global Scoring Rules
        </button>
      </div>

      {/* Real-time Weight Total Status Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
          validation.isValid
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100 shadow-md'
            : 'bg-rose-950/60 border-rose-500/60 text-rose-100 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold block text-white">
              Total KPI Weight Distribution: <strong className="text-emerald-300 font-mono text-sm">{validation.totalWeight}%</strong> / 100%
            </span>
            <span className="text-[11px] text-slate-200">
              {validation.isValid
                ? 'Valid distribution. All KPI scores will compute cleanly.'
                : 'Warning: Total KPI weight must equal 100% before you can save.'}
            </span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            validation.isValid ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'
          }`}
        >
          {validation.isValid ? '✓ Valid (100%)' : `≠ ${validation.totalWeight}%`}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: MONTHLY & WEEKLY TARGETS */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          {/* Target Cadence & Scope Selector Control Bar */}
          <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-750 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-750 pb-4">
              {/* Cadence Switcher: Monthly vs Weekly */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Target Cadence:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTargetCadence('monthly')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetCadence === 'monthly'
                        ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    📅 Monthly Targets
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCadence('weekly')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetCadence === 'weekly'
                        ? 'bg-orange-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    ⏱️ Weekly Targets
                  </button>
                </div>
              </div>

              {/* Team Division Scope */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Team Scope:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTargetTeam('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🌟 All Teams
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetTeam('it')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'it'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    💻 IT Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetTeam('smm')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetTeam === 'smm'
                        ? 'bg-pink-500 text-slate-950 shadow-sm font-black'
                        : 'text-slate-300 hover:text-white'
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
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Target Month
                </label>
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="August" className="bg-slate-900 text-white">August</option>
                  <option value="September" className="bg-slate-900 text-white">September</option>
                  <option value="October" className="bg-slate-900 text-white">October</option>
                  <option value="November" className="bg-slate-900 text-white">November</option>
                  <option value="December" className="bg-slate-900 text-white">December</option>
                  <option value="January" className="bg-slate-900 text-white">January</option>
                  <option value="February" className="bg-slate-900 text-white">February</option>
                  <option value="March" className="bg-slate-900 text-white">March</option>
                  <option value="April" className="bg-slate-900 text-white">April</option>
                  <option value="May" className="bg-slate-900 text-white">May</option>
                  <option value="June" className="bg-slate-900 text-white">June</option>
                  <option value="July" className="bg-slate-900 text-white">July</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                  Target Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value={2026} className="bg-slate-900 text-white">2026</option>
                  <option value={2025} className="bg-slate-900 text-white">2025</option>
                  <option value={2027} className="bg-slate-900 text-white">2027</option>
                </select>
              </div>

              {targetCadence === 'weekly' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                    Target Week
                  </label>
                  <select
                    value={targetWeek}
                    onChange={(e) => setTargetWeek(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="Week 1" className="bg-slate-900 text-white">Week 1</option>
                    <option value="Week 2" className="bg-slate-900 text-white">Week 2</option>
                    <option value="Week 3" className="bg-slate-900 text-white">Week 3</option>
                    <option value="Week 4" className="bg-slate-900 text-white">Week 4</option>
                    <option value="Week 5" className="bg-slate-900 text-white">Week 5</option>
                  </select>
                </div>
              )}

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-0 sm:col-span-1 lg:col-span-1">
                <button
                  type="button"
                  onClick={handleLoadITPresets}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-cyan-950 text-cyan-200 border border-cyan-700 hover:bg-cyan-900 transition-colors cursor-pointer"
                  title="Load recommended benchmarks for IT Engineers"
                >
                  💻 Load IT Presets
                </button>
                <button
                  type="button"
                  onClick={handleLoadSMMPresets}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-pink-950 text-pink-200 border border-pink-700 hover:bg-pink-900 transition-colors cursor-pointer"
                  title="Load recommended benchmarks for SMM Specialists"
                >
                  📱 Load SMM Presets
                </button>
              </div>
            </div>

            {/* Smart Converter Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  Currently Editing:{' '}
                  <strong className="text-white font-bold">
                    {targetTeam === 'it' ? 'IT Team' : targetTeam === 'smm' ? 'SMM Team' : 'All Teams'} -{' '}
                    {targetCadence === 'monthly' ? `${targetMonth} ${targetYear} (Full Month)` : `${targetMonth} ${targetYear} (${targetWeek})`}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {targetCadence === 'monthly' ? (
                  <button
                    type="button"
                    onClick={handleAutoDivideMonthly}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-600 transition-colors cursor-pointer"
                    title="Auto-calculate and set weekly targets = monthly / 4"
                  >
                    <Divide className="w-3.5 h-3.5" />
                    Auto-Divide to 4 Weeks (/4)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAutoMultiplyWeekly}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-600 transition-colors cursor-pointer"
                      title="Auto-calculate and set monthly target = weekly * 4"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Auto-Multiply to Month (*4)
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyWeekToAllWeeks}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-600 transition-colors cursor-pointer"
                      title="Apply this week's target values to Weeks 1-4"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Apply to All Weeks
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
                      ? 'bg-slate-900/95 border-slate-750 shadow-xl'
                      : 'bg-slate-900/40 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-750">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-700">
                        {getKPIIcon(kpi.key)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{kpi.name}</h4>
                        <span className="text-[10px] text-slate-300 font-bold">
                          Weight: <span className="text-amber-300">{kpi.weight}%</span> • Unit: {kpi.unit}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-950 text-slate-200 border border-slate-700">
                      {targetCadence === 'weekly' ? 'Weekly Target' : 'Monthly Target'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        {targetCadence === 'weekly'
                          ? `Target Value for ${targetWeek} (${kpi.unit})`
                          : `Target Value for ${targetMonth} (${kpi.unit})`}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step={kpi.isRating ? '0.1' : 'any'}
                          value={currentVal}
                          onChange={(e) => handleScopeTargetChange(kpi.id, Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-black text-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono shadow-inner"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {kpi.unit}
                        </span>
                      </div>
                    </div>

                    {/* Prorated Context helper */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
                      {targetCadence === 'monthly' ? (
                        <span>
                          Weekly Equivalent:{' '}
                          <strong className="text-white font-bold">
                            {weeklyEst} {kpi.unit}/wk
                          </strong>
                        </span>
                      ) : (
                        <span>
                          Monthly Equivalent:{' '}
                          <strong className="text-white font-bold">
                            {monthlyEst} {kpi.unit}/mo
                          </strong>
                        </span>
                      )}
                      <span className="text-emerald-300 font-bold">Active in scoring</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 4-WEEK TARGET MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900/95 border border-slate-750 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-750 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-400" />
                  Performance Period Target Matrix
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Side-by-side view of Monthly targets alongside Week 1, Week 2, Week 3, and Week 4
                </p>
              </div>

              {/* Matrix Scope Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="bg-slate-950 text-xs font-bold text-white rounded-xl px-3 py-2 border border-slate-700 cursor-pointer"
                >
                  <option value="August" className="bg-slate-900 text-white">August</option>
                  <option value="September" className="bg-slate-900 text-white">September</option>
                  <option value="October" className="bg-slate-900 text-white">October</option>
                  <option value="November" className="bg-slate-900 text-white">November</option>
                  <option value="December" className="bg-slate-900 text-white">December</option>
                </select>

                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="bg-slate-950 text-xs font-bold text-white rounded-xl px-3 py-2 border border-slate-700 cursor-pointer"
                >
                  <option value={2026} className="bg-slate-900 text-white">2026</option>
                  <option value={2025} className="bg-slate-900 text-white">2025</option>
                </select>

                <select
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value as any)}
                  className="bg-slate-950 text-xs font-bold text-orange-300 rounded-xl px-3 py-2 border border-orange-500/50 cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-white">🌟 All Teams</option>
                  <option value="it" className="bg-slate-900 text-white">💻 IT Team</option>
                  <option value="smm" className="bg-slate-900 text-white">📱 SMM Team</option>
                </select>
              </div>
            </div>

            {/* Interactive Target Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 bg-slate-950 text-slate-300 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">KPI Metric</th>
                    <th className="py-3 px-3">Weight</th>
                    <th className="py-3 px-3">Unit</th>
                    <th className="py-3 px-3 text-orange-300">Monthly Target</th>
                    <th className="py-3 px-3">Week 1</th>
                    <th className="py-3 px-3">Week 2</th>
                    <th className="py-3 px-3">Week 3</th>
                    <th className="py-3 px-3">Week 4</th>
                    <th className="py-3 px-4 text-emerald-300">4-Wk Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
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
                      <tr key={kpi.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                          {getKPIIcon(kpi.key)}
                          <span className="text-white">{kpi.name}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-300">{kpi.weight}%</td>
                        <td className="py-3 px-3 text-slate-300 font-mono font-medium">{kpi.unit}</td>

                        {/* Monthly Target Input */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={monthVal}
                            onChange={(e) =>
                              handleMatrixMonthTargetChange(kpi.id, Number(e.target.value))
                            }
                            className="w-24 bg-slate-950 border border-orange-500/50 rounded-lg px-2.5 py-1 text-xs font-bold text-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </td>

                        {/* Week 1 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w1}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 1', Number(e.target.value))
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </td>

                        {/* Week 2 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w2}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 2', Number(e.target.value))
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </td>

                        {/* Week 3 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w3}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 3', Number(e.target.value))
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </td>

                        {/* Week 4 */}
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={w4}
                            onChange={(e) =>
                              handleMatrixWeekTargetChange(kpi.id, 'Week 4', Number(e.target.value))
                            }
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </td>

                        {/* Total 4-Wk Sum */}
                        <td className="py-3 px-4 font-mono font-bold text-emerald-300">
                          {kpi.isRating ? weekSum.toFixed(1) : weekSum.toLocaleString()}{' '}
                          <span className="text-[10px] text-slate-400">{kpi.unit}</span>
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

      {/* TAB 3: KPI WEIGHTS & ORDER (100% Distribution) */}
      {activeTab === 'weights' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-750 bg-slate-900/95 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-750 pb-3">
              KPI Weight Breakdown (Must Total Exactly 100%)
            </h3>

            <div className="space-y-3">
              {localKpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    kpi.active
                      ? 'bg-slate-950 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* KPI Name */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                        KPI Name
                      </label>
                      <input
                        type="text"
                        value={kpi.name}
                        onChange={(e) => handleNameChange(kpi.id, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Weight % */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                        Weight (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={kpi.weight}
                          onChange={(e) => handleWeightChange(kpi.id, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-7 py-2 text-xs font-black text-amber-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                        <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                        Measurement Unit
                      </label>
                      <input
                        type="text"
                        value={kpi.unit}
                        onChange={(e) =>
                          setLocalKpis((prev) =>
                            prev.map((k) => (k.id === kpi.id ? { ...k, unit: e.target.value } : k))
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(kpi.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          kpi.active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
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

      {/* TAB 4: GLOBAL SCORING RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-750 bg-slate-900/95 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-750 pb-3">
              Global Scoring & Display Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="$" className="bg-slate-900 text-white">USD ($)</option>
                  <option value="€" className="bg-slate-900 text-white">EUR (€)</option>
                  <option value="£" className="bg-slate-900 text-white">GBP (£)</option>
                  <option value="₹" className="bg-slate-900 text-white">INR (₹)</option>
                  <option value="AED" className="bg-slate-900 text-white">AED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                >
                  <option value={2} className="bg-slate-900 text-white">2 Decimal Places (Standard, e.g. 68.02)</option>
                  <option value={1} className="bg-slate-900 text-white">1 Decimal Place (e.g. 68.0)</option>
                  <option value={0} className="bg-slate-900 text-white">0 Decimal Places (Rounded Integer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Max Achievement Cap (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={localSettings.achievementCap}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      achievementCap: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-300 font-medium mt-1 block">
                  Standard cap is 100% to prevent over-weighting
                </span>
              </div>
            </div>

            {/* Performance Bands Thresholds */}
            <div className="pt-4 border-t border-slate-750">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                Performance Rating Bands (Score Cutoffs)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase mb-1">
                    Excellent Cutoff (PTS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.excellenceThreshold}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        excellenceThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-300 uppercase mb-1">
                    Very Good Cutoff (PTS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.veryGoodThreshold}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        veryGoodThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-blue-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-300 uppercase mb-1">
                    Good Cutoff (PTS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.goodThreshold}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        goodThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Save Button Fixed / Bottom Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-750 shadow-2xl flex items-center justify-between sticky bottom-4 z-30 backdrop-blur-md">
        <div className="text-xs text-slate-300 font-medium">
          Super Admin Root: Updates persist directly to Firestore database & reflect in all member leaderboards.
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
            validation.isValid && !isSaving
              ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/30'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes to Firestore...' : 'Save All Target & KPI Changes'}
        </button>
      </div>
    </div>
  );
};
