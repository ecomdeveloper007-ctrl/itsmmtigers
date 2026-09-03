import { ProfileCode } from './index';

export type SalesDepartment = 'IT' | 'SMM';

// IT: PR, WR, HW; SMM: DR, RR
export type SalesProfileCode = 'PR' | 'WR' | 'HW' | 'DR' | 'RR';

export interface SalesProfileMeta {
  code: SalesProfileCode;
  name: string;
  department: SalesDepartment;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const SALES_PROFILES_META: Record<SalesProfileCode, SalesProfileMeta> = {
  PR: {
    code: 'PR',
    name: 'PR Profile (Solutions & Product Delivery)',
    department: 'IT',
    description: 'IT PR, Client Solutions & Product Delivery',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  WR: {
    code: 'WR',
    name: 'WR Profile (Web Architecture & Eng)',
    department: 'IT',
    description: 'IT Web Architecture & Full-Stack Sales',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  HW: {
    code: 'HW',
    name: 'HW Profile (Cloud & Infrastructure)',
    department: 'IT',
    description: 'IT Hardware, Cloud & Infra Solutions',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  DR: {
    code: 'DR',
    name: 'DR Profile (Direct Response & Ads)',
    department: 'SMM',
    description: 'SMM Direct Response & Performance Sales',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
  RR: {
    code: 'RR',
    name: 'RR Profile (Retainers & Growth)',
    department: 'SMM',
    description: 'SMM Brand Retainers & Long-Term Contracts',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
};

export interface SalesEmployee {
  id: string;
  userId?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department: SalesDepartment;
  profileCode?: SalesProfileCode; // primary / backward compatibility
  assignedProfiles: SalesProfileCode[]; // Support multiple assigned profiles
  moduleAssignment?: 'pm' | 'sales' | 'both';
  joiningDate: string;
  status: 'active' | 'inactive';
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesRewardSlabConfig {
  id: string;
  level: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'No Reward' | string;
  minScore: number; // e.g. 90
  maxScore: number; // e.g. 100
  rewardAmount: number; // e.g. 5000 (INR)
  color?: string;
}

export type SalesRewardSlab = SalesRewardSlabConfig;

export interface SalesProfileTargetConfig {
  profileCode: SalesProfileCode;
  profileName: string;
  department: SalesDepartment;

  // Profile-specific targets
  conversionTarget: number; // e.g. 10 (10%)
  followupTarget: number; // e.g. 100
  orderValueTarget: number; // e.g. 100000 (₹1,00,000)
  reachoutBenchmark: number; // e.g. 200 (optional benchmark, purely activity, 0% score weight)

  targetConversionRate?: number;
  targetFollowups?: number;
  targetOrderValue?: number;
  followupsWeight?: number;

  // Scoring Weights (Must total 100%)
  conversionWeight: number; // default 50%
  followupWeight: number; // default 20%
  orderValueWeight: number; // default 30%
  reachoutWeight: number; // strictly 0%

  // Backward compatibility optional fields
  reachoutTarget?: number;
  orderConvertTarget?: number;
  repeatOrdersTarget?: number;
  orderConvertWeight?: number;
  repeatOrdersWeight?: number;
  minConversionRate?: number;

  // Reward slabs
  rewardSlabs: SalesRewardSlabConfig[];
}

export interface SalesRewardSettings {
  currency: string; // 'INR'
  currencySymbol: string; // '₹'
  profiles: Record<SalesProfileCode, SalesProfileTargetConfig>;
  updatedAt?: string;
}

export interface SalesPerformanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: SalesDepartment;
  profileCode: SalesProfileCode;

  // Weekly Association
  week: string; // e.g. 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'
  weekStartDate?: string; // e.g. '2026-09-01'
  weekEndDate?: string; // e.g. '2026-09-07'
  month: string; // e.g. 'September'
  year: number; // e.g. 2026
  monthYearKey: string; // 'September 2026'

  // Raw Weekly Performance Inputs
  reachouts: number; // Activity metric (0% weight)
  conversions: number; // Converted orders
  followups: number; // Follow-up messages / calls
  orderValue: number; // Total order value in INR (₹)

  // Backward compatibility alias mappings
  totalReachout?: number;
  orderConvert?: number;
  followupSent?: number;
  repeatOrders?: number;

  managerRemarks?: string;

  // Auto-calculated Metrics (Profile-Specific)
  conversionRate: number; // (conversions / reachouts) * 100
  conversionScore: number; // MIN(conversionRate / conversionTarget, 1) * conversionWeight
  followupScore: number; // MIN(followups / followupTarget, 1) * followupWeight
  orderValueScore: number; // MIN(orderValue / orderValueTarget, 1) * orderValueWeight
  totalPerformanceScore: number; // conversionScore + followupScore + orderValueScore (Max 100)

  // Backward-compatibility score fields
  reachoutScore?: number; // 0
  orderConvertScore?: number;
  repeatOrdersScore?: number;

  // Reward Status & Output
  rewardEligibility: 'Eligible' | 'Not Eligible';
  ineligibilityReason?: string;
  rewardLevel: string; // 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'No Reward'
  rewardAmount: number; // in INR (₹)

  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLeaderboardItem extends SalesPerformanceRecord {
  rank: number;
  isTie?: boolean;
  avatarUrl?: string;
  assignedProfiles?: SalesProfileCode[];
  joiningDate?: string;
  // Progress indicators
  conversionAchievementPct: number;
  followupAchievementPct: number;
  orderValueAchievementPct: number;
  reachoutBenchmarkPct?: number;
  reachoutAchievementPct?: number;
  orderAchievementPct?: number;
  repeatAchievementPct?: number;
  performanceBand: 'Platinum Tier' | 'Gold Tier' | 'Silver Tier' | 'Bronze Tier' | 'Developing';
}

export interface SalesProfileSummary {
  profileCode: SalesProfileCode;
  profileName: string;
  department: SalesDepartment;
  employeeCount: number;
  totalReachout: number;
  totalConversions: number;
  totalFollowups: number;
  totalOrderValue: number;
  avgReachout: number;
  avgConversions: number;
  avgFollowups: number;
  avgOrderValue: number;
  conversionRate: number;
  avgConversionRate?: number;
  avgOrders?: number;
  avgRepeatOrders?: number;
  avgScore: number;
  totalRewards: number;
  eligibleEmployeesCount: number;
}

export interface SalesDepartmentSummary {
  department: SalesDepartment;
  employeeCount: number;
  totalReachout: number;
  totalConversions: number;
  totalFollowups: number;
  totalOrderValue: number;
  overallConversionRate: number;
  avgScore: number;
  totalRewards: number;
  profiles: SalesProfileSummary[];
}

export interface SalesDashboardSummary {
  totalEmployees: number;
  itEmployeesCount: number;
  smmEmployeesCount: number;
  totalReachouts: number;
  totalConversions: number;
  overallConversionRate: number;
  totalFollowups: number;
  totalOrderValue: number;
  avgScore: number;
  totalRewards: number;
  eligibleCount: number;

  // Highlights
  topSalesPerformer?: SalesLeaderboardItem;
  topItPerformer?: SalesLeaderboardItem;
  topSmmPerformer?: SalesLeaderboardItem;
  highestConversionPerformer?: SalesLeaderboardItem;
  highestOrderValuePerformer?: SalesLeaderboardItem;
  highestFollowupPerformer?: SalesLeaderboardItem;
  highestReachoutPerformer?: SalesLeaderboardItem;
}

export interface SalesAuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'profile' | 'employee' | 'record' | 'target' | 'settings' | 'user';
  entityId: string;
  details: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface SalesEmployeeHistoryComparison {
  month: string;
  year: number;
  score: number;
  totalPerformanceScore?: number;
  conversionRate: number;
  orders: number;
  orderConvert?: number;
  repeatOrders: number;
  followups?: number;
  followupSent?: number;
  reachouts?: number;
  totalReachout?: number;
  rewardAmount: number;
  rewardLevel: string;
  eligibility: string;
  scoreChange?: number;
  conversionChange?: number;
  orderChange?: number;
  repeatOrderChange?: number;
  orderValue?: number;
}

export interface SalesMonthlyAggregation {
  employeeId: string;
  employeeName: string;
  department: SalesDepartment;
  profileCode: SalesProfileCode;
  month: string;
  year: number;
  monthYearKey: string;
  weeksCount: number;
  totalReachouts: number;
  totalConversions: number;
  conversionRate: number;
  totalFollowups: number;
  totalOrderValue: number;
  avgWeeklyScore: number;
  monthlyPerformanceScore: number;
  rewardLevel: string;
  rewardAmount: number;
  weeklyRecords: SalesPerformanceRecord[];
}
