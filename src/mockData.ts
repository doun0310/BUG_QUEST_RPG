import type { VacationRequest, WorkloadCapacity, ProjectBudget, DevSummary, BugMonster, UserProfile, TeamMemberCapacity, WeeklyRank, WebhookPayload, WeeklyQuest, TeamCoopBoss } from './types';

// Image assets generated
export const DQ_SLIME_IMG = '/dq_style_slime.jpg';
export const DQ_DRAGON_IMG = '/dq_style_dragon.jpg';
export const CYBER_BUG_IMG = '/cyber_bug.jpg';
export const SHADOW_BOSS_IMG = '/shadow_boss.jpg';
export const PIXEL_SLIME_IMG = '/pixel_slime.jpg';
export const CYBER_GOLEM_IMG = '/cyber_golem.jpg';

export const mockUser: UserProfile = {
  name: '김개발 (Hero)',
  heroClass: '전사 (Frontend)',
  level: 5,
  hp: 70,
  maxHp: 100,
  xp: 340,
  maxXp: 500,
  defeatedBugs: 12,
  title: '🏅 버그 슬레이어',
  streakCount: 3,
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
  inventory: [
    { id: 'i0', name: '☕ 포션: 커피 힐링 (HP +30)', type: '쿠폰', icon: '☕', description: '지친 개발자의 체력을 30 회복시킵니다.', acquiredAt: '2026-08-07' },
    { id: 'i1', name: '조기 퇴근권 (2시간)', type: '쿠폰', icon: '🎫', description: '금요일 2시간 일찍 퇴근할 수 있는 특권', acquiredAt: '2026-08-01' },
    { id: 'i2', name: '스타벅스 3만원 상품권', type: '쿠폰', icon: '☕', description: '주간 버그 슬레이어 1위 달성 보상', acquiredAt: '2026-08-04' }
  ]
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
  participants: [
    { name: '김개발', damageDealt: 1200 },
    { name: '이백엔드', damageDealt: 800 },
    { name: '박풀스택', damageDealt: 600 }
  ]
};

export const mockWeeklyQuests: WeeklyQuest[] = [
  { id: 'q1', title: '월요병 극복자', description: '월요일 10시 전 첫 PR Merge 완료하기', rewardXp: 200, rewardItem: '☕ 커피 쿠폰', isCompleted: true },
  { id: 'q2', title: '클린 코더의 정석', description: '테스트 커버리지 80% 이상 PR로 몬스터 막타 치기', rewardXp: 300, rewardItem: '✨ 칭호: [클린 코더]', isCompleted: false },
  { id: 'q3', title: '동료의 구원자', description: 'HP가 떨어진 동료에게 커피 포션 회복선물 1회 하기', rewardXp: 150, rewardItem: '🎁 전리품 상자', isCompleted: false }
];

export const mockWeeklyLeaderboard: WeeklyRank[] = [
  { rank: 1, userName: '김개발 (Hero)', role: 'Frontend Lead', xpEarned: 1240, bugsSlain: 12, avatar: '👨‍💻' },
  { rank: 2, userName: '박백엔드', role: 'Backend Dev', xpEarned: 980, bugsSlain: 9, avatar: '🧙‍♂️' },
  { rank: 3, userName: '이디자인', role: 'UI/UX Designer', xpEarned: 640, bugsSlain: 5, avatar: '🎨' },
  { rank: 4, userName: '최PM', role: 'Project Owner', xpEarned: 310, bugsSlain: 2, avatar: '🛡️' }
];

export const mockWebhooks: WebhookPayload[] = [
  { id: 'wh-1', eventType: 'pull_request_merged', repository: 'org/cms-frontend', author: '김개발', branch: 'feat/rpg-boss-raid', timestamp: '15:20:11', summary: 'AUTH-401 JWT Token Refresh 무한 루프 Bug 수정 완료 (HP -100 데미지)' },
  { id: 'wh-2', eventType: 'issue_opened', repository: 'org/cms-backend', author: '최PM', branch: 'main', timestamp: '14:45:00', summary: '새로운 몬스터 생성: DB-505 커넥션 풀 Deadlock 이슈 (HP 500)' },
  { id: 'wh-3', eventType: 'commit_pushed', repository: 'org/cms-frontend', author: '이디자인', branch: 'fix/darkmode', timestamp: '11:15:30', summary: 'UI-102 다크모드 깨짐 수정 커밋 (HP -50 데미지)' }
];

