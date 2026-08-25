import {
  KPIConfig,
  PerformanceRecord,
  KPIScoreBreakdown,
  MemberPerformanceSummary,
  UserProfile,
  AppSettings,
  LeaderboardData,
} from '../types';

/**
 * Standard default KPIs for IT SMM Tigers
 */
export const DEFAULT_KPIS: KPIConfig[] = [
  {
    id: 'kpi_projects',
    name: 'Project Closed',
    key: 'projectClosed',
    weight: 20,
    defaultTarget: 25,
    unit: 'Projects',
    min: 0,
    active: true,
    order: 1,
  },
  {
    id: 'kpi_revenue',
    name: 'Revenue Generated',
    key: 'revenueGenerated',
    weight: 30,
    defaultTarget: 10000,
    unit: '$',
    isCurrency: true,
    min: 0,
    active: true,
    order: 2,
  },
  {
    id: 'kpi_upsells',
    name: 'Upsells',
    key: 'upsells',
    weight: 15,
    defaultTarget: 10,
    unit: 'Upsells',
    min: 0,
    active: true,
    order: 3,
  },
  {
    id: 'kpi_rating',
    name: 'Client Rating',
    key: 'clientRating',
    weight: 10,
    defaultTarget: 5,
    unit: '★',
    isRating: true,
    min: 0,
    max: 5,
    active: true,
    order: 4,
  },
  {
    id: 'kpi_followup',
    name: 'Follow-up Completed',
    key: 'followupsCompleted',
    weight: 10,
    defaultTarget: 50,
    unit: 'Follow-ups',
    min: 0,
    active: true,
    order: 5,
  },
  {
    id: 'kpi_repeat',
    name: 'Repeat Clients',
    key: 'repeatClients',
    weight: 15,
    defaultTarget: 10,
    unit: 'Clients',
    min: 0,
    active: true,
    order: 6,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  applicationName: 'IT SMM Tigers',
  currency: 'USD',
  currencySymbol: '$',
  scoreDecimalPlaces: 2,
  achievementCap: 100,
  excellenceThreshold: 90,
  veryGoodThreshold: 75,
  goodThreshold: 60,
  allowMemberEditPastWeeks: false,
  branding: {
    tagline: 'Rewards & Recognition Platform',
    primaryColor: '#F97316',
  },
};

/**
 * Safely parse any input value to a non-negative number.
 * Empty, null, undefined, or invalid inputs become 0.
 */
export function sanitizeNumber(value: any, isRating = false): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = Number(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  if (parsed < 0) {
    return 0;
  }
  if (isRating && parsed > 5) {
    return 5;
  }
  return parsed;
}

/**
 * Calculate Achievement Percentage for a KPI
 * Formula: MIN((actual / target) * 100, achievementCap)
 */
export function calculateAchievementPercentage(
  actual: number,
  target: number,
  cap: number = 100
): { capped: number; raw: number } {
  const cleanActual = sanitizeNumber(actual);
  const cleanTarget = sanitizeNumber(target);

  if (cleanTarget <= 0) {
    // If target is 0 and actual is > 0, consider 100% achieved, else 0%
    return {
      capped: cleanActual > 0 ? cap : 0,
      raw: cleanActual > 0 ? 100 : 0,
    };
  }

  const raw = (cleanActual / cleanTarget) * 100;
  const capped = Math.min(raw, cap);

  return {
    capped: Math.max(0, capped),
    raw: Math.max(0, raw),
  };
}

/**
 * Calculate KPI Score
 * Formula: Score = Achievement % * KPI Weight / 100
 */
export function calculateKPIScore(
  achievementPercentage: number,
  weight: number
): number {
  const cleanAch = sanitizeNumber(achievementPercentage);
  const cleanWeight = sanitizeNumber(weight);
  return (cleanAch * cleanWeight) / 100;
}

/**
 * Aggregate weekly records for a member in a given period/month
 */
export function aggregateMemberRecords(
  records: PerformanceRecord[],
  kpis: KPIConfig[] = DEFAULT_KPIS,
  settings: AppSettings = DEFAULT_SETTINGS
): {
  totals: {
    projectClosed: number;
    revenueGenerated: number;
    upsells: number;
    clientRating: number;
    followupsCompleted: number;
    repeatClients: number;
  };
  weeksSubmitted: number;
  breakdown: Record<string, KPIScoreBreakdown>;
  finalScore: number;
  finalScoreDisplay: string;
  overallAchievement: number;
} {
  let projectClosed = 0;
  let revenueGenerated = 0;
  let upsells = 0;
  let followupsCompleted = 0;
  let repeatClients = 0;

  // For ratings: calculate true average of entered non-empty ratings
  const ratings: number[] = [];

  records.forEach((rec) => {
    projectClosed += sanitizeNumber(rec.projectClosed);
    revenueGenerated += sanitizeNumber(rec.revenueGenerated);
    upsells += sanitizeNumber(rec.upsells);
    followupsCompleted += sanitizeNumber(rec.followupsCompleted);
    repeatClients += sanitizeNumber(rec.repeatClients);

    const rating = sanitizeNumber(rec.clientRating, true);
    if (rating > 0) {
      ratings.push(rating);
    } else if (rec.clientRating !== undefined && rec.clientRating !== null) {
      // 0 explicitly entered
      ratings.push(0);
    }
  });

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const totals = {
    projectClosed,
    revenueGenerated,
    upsells,
    clientRating: avgRating,
    followupsCompleted,
    repeatClients,
  };

  const breakdown: Record<string, KPIScoreBreakdown> = {};
  let totalScore = 0;
  let totalAch = 0;
  let activeKpiCount = 0;

  const activeKPIs = kpis.filter((k) => k.active);

  activeKPIs.forEach((kpi) => {
    let actual = 0;
    switch (kpi.key) {
      case 'projectClosed':
        actual = totals.projectClosed;
        break;
      case 'revenueGenerated':
        actual = totals.revenueGenerated;
        break;
      case 'upsells':
        actual = totals.upsells;
        break;
      case 'clientRating':
        actual = totals.clientRating;
        break;
      case 'followupsCompleted':
        actual = totals.followupsCompleted;
        break;
      case 'repeatClients':
        actual = totals.repeatClients;
        break;
      default:
        actual = 0;
    }

    const { capped, raw } = calculateAchievementPercentage(
      actual,
      kpi.defaultTarget,
      settings.achievementCap
    );

    const score = calculateKPIScore(capped, kpi.weight);
    totalScore += score;
    totalAch += capped;
    activeKpiCount++;

    breakdown[kpi.id] = {
      kpiId: kpi.id,
      kpiName: kpi.name,
      actual,
      target: kpi.defaultTarget,
      weight: kpi.weight,
      achievementPercentage: capped,
      rawAchievementPercentage: raw,
      score,
    };
  });

  const decimals = settings.scoreDecimalPlaces ?? 2;
  const finalScoreDisplay = totalScore.toFixed(decimals);
  const overallAchievement =
    activeKpiCount > 0 ? totalAch / activeKpiCount : 0;

  return {
    totals,
    weeksSubmitted: records.length,
    breakdown,
    finalScore: totalScore,
    finalScoreDisplay,
    overallAchievement,
  };
}

/**
 * Determine performance rating band
 */
export function getPerformanceBand(
  score: number,
  settings: AppSettings = DEFAULT_SETTINGS
): 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' {
  if (score >= settings.excellenceThreshold) return 'Excellent';
  if (score >= settings.veryGoodThreshold) return 'Very Good';
  if (score >= settings.goodThreshold) return 'Good';
  return 'Needs Improvement';
}

