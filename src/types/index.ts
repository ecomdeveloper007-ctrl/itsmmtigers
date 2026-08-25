export type UserRole = 'super_admin' | 'admin' | 'team_member';

export type UserStatus = 'active' | 'disabled' | 'pending_approval' | 'rejected';

export type TeamType = 'all' | 'it' | 'smm';

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
  defaultTarget: number;
  unit: string; // e.g. 'projects', '$', 'rating', 'clients', 'upsells'
  isCurrency?: boolean;
  isRating?: boolean;
  min: number;
  max?: number;
  active: boolean;
  order: number;
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