export const mockVacations: VacationRequest[] = [
  { id: 'v1', userName: '김개발', type: '연차', startDate: '2026-08-10', endDate: '2026-08-11', days: 2, status: '승인', reason: '개인 사유 휴가' },
  { id: 'v2', userName: '이디자인', type: '외근', startDate: '2026-08-12', endDate: '2026-08-12', days: 1, status: '승인', reason: '클라이언트 UX 미팅' },
  { id: 'v3', userName: '박백엔드', type: '월차', startDate: '2026-08-14', endDate: '2026-08-14', days: 1, status: '대기', reason: '가족 행사' }
];

export const mockTeamMembers: TeamMemberCapacity[] = [
  { userName: '김개발', role: 'Frontend Lead', vacationDays: 2, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 45, assignedHours: 52, isOverloaded: true },
  { userName: '이디자인', role: 'UI/UX Designer', vacationDays: 1, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 50, assignedHours: 38, isOverloaded: false },
  { userName: '박백엔드', role: 'Backend Dev', vacationDays: 1, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 50, assignedHours: 48, isOverloaded: false },
  { userName: '최PM', role: 'Project Owner', vacationDays: 0, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 56, assignedHours: 40, isOverloaded: false },
];

export const calculateCapacity = (members: TeamMemberCapacity[]): WorkloadCapacity => {
  const totalSprintDays = 10;
  const workingHoursPerDay = 8;
  const deepWorkLimitRatio = 0.7;
  
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

export const mockMonsters: BugMonster[] = [
  { 
    id: 'b1', 
    title: 'AUTH-401 JWT Token Refresh 무한 루프 Bug', 
    severity: 'Minor', 
    maxHp: 150, 
    currentHp: 30, 
    assignee: '김개발', 
    rewardXp: 60, 
    isBoss: false, 
    status: 'Active', 
    prUrl: 'https://github.com/org/repo/pull/104',
    defenseTrait: 'Dodge',
    elementTrait: 'Security',
    monsterImage: '/pixel_slime.jpg',
    dueDate: '오늘 18:00 마감 (⏳ 2시간 남음)',
    dialogue: '크윽... 세미콜론 하나 안 붙였다고 이런 데미지가?!'
  },
  { 
    id: 'b2', 
    title: 'PAY-909 결제 모듈 Memory Leak (BOSS RAID)', 
    severity: 'Critical', 
    maxHp: 1200, 
    currentHp: 450, 
    assignee: '팀 레이드', 
    rewardXp: 400, 
    isBoss: true, 
    status: 'Active', 
    prUrl: 'https://github.com/org/repo/pull/112',
    defenseTrait: 'Shield',
    elementTrait: 'Backend',
    isEnraged: true,
    monsterImage: '/cyber_golem.jpg',
    dueDate: '어제 마감 초과 (⚠️ 몬스터 광포화 반격 발동!)',
    isOverdue: true,
    dialogue: '후후... 마감시간을 넘겼다! 분노의 광포화 상태를 보여주마!'
  },
  { 
    id: 'b4', 
    title: 'DB-505 커넥션 풀 Deadlock 이슈 (MINI BOSS)', 
    severity: 'Major', 
    maxHp: 500, 
    currentHp: 320, 
    assignee: '박백엔드', 
    rewardXp: 200, 
    isBoss: false, 
    status: 'Active', 
    prUrl: 'https://github.com/org/repo/pull/118',
    defenseTrait: 'Dodge',
    elementTrait: 'Database',
    monsterImage: '/shadow_boss.jpg',
    dueDate: '내일 12:00 마감',
    dialogue: '트랜잭션 락을 해제하지 않는 이상 날 잡을 수 없을 걸!'
  },
  { 
    id: 'b5', 
    title: 'UI-880 CSS Z-Index 레이어 침범 몬스터', 
    severity: 'Minor', 
    maxHp: 200, 
    currentHp: 150, 
    assignee: '최디자인', 
    rewardXp: 80, 
    isBoss: false, 
    status: 'Active', 
    prUrl: 'https://github.com/org/repo/pull/120',
    defenseTrait: 'Dodge',
    elementTrait: 'Frontend',
    monsterImage: '/cyber_bug.jpg',
    dueDate: '오늘 20:00 마감',
    dialogue: 'z-index: 999999로 모든 버튼을 가려버리겠다!'
  }
];