/**
 * Validate KPI weights equal exactly 100%
 */
export function validateKPIWeights(kpis: KPIConfig[]): {
  isValid: boolean;
  totalWeight: number;
  message?: string;
} {
  const activeKPIs = kpis.filter((k) => k.active);
  const total = activeKPIs.reduce(
    (sum, k) => sum + (Number(k.weight) || 0),
    0
  );

  // Handle minor floating point precision
  const roundedTotal = Math.round(total * 100) / 100;
  const isValid = Math.abs(roundedTotal - 100) < 0.001;

  return {
    isValid,
    totalWeight: roundedTotal,
    message: isValid ? undefined : 'Total KPI weight must equal 100%.',
  };
}

/**
 * Calculate full Leaderboard with multi-tier tie-breakers:
 * 1. Final Score DESC
 * 2. Higher Revenue DESC
 * 3. Higher Repeat Clients DESC
 * 4. Higher Client Rating DESC
 * 5. Higher Projects Closed DESC
 */
export function calculateLeaderboard(
  users: UserProfile[],
  records: PerformanceRecord[],
  kpis: KPIConfig[] = DEFAULT_KPIS,
  settings: AppSettings = DEFAULT_SETTINGS,
  filterMonth?: string,
  filterYear?: number,
  filterPeriodId?: string
): LeaderboardData {
  // Only include active team members (and admins if they have records)
  const eligibleUsers = users.filter(
    (u) => u.status === 'active' && u.role === 'team_member'
  );

  const summaries: MemberPerformanceSummary[] = eligibleUsers.map((user) => {
    // Filter records for this user
    let userRecords = records.filter((r) => r.userId === user.uid || r.userId === user.userId);

    if (filterMonth) {
      userRecords = userRecords.filter((r) => r.month.toLowerCase() === filterMonth.toLowerCase());
    }
    if (filterYear) {
      userRecords = userRecords.filter((r) => r.year === filterYear);
    }
    if (filterPeriodId && filterPeriodId !== 'all') {
      userRecords = userRecords.filter((r) => r.periodId === filterPeriodId);
    }

    const {
      totals,
      weeksSubmitted,
      breakdown,
      finalScore,
      finalScoreDisplay,
      overallAchievement,
    } = aggregateMemberRecords(userRecords, kpis, settings);

    return {
      userId: user.uid || user.userId,
      userName: user.name,
      userRole: user.role,
      userStatus: user.status,
      avatarUrl: user.avatarUrl,
      month: filterMonth || 'August',
      year: filterYear || 2026,
      periodId: filterPeriodId,
      projectClosed: totals.projectClosed,
      revenueGenerated: totals.revenueGenerated,
      upsells: totals.upsells,
      clientRating: totals.clientRating,
      followupsCompleted: totals.followupsCompleted,
      repeatClients: totals.repeatClients,
      weeksSubmitted,
      breakdown,
      finalScore,
      finalScoreDisplay,
      achievementPercentage: overallAchievement,
      rank: 0,
      performanceBand: getPerformanceBand(finalScore, settings),
    };
  });

  // Sort by tie-breaker rules
  summaries.sort((a, b) => {
    // 1. Final Score DESC (with float precision)
    const scoreDiff = b.finalScore - a.finalScore;
    if (Math.abs(scoreDiff) > 0.0001) {
      return scoreDiff;
    }
    // 2. Higher Revenue DESC
    if (b.revenueGenerated !== a.revenueGenerated) {
      return b.revenueGenerated - a.revenueGenerated;
    }
    // 3. Higher Repeat Clients DESC
    if (b.repeatClients !== a.repeatClients) {
      return b.repeatClients - a.repeatClients;
    }
    // 4. Higher Client Rating DESC
    if (b.clientRating !== a.clientRating) {
      return b.clientRating - a.clientRating;
    }
    // 5. Higher Projects Closed DESC
    if (b.projectClosed !== a.projectClosed) {
      return b.projectClosed - a.projectClosed;
    }
    return 0;
  });

  // Assign ranks & check for true ties
  let currentRank = 1;
  for (let i = 0; i < summaries.length; i++) {
    if (i > 0) {
      const prev = summaries[i - 1];
      const curr = summaries[i];
      const isIdentical =
        Math.abs(curr.finalScore - prev.finalScore) < 0.0001 &&
        curr.revenueGenerated === prev.revenueGenerated &&
        curr.repeatClients === prev.repeatClients &&
        curr.clientRating === prev.clientRating &&
        curr.projectClosed === prev.projectClosed;

      if (isIdentical) {
        curr.rank = prev.rank;
        curr.isTie = true;
        prev.isTie = true;
      } else {
        curr.rank = i + 1;
        currentRank = i + 1;
      }
    } else {
      summaries[i].rank = 1;
    }
  }

  // Calculate team stats
  const totalMembers = summaries.length;
  const totalProjects = summaries.reduce((s, m) => s + m.projectClosed, 0);
  const totalRevenue = summaries.reduce((s, m) => s + m.revenueGenerated, 0);
  const totalUpsells = summaries.reduce((s, m) => s + m.upsells, 0);
  const validRatings = summaries.filter((m) => m.clientRating > 0);
  const avgClientRating =
    validRatings.length > 0
      ? validRatings.reduce((s, m) => s + m.clientRating, 0) / validRatings.length
      : 0;
  const totalFollowups = summaries.reduce((s, m) => s + m.followupsCompleted, 0);
  const totalRepeatClients = summaries.reduce((s, m) => s + m.repeatClients, 0);
  const avgTeamScore =
    totalMembers > 0
      ? summaries.reduce((s, m) => s + m.finalScore, 0) / totalMembers
      : 0;

  const top3 = summaries.slice(0, 3);
  const winner = summaries.length > 0 ? summaries[0] : undefined;

  return {
    month: filterMonth || 'August',
    year: filterYear || 2026,
    periodFilter: filterPeriodId || 'all',
    rankings: summaries,
    winner,
    top3,
    teamStats: {
      totalMembers,
      totalProjects,
      totalRevenue,
      totalUpsells,
      avgClientRating,
      totalFollowups,
      totalRepeatClients,
      avgTeamScore,
    },
  };
}
