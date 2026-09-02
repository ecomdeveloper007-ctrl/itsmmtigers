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
} from '../types/sales';

/**
 * Default configurable reward slabs per profile
 */
export const DEFAULT_REWARD_SLABS = [
  { id: 'slab_plat', level: 'Platinum', minScore: 90, maxScore: 100, rewardAmount: 5000, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'slab_gold', level: 'Gold', minScore: 80, maxScore: 89.99, rewardAmount: 3000, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'slab_silver', level: 'Silver', minScore: 70, maxScore: 79.99, rewardAmount: 2000, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  { id: 'slab_bronze', level: 'Bronze', minScore: 60, maxScore: 69.99, rewardAmount: 1000, color: 'text-amber-800 bg-amber-100/60 border-amber-300' },
  { id: 'slab_none', level: 'No Reward', minScore: 0, maxScore: 59.99, rewardAmount: 0, color: 'text-gray-500 bg-gray-50 border-gray-200' },
];

/**
 * Default Configurable Profile Targets & Weights
 */
export const DEFAULT_SALES_SETTINGS: SalesRewardSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  profiles: {
    PR: {
      profileCode: 'PR',
      profileName: 'PR Profile (IT Solutions & Product Delivery)',
      department: 'IT',
      reachoutTarget: 200,
      orderConvertTarget: 20,
      repeatOrdersTarget: 8,
      followupTarget: 100,
      reachoutWeight: 20,
      orderConvertWeight: 40,
      repeatOrdersWeight: 25,
      followupWeight: 15,
      minConversionRate: 7.0, // 7%
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    WR: {
      profileCode: 'WR',
      profileName: 'WR Profile (IT Web Architecture & Eng)',
      department: 'IT',
      reachoutTarget: 180,
      orderConvertTarget: 18,
      repeatOrdersTarget: 7,
      followupTarget: 90,
      reachoutWeight: 20,
      orderConvertWeight: 40,
      repeatOrdersWeight: 25,
      followupWeight: 15,
      minConversionRate: 7.0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    HW: {
      profileCode: 'HW',
      profileName: 'HW Profile (IT Cloud & Infrastructure)',
      department: 'IT',
      reachoutTarget: 150,
      orderConvertTarget: 15,
      repeatOrdersTarget: 6,
      followupTarget: 80,
      reachoutWeight: 20,
      orderConvertWeight: 40,
      repeatOrdersWeight: 25,
      followupWeight: 15,
      minConversionRate: 7.0,
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    DR: {
      profileCode: 'DR',
      profileName: 'DR Profile (SMM Direct Response & Conversions)',
      department: 'SMM',
      reachoutTarget: 250,
      orderConvertTarget: 25,
      repeatOrdersTarget: 10,
      followupTarget: 120,
      reachoutWeight: 20,
      orderConvertWeight: 40,
      repeatOrdersWeight: 25,
      followupWeight: 15,
      minConversionRate: 8.0, // 8%
      rewardSlabs: JSON.parse(JSON.stringify(DEFAULT_REWARD_SLABS)),
    },
    RR: {
      profileCode: 'RR',
      profileName: 'RR Profile (SMM Retainers & Growth)',
      department: 'SMM',
      reachoutTarget: 220,
      orderConvertTarget: 22,
      repeatOrdersTarget: 9,
      followupTarget: 110,
      reachoutWeight: 20,
      orderConvertWeight: 40,
      repeatOrdersWeight: 25,
      followupWeight: 15,
      minConversionRate: 8.0,
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
 * 1. Get profile target and weighting settings
 */
export function getProfileSettings(
  settings: SalesRewardSettings | undefined,
  profileCode: SalesProfileCode
): SalesProfileTargetConfig {
  const safeSettings = settings || DEFAULT_SALES_SETTINGS;
  const config = safeSettings.profiles?.[profileCode];
  if (config) return config;
  return DEFAULT_SALES_SETTINGS.profiles[profileCode] || DEFAULT_SALES_SETTINGS.profiles.PR;
}

/**
 * 2. Calculate conversion rate safely: (Order Convert / Total Reachout) * 100
 */
export function calculateConversionRate(orderConvert: number, totalReachout: number): number {
  const safeOrders = sanitizeSalesNumber(orderConvert);
  const safeReachout = sanitizeSalesNumber(totalReachout);

  if (safeReachout <= 0) return 0;
  const rate = (safeOrders / safeReachout) * 100;
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
 * 4. Calculate total 100-point sales performance score
 */
export function calculateSalesPerformanceScore(
  inputs: {
    totalReachout: number;
    orderConvert: number;
    repeatOrders: number;
    followupSent: number;
  },
  config: SalesProfileTargetConfig
): {
  reachoutScore: number;
  orderConvertScore: number;
  repeatOrdersScore: number;
  followupScore: number;
  totalPerformanceScore: number;
  reachoutAchievementPct: number;
  orderAchievementPct: number;
  repeatAchievementPct: number;
  followupAchievementPct: number;
} {
  const reachoutScore = calculateMetricScore(inputs.totalReachout, config.reachoutTarget, config.reachoutWeight);
  const orderConvertScore = calculateMetricScore(inputs.orderConvert, config.orderConvertTarget, config.orderConvertWeight);
  const repeatOrdersScore = calculateMetricScore(inputs.repeatOrders, config.repeatOrdersTarget, config.repeatOrdersWeight);
  const followupScore = calculateMetricScore(inputs.followupSent, config.followupTarget, config.followupWeight);

  const rawTotal = reachoutScore + orderConvertScore + repeatOrdersScore + followupScore;
  const totalPerformanceScore = Math.min(100, Number(rawTotal.toFixed(2)));

  const reachoutAchievementPct = config.reachoutTarget > 0 ? Number(((inputs.totalReachout / config.reachoutTarget) * 100).toFixed(1)) : 0;
  const orderAchievementPct = config.orderConvertTarget > 0 ? Number(((inputs.orderConvert / config.orderConvertTarget) * 100).toFixed(1)) : 0;
  const repeatAchievementPct = config.repeatOrdersTarget > 0 ? Number(((inputs.repeatOrders / config.repeatOrdersTarget) * 100).toFixed(1)) : 0;
  const followupAchievementPct = config.followupTarget > 0 ? Number(((inputs.followupSent / config.followupTarget) * 100).toFixed(1)) : 0;

  return {
    reachoutScore,
    orderConvertScore,
    repeatOrdersScore,
    followupScore,
    totalPerformanceScore,
    reachoutAchievementPct,
    orderAchievementPct,
    repeatAchievementPct,
    followupAchievementPct,
  };
}

/**
 * 5. Check reward eligibility based on minimum conversion rate
 */
export function checkRewardEligibility(
  conversionRate: number,
  config: SalesProfileTargetConfig
): { isEligible: boolean; reason?: string } {
  const minRequired = sanitizeSalesNumber(config.minConversionRate);
  if (conversionRate < minRequired) {
    return {
      isEligible: false,
      reason: `Conversion Rate (${conversionRate.toFixed(2)}%) is below profile minimum requirement (${minRequired.toFixed(2)}%).`,
    };
  }
  return { isEligible: true };
}

/**
 * 6. Calculate reward level and reward amount based on score and eligibility
 */
export function calculateReward(
  totalPerformanceScore: number,
  conversionRate: number,
  config: SalesProfileTargetConfig
): {
  rewardLevel: string;
  rewardAmount: number;
  rewardEligibility: 'Eligible' | 'Not Eligible';
  ineligibilityReason?: string;
} {
  const eligibility = checkRewardEligibility(conversionRate, config);

  if (!eligibility.isEligible) {
    return {
      rewardLevel: 'No Reward',
      rewardAmount: 0,
      rewardEligibility: 'Not Eligible',
      ineligibilityReason: eligibility.reason,
    };
  }

  // Find matching slab (sorted by minScore descending)
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
    month: string;
    year: number;
    totalReachout: number;
    orderConvert: number;
    repeatOrders: number;
    followupSent: number;
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

  const totalReachout = sanitizeSalesNumber(raw.totalReachout);
  const orderConvert = sanitizeSalesNumber(raw.orderConvert);
  const repeatOrders = sanitizeSalesNumber(raw.repeatOrders);
  const followupSent = sanitizeSalesNumber(raw.followupSent);

  const conversionRate = calculateConversionRate(orderConvert, totalReachout);
  const scoreBreakdown = calculateSalesPerformanceScore(
    { totalReachout, orderConvert, repeatOrders, followupSent },
    config
  );
  const rewardInfo = calculateReward(scoreBreakdown.totalPerformanceScore, conversionRate, config);

  const now = new Date().toISOString();
  const id = raw.id || `sales_rec_${raw.employeeId}_${raw.month}_${raw.year}`;

  return {
    id,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName,
    department,
    profileCode,
    month: raw.month,
    year: raw.year,
    monthYearKey: `${raw.month} ${raw.year}`,
    totalReachout,
    orderConvert,
    repeatOrders,
    followupSent,
    managerRemarks: raw.managerRemarks || '',
    conversionRate,
    reachoutScore: scoreBreakdown.reachoutScore,
    orderConvertScore: scoreBreakdown.orderConvertScore,
    repeatOrdersScore: scoreBreakdown.repeatOrdersScore,
    followupScore: scoreBreakdown.followupScore,
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
  totalReachout: number;
  orderConvert: number;
  repeatOrders: number;
  followupSent: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (inputs.totalReachout < 0) errors.push('Total Reachout cannot be negative.');
  if (inputs.orderConvert < 0) errors.push('Order Convert cannot be negative.');
  if (inputs.repeatOrders < 0) errors.push('Repeat Orders cannot be negative.');
  if (inputs.followupSent < 0) errors.push('Follow-up Sent cannot be negative.');

  if (inputs.orderConvert > inputs.totalReachout && inputs.totalReachout > 0) {
    errors.push('Order Convert should not normally exceed Total Reachout.');
  }

  if (inputs.repeatOrders > inputs.orderConvert && inputs.orderConvert > 0) {
    errors.push('Repeat Orders should not exceed Order Convert.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Profile Target & Weight Settings
 */
export function validateSalesProfileConfig(config: SalesProfileTargetConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.reachoutTarget <= 0) errors.push('Reachout Target must be greater than zero.');
  if (config.orderConvertTarget <= 0) errors.push('Order Convert Target must be greater than zero.');
  if (config.repeatOrdersTarget <= 0) errors.push('Repeat Orders Target must be greater than zero.');
  if (config.followupTarget <= 0) errors.push('Follow-up Target must be greater than zero.');

  const totalWeight =
    config.reachoutWeight +
    config.orderConvertWeight +
    config.repeatOrdersWeight +
    config.followupWeight;

  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Weights must total exactly 100%. Current total is ${totalWeight}%.`);
  }

  if (config.minConversionRate < 0 || config.minConversionRate > 100) {
    errors.push('Minimum Conversion Rate must be between 0% and 100%.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 7. Calculate Sales Leaderboard with sorting and tie-breakers
 * Sorting rule: 1. Total Performance Score, 2. Conversion Rate, 3. Order Convert, 4. Repeat Orders
 */
export function calculateSalesLeaderboard(
  employees: SalesEmployee[],
  records: SalesPerformanceRecord[],
  settings: SalesRewardSettings,
  filterMonth: string,
  filterYear: number,
  departmentFilter: 'all' | 'IT' | 'SMM' = 'all',
  profileFilter: 'all' | SalesProfileCode = 'all',
  rewardLevelFilter: string = 'all',
  searchQuery: string = ''
): {
  items: SalesLeaderboardItem[];
  top3: SalesLeaderboardItem[];
  winner?: SalesLeaderboardItem;
} {
  // 1. Filter active records for month and year
  const activeRecords = records.filter(
    (r) => r.month.toLowerCase() === filterMonth.toLowerCase() && Number(r.year) === Number(filterYear)
  );

  // Map employee avatars & details
  const empMap = new Map<string, SalesEmployee>();
  employees.forEach((e) => empMap.set(e.id, e));

  // 2. Build complete list of items
  let items: SalesLeaderboardItem[] = activeRecords.map((rec) => {
    const emp = empMap.get(rec.employeeId);
    const config = getProfileSettings(settings, rec.profileCode);

    const reachoutAchievementPct = config.reachoutTarget > 0 ? Number(((rec.totalReachout / config.reachoutTarget) * 100).toFixed(1)) : 0;
    const orderAchievementPct = config.orderConvertTarget > 0 ? Number(((rec.orderConvert / config.orderConvertTarget) * 100).toFixed(1)) : 0;
    const repeatAchievementPct = config.repeatOrdersTarget > 0 ? Number(((rec.repeatOrders / config.repeatOrdersTarget) * 100).toFixed(1)) : 0;
    const followupAchievementPct = config.followupTarget > 0 ? Number(((rec.followupSent / config.followupTarget) * 100).toFixed(1)) : 0;

    let performanceBand: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' = 'Needs Improvement';
    if (rec.totalPerformanceScore >= 90) performanceBand = 'Excellent';
    else if (rec.totalPerformanceScore >= 75) performanceBand = 'Very Good';
    else if (rec.totalPerformanceScore >= 60) performanceBand = 'Good';

    return {
      ...rec,
      rank: 0,
      avatarUrl: emp?.avatarUrl,
      joiningDate: emp?.joiningDate,
      reachoutAchievementPct,
      orderAchievementPct,
      repeatAchievementPct,
      followupAchievementPct,
      performanceBand,
    };
  });

  // 3. Multi-Tier Sorting Rule:
  // 1. Performance Score desc
  // 2. Conversion Rate desc
  // 3. Order Convert desc
  // 4. Repeat Orders desc
  // 5. Total Reachout desc
  items.sort((a, b) => {
    if (Math.abs(b.totalPerformanceScore - a.totalPerformanceScore) > 0.001) {
      return b.totalPerformanceScore - a.totalPerformanceScore;
    }
    if (Math.abs(b.conversionRate - a.conversionRate) > 0.001) {
      return b.conversionRate - a.conversionRate;
    }
    if (b.orderConvert !== a.orderConvert) {
      return b.orderConvert - a.orderConvert;
    }
    if (b.repeatOrders !== a.repeatOrders) {
      return b.repeatOrders - a.repeatOrders;
    }
    return b.totalReachout - a.totalReachout;
  });

  // 4. Assign ranks
  let currentRank = 1;
  items.forEach((item, index) => {
    if (index > 0) {
      const prev = items[index - 1];
      const isTie =
        Math.abs(prev.totalPerformanceScore - item.totalPerformanceScore) < 0.001 &&
        Math.abs(prev.conversionRate - item.conversionRate) < 0.001 &&
        prev.orderConvert === item.orderConvert &&
        prev.repeatOrders === item.repeatOrders;

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

  // 5. Apply filters
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
 * 8. Calculate Sales Dashboard Summary & Highlights
 */
export function calculateSalesDashboardSummary(
  employees: SalesEmployee[],
  records: SalesPerformanceRecord[],
  settings: SalesRewardSettings,
  month: string,
  year: number
): SalesDashboardSummary {
  const currentRecords = records.filter(
    (r) => r.month.toLowerCase() === month.toLowerCase() && Number(r.year) === Number(year)
  );

  const leaderboardResult = calculateSalesLeaderboard(employees, currentRecords, settings, month, year);
  const items = leaderboardResult.items;

  let totalReachout = 0;
  let totalOrders = 0;
  let totalRepeatOrders = 0;
  let totalFollowups = 0;
  let totalScoreSum = 0;
  let totalRewards = 0;
  let eligibleCount = 0;

  items.forEach((item) => {
    totalReachout += item.totalReachout;
    totalOrders += item.orderConvert;
    totalRepeatOrders += item.repeatOrders;
    totalFollowups += item.followupSent;
    totalScoreSum += item.totalPerformanceScore;
    totalRewards += item.rewardAmount;
    if (item.rewardEligibility === 'Eligible' && item.rewardAmount > 0) {
      eligibleCount++;
    }
  });

  const overallConversionRate = totalReachout > 0 ? Number(((totalOrders / totalReachout) * 100).toFixed(2)) : 0;
  const avgScore = items.length > 0 ? Number((totalScoreSum / items.length).toFixed(2)) : 0;

  // Highlights
  const topSalesPerformer = items[0];
  const topItPerformer = items.find((i) => i.department === 'IT');
  const topSmmPerformer = items.find((i) => i.department === 'SMM');

  const highestConversionPerformer = items.slice().sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const highestRepeatOrdersPerformer = items.slice().sort((a, b) => b.repeatOrders - a.repeatOrders)[0];
  const highestReachoutPerformer = items.slice().sort((a, b) => b.totalReachout - a.totalReachout)[0];
  const highestFollowupPerformer = items.slice().sort((a, b) => b.followupSent - a.followupSent)[0];

  return {
    totalEmployees: employees.filter((e) => e.status === 'active').length,
    totalReachout,
    totalOrders,
    totalRepeatOrders,
    totalFollowups,
    overallConversionRate,
    avgScore,
    totalRewards,
    eligibleCount,
    topSalesPerformer,
    topItPerformer,
    topSmmPerformer,
    highestConversionPerformer,
    highestRepeatOrdersPerformer,
    highestReachoutPerformer,
    highestFollowupPerformer,
  };
}

/**
 * 9. Calculate Profile Performance Breakdown
 */
export function getProfilePerformance(
  records: SalesPerformanceRecord[],
  employees: SalesEmployee[],
  profileCode: SalesProfileCode,
  settings: SalesRewardSettings
): SalesProfileSummary {
  const config = getProfileSettings(settings, profileCode);
  const profileRecords = records.filter((r) => r.profileCode === profileCode);
  const profileEmployees = employees.filter((e) => e.profileCode === profileCode && e.status === 'active');

  let totalReachout = 0;
  let totalOrders = 0;
  let totalRepeatOrders = 0;
  let totalFollowups = 0;
  let scoreSum = 0;
  let totalRewards = 0;
  let eligibleCount = 0;

  profileRecords.forEach((r) => {
    totalReachout += r.totalReachout;
    totalOrders += r.orderConvert;
    totalRepeatOrders += r.repeatOrders;
    totalFollowups += r.followupSent;
    scoreSum += r.totalPerformanceScore;
    totalRewards += r.rewardAmount;
    if (r.rewardEligibility === 'Eligible') eligibleCount++;
  });

  const count = profileRecords.length;
  const avgReachout = count > 0 ? Number((totalReachout / count).toFixed(1)) : 0;
  const avgOrders = count > 0 ? Number((totalOrders / count).toFixed(1)) : 0;
  const avgRepeatOrders = count > 0 ? Number((totalRepeatOrders / count).toFixed(1)) : 0;
  const avgFollowups = count > 0 ? Number((totalFollowups / count).toFixed(1)) : 0;
  const avgConversionRate = totalReachout > 0 ? Number(((totalOrders / totalReachout) * 100).toFixed(2)) : 0;
  const avgScore = count > 0 ? Number((scoreSum / count).toFixed(2)) : 0;

  return {
    profileCode,
    profileName: config.profileName,
    department: config.department,
    employeeCount: profileEmployees.length,
    totalReachout,
    totalOrders,
    totalRepeatOrders,
    totalFollowups,
    avgReachout,
    avgOrders,
    avgRepeatOrders,
    avgFollowups,
    avgConversionRate,
    avgScore,
    totalRewards,
    eligibleEmployeesCount: eligibleCount,
  };
}

/**
 * 10. Calculate Department Performance Breakdown (IT vs SMM)
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
  let totalOrders = 0;
  let totalRepeatOrders = 0;
  let totalFollowups = 0;
  let scoreSum = 0;
  let totalRewards = 0;

  deptRecords.forEach((r) => {
    totalReachout += r.totalReachout;
    totalOrders += r.orderConvert;
    totalRepeatOrders += r.repeatOrders;
    totalFollowups += r.followupSent;
    scoreSum += r.totalPerformanceScore;
    totalRewards += r.rewardAmount;
  });

  const overallConversionRate = totalReachout > 0 ? Number(((totalOrders / totalReachout) * 100).toFixed(2)) : 0;
  const avgScore = deptRecords.length > 0 ? Number((scoreSum / deptRecords.length).toFixed(2)) : 0;

  return {
    department,
    employeeCount: deptEmployees.length,
    totalReachout,
    totalOrders,
    totalRepeatOrders,
    totalFollowups,
    overallConversionRate,
    avgScore,
    totalRewards,
    profiles,
  };
}

/**
 * 11. Calculate Monthly History & Month-over-Month Comparison for an Employee
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
      orderChange = r.orderConvert - prev.orderConvert;
      repeatOrderChange = r.repeatOrders - prev.repeatOrders;
    }

    history.push({
      month: r.month,
      year: r.year,
      score: r.totalPerformanceScore,
      conversionRate: r.conversionRate,
      orders: r.orderConvert,
      repeatOrders: r.repeatOrders,
      reachouts: r.totalReachout,
      followups: r.followupSent,
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
