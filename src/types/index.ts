export type UserRole = 'super_admin' | 'admin' | 'team_member' | 'viewer';

export type UserStatus = 'active' | 'disabled' | 'pending_approval' | 'rejected';

export type TeamType = 'all' | 'it' | 'smm';

// IT Team Profile Codes: PR, WR, HW
export type ITProfileCode = 'PR' | 'WR' | 'HW';

// SMM Team Profile Codes: RR, DR
export type SMMProfileCode = 'RR' | 'DR';

export type ProfileCode = ITProfileCode | SMMProfileCode;

export interface ProfileDefinition {
  code: ProfileCode;
  label: string;
  fullName: string;
  title: string;
  team: 'IT' | 'SMM';
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const IT_PROFILES: ProfileDefinition[] = [
  {
    code: 'PR',
    label: 'PR',
    fullName: 'PR Profile',
    title: 'PR Profile',
    team: 'IT',
    description: 'IT PR, Solutions & Product Delivery',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    code: 'WR',
    label: 'WR',
    fullName: 'WR Profile',
    title: 'WR Profile',
    team: 'IT',
    description: 'IT Web Architecture & Engineering',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  {
    code: 'HW',
    label: 'HW',
    fullName: 'HW Profile',
    title: 'HW Profile',
    team: 'IT',
    description: 'IT Hardware, Cloud & Infrastructure',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    borderColor: 'border-indigo-200',
  },
];

export const SMM_PROFILES: ProfileDefinition[] = [
  {
    code: 'RR',
    label: 'RR',
    fullName: 'RR Profile',
    title: 'RR Profile',
    team: 'SMM',
    description: 'SMM Retainers & Audience Reach',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  {
    code: 'DR',
    label: 'DR',
    fullName: 'DR Profile',
    title: 'DR Profile',
    team: 'SMM',
    description: 'SMM Direct Response & Conversions',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
];

export const ALL_PROFILES_LIST: ProfileDefinition[] = [...IT_PROFILES, ...SMM_PROFILES];

export const ALL_PROFILES: Record<ProfileCode, ProfileDefinition> = {
  PR: IT_PROFILES[0],
  WR: IT_PROFILES[1],
  HW: IT_PROFILES[2],
  RR: SMM_PROFILES[0],
  DR: SMM_PROFILES[1],
};

export const PROFILE_DEPARTMENT_PRESETS: Record<ProfileCode, string[]> = {
  PR: [
    'IT Solutions & Product Delivery (PR)',
    'IT Client Solutions & Delivery',
    'IT Technical Management (PR)',
    'IT Solutions Engineering',
    'IT Team - PR Profile',
  ],
  WR: [
    'IT Web Architecture & Engineering (WR)',
    'IT Full-Stack Web Development',
    'IT Frontend & Web Systems',
    'IT Web Applications (WR)',
    'IT Team - WR Profile',
  ],
  HW: [
    'IT Hardware & Cloud Infrastructure (HW)',
    'IT DevOps & Cloud Systems',
    'IT Server Operations & Hardware',
    'IT Systems & Infra (HW)',
    'IT Team - HW Profile',
  ],
  RR: [
    'SMM Retainers & Audience Reach (RR)',
    'SMM Social Management & Growth',
    'SMM Brand & Community Retainers',
    'SMM Retainer Strategy (RR)',
    'SMM Team - RR Profile',
  ],
  DR: [
    'SMM Direct Response & Conversions (DR)',
    'SMM Performance Marketing & Ads',
    'SMM Paid Acquisition & Funnels',
    'SMM Conversion Optimization (DR)',
    'SMM Team - DR Profile',
  ],
};

export function getDefaultDepartmentForProfile(profileCode: ProfileCode): string {
  return PROFILE_DEPARTMENT_PRESETS[profileCode]?.[0] || `${profileCode} Profile`;
}

export function getAllDepartmentPresets(): { profileCode: ProfileCode; team: 'IT' | 'SMM'; department: string }[] {
  const result: { profileCode: ProfileCode; team: 'IT' | 'SMM'; department: string }[] = [];
  (['PR', 'WR', 'HW', 'RR', 'DR'] as ProfileCode[]).forEach((code) => {
    const team: 'IT' | 'SMM' = ['PR', 'WR', 'HW'].includes(code) ? 'IT' : 'SMM';
    (PROFILE_DEPARTMENT_PRESETS[code] || []).forEach((dept) => {
      result.push({ profileCode: code, team, department: dept });
    });
  });
  return result;
}

export interface UserProfile {
  uid: string;
  userId: string; // e.g., 'prakash.choudhary' or 'divya.bhardwaj'
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  avatarUrl?: string;
  department?: string;
  team?: 'IT' | 'SMM' | 'Operations' | 'Leadership';
  profileCode?: ProfileCode;
  joiningDate?: string;
  lastLogin?: string;
  registrationNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIConfig {
  id: string;
  name: string;
  key: string;
  weight: number; // e.g. 20 for 20%
  defaultTarget: number; // default monthly target
  weeklyTarget?: number; // default weekly target (e.g. defaultTarget / 4)
  itMonthlyTarget?: number; // target for IT team
  smmMonthlyTarget?: number; // target for SMM team
  itWeeklyTarget?: number; // weekly target for IT team
  smmWeeklyTarget?: number; // weekly target for SMM team
  unit: string; // e.g. 'projects', '$', 'rating', 'clients', 'upsells'
  isCurrency?: boolean;
  isRating?: boolean;
  min: number;
  max?: number;
  active: boolean;
  order: number;
  periodTargets?: Record<string, number>; // key: "month_August_2026" or "period_2026-08-w1" or "week_August_2026_Week 1"
}

export type PeriodStatus = 'active' | 'locked' | 'completed';

export interface PerformancePeriod {
  id: string; // e.g., '2026-08-w1' or generated
  month: string; // e.g., 'August'
  year: number; // e.g., 2026
  weekName: string; // e.g., 'Week 1', 'Week 2', 'Week 3', 'Week 4'
  weekNumber: number; // 1, 2, 3, 4, 5...
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  createdAt: string;
}

export interface PerformanceRecord {
  id: string;
  userId: string;
  userName: string;
  periodId: string;
  month: string;
  year: number;
  weekName: string;
  profileCode?: ProfileCode;
  projectClosed: number;
  revenueGenerated: number;
  upsells: number;
  clientRating: number;
  followupsCompleted: number;
  repeatClients: number;
  notes?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIScoreBreakdown {
  kpiId: string;
  kpiName: string;
  actual: number;
  target: number;
  weight: number;
  achievementPercentage: number; // Capped at 100%
  rawAchievementPercentage: number; // Before capping
  score: number;
}

export interface MemberPerformanceSummary {
  userId: string;
  userName: string;
  userRole: UserRole;
  userStatus: UserStatus;
  avatarUrl?: string;
  department?: string;
  team?: 'IT' | 'SMM' | 'Operations' | 'Leadership';
  profileCode?: ProfileCode;
  month: string;
  year: number;
  periodId?: string; // If filtered by specific week
  // Aggregated totals
  projectClosed: number;
  revenueGenerated: number;
  upsells: number;
  clientRating: number; // Average rating
  followupsCompleted: number;
  repeatClients: number;
  // Submissions count
  weeksSubmitted: number;
  // Calculated metrics
  breakdown: Record<string, KPIScoreBreakdown>;
  finalScore: number; // Exact float
  finalScoreDisplay: string; // e.g., "68.02"
  achievementPercentage: number; // Overall average achievement %
  rank: number;
  teamRank?: number;
  isTie?: boolean;
  performanceBand: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
}

export interface TeamStatsSummary {
  totalMembers: number;
  totalProjects: number;
  totalRevenue: number;
  totalUpsells: number;
  avgClientRating: number;
  totalFollowups: number;
  totalRepeatClients: number;
  avgTeamScore: number;
}

export interface ProfileRevenueItem {
  profileCode: ProfileCode;
  label: string;
  fullName: string;
  team: 'IT' | 'SMM';
  memberCount: number;
  projectCount: number;
  grossRevenue: number;
  platformFeeRate: number; // 0.20 (20%)
  platformFeeAmount: number; // grossRevenue * 0.20
  platformFee: number; // alias for platformFeeAmount
  finalNetRevenue: number; // grossRevenue * 0.80
  netRevenue: number; // alias for finalNetRevenue
  contributionPct: number; // % of team gross revenue
}

export interface TeamRevenueGroup {
  team: 'IT' | 'SMM';
  teamName: string;
  memberCount: number;
  activeMembers: number; // alias for memberCount
  projectCount: number;
  totalProjects: number; // alias for projectCount
  grossRevenue: number;
  platformFeeRate: number; // 0.20
  platformFeeAmount: number;
  platformFee: number; // alias for platformFeeAmount
  finalNetRevenue: number;
  netRevenue: number; // alias for finalNetRevenue
  profiles: ProfileRevenueItem[];
}

export interface MonthEndRevenueSummary {
  platformFeePercent: number; // 20
  totalGrossRevenue: number;
  totalPlatformFee: number;
  totalNetRevenue: number;
  itTeam: TeamRevenueGroup;
  smmTeam: TeamRevenueGroup;
  itRevenue: TeamRevenueGroup;
  smmRevenue: TeamRevenueGroup;
  grandTotal: {
    memberCount: number;
    projectCount: number;
    grossRevenue: number;
    platformFeeRate: number;
    platformFeeAmount: number;
    finalNetRevenue: number;
  };
  profiles: Record<ProfileCode, ProfileRevenueItem>;
  profileBreakdown: Record<ProfileCode, ProfileRevenueItem>;
}

export interface LeaderboardData {
  month: string;
  year: number;
  periodFilter: string; // 'all' or periodId
  teamFilter: TeamType;
  rankings: MemberPerformanceSummary[];
  winner?: MemberPerformanceSummary;
  top3: MemberPerformanceSummary[];
  teamStats: TeamStatsSummary;
  itTeamStats?: TeamStatsSummary;
  smmTeamStats?: TeamStatsSummary;
  itRankings?: MemberPerformanceSummary[];
  smmRankings?: MemberPerformanceSummary[];
  itWinner?: MemberPerformanceSummary;
  smmWinner?: MemberPerformanceSummary;
  revenueSummary?: MonthEndRevenueSummary;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'performance' | 'kpi' | 'user' | 'period' | 'settings';
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface AppSettings {
  applicationName: string;
  currency: string;
  currencySymbol: string;
  scoreDecimalPlaces: number;
  achievementCap: number; // default 100
  excellenceThreshold: number; // default 90
  veryGoodThreshold: number; // default 75
  goodThreshold: number; // default 60
  allowMemberEditPastWeeks: boolean;
  branding: {
    tagline: string;
    primaryColor: string;
  };
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
