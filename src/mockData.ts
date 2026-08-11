import type { VacationRequest, WorkloadCapacity, ProjectBudget, DevSummary, BugMonster, UserProfile, TeamMemberCapacity, WeeklyRank, WebhookPayload, WeeklyQuest, TeamCoopBoss } from './types';

// Image assets generated
export const DQ_SLIME_IMG = '/dq_style_slime.jpg';
export const DQ_DRAGON_IMG = '/dq_style_dragon.jpg';
export const CYBER_BUG_IMG = '/cyber_bug.jpg';
export const SHADOW_BOSS_IMG = '/shadow_boss.jpg';
export const PIXEL_SLIME_IMG = '/pixel_slime.jpg';
export const CYBER_GOLEM_IMG = '/cyber_golem.jpg';

export const mockUser: UserProfile = {
  name: '새 개발자',
  heroClass: '전사 (Frontend)',
  devClass: '프론트엔드 마법사',
  skillPoints: 3,
  skillLevels: { shield: 0, transaction: 0, automation: 0 },
  level: 1,
  hp: 100,
  maxHp: 100,
  xp: 0,
  maxXp: 500,
  defeatedBugs: 0,
  title: '버그 헌터 신참',
  streakCount: 0,
  activeSkill: {
    id: 's1',
    name: '크리티컬 머지 샷',
    icon: '⚡',
    description: '다음 PR Merge 공격 시 데미지 2배 (200% 피해)',
    cooldown: 3,
    currentCooldown: 0,
    damageMultiplier: 2.0
  },
  pet: {
    name: '나비 (Nabi)',
    species: '사이버 캣',
    level: 3,
    xp: 80,
    maxXp: 150,
    passiveBuff: 'HP 자동 힐 +5%',
    icon: '🐱'
  },
  weapon: {
    name: '기계식 청축 키보드',
    enhanceLevel: 7,
    statBonus: '공격력 +35%',
    icon: '⌨️'
  },
  stats: {
    productivity: 85,
    testCoverage: 90,
    agility: 78,
    codeReview: 88
  },
  seasonPass: {
    seasonName: '8월 네온 매트릭스 시즌',
    currentTier: 4,
    maxTier: 10,
    passXp: 350,
    maxPassXp: 500,
    rewardSkin: '네온 사이버 매트릭스 UI 스킨 & 백화점 5만원권',
    isUnlocked: false
  },
  inventory: []
};

export const mockGuildWar = {
  guildA: { name: '프론트엔드 길드', score: 1420, avatar: '🗡️' },
  guildB: { name: '백엔드 길드', score: 1280, avatar: '🧙‍♂️' },
  daysLeft: 3
};

export const mockTeamCoopBoss: TeamCoopBoss = {
  id: 'boss-coop-1',
  name: '초월급 결제 시스템 서버 폭발 보스',
  maxHp: 5000,
  currentHp: 2400,
  rewardXp: 1500,
  rewardItem: '팀 전체 회식비 20만원 지원권',
  participants: []
};

export const mockWeeklyQuests: WeeklyQuest[] = [
  { id: 'q1', title: '월요병 극복자', description: '월요일 10시 전 첫 PR Merge 완료하기', rewardXp: 200, rewardItem: '☕ 커피 쿠폰', isCompleted: true },
  { id: 'q2', title: '클린 코더의 정석', description: '테스트 커버리지 80% 이상 PR로 몬스터 막타 치기', rewardXp: 300, rewardItem: '✨ 칭호: [클린 코더]', isCompleted: false },
  { id: 'q3', title: '동료의 구원자', description: 'HP가 떨어진 동료에게 커피 포션 회복선물 1회 하기', rewardXp: 150, rewardItem: '🎁 전리품 상자', isCompleted: false }
];

export const mockWeeklyLeaderboard: WeeklyRank[] = [];

export const mockWebhooks: WebhookPayload[] = [];

export const mockVacations: VacationRequest[] = [];

export const mockTeamMembers: TeamMemberCapacity[] = [];

export const calculateCapacity = (members: TeamMemberCapacity[]): WorkloadCapacity => {
  // The summary reflects the configured team instead of demo-only constants.
  // Averages keep the existing WorkloadCapacity shape while supporting
  // different work schedules for individual members.
  const totalSprintDays = members[0]?.totalSprintDays ?? 10;
  const workingHoursPerDay = members.length
    ? members.reduce((sum, member) => sum + member.workingHoursPerDay, 0) / members.length
    : 8;
  const deepWorkLimitRatio = members.length
    ? members.reduce((sum, member) => sum + member.deepWorkLimitRatio, 0) / members.length
    : 0.7;
  
  const totalVacations = members.reduce((sum, m) => sum + m.vacationDays, 0);
  const availableHours = members.reduce((sum, m) => sum + m.availableHours, 0);
  const assignedHours = members.reduce((sum, m) => sum + m.assignedHours, 0);
  const isOverloaded = members.some(m => m.isOverloaded);

  return {
    totalSprintDays,
    workingHoursPerDay,
    deepWorkLimitRatio,
    vacationDays: totalVacations,
    availableHours,
    assignedHours,
    isOverloaded,
    members
  };
};

export const mockBudget: ProjectBudget = {
  totalBudget: 50000000,
  spentBudget: 36500000,
  hourlyRate: {
    'Frontend': 45000,
    'Backend': 50000,
    'UI/UX Design': 40000,
    'PM': 55000
  },
  fixedCosts: [
    { id: 'f1', name: 'AWS Cloud / Infra 운영비', cost: 1500000, category: '인프라' },
    { id: 'f2', name: 'Figma & SaaS 라이선스', cost: 600000, category: '소프트웨어' },
    { id: 'f3', name: '보안 검수 외주용역', cost: 2500000, category: '외주' },
  ],
  burnRateAlert: true,
  projectDays: 60,
  currentDay: 35,
  idealBurnRate: 58.3,
  actualBurnRate: 73.0
};

export const mockDailySummary: DevSummary = {
  date: '2026-08-07',
  doneToday: [
    'CMS 1.1 팀원별 Deep Work 가동률 및 연차 신청/승인 기능 완성',
    'CMS 1.2 소진 곡선(Burn-rate) 차트 연산 및 고정비 관리 모듈 추가',
    '버그 RPG 2.1 클래스 액티브 스킬 & 몬스터 특성 패턴 구현'
  ],
  planTomorrow: [
    '버그 RPG 몬스터 럭키 드롭 포션 가챠 연동'
  ],
  cautions: [
    '프로젝트 예산 소진 속도가 14.7%p 빠름'
  ],
  gitCommitsCount: 14,
  pullRequestsMerged: 3
};

/** New projects start empty; issues are created through the app or loaded from the project API. */
export const mockMonsters: BugMonster[] = [];
