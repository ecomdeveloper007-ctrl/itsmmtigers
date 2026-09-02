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
  profileCode: SalesProfileCode;
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
  rewardAmount: number; // e.g. 5000 (INR or currency)
  color?: string;
}

export type SalesRewardSlab = SalesRewardSlabConfig;

export interface SalesProfileTargetConfig {
  profileCode: SalesProfileCode;
  profileName: string;
  department: SalesDepartment;
  // Targets
  reachoutTarget: number;
  orderConvertTarget: number;
  repeatOrdersTarget: number;
  followupTarget: number;
  // Weights (Must total 100)
  reachoutWeight: number; // e.g. 20 (20%)
  orderConvertWeight: number; // e.g. 40 (40%)
  repeatOrdersWeight: number; // e.g. 25 (25%)
  followupWeight: number; // e.g. 15 (15%)
  // Eligibility rule
  minConversionRate: number; // e.g. 7 (7%)
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
  month: string; // e.g. 'September'
  year: number; // e.g. 2026
  monthYearKey: string; // 'September 2026'

  // Raw Performance Inputs
  totalReachout: number;
  orderConvert: number;
  repeatOrders: number;
  followupSent: number;
  managerRemarks?: string;

  // Auto-calculated Metrics
  conversionRate: number; // (orderConvert / totalReachout) * 100
  reachoutScore: number; // MIN(totalReachout / reachoutTarget, 1) * reachoutWeight
  orderConvertScore: number; // MIN(orderConvert / orderConvertTarget, 1) * orderConvertWeight
  repeatOrdersScore: number; // MIN(repeatOrders / repeatOrdersTarget, 1) * repeatOrdersWeight
  followupScore: number; // MIN(followupSent / followupTarget, 1) * followupWeight
  totalPerformanceScore: number; // Total sum, max 100

  // Reward Status & Output
  rewardEligibility: 'Eligible' | 'Not Eligible';
  ineligibilityReason?: string;
  rewardLevel: string; // 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'No Reward'
  rewardAmount: number;

  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLeaderboardItem extends SalesPerformanceRecord {
  rank: number;
  isTie?: boolean;
  avatarUrl?: string;
  joiningDate?: string;
  // Progress indicators
  reachoutAchievementPct: number;
  orderAchievementPct: number;
  repeatAchievementPct: number;
  followupAchievementPct: number;
  performanceBand: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
}

export interface SalesProfileSummary {
  profileCode: SalesProfileCode;
  profileName: string;
  department: SalesDepartment;
  employeeCount: number;
  totalReachout: number;
  totalOrders: number;
  totalRepeatOrders: number;
  totalFollowups: number;
  avgReachout: number;
  avgOrders: number;
  avgRepeatOrders: number;
  avgFollowups: number;
  avgConversionRate: number;
  avgScore: number;
  totalRewards: number;
  eligibleEmployeesCount: number;
}

export interface SalesDepartmentSummary {
  department: SalesDepartment;
  employeeCount: number;
  totalReachout: number;
  totalOrders: number;
  totalRepeatOrders: number;
  totalFollowups: number;
  overallConversionRate: number;
  avgScore: number;
  totalRewards: number;
  profiles: SalesProfileSummary[];
}

export interface SalesDashboardSummary {
  totalEmployees: number;
  totalReachout: number;
  totalOrders: number;
  totalRepeatOrders: number;
  totalFollowups: number;
  overallConversionRate: number;
  avgScore: number;
  totalRewards: number;
  eligibleCount: number;

  // Highlights
  topSalesPerformer?: SalesLeaderboardItem;
  topItPerformer?: SalesLeaderboardItem;
  topSmmPerformer?: SalesLeaderboardItem;
  highestConversionPerformer?: SalesLeaderboardItem;
  highestRepeatOrdersPerformer?: SalesLeaderboardItem;
  highestReachoutPerformer?: SalesLeaderboardItem;
  highestFollowupPerformer?: SalesLeaderboardItem;
}

export interface SalesEmployeeHistoryComparison {
  month: string;
  year: number;
  score: number;
  conversionRate: number;
  orders: number;
  repeatOrders: number;
  reachouts: number;
  followups: number;
  rewardAmount: number;
  rewardLevel: string;
  eligibility: 'Eligible' | 'Not Eligible';
  // Deltas against previous month
  scoreChange?: number;
  conversionChange?: number;
  orderChange?: number;
  repeatOrderChange?: number;
}
