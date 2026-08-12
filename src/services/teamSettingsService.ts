import type { TeamSettings, TeamMemberInput, TeamMemberCapacity, BugMonster } from '../types';

const TEAM_SETTINGS_KEY = 'bug_quest_team_settings';

const inMemoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage.getItem(key);
  } catch { /* fallback */ }
  return inMemoryStore[key] ?? null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) localStorage.setItem(key, value);
  } catch { /* fallback */ }
  inMemoryStore[key] = value;
}

// ─── Default (첫 접속 시 기본값) ───────────────────────────────────────────

export const DEFAULT_TEAM_SETTINGS: TeamSettings = {
  isConfigured: false,
  teamName: '',
  projectName: '',
  guildAName: '프론트엔드 길드',
  guildBName: '백엔드 길드',
  sprintDays: 10,
  totalBudget: 50_000_000,
  projectDurationDays: 60,
  projectStartDate: new Date().toISOString().split('T')[0],
  members: [],
  configuredAt: '',
  lastUpdatedAt: '',
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadTeamSettings(): TeamSettings {
  try {
    const raw = getItem(TEAM_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TeamSettings;
      return { ...DEFAULT_TEAM_SETTINGS, ...parsed };
    }
  } catch { /* fallback */ }
  return { ...DEFAULT_TEAM_SETTINGS };
}

export function saveTeamSettings(settings: Partial<TeamSettings>): TeamSettings {
  const current = loadTeamSettings();
  const updated: TeamSettings = {
    ...current,
    ...settings,
    lastUpdatedAt: new Date().toISOString(),
  };
  setItem(TEAM_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

/** Registers a local account as a workload member without duplicating existing team entries. */
export function addAccountAsTeamMember(name: string, role: Extract<TeamMemberInput['role'], '전사 (Frontend)' | '마법사 (Backend)' | '성기사 (QA)'>): TeamSettings {
  const current = loadTeamSettings();
  if (current.members.some(member => member.name === name)) return current;
  return saveTeamSettings({
    members: [...current.members, {
      id: `member-${Date.now()}`,
      name,
      role,
      workingHoursPerDay: 8,
      deepWorkRatio: 0.7,
    }],
  });
}

export function isOnboardingComplete(): boolean {
  return loadTeamSettings().isConfigured === true;
}

export function completeOnboarding(settings: Omit<TeamSettings, 'isConfigured' | 'configuredAt' | 'lastUpdatedAt'>): TeamSettings {
  return saveTeamSettings({
    ...settings,
    isConfigured: true,
    configuredAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function resetOnboarding(): void {
  setItem(TEAM_SETTINGS_KEY, JSON.stringify({ ...DEFAULT_TEAM_SETTINGS }));
}

// ─── 팀 설정 → AppState 호환 변환 ──────────────────────────────────────────

const ROLE_MAP: Record<TeamMemberInput['role'], string> = {
  '전사 (Frontend)': 'Frontend Dev',
  '마법사 (Backend)': 'Backend Dev',
  '성기사 (QA)': 'QA Engineer',
  '궁수 (DevOps)': 'DevOps Engineer',
  '힐러 (PM)': 'Project Manager',
};

/**
 * TeamMemberInput[] → TeamMemberCapacity[] 변환 (Sidebar/Simulator에서 사용)
 */
export function toTeamMemberCapacity(members: TeamMemberInput[], sprintDays: number): TeamMemberCapacity[] {
  return members.map(m => {
    const availableHours = Math.floor((sprintDays * m.workingHoursPerDay) * m.deepWorkRatio);
    const assignedHours = Math.floor(availableHours * 0.75); // 기본 75% 배정으로 초기화
    return {
      userName: m.name,
      role: ROLE_MAP[m.role] || m.role,
      vacationDays: 0,
      totalSprintDays: sprintDays,
      workingHoursPerDay: m.workingHoursPerDay,
      deepWorkLimitRatio: m.deepWorkRatio,
      availableHours,
      assignedHours,
      isOverloaded: assignedHours > availableHours,
    };
  });
}

/**
 * 팀 설정 및 버그/몬스터 처리 상태 기반으로 프로젝트 예산 오브젝트 생성 (실시간 연동)
 */
export function buildProjectBudget(settings: TeamSettings, monsters: BugMonster[] = []) {
  const today = new Date();
  const startDate = new Date(settings.projectStartDate || new Date().toISOString().split('T')[0]);
  const daysPassed = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = settings.projectDurationDays || 60;
  const idealBurnRate = totalDays > 0 ? parseFloat(Math.min(100, (daysPassed / totalDays) * 100).toFixed(1)) : 0;

  // 몬스터(이슈) 처리 비율 및 작업 시간 기반 소진 비용 동적 산출
  const totalMonsters = monsters.length;
  const defeatedCount = monsters.filter(m => m.status === 'Defeated' || m.currentHp <= 0).length;
  
  // 몬스터 데미지 소진 비율 (전체 maxHp 대비 감축된 hp 비중)
  const totalMaxHp = monsters.reduce((acc, m) => acc + (m.maxHp || 100), 0);
  const totalCurrentHp = monsters.reduce((acc, m) => acc + Math.max(0, m.currentHp || 0), 0);
  const damageProgressRate = totalMaxHp > 0 ? (totalMaxHp - totalCurrentHp) / totalMaxHp : (totalMonsters > 0 ? defeatedCount / totalMonsters : 0);

  // 고정비 (인프라 + SaaS)
  const fixedCostsTotal = Math.floor(settings.totalBudget * 0.042);
  
  // 경과 일수 기본 소진 (일할 계산) + 작업 진행도에 따른 인건비 소진
  const timeBasedSpent = settings.totalBudget * 0.5 * (daysPassed / totalDays);
  const workBasedSpent = settings.totalBudget * 0.45 * damageProgressRate;
  const spentEstimate = Math.min(settings.totalBudget, Math.floor(fixedCostsTotal + timeBasedSpent + workBasedSpent));

  const actualBurnRate = settings.totalBudget > 0 ? parseFloat(((spentEstimate / settings.totalBudget) * 100).toFixed(1)) : 0;

  return {
    totalBudget: settings.totalBudget,
    spentBudget: spentEstimate,
    hourlyRate: { 'Frontend': 45000, 'Backend': 50000, 'QA': 38000, 'DevOps': 48000, 'PM': 55000 },
    fixedCosts: [
      { id: 'f1', name: '클라우드 인프라 운영비', cost: Math.floor(settings.totalBudget * 0.03), category: '인프라' },
      { id: 'f2', name: 'SaaS 라이선스 & 도구', cost: Math.floor(settings.totalBudget * 0.012), category: '소프트웨어' },
    ],
    burnRateAlert: actualBurnRate > idealBurnRate + 10,
    projectDays: totalDays,
    currentDay: daysPassed,
    idealBurnRate,
    actualBurnRate,
    defeatedCount,
    totalMonsters,
    damageProgressRate: Math.round(damageProgressRate * 100),
  };
}
