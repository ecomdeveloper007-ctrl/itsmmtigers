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
  profileCode: SalesProfileCode
): SalesProfileTargetConfig {
  const safeSettings = settings || DEFAULT_SALES_SETTINGS;
  const config = safeSettings.profiles?.[profileCode];
  if (config) {
    // Ensure default weights and benchmarks exist if missing from older data
    return {
      ...config,
      conversionWeight: config.conversionWeight ?? 50,
      followupWeight: config.followupWeight ?? 20,
      orderValueWeight: config.orderValueWeight ?? 30,
      reachoutWeight: 0,
      conversionTarget: config.conversionTarget || (config.orderConvertTarget ? 10 : 10),
      followupTarget: config.followupTarget || 100,
      orderValueTarget: config.orderValueTarget || 100000,
      reachoutBenchmark: config.reachoutBenchmark || config.reachoutTarget || 200,
    };
  }
  return DEFAULT_SALES_SETTINGS.profiles[profileCode] || DEFAULT_SALES_SETTINGS.profiles.PR;
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

  const week = raw.week || 'Week 1';
  const weekStartDate = raw.weekStartDate || '2026-09-01';
  const weekEndDate = raw.weekEndDate || '2026-09-07';

  const scoreBreakdown = calculateSalesPerformanceScore(
    { reachouts, conversions, followups, orderValue },
    config
  );
  const rewardInfo = calculateReward(scoreBreakdown.totalPerformanceScore, config);

  const now = new Date().toISOString();
  const id = raw.id || `sales_rec_${raw.employeeId}_${profileCode}_${week.replace(/\s+/g, '_')}_${raw.month}_${raw.year}`;

  return {
    id,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName,
    department,
    profileCode,
    week,
    weekStartDate,
    weekEndDate,
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
    ineligibilityReason: rewardInfo.ineligibilityReason,
    rewardLevel: rewardInfo.rewardLevel,
    rewardAmount: rewardInfo.rewardAmount,
    submittedBy: raw.submittedBy || 'manager',
    createdAt: raw.createdAt || now,
    updatedAt: now,
  };
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
 * Calculate Sales Leaderboard with sorting and tie-breakers
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
  searchQuery: string = ''
): {
  items: SalesLeaderboardItem[];
  top3: SalesLeaderboardItem[];
  winner?: SalesLeaderboardItem;
} {
  // Filter active records for month, year, and optional week
  let activeRecords = records.filter(
    (r) => r.month.toLowerCase() === filterMonth.toLowerCase() && Number(r.year) === Number(filterYear)
  );

  if (filterWeek !== 'all') {
    activeRecords = activeRecords.filter((r) => r.week === filterWeek);
  }

  // Map employee avatars & assigned profiles
  const empMap = new Map<string, SalesEmployee>();
  employees.forEach((e) => empMap.set(e.id, e));

  // Build complete list of items
  let items: SalesLeaderboardItem[] = activeRecords.map((rec) => {
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

  // Multi-Tier Sorting Rule:
  // 1. Total Performance Score desc
  // 2. Conversion Rate desc
  // 3. Order Value desc
  // 4. Follow-ups desc
  // 5. Reachouts desc (activity tie-breaker)
  items.sort((a, b) => {
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

  // Assign ranks
  let currentRank = 1;
  items.forEach((item, index) => {
    if (index > 0) {
      const prev = items[index - 1];
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

  // Apply filters
  let filtered = items;
  if (departmentFilter !== 'all') {
    filtered = filtered.filter((i) => i.department === departmentFilter);
  }
  if (profileFilter !== 'all') {
    filtered = filtered.filter((i) => i.profileCode === profileFilter);
  }
  if (rewardLevelFilter !== 'all') {
    filtered = filtered.filter((i) => i.rewardLevel.toLowerCase() === rewardLevelFilter.toLowerCase());
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.employeeName.toLowerCase().includes(q) ||
        i.profileCode.toLowerCase().includes(q) ||
        i.department.toLowerCase().includes(q)
    );
  }

  const top3 = items.slice(0, 3);
  const winner = items.length > 0 ? items[0] : undefined;

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
  week: string = 'all'
): SalesDashboardSummary {
  const currentRecords = records.filter((r) => {
    const mMatch = r.month.toLowerCase() === month.toLowerCase() && Number(r.year) === Number(year);
    if (!mMatch) return false;
    if (week !== 'all') return r.week === week;
    return true;
  });

  const leaderboardResult = calculateSalesLeaderboard(employees, currentRecords, settings, month, year, week);
  const items = leaderboardResult.items;

  let totalReachouts = 0;
  let totalConversions = 0;
  let totalFollowups = 0;
  let totalOrderValue = 0;
  let totalScoreSum = 0;
  let totalRewards = 0;
  let eligibleCount = 0;

  items.forEach((item) => {
    totalReachouts += item.reachouts ?? item.totalReachout ?? 0;
    totalConversions += item.conversions ?? item.orderConvert ?? 0;
    totalFollowups += item.followups ?? item.followupSent ?? 0;
    totalOrderValue += item.orderValue ?? 0;
    totalScoreSum += item.totalPerformanceScore;
    totalRewards += item.rewardAmount;
    if (item.rewardEligibility === 'Eligible' && item.rewardAmount > 0) {
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
  const topItPerformer = items.find((i) => i.department === 'IT');
  const topSmmPerformer = items.find((i) => i.department === 'SMM');

  const highestConversionPerformer = items.slice().sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const highestOrderValuePerformer = items.slice().sort((a, b) => (b.orderValue ?? 0) - (a.orderValue ?? 0))[0];
  const highestFollowupPerformer = items.slice().sort((a, b) => (b.followups ?? b.followupSent ?? 0) - (a.followups ?? a.followupSent ?? 0))[0];
  const highestReachoutPerformer = items.slice().sort((a, b) => (b.reachouts ?? b.totalReachout ?? 0) - (a.reachouts ?? a.totalReachout ?? 0))[0];

  return {
    totalEmployees: activeEmployees.length,
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
