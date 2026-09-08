import {
  SalesProfileCode,
  SalesDepartment,
  SalesProfileTargetConfig,
  SalesRewardSettings,
  SalesPerformanceRecord,
  SalesLeaderboardItem,
  SalesEmployee,
  SalesDepartmentSummary,
  SalesProfileSummary,
  SalesDashboardSummary,
  SalesEmployeeHistoryComparison,
  SalesMonthlyAggregation,
} from '../types/sales';

/**
 * Default configurable reward slabs per profile (INR Currency)
 */
export const DEFAULT_REWARD_SLABS = [
  { id: 'slab_plat', level: 'Platinum', minScore: 90, maxScore: 100, rewardAmount: 5000, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'slab_gold', level: 'Gold', minScore: 80, maxScore: 89.99, rewardAmount: 3500, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'slab_silver', level: 'Silver', minScore: 70, maxScore: 79.99, rewardAmount: 2000, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  { id: 'slab_bronze', level: 'Bronze', minScore: 60, maxScore: 69.99, rewardAmount: 1000, color: 'text-amber-800 bg-amber-100/60 border-amber-300' },
  { id: 'slab_none', level: 'No Reward', minScore: 0, maxScore: 59.99, rewardAmount: 0, color: 'text-gray-500 bg-gray-50 border-gray-200' },
];

/**
 * Default Profile-Specific Targets and 100% Weight Distribution:
 * - Conversion Rate: 50%
 * - Follow-ups: 20%
 * - Order Value: 30%
 * - Reachouts: 0% (Used only for Conversion Rate & Activity Reporting, NEVER for score)
 */
export const DEFAULT_SALES_SETTINGS: SalesRewardSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  profiles: {
    PR: {
      profileCode: 'PR',
      profileName: 'PR Profile (IT Solutions & Product Delivery)',
      department: 'IT',
      conversionTarget: 10.0, // 10%
      followupTarget: 100, // 100 followups/week
      orderValueTarget: 100000, // ₹1,00,000 / week
      reachoutBenchmark: 200, // 200 reachouts (Activity only, 0% weight)
      conversionWeight: 50, // 50%
      followupWeight: 20, // 20%
      orderValueWeight: 30, // 30%
      reachoutWeight: 0, // 0%
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    WR: {
      profileCode: 'WR',
      profileName: 'WR Profile (IT Web Architecture & Eng)',
      department: 'IT',
      conversionTarget: 8.0, // 8%
      followupTarget: 80, // 80 followups/week
      orderValueTarget: 80000, // ₹80,000 / week
      reachoutBenchmark: 150, // 150 reachouts (Activity only, 0% weight)
      conversionWeight: 50,
      followupWeight: 20,
      orderValueWeight: 30,
      reachoutWeight: 0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    HW: {
      profileCode: 'HW',
      profileName: 'HW Profile (IT Cloud & Infrastructure)',
      department: 'IT',
      conversionTarget: 6.0, // 6%
      followupTarget: 60, // 60 followups/week
      orderValueTarget: 120000, // ₹1,20,000 / week
      reachoutBenchmark: 120, // 120 reachouts (Activity only, 0% weight)
      conversionWeight: 50,
      followupWeight: 20,
      orderValueWeight: 30,
      reachoutWeight: 0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    DR: {
      profileCode: 'DR',
      profileName: 'DR Profile (SMM Direct Response & Conversions)',
      department: 'SMM',
      conversionTarget: 12.0, // 12%
      followupTarget: 120, // 120 followups/week
      orderValueTarget: 75000, // ₹75,000 / week
      reachoutBenchmark: 250, // 250 reachouts (Activity only, 0% weight)
      conversionWeight: 50,
      followupWeight: 20,
      orderValueWeight: 30,
      reachoutWeight: 0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    RR: {
      profileCode: 'RR',
      profileName: 'RR Profile (SMM Retainers & Growth)',
      department: 'SMM',
      conversionTarget: 15.0, // 15%
      followupTarget: 90, // 90 followups/week
      orderValueTarget: 150000, // ₹1,50,000 / week
      reachoutBenchmark: 180, // 180 reachouts (Activity only, 0% weight)
      conversionWeight: 50,
      followupWeight: 20,
      orderValueWeight: 30,
      reachoutWeight: 0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
  },
};

/**
 * Safely parse any number input, defaulting to 0 for NaN/undefined/negative
 */
export function sanitizeSalesNumber(value: any, allowNegative: boolean = false): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num) || !isFinite(num)) return 0;
  return allowNegative ? num : Math.max(0, num);
}

/**
 * Format currency in INR (₹)
 */
export function formatINR(amount: number): string {
  const safe = sanitizeSalesNumber(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

/**
 * 1. Get profile target and weighting settings
 */
export function getProfileSettings(
  settings: SalesRewardSettings | undefined,
  profileCode: SalesProfileCode,
  context?: {
    month?: string;
    year?: number;
    week?: string;
    isWeekly?: boolean;
  }
): SalesProfileTargetConfig {
  const safeSettings = settings || DEFAULT_SALES_SETTINGS;
  const config = safeSettings.profiles?.[profileCode] || DEFAULT_SALES_SETTINGS.profiles[profileCode] || DEFAULT_SALES_SETTINGS.profiles.PR;

  let conversionTarget = config.conversionTarget || (config.orderConvertTarget ? 10 : 10);
  let followupTarget = config.followupTarget || 100;
  let orderValueTarget = config.orderValueTarget || 100000;
  let reachoutBenchmark = config.reachoutBenchmark || config.reachoutTarget || 200;

  // Check periodTargets if context is provided
  if (context?.month && context?.year) {
    const pt = config.periodTargets || safeSettings.periodTargets || {};
    const isWeekly = context.isWeekly || (context.week && context.week !== 'all');
    if (isWeekly && context.week) {
      const weekKeyWithProfile = `week_${context.month}_${context.year}_${context.week}_${profileCode}`;
      const weekKey = `week_${context.month}_${context.year}_${context.week}`;
      const targetObj = pt[weekKeyWithProfile] || pt[weekKey];
      if (targetObj) {
        if (targetObj.conversionTarget !== undefined && targetObj.conversionTarget > 0) conversionTarget = targetObj.conversionTarget;
        if (targetObj.followupTarget !== undefined && targetObj.followupTarget > 0) followupTarget = targetObj.followupTarget;
        if (targetObj.orderValueTarget !== undefined && targetObj.orderValueTarget > 0) orderValueTarget = targetObj.orderValueTarget;
        if (targetObj.reachoutBenchmark !== undefined && targetObj.reachoutBenchmark > 0) reachoutBenchmark = targetObj.reachoutBenchmark;
      } else if (config.weeklyFollowupTarget !== undefined && config.weeklyFollowupTarget > 0) {
        followupTarget = config.weeklyFollowupTarget;
        if (config.weeklyOrderValueTarget) orderValueTarget = config.weeklyOrderValueTarget;
        if (config.weeklyReachoutBenchmark) reachoutBenchmark = config.weeklyReachoutBenchmark;
        if (config.weeklyConversionTarget) conversionTarget = config.weeklyConversionTarget;
      }
    } else {
      const monthKeyWithProfile = `month_${context.month}_${context.year}_${profileCode}`;
      const monthKey = `month_${context.month}_${context.year}`;
      const targetObj = pt[monthKeyWithProfile] || pt[monthKey];
      if (targetObj) {
        if (targetObj.conversionTarget !== undefined && targetObj.conversionTarget > 0) conversionTarget = targetObj.conversionTarget;
        if (targetObj.followupTarget !== undefined && targetObj.followupTarget > 0) followupTarget = targetObj.followupTarget;
        if (targetObj.orderValueTarget !== undefined && targetObj.orderValueTarget > 0) orderValueTarget = targetObj.orderValueTarget;
        if (targetObj.reachoutBenchmark !== undefined && targetObj.reachoutBenchmark > 0) reachoutBenchmark = targetObj.reachoutBenchmark;
      }
    }
  }

  return {
    ...config,
    conversionWeight: config.conversionWeight ?? 50,
    followupWeight: config.followupWeight ?? 20,
    orderValueWeight: config.orderValueWeight ?? 30,
    reachoutWeight: 0,
    conversionTarget,
    followupTarget,
    orderValueTarget,
    reachoutBenchmark,
    weeklyConversionTarget: config.weeklyConversionTarget ?? conversionTarget,
    weeklyFollowupTarget: config.weeklyFollowupTarget ?? followupTarget,
    weeklyOrderValueTarget: config.weeklyOrderValueTarget ?? orderValueTarget,
    weeklyReachoutBenchmark: config.weeklyReachoutBenchmark ?? reachoutBenchmark,
    monthlyConversionTarget: config.monthlyConversionTarget ?? conversionTarget,
    monthlyFollowupTarget: config.monthlyFollowupTarget ?? followupTarget * 4,
    monthlyOrderValueTarget: config.monthlyOrderValueTarget ?? orderValueTarget * 4,
    monthlyReachoutBenchmark: config.monthlyReachoutBenchmark ?? reachoutBenchmark * 4,
  };
}

/**
 * 2. Calculate conversion rate safely: (Conversions / Reachouts) * 100
 */
export function calculateConversionRate(conversions: number, reachouts: number): number {
  const safeConversions = sanitizeSalesNumber(conversions);
  const safeReachouts = sanitizeSalesNumber(reachouts);

  if (safeReachouts <= 0) return 0;
  const rate = (safeConversions / safeReachouts) * 100;
  if (isNaN(rate) || !isFinite(rate)) return 0;
  return Number(rate.toFixed(2));
}

/**
 * 3. Calculate single metric score: MIN(Actual / Target, 1) * Weight
 */
export function calculateMetricScore(actual: number, target: number, weight: number): number {
  const safeActual = sanitizeSalesNumber(actual);
  const safeTarget = sanitizeSalesNumber(target);
  const safeWeight = sanitizeSalesNumber(weight);

  if (safeTarget <= 0 || safeWeight <= 0) return 0;
  const achievementRatio = Math.min(safeActual / safeTarget, 1.0);
  const points = achievementRatio * safeWeight;
  return Number(points.toFixed(2));
}

/**
 * 4. Calculate total 100-point sales performance score:
 * - Conversion Rate Score (50%)
 * - Follow-up Score (20%)
 * - Order Value Score (30%)
 * - Reachout Score = 0% (NO Reachout Score)
 */
export function calculateSalesPerformanceScore(
  inputs: {
    reachouts: number;
    conversions: number;
    followups: number;
    orderValue: number;
  },
  config: SalesProfileTargetConfig
): {
  conversionRate: number;
  conversionScore: number;
  followupScore: number;
  orderValueScore: number;
  totalPerformanceScore: number;
  conversionAchievementPct: number;
  followupAchievementPct: number;
  orderValueAchievementPct: number;
  reachoutBenchmarkPct: number;
} {
  const conversionRate = calculateConversionRate(inputs.conversions, inputs.reachouts);

  const conversionTarget = config.conversionTarget || 10;
  const followupTarget = config.followupTarget || 100;
  const orderValueTarget = config.orderValueTarget || 100000;
  const reachoutBenchmark = config.reachoutBenchmark || 200;

  const conversionWeight = config.conversionWeight ?? 50;
  const followupWeight = config.followupWeight ?? 20;
  const orderValueWeight = config.orderValueWeight ?? 30;

  const conversionScore = calculateMetricScore(conversionRate, conversionTarget, conversionWeight);
  const followupScore = calculateMetricScore(inputs.followups, followupTarget, followupWeight);
  const orderValueScore = calculateMetricScore(inputs.orderValue, orderValueTarget, orderValueWeight);

  const rawTotal = conversionScore + followupScore + orderValueScore;
  const totalPerformanceScore = Math.min(100, Number(rawTotal.toFixed(2)));

  const conversionAchievementPct = conversionTarget > 0 ? Number(((conversionRate / conversionTarget) * 100).toFixed(1)) : 0;
  const followupAchievementPct = followupTarget > 0 ? Number(((inputs.followups / followupTarget) * 100).toFixed(1)) : 0;
  const orderValueAchievementPct = orderValueTarget > 0 ? Number(((inputs.orderValue / orderValueTarget) * 100).toFixed(1)) : 0;
  const reachoutBenchmarkPct = reachoutBenchmark > 0 ? Number(((inputs.reachouts / reachoutBenchmark) * 100).toFixed(1)) : 0;

  return {
    conversionRate,
    conversionScore,
    followupScore,
    orderValueScore,
    totalPerformanceScore,
    conversionAchievementPct,
    followupAchievementPct,
    orderValueAchievementPct,
    reachoutBenchmarkPct,
  };
}

/**
 * 5. Calculate reward level and reward amount based on score
 */
export function calculateReward(
  totalPerformanceScore: number,
  config: SalesProfileTargetConfig
): {
  rewardLevel: string;
  rewardAmount: number;
  rewardEligibility: 'Eligible' | 'Not Eligible';
  ineligibilityReason?: string;
} {
  const slabs = (config.rewardSlabs || DEFAULT_REWARD_SLABS).slice().sort((a, b) => b.minScore - a.minScore);

  for (const slab of slabs) {
    if (totalPerformanceScore >= slab.minScore) {
      return {
        rewardLevel: slab.level,
        rewardAmount: sanitizeSalesNumber(slab.rewardAmount),
        rewardEligibility: 'Eligible',
      };
    }
  }

  return {
    rewardLevel: 'No Reward',
    rewardAmount: 0,
    rewardEligibility: 'Eligible',
  };
}

/**
 * Complete computation for a sales performance record
 */
export function computeCompleteSalesRecord(
  raw: {
    id?: string;
    employeeId: string;
    employeeName: string;
    department?: SalesDepartment;
    profileCode: SalesProfileCode;
    week?: string;
    weekStartDate?: string;
    weekEndDate?: string;
    month: string;
    year: number;
    reachouts?: number;
    conversions?: number;
    followups?: number;
    orderValue?: number;
    entryType?: 'daily' | 'weekly';
    entryDate?: string;
    // Backward compat aliases
    totalReachout?: number;
    orderConvert?: number;
    repeatOrders?: number;
    followupSent?: number;
    managerRemarks?: string;
    submittedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  },
  settings: SalesRewardSettings
): SalesPerformanceRecord {
  const profileCode = raw.profileCode;
  const config = getProfileSettings(settings, profileCode);
  const department = raw.department || config.department || (['PR', 'WR', 'HW'].includes(profileCode) ? 'IT' : 'SMM');

  const reachouts = sanitizeSalesNumber(raw.reachouts ?? raw.totalReachout);
  const conversions = sanitizeSalesNumber(raw.conversions ?? raw.orderConvert);
  const followups = sanitizeSalesNumber(raw.followups ?? raw.followupSent);
  const orderValue = sanitizeSalesNumber(raw.orderValue ?? ((raw.orderConvert || conversions) * 5000 + (raw.repeatOrders || 0) * 8000));

  const entryType = raw.entryType || (raw.entryDate ? 'daily' : 'weekly');
  const entryDate = raw.entryDate;

  const week = raw.week || (entryDate ? getWeekFromDate(entryDate) : 'Week 1');
  const weekStartDate = raw.weekStartDate || (entryDate ? entryDate : '2026-09-01');
  const weekEndDate = raw.weekEndDate || (entryDate ? entryDate : '2026-09-07');

  const scoreBreakdown = calculateSalesPerformanceScore(
    { reachouts, conversions, followups, orderValue },
    config
  );
  const rewardInfo = calculateReward(scoreBreakdown.totalPerformanceScore, config);

  const now = new Date().toISOString();
  const id = raw.id || (entryType === 'daily' && entryDate
    ? `sales_rec_daily_${raw.employeeId}_${profileCode}_${entryDate}`
    : `sales_rec_${raw.employeeId}_${profileCode}_${week.replace(/\s+/g, '_')}_${raw.month}_${raw.year}`);

  return {
    id,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName,
    department,
    profileCode,
    entryType,
    entryDate: entryDate || '',
    week,
    weekStartDate: weekStartDate || '',
    weekEndDate: weekEndDate || '',
    month: raw.month,
    year: raw.year,
    monthYearKey: `${raw.month} ${raw.year}`,
    reachouts,
    conversions,
    followups,
    orderValue,
    // Backward compat mapping
    totalReachout: reachouts,
    orderConvert: conversions,
    followupSent: followups,
    repeatOrders: Math.round(conversions * 0.35),
    managerRemarks: raw.managerRemarks || '',
    conversionRate: scoreBreakdown.conversionRate,
    conversionScore: scoreBreakdown.conversionScore,
    followupScore: scoreBreakdown.followupScore,
    orderValueScore: scoreBreakdown.orderValueScore,
    reachoutScore: 0, // 0% Weight!
    totalPerformanceScore: scoreBreakdown.totalPerformanceScore,
    rewardEligibility: rewardInfo.rewardEligibility,
    ineligibilityReason: rewardInfo.ineligibilityReason || '',
    rewardLevel: rewardInfo.rewardLevel || 'None',
    rewardAmount: rewardInfo.rewardAmount || 0,
    submittedBy: raw.submittedBy || 'Team Member',
    createdAt: raw.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Helper to determine week from a calendar date (e.g. '2026-09-07' -> 'Week 1')
 */
export function getWeekFromDate(dateStr: string): string {
  if (!dateStr) return 'Week 1';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Week 1';
  const day = d.getDate();
  if (day <= 7) return 'Week 1';
  if (day <= 14) return 'Week 2';
  if (day <= 21) return 'Week 3';
  if (day <= 28) return 'Week 4';
  return 'Week 5';
}

export function getMonthAndYearFromDate(dateStr: string): { month: string; year: number } {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (!dateStr) return { month: 'September', year: 2026 };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { month: 'September', year: 2026 };
  return {
    month: months[d.getMonth()],
    year: d.getFullYear(),
  };
}

/**
 * Normalizes a list of performance records (which may contain both daily and weekly entries)
 * by aggregating underlying daily records into their corresponding weekly record so that
 * no double-counting occurs.
 */
export function normalizeAndAggregateRecords(
  records: SalesPerformanceRecord[],
  settings: SalesRewardSettings
): SalesPerformanceRecord[] {
  const groups = new Map<string, SalesPerformanceRecord[]>();

  for (const r of records) {
    const key = `${r.employeeId}__${r.profileCode}__${r.month.toLowerCase()}__${r.year}__${r.week}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  const result: SalesPerformanceRecord[] = [];

  for (const [, groupRecs] of groups.entries()) {
    const dailyRecs = groupRecs.filter((r) => r.entryType === 'daily');
    const weeklyRecs = groupRecs.filter((r) => r.entryType !== 'daily');

    if (dailyRecs.length > 0) {
      const first = dailyRecs[0];
      let totalReachouts = 0;
      let totalConversions = 0;
      let totalFollowups = 0;
      let totalOrderValue = 0;

      for (const d of dailyRecs) {
        totalReachouts += d.reachouts ?? d.totalReachout ?? 0;
        totalConversions += d.conversions ?? d.orderConvert ?? 0;
        totalFollowups += d.followups ?? d.followupSent ?? 0;
        totalOrderValue += d.orderValue ?? 0;
      }

      const consolidated = computeCompleteSalesRecord(
        {
          id: `aggregated_${first.employeeId}_${first.profileCode}_${first.week.replace(/\s+/g, '_')}_${first.month}_${first.year}`,
          employeeId: first.employeeId,
          employeeName: first.employeeName,
          department: first.department,
          profileCode: first.profileCode,
          week: first.week,
          month: first.month,
          year: first.year,
          reachouts: totalReachouts,
          conversions: totalConversions,
          followups: totalFollowups,
          orderValue: totalOrderValue,
          managerRemarks: `Aggregated from ${dailyRecs.length} daily performance ${dailyRecs.length === 1 ? 'entry' : 'entries'}.`,
        },
        settings
      );
      consolidated.entryType = 'weekly';
      result.push(consolidated);
    } else if (weeklyRecs.length > 0) {
      result.push(weeklyRecs[0]);
    }
  }

  return result;
}

/**
 * Validate Sales Performance Inputs
 */
export function validateSalesPerformanceInputs(inputs: {
  reachouts: number;
  conversions: number;
  followups: number;
  orderValue: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (inputs.reachouts < 0) errors.push('Reachouts cannot be negative.');
  if (inputs.conversions < 0) errors.push('Conversions cannot be negative.');
  if (inputs.followups < 0) errors.push('Follow-ups cannot be negative.');
  if (inputs.orderValue < 0) errors.push('Order Value cannot be negative.');

  if (inputs.conversions > inputs.reachouts && inputs.reachouts > 0) {
    errors.push('Conversions cannot exceed total Reachouts.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Profile Target & Weight Settings (Weights must sum to 100%)
 */
export function validateSalesProfileConfig(config: SalesProfileTargetConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.conversionTarget <= 0) errors.push('Conversion Target must be greater than 0%.');
  if (config.followupTarget <= 0) errors.push('Follow-up Target must be greater than zero.');
  if (config.orderValueTarget <= 0) errors.push('Order Value Target must be greater than zero.');

  const conversionWeight = config.conversionWeight ?? 50;
  const followupWeight = config.followupWeight ?? 20;
  const orderValueWeight = config.orderValueWeight ?? 30;

  const totalWeight = conversionWeight + followupWeight + orderValueWeight;

  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Scoring weights must total exactly 100%. Current sum: ${totalWeight}% (Conversion: ${conversionWeight}%, Follow-ups: ${followupWeight}%, Order Value: ${orderValueWeight}%).`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate Monthly Rollup from Weekly Records for an Employee & Profile
 */
export function aggregateMonthlyRecords(
  weeklyRecords: SalesPerformanceRecord[],
  employeeId: string,
  profileCode: SalesProfileCode,
  month: string,
  year: number,
  settings: SalesRewardSettings
): SalesMonthlyAggregation | null {
  const empProfileWeekly = weeklyRecords.filter(
    (r) =>
      r.employeeId === employeeId &&
      r.profileCode === profileCode &&
      r.month.toLowerCase() === month.toLowerCase() &&
      Number(r.year) === Number(year)
  );

  if (empProfileWeekly.length === 0) return null;

  const firstRec = empProfileWeekly[0];
  const config = getProfileSettings(settings, profileCode);

  let totalReachouts = 0;
  let totalConversions = 0;
  let totalFollowups = 0;
  let totalOrderValue = 0;
  let scoreSum = 0;

  empProfileWeekly.forEach((r) => {
    totalReachouts += r.reachouts ?? r.totalReachout ?? 0;
    totalConversions += r.conversions ?? r.orderConvert ?? 0;
    totalFollowups += r.followups ?? r.followupSent ?? 0;
    totalOrderValue += r.orderValue ?? 0;
    scoreSum += r.totalPerformanceScore;
  });

  const weeksCount = empProfileWeekly.length;
  const conversionRate = totalReachouts > 0 ? Number(((totalConversions / totalReachouts) * 100).toFixed(2)) : 0;
  const avgWeeklyScore = Number((scoreSum / weeksCount).toFixed(2));

  // Monthly score calculation:
  // - Conversion Rate: actual monthly conversion rate vs conversionTarget
  // - Followups: total followups vs (followupTarget * weeksCount)
  // - Order Value: total order value vs (orderValueTarget * weeksCount)
  const monthlyConversionScore = calculateMetricScore(conversionRate, config.conversionTarget || 10, config.conversionWeight ?? 50);
  const monthlyFollowupScore = calculateMetricScore(totalFollowups, (config.followupTarget || 100) * weeksCount, config.followupWeight ?? 20);
  const monthlyOrderValueScore = calculateMetricScore(totalOrderValue, (config.orderValueTarget || 100000) * weeksCount, config.orderValueWeight ?? 30);

  const monthlyPerformanceScore = Math.min(100, Number((monthlyConversionScore + monthlyFollowupScore + monthlyOrderValueScore).toFixed(2)));
  const rewardInfo = calculateReward(monthlyPerformanceScore, config);

  return {
    employeeId,
    employeeName: firstRec.employeeName,
    department: firstRec.department,
    profileCode,
    month,
    year,
    monthYearKey: `${month} ${year}`,
    weeksCount,
    totalReachouts,
    totalConversions,
    conversionRate,
    totalFollowups,
    totalOrderValue,
    avgWeeklyScore,
    monthlyPerformanceScore,
    rewardLevel: rewardInfo.rewardLevel,
    rewardAmount: rewardInfo.rewardAmount,
    weeklyRecords: empProfileWeekly,
  };
}

/**
 * Helper to format readable performance period label for announcements and dashboard
 */
export function formatPerformancePeriodLabel(
  periodType: 'daily' | 'weekly' | 'monthly' = 'weekly',
  month: string = 'September',
  year: number = 2026,
  week: string = 'Week 1',
  dateStr?: string
): string {
  if (periodType === 'daily') {
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dateStr;
    }
    return `07 Sep ${year}`;
  }

  if (periodType === 'monthly') {
    const shortMonth = month.slice(0, 3);
    return `${month} ${year} (01–30 ${shortMonth} ${year})`;
  }

  // Weekly period
  const shortMonth = month.slice(0, 3);
  if (week === 'Week 1') return `01–07 ${shortMonth} ${year}`;
  if (week === 'Week 2') return `08–14 ${shortMonth} ${year}`;
  if (week === 'Week 3') return `15–21 ${shortMonth} ${year}`;
  if (week === 'Week 4') return `22–28 ${shortMonth} ${year}`;
  if (week === 'Week 5') return `29–30 ${shortMonth} ${year}`;
  return `01–30 ${shortMonth} ${year}`;
}

/**
 * Calculate Sales Leaderboard with sorting, period aggregation (daily/weekly/monthly),
 * multi-profile support (Overall vs Profile-specific), and tie-breakers.
 */
export function calculateSalesLeaderboard(
  employees: SalesEmployee[],
  records: SalesPerformanceRecord[],
  settings: SalesRewardSettings,
  filterMonth: string,
  filterYear: number,
  filterWeek: string = 'all',
  departmentFilter: 'all' | 'IT' | 'SMM' = 'all',
  profileFilter: 'all' | SalesProfileCode = 'all',
  rewardLevelFilter: string = 'all',
  searchQuery: string = '',
  periodType: 'daily' | 'weekly' | 'monthly' = 'weekly',
  selectedDate?: string,
  memberFilter: string = 'all'
): {
  items: SalesLeaderboardItem[];
  top3: SalesLeaderboardItem[];
  winner?: SalesLeaderboardItem;
} {
  // Map employee avatars & metadata
  const empMap = new Map<string, SalesEmployee>();
  employees.forEach((e) => empMap.set(e.id, e));

  let candidateRecords: SalesPerformanceRecord[] = [];

  if (periodType === 'daily') {
    // Filter daily records matching date or fallback to all daily records in month
    const dailyRecs = records.filter(
      (r) =>
        r.entryType === 'daily' &&
        r.month.toLowerCase() === filterMonth.toLowerCase() &&
        Number(r.year) === Number(filterYear)
    );

    if (selectedDate) {
      const dateMatched = dailyRecs.filter((r) => r.entryDate === selectedDate || (r as any).date === selectedDate);
      candidateRecords = dateMatched.length > 0 ? dateMatched : dailyRecs;
    } else {
      candidateRecords = dailyRecs;
    }

    // If candidateRecords is empty (e.g. no daily entries yet), fallback to normalized weekly
    if (candidateRecords.length === 0) {
      candidateRecords = normalizeAndAggregateRecords(records, settings).filter(
        (r) =>
          r.month.toLowerCase() === filterMonth.toLowerCase() &&
          Number(r.year) === Number(filterYear) &&
          (filterWeek === 'all' || r.week === filterWeek)
      );
    }
  } else if (periodType === 'monthly') {
    // True monthly aggregation: group by employee and profile
    const normalizedWeekly = normalizeAndAggregateRecords(records, settings).filter(
      (r) => r.month.toLowerCase() === filterMonth.toLowerCase() && Number(r.year) === Number(filterYear)
    );

    const empProfileGroups = new Map<string, SalesPerformanceRecord[]>();
    for (const r of normalizedWeekly) {
      const key = `${r.employeeId}__${r.profileCode}`;
      if (!empProfileGroups.has(key)) empProfileGroups.set(key, []);
      empProfileGroups.get(key)!.push(r);
    }

    for (const [, groupRecs] of empProfileGroups.entries()) {
      const first = groupRecs[0];
      const config = getProfileSettings(settings, first.profileCode);
      const weeksCount = Math.max(1, groupRecs.length);

      let totReachouts = 0;
      let totConversions = 0;
      let totFollowups = 0;
      let totOrderVal = 0;

      for (const gr of groupRecs) {
        totReachouts += gr.reachouts ?? gr.totalReachout ?? 0;
        totConversions += gr.conversions ?? gr.orderConvert ?? 0;
        totFollowups += gr.followups ?? gr.followupSent ?? 0;
        totOrderVal += gr.orderValue ?? 0;
      }

      const convRate = calculateConversionRate(totConversions, totReachouts);
      const convScore = calculateMetricScore(convRate, config.conversionTarget || 10, config.conversionWeight ?? 50);
      const folScore = calculateMetricScore(totFollowups, (config.followupTarget || 100) * weeksCount, config.followupWeight ?? 20);
      const ordScore = calculateMetricScore(totOrderVal, (config.orderValueTarget || 100000) * weeksCount, config.orderValueWeight ?? 30);
      const totScore = Math.min(100, Number((convScore + folScore + ordScore).toFixed(2)));

      const monthlyRec: SalesPerformanceRecord = {
        ...first,
        id: `monthly_${first.employeeId}_${first.profileCode}_${filterMonth}_${filterYear}`,
        week: 'All Weeks (Monthly)',
        entryType: 'weekly',
        reachouts: totReachouts,
        conversions: totConversions,
        conversionRate: convRate,
        followups: totFollowups,
        orderValue: totOrderVal,
        conversionScore: convScore,
        followupScore: folScore,
        orderValueScore: ordScore,
        reachoutScore: 0,
        totalPerformanceScore: totScore,
        rewardEligibility: totReachouts >= ((config.reachoutBenchmark || 200) * weeksCount) * 0.5 ? 'Eligible' : 'Not Eligible',
        rewardLevel: calculateReward(totScore, config).rewardLevel,
        rewardAmount: calculateReward(totScore, config).rewardAmount,
        managerRemarks: `Monthly rollup across ${weeksCount} weekly performance cycles.`,
      };
      candidateRecords.push(monthlyRec);
    }
  } else {
    // Weekly period
    const aggregatedRecords = normalizeAndAggregateRecords(records, settings);
    candidateRecords = aggregatedRecords.filter(
      (r) => r.month.toLowerCase() === filterMonth.toLowerCase() && Number(r.year) === Number(filterYear)
    );
    if (filterWeek !== 'all') {
      candidateRecords = candidateRecords.filter((r) => r.week === filterWeek);
    }
  }

  let items: SalesLeaderboardItem[] = [];

  if (profileFilter !== 'all') {
    // Profile-Specific Leaderboard: Filter strictly by profileCode
    const profileSpecificRecs = candidateRecords.filter((r) => r.profileCode === profileFilter);

    items = profileSpecificRecs.map((rec) => {
      const emp = empMap.get(rec.employeeId);
      const config = getProfileSettings(settings, rec.profileCode);

      const conversionAchievementPct = config.conversionTarget > 0 ? Number(((rec.conversionRate / config.conversionTarget) * 100).toFixed(1)) : 0;
      const followupAchievementPct = config.followupTarget > 0 ? Number((((rec.followups ?? rec.followupSent ?? 0) / config.followupTarget) * 100).toFixed(1)) : 0;
      const orderValueAchievementPct = config.orderValueTarget > 0 ? Number((((rec.orderValue ?? 0) / config.orderValueTarget) * 100).toFixed(1)) : 0;
      const reachoutBenchmarkPct = (config.reachoutBenchmark || 200) > 0 ? Number((((rec.reachouts ?? rec.totalReachout ?? 0) / (config.reachoutBenchmark || 200)) * 100).toFixed(1)) : 0;

      let performanceBand: 'Platinum Tier' | 'Gold Tier' | 'Silver Tier' | 'Bronze Tier' | 'Developing' = 'Developing';
      if (rec.totalPerformanceScore >= 90) performanceBand = 'Platinum Tier';
      else if (rec.totalPerformanceScore >= 80) performanceBand = 'Gold Tier';
      else if (rec.totalPerformanceScore >= 70) performanceBand = 'Silver Tier';
      else if (rec.totalPerformanceScore >= 60) performanceBand = 'Bronze Tier';

      return {
        ...rec,
        rank: 0,
        avatarUrl: emp?.avatarUrl,
        assignedProfiles: emp?.assignedProfiles || (emp?.profileCode ? [emp.profileCode] : [rec.profileCode]),
        joiningDate: emp?.joiningDate,
        conversionAchievementPct,
        followupAchievementPct,
        orderValueAchievementPct,
        reachoutBenchmarkPct,
        performanceBand,
      };
    });
  } else {
    // Overall Leaderboard (All eligible Sales Members combined, handling multiple profiles without inflation)
    const empGroups = new Map<string, SalesPerformanceRecord[]>();
    for (const r of candidateRecords) {
      if (!empGroups.has(r.employeeId)) empGroups.set(r.employeeId, []);
      empGroups.get(r.employeeId)!.push(r);
    }

    for (const [empId, empRecs] of empGroups.entries()) {
      const emp = empMap.get(empId);
      const first = empRecs[0];

      let totalReachouts = 0;
      let totalConversions = 0;
      let totalFollowups = 0;
      let totalOrderValue = 0;
      let scoreSum = 0;
      let totalRewardAmount = 0;

      const profileCodesUsed = Array.from(new Set(empRecs.map((r) => r.profileCode)));

      for (const r of empRecs) {
        totalReachouts += r.reachouts ?? r.totalReachout ?? 0;
        totalConversions += r.conversions ?? r.orderConvert ?? 0;
        totalFollowups += r.followups ?? r.followupSent ?? 0;
        totalOrderValue += r.orderValue ?? 0;
        scoreSum += r.totalPerformanceScore;
        totalRewardAmount += r.rewardAmount ?? 0;
      }

      const conversionRate = calculateConversionRate(totalConversions, totalReachouts);
      // Average score across profiles to maintain target integrity
      const avgPerformanceScore = Number((scoreSum / empRecs.length).toFixed(2));

      let performanceBand: 'Platinum Tier' | 'Gold Tier' | 'Silver Tier' | 'Bronze Tier' | 'Developing' = 'Developing';
      if (avgPerformanceScore >= 90) performanceBand = 'Platinum Tier';
      else if (avgPerformanceScore >= 80) performanceBand = 'Gold Tier';
      else if (avgPerformanceScore >= 70) performanceBand = 'Silver Tier';
      else if (avgPerformanceScore >= 60) performanceBand = 'Bronze Tier';

      items.push({
        ...first,
        id: `overall_${empId}_${filterMonth}_${filterYear}_${filterWeek}`,
        profileCode: (profileCodesUsed.length === 1 ? profileCodesUsed[0] : (profileCodesUsed.join(' + ') as any)),
        reachouts: totalReachouts,
        conversions: totalConversions,
        conversionRate,
        followups: totalFollowups,
        orderValue: totalOrderValue,
        totalPerformanceScore: avgPerformanceScore,
        rewardAmount: totalRewardAmount,
        rank: 0,
        avatarUrl: emp?.avatarUrl,
        assignedProfiles: emp?.assignedProfiles || profileCodesUsed,
        joiningDate: emp?.joiningDate,
        conversionAchievementPct: 0,
        followupAchievementPct: 0,
        orderValueAchievementPct: 0,
        reachoutBenchmarkPct: 0,
        performanceBand,
      });
    }
  }

  // Apply filters (department, member, reward level, search) BEFORE sorting and ranking
  let filtered = items;
  if (departmentFilter !== 'all') {
    filtered = filtered.filter((i) => i.department === departmentFilter);
  }
  if (memberFilter !== 'all') {
    filtered = filtered.filter((i) => i.employeeId === memberFilter);
  }
  if (rewardLevelFilter !== 'all') {
    filtered = filtered.filter((i) => i.rewardLevel.toLowerCase() === rewardLevelFilter.toLowerCase());
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.employeeName.toLowerCase().includes(q) ||
        String(i.profileCode).toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q)
    );
  }

  // Multi-Tier Sorting Rule:
  // 1. Total Performance Score desc
  // 2. Conversion Rate desc
  // 3. Order Value desc
  // 4. Follow-ups desc
  // 5. Reachouts desc (activity tie-breaker)
  filtered.sort((a, b) => {
    if (Math.abs(b.totalPerformanceScore - a.totalPerformanceScore) > 0.001) {
      return b.totalPerformanceScore - a.totalPerformanceScore;
    }
    if (Math.abs(b.conversionRate - a.conversionRate) > 0.001) {
      return b.conversionRate - a.conversionRate;
    }
    if ((b.orderValue ?? 0) !== (a.orderValue ?? 0)) {
      return (b.orderValue ?? 0) - (a.orderValue ?? 0);
    }
    if ((b.followups ?? b.followupSent ?? 0) !== (a.followups ?? a.followupSent ?? 0)) {
      return (b.followups ?? b.followupSent ?? 0) - (a.followups ?? a.followupSent ?? 0);
    }
    return (b.reachouts ?? b.totalReachout ?? 0) - (a.reachouts ?? a.totalReachout ?? 0);
  });

  // Assign ranks strictly within filtered view
  let currentRank = 1;
  filtered.forEach((item, index) => {
    if (index > 0) {
      const prev = filtered[index - 1];
      const isTie =
        Math.abs(prev.totalPerformanceScore - item.totalPerformanceScore) < 0.001 &&
        Math.abs(prev.conversionRate - item.conversionRate) < 0.001 &&
        (prev.orderValue ?? 0) === (item.orderValue ?? 0);

      if (isTie) {
        item.rank = prev.rank;
        item.isTie = true;
        prev.isTie = true;
      } else {
        item.rank = currentRank;
      }
    } else {
      item.rank = 1;
    }
    currentRank++;
  });

  const top3 = filtered.slice(0, 3);
  const winner = filtered.length > 0 ? filtered[0] : undefined;

  return {
    items: filtered,
    top3,
    winner,
  };
}

/**
 * Calculate Sales Dashboard Summary & Highlights
 */
export function calculateSalesDashboardSummary(
  employees: SalesEmployee[],
  records: SalesPerformanceRecord[],
  settings: SalesRewardSettings,
  month: string,
  year: number,
  week: string = 'all',
  periodType: 'daily' | 'weekly' | 'monthly' = 'weekly',
  selectedDate?: string,
  profileFilter: 'all' | SalesProfileCode = 'all',
  memberFilter: string = 'all'
): SalesDashboardSummary {
  const leaderboardResult = calculateSalesLeaderboard(
    employees,
    records,
    settings,
    month,
    year,
    week,
    'all',
    profileFilter,
    'all',
    '',
    periodType,
    selectedDate,
    memberFilter
  );
  const items = leaderboardResult.items;

  let totalReachouts = 0;
  let totalConversions = 0;
  let totalFollowups = 0;
  let totalOrderValue = 0;
  let totalScoreSum = 0;
  let totalRewards = 0;
  let eligibleCount = 0;

  const activeEmpIdSet = new Set<string>();

  items.forEach((item) => {
    activeEmpIdSet.add(item.employeeId);
    totalReachouts += item.reachouts ?? item.totalReachout ?? 0;
    totalConversions += item.conversions ?? item.orderConvert ?? 0;
    totalFollowups += item.followups ?? item.followupSent ?? 0;
    totalOrderValue += item.orderValue ?? 0;
    totalScoreSum += item.totalPerformanceScore;
    totalRewards += item.rewardAmount ?? 0;
    if (item.rewardEligibility === 'Eligible' && (item.rewardAmount ?? 0) > 0) {
      eligibleCount++;
    }
  });

  const overallConversionRate = totalReachouts > 0 ? Number(((totalConversions / totalReachouts) * 100).toFixed(2)) : 0;
  const avgScore = items.length > 0 ? Number((totalScoreSum / items.length).toFixed(2)) : 0;

  const activeEmployees = employees.filter((e) => e.status === 'active');
  const itEmployeesCount = activeEmployees.filter((e) => e.department === 'IT').length;
  const smmEmployeesCount = activeEmployees.filter((e) => e.department === 'SMM').length;

  // Highlights
  const topSalesPerformer = items[0];
  const salesWinner = leaderboardResult.winner;
  const topItPerformer = items.find((i) => i.department === 'IT');
  const topSmmPerformer = items.find((i) => i.department === 'SMM');

  const highestConversionPerformer = items.slice().sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const highestOrderValuePerformer = items.slice().sort((a, b) => (b.orderValue ?? 0) - (a.orderValue ?? 0))[0];
  const highestFollowupPerformer = items.slice().sort((a, b) => (b.followups ?? b.followupSent ?? 0) - (a.followups ?? a.followupSent ?? 0))[0];
  const highestReachoutPerformer = items.slice().sort((a, b) => (b.reachouts ?? b.totalReachout ?? 0) - (a.reachouts ?? a.totalReachout ?? 0))[0];

  return {
    totalEmployees: activeEmployees.length,
    activeEmployeesCount: activeEmpIdSet.size,
    itEmployeesCount,
    smmEmployeesCount,
    totalReachouts,
    totalConversions,
    overallConversionRate,
    totalFollowups,
    totalOrderValue,
    avgScore,
    totalRewards,
    eligibleCount,
    topSalesPerformer,
    salesWinner,
    topItPerformer,
    topSmmPerformer,
    highestConversionPerformer,
    highestOrderValuePerformer,
    highestFollowupPerformer,
    highestReachoutPerformer,
  };
}

/**
 * Calculate Profile Performance Breakdown
 */
export function getProfilePerformance(
  records: SalesPerformanceRecord[],
  employees: SalesEmployee[],
  profileCode: SalesProfileCode,
  settings: SalesRewardSettings
): SalesProfileSummary {
  const config = getProfileSettings(settings, profileCode);
  const profileRecords = records.filter((r) => r.profileCode === profileCode);
  const profileEmployees = employees.filter(
    (e) =>
      e.status === 'active' &&
      ((e.assignedProfiles && e.assignedProfiles.includes(profileCode)) || e.profileCode === profileCode)
  );

  let totalReachout = 0;
  let totalConversions = 0;
  let totalFollowups = 0;
  let totalOrderValue = 0;
  let scoreSum = 0;
  let totalRewards = 0;
  let eligibleCount = 0;

  profileRecords.forEach((r) => {
    totalReachout += r.reachouts ?? r.totalReachout ?? 0;
    totalConversions += r.conversions ?? r.orderConvert ?? 0;
    totalFollowups += r.followups ?? r.followupSent ?? 0;
    totalOrderValue += r.orderValue ?? 0;
    scoreSum += r.totalPerformanceScore;
    totalRewards += r.rewardAmount;
    if (r.rewardEligibility === 'Eligible' && r.rewardAmount > 0) eligibleCount++;
  });

  const count = profileRecords.length;
  const avgReachout = count > 0 ? Number((totalReachout / count).toFixed(1)) : 0;
  const avgConversions = count > 0 ? Number((totalConversions / count).toFixed(1)) : 0;
  const avgFollowups = count > 0 ? Number((totalFollowups / count).toFixed(1)) : 0;
  const avgOrderValue = count > 0 ? Number((totalOrderValue / count).toFixed(0)) : 0;
  const conversionRate = totalReachout > 0 ? Number(((totalConversions / totalReachout) * 100).toFixed(2)) : 0;
  const avgScore = count > 0 ? Number((scoreSum / count).toFixed(2)) : 0;

  return {
    profileCode,
    profileName: config.profileName,
    department: config.department,
    employeeCount: profileEmployees.length,
    totalReachout,
    totalConversions,
    totalFollowups,
    totalOrderValue,
    avgReachout,
    avgConversions,
    avgFollowups,
    avgOrderValue,
    conversionRate,
    avgScore,
    totalRewards,
    eligibleEmployeesCount: eligibleCount,
  };
}

/**
 * Calculate Department Performance Breakdown (IT vs SMM)
 */
export function getDepartmentPerformance(
  records: SalesPerformanceRecord[],
  employees: SalesEmployee[],
  department: SalesDepartment,
  settings: SalesRewardSettings
): SalesDepartmentSummary {
  const profileCodes: SalesProfileCode[] = department === 'IT' ? ['PR', 'WR', 'HW'] : ['DR', 'RR'];
  const profiles = profileCodes.map((code) => getProfilePerformance(records, employees, code, settings));

  const deptRecords = records.filter((r) => r.department === department);
  const deptEmployees = employees.filter((e) => e.department === department && e.status === 'active');

  let totalReachout = 0;
  let totalConversions = 0;
  let totalFollowups = 0;
  let totalOrderValue = 0;
  let scoreSum = 0;
  let totalRewards = 0;

  deptRecords.forEach((r) => {
    totalReachout += r.reachouts ?? r.totalReachout ?? 0;
    totalConversions += r.conversions ?? r.orderConvert ?? 0;
    totalFollowups += r.followups ?? r.followupSent ?? 0;
    totalOrderValue += r.orderValue ?? 0;
    scoreSum += r.totalPerformanceScore;
    totalRewards += r.rewardAmount;
  });

  const overallConversionRate = totalReachout > 0 ? Number(((totalConversions / totalReachout) * 100).toFixed(2)) : 0;
  const avgScore = deptRecords.length > 0 ? Number((scoreSum / deptRecords.length).toFixed(2)) : 0;

  return {
    department,
    employeeCount: deptEmployees.length,
    totalReachout,
    totalConversions,
    totalFollowups,
    totalOrderValue,
    overallConversionRate,
    avgScore,
    totalRewards,
    profiles,
  };
}

/**
 * Calculate Monthly History & Month-over-Month Comparison for an Employee
 */
export function calculateSalesHistoryComparison(
  records: SalesPerformanceRecord[],
  employeeId: string,
  monthsOrder: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
): SalesEmployeeHistoryComparison[] {
  const empRecords = records
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
    });

  const history: SalesEmployeeHistoryComparison[] = [];

  empRecords.forEach((r, idx) => {
    let scoreChange: number | undefined;
    let conversionChange: number | undefined;
    let orderChange: number | undefined;
    let repeatOrderChange: number | undefined;

    if (idx > 0) {
      const prev = empRecords[idx - 1];
      scoreChange = Number((r.totalPerformanceScore - prev.totalPerformanceScore).toFixed(2));
      conversionChange = Number((r.conversionRate - prev.conversionRate).toFixed(2));
      orderChange = (r.conversions ?? r.orderConvert ?? 0) - (prev.conversions ?? prev.orderConvert ?? 0);
      repeatOrderChange = (r.repeatOrders ?? 0) - (prev.repeatOrders ?? 0);
    }

    history.push({
      month: r.month,
      year: r.year,
      score: r.totalPerformanceScore,
      conversionRate: r.conversionRate,
      orders: r.conversions ?? r.orderConvert ?? 0,
      repeatOrders: r.repeatOrders ?? 0,
      reachouts: r.reachouts ?? r.totalReachout ?? 0,
      followups: r.followups ?? r.followupSent ?? 0,
      rewardAmount: r.rewardAmount,
      rewardLevel: r.rewardLevel,
      eligibility: r.rewardEligibility,
      scoreChange,
      conversionChange,
      orderChange,
      repeatOrderChange,
    });
  });

  return history;
}

/**
 * Format sales currency with symbol
 */
export function formatSalesCurrency(amount: number, symbol = '$'): string {
  const safe = sanitizeSalesNumber(amount);
  return `${symbol}${safe.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

