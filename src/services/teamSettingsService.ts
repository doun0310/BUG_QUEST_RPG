import type { TeamSettings, TeamMemberInput, TeamMemberCapacity } from '../types';

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
 * 팀 설정 기반으로 프로젝트 예산 오브젝트 생성
 */
export function buildProjectBudget(settings: TeamSettings) {
  const today = new Date();
  const startDate = new Date(settings.projectStartDate);
  const daysPassed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = settings.projectDurationDays;
  const idealBurnRate = totalDays > 0 ? parseFloat(((daysPassed / totalDays) * 100).toFixed(1)) : 0;
  const spentEstimate = Math.floor(settings.totalBudget * (idealBurnRate / 100) * 1.05); // 5% 초과 가정

  return {
    totalBudget: settings.totalBudget,
    spentBudget: spentEstimate,
    hourlyRate: { 'Frontend': 45000, 'Backend': 50000, 'QA': 38000, 'DevOps': 48000, 'PM': 55000 },
    fixedCosts: [
      { id: 'f1', name: '클라우드 인프라 운영비', cost: Math.floor(settings.totalBudget * 0.03), category: '인프라' },
      { id: 'f2', name: 'SaaS 라이선스 & 도구', cost: Math.floor(settings.totalBudget * 0.012), category: '소프트웨어' },
    ],
    burnRateAlert: idealBurnRate > 0 && (spentEstimate / settings.totalBudget * 100) > idealBurnRate + 10,
    projectDays: totalDays,
    currentDay: daysPassed,
    idealBurnRate,
    actualBurnRate: settings.totalBudget > 0 ? parseFloat((spentEstimate / settings.totalBudget * 100).toFixed(1)) : 0,
  };
}
