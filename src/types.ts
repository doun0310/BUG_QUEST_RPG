export interface VacationRequest {
  id: string;
  userName: string;
  type: '연차' | '월차' | '외근' | '병가';
  startDate: string;
  endDate: string;
  days: number;
  status: '대기' | '승인' | '반려';
  reason: string;
}

export interface TeamMemberCapacity {
  userName: string;
  role: string;
  vacationDays: number;
  totalSprintDays: number;
  workingHoursPerDay: number;
  deepWorkLimitRatio: number;
  availableHours: number;
  assignedHours: number;
  isOverloaded: boolean;
}

export interface WorkloadCapacity {
  totalSprintDays: number;
  workingHoursPerDay: number;
  deepWorkLimitRatio: number; // e.g. 0.7 (70%)
  vacationDays: number;
  availableHours: number;
  assignedHours: number;
  isOverloaded: boolean;
  members: TeamMemberCapacity[];
}

export interface ProjectBudget {
  totalBudget: number;
  spentBudget: number;
  hourlyRate: { [role: string]: number };
  fixedCosts: { id: string; name: string; cost: number; category: string }[];
  burnRateAlert: boolean;
  projectDays: number;
  currentDay: number;
  idealBurnRate: number; // percentage
  actualBurnRate: number; // percentage
}

export interface DevSummary {
  date: string;
  doneToday: string[];
  planTomorrow: string[];
  cautions: string[];
  gitCommitsCount: number;
  pullRequestsMerged: number;
}

export interface HeroSkill {
  id: string;
  name: string;
  icon: string;
  description: string;
  cooldown: number; // in turns
  currentCooldown: number;
  damageMultiplier: number;
}

export interface BugMonster {
  id: string;
  title: string;
  severity: 'Minor' | 'Major' | 'Critical';
  maxHp: number;
  currentHp: number;
  assignee: string;
  rewardXp: number;
  isBoss: boolean;
  status: 'Active' | 'Defeated';
  prUrl?: string;
  defenseTrait?: 'Shield' | 'Dodge' | 'Normal'; // RPG Fun Trait
  traitDescription?: string;
  monsterImage?: string;
  dueDate?: string; // Deadline
  isOverdue?: boolean;
  dialogue?: string;
  postMortem?: {
    category: string;
    rootCause: string;
    actionItem: string;
    createdAt: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  type: '칭호' | '아이템' | '쿠폰';
  icon: string;
  description: string;
  acquiredAt: string;
}

export interface WeeklyRank {
  rank: number;
  userName: string;
  role: string;
  xpEarned: number;
  bugsSlain: number;
  avatar: string;
}

export interface MonthlyWorkloadAnalytics {
  month: string;
  totalCapacityHours: number;
  assignedHours: number;
  overloadCount: number;
}

export interface WebhookPayload {
  id: string;
  eventType: 'pull_request_merged' | 'issue_opened' | 'commit_pushed';
  repository: string;
  author: string;
  branch: string;
  timestamp: string;
  summary: string;
}

export interface DeveloperPet {
  name: string;
  species: '사이버 캣' | '코드 슬라임' | '미니 드래곤';
  level: number;
  xp: number;
  maxXp: number;
  passiveBuff: string;
  icon: string;
}

export interface Equipment {
  name: string;
  enhanceLevel: number;
  statBonus: string;
  icon: string;
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardItem: string;
  isCompleted: boolean;
}

export interface TeamCoopBoss {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  rewardXp: number;
  rewardItem: string;
  participants: { name: string; damageDealt: number }[];
}

export interface SeasonPass {
  seasonName: string;
  currentTier: number;
  maxTier: number;
  passXp: number;
  maxPassXp: number;
  rewardSkin: string;
  isUnlocked: boolean;
}

export interface GuildWar {
  guildA: { name: string; score: number; avatar: string };
  guildB: { name: string; score: number; avatar: string };
  daysLeft: number;
}

export interface DeveloperStats {
  productivity: number; // 공격력
  testCoverage: number; // 방어력
  agility: number; // 민첩성 (SLA 준수)
  codeReview: number; // 지능
}

export interface UserProfile {
  name: string;
  heroClass: '전사 (Frontend)' | '마법사 (Backend)' | '성기사 (QA)';
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  defeatedBugs: number;
  title: string;
  inventory: InventoryItem[];
  activeSkill: HeroSkill;
  streakCount: number;
  pet: DeveloperPet;
  weapon: Equipment;
  stats: DeveloperStats;
  seasonPass: SeasonPass;
}



