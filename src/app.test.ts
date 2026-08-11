import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCapacity } from './mockData';
import type { TeamMemberCapacity } from './types';
import { store } from './store';
import { t, setLang } from './i18n';
import { getGitHubConfig, saveGitHubConfig, verifyGitHubConfig } from './services/githubService';
import { parseBackupFile } from './services/dataBackupService';
import { particleService } from './services/particleService';
import { generateMonsterPreset } from './services/monsterPresetEngine';
import { getWebhookConfig, saveWebhookConfig, notifyMonsterDefeated } from './services/webhookNotifier';
import { parseLcovContent } from './services/lcovParser';
import { createAccount, login, logout, switchAccount, isLoggedIn, getCurrentAccount, deleteAccount, lockSession, unlockSession, isSessionLocked, resetAuthStateForTesting } from './services/authService';
import { calculateElementalDamage, canEnrage, isDailyClaimAvailable } from './services/gameRules';
import { getAssignedWorkloadMembers, recalculateWorkload } from './services/workloadService';
import { createAccountDemoData } from './services/accountDemoService';
import { escapeHtml, safeExternalUrl } from './services/inputSafety';
import { validateIssueInput } from './services/issueValidation';

const workloadFixture: TeamMemberCapacity[] = [
  { userName: 'Alex', role: 'Frontend Dev', vacationDays: 0, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 56, assignedHours: 12, isOverloaded: false },
  { userName: 'Morgan', role: 'Backend Dev', vacationDays: 0, totalSprintDays: 10, workingHoursPerDay: 8, deepWorkLimitRatio: 0.7, availableHours: 56, assignedHours: 8, isOverloaded: false },
];

describe('CMS Workload Capacity Calculations', () => {
  it('should correctly calculate total available and assigned hours for team members', () => {
    const capacity = calculateCapacity(workloadFixture);
    
    expect(capacity.totalSprintDays).toBe(10);
    expect(capacity.workingHoursPerDay).toBe(8);
    expect(capacity.members.length).toBe(2);
    
    expect(capacity.availableHours).toBe(112);
    expect(capacity.assignedHours).toBe(20);
    expect(capacity.isOverloaded).toBe(false);
  });

  it('should reflect each member schedule in the team summary', () => {
    const capacity = calculateCapacity([
      { ...workloadFixture[0], totalSprintDays: 8, workingHoursPerDay: 6, deepWorkLimitRatio: 0.5 },
      { ...workloadFixture[1], totalSprintDays: 8, workingHoursPerDay: 10, deepWorkLimitRatio: 0.9 },
    ]);

    expect(capacity.totalSprintDays).toBe(8);
    expect(capacity.workingHoursPerDay).toBe(8);
    expect(capacity.deepWorkLimitRatio).toBeCloseTo(0.7);
  });

  it('should apply approved leave and assigned issue estimates to workload', () => {
    const [member] = recalculateWorkload(
      [{ ...workloadFixture[0], vacationDays: 0, assignedHours: 0, isOverloaded: false }],
      [{ id: 'leave-1', userName: 'Alex', type: '연차', startDate: '2026-08-10', endDate: '2026-08-11', days: 2, status: '승인', reason: '휴가' }],
      [{ id: 'bug-1', title: '테스트 버그', severity: 'Minor', status: 'Active', currentHp: 10, maxHp: 10, rewardXp: 1, isBoss: false, assignee: 'Alex', estimatedHours: 12 }]
    );

    expect(member.vacationDays).toBe(2);
    expect(member.availableHours).toBe(45);
    expect(member.assignedHours).toBe(12);
    expect(member.isOverloaded).toBe(false);
  });

  it('should show only members with active assigned work in workload views', () => {
    const members = [workloadFixture[0], workloadFixture[1]];
    const assigned = getAssignedWorkloadMembers(members, [{
      id: 'bug-2', title: '배정된 이슈', severity: 'Major', status: 'Active', currentHp: 50, maxHp: 50,
      rewardXp: 50, isBoss: false, assignee: 'Morgan'
    }]);

    expect(assigned.map(member => member.userName)).toEqual(['Morgan']);
  });
});

describe('Connected Account Demo Data', () => {
  it('creates assigned sample work from registered account names only', () => {
    const demo = createAccountDemoData([
      { id: 'acc-1', displayName: 'Lee John', heroClass: '전사 (Frontend)', avatar: { iconSymbol: '⚡' } },
      { id: 'acc-2', displayName: 'Choi Mina', heroClass: '마법사 (Backend)', avatar: { iconSymbol: '💻' } },
    ] as any, '2026-08-11');

    expect(demo.monsters).toHaveLength(5);
    expect(demo.monsters.slice(0, 2).map(item => item.assignee)).toEqual(['Lee John', 'Choi Mina']);
    expect(demo.leaderboard.map(item => item.userName)).toEqual(['Lee John', 'Choi Mina']);
    expect(demo.monsters.every(item => item.title.startsWith('[샘플]'))).toBe(true);
    expect(demo.monsters[0].title).toContain('React Query 캐시 무효화');
    expect(demo.monsters[1].dialogue).toContain('중복 결제');
  });
});

describe('Issue quality safeguards', () => {
  it('escapes user text and rejects unsafe external URLs', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toContain('&lt;img');
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('https://github.com/example/repo')).toBe('https://github.com/example/repo');
  });

  it('validates issue content before it is saved', () => {
    expect(validateIssueInput({ title: 'x', assignee: 'A', dueDate: '', estimatedHours: 0, dialogue: '' })).toBeTruthy();
    expect(validateIssueInput({ title: '로그인 API가 500을 반환함', assignee: 'Lee John', dueDate: '내일 10:00', estimatedHours: 8, dialogue: '재현 절차를 확인합니다.' })).toBeNull();
  });
});

describe('Store & State Management', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage) {
      localStorage.clear();
    }
  });

  it('should initialize with default state and allow updates', () => {
    const initialState = store.getState();
    expect(initialState.userState.name).toBe('새 개발자');
    expect(initialState.bugFilter).toBe('all');

    store.setState({ bugFilter: 'active' });
    expect(store.getState().bugFilter).toBe('active');
  });

  it('should update local storage when theme or state changes', () => {
    store.setState({ currentTheme: 'matrix' });
    expect(store.getState().currentTheme).toBe('matrix');
  });
});

describe('i18n Translation Manager', () => {
  it('should translate keys according to the selected language', () => {
    setLang('ko');
    expect(t('appTitle')).toBe('BUG QUEST RPG');
    expect(t('attackBtn')).toBe('PR 공격 / 통합');

    setLang('en');
    expect(t('attackBtn')).toBe('PR Merge Attack');
    expect(t('weeklyQuestsBtn')).toBe('Weekly Quests');
  });
});

describe('GitHub Integration Service', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.clear();
    }
  });

  it('should manage GitHub config in localStorage', () => {
    const defaultConfig = getGitHubConfig();
    expect(defaultConfig.isEnabled).toBe(false);

    const testConfig = { token: 'ghp_test123', owner: 'testuser', repo: 'testrepo', isEnabled: true };
    saveGitHubConfig(testConfig);

    const saved = getGitHubConfig();
    expect(saved.token).toBe('ghp_test123');
    expect(saved.owner).toBe('testuser');
    expect(saved.isEnabled).toBe(true);
  });

  it('should fail verification if token or owner is missing', async () => {
    const emptyConfig = { token: '', owner: '', repo: '', isEnabled: true };
    const res = await verifyGitHubConfig(emptyConfig);
    expect(res.success).toBe(false);
    expect(res.message).toContain('Token');
  });
});

describe('Data Backup & Restore Service', () => {
  it('should validate JSON backup file content correctly', () => {
    const validJson = JSON.stringify({
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      userState: { name: '테스트 유저' },
      monstersState: [{ id: 'm1', title: 'Test Monster' }],
    });

    const result = parseBackupFile(validJson);
    expect(result.success).toBe(true);
    expect(result.data?.userState.name).toBe('테스트 유저');
  });

  it('should reject invalid JSON format or missing required fields', () => {
    const invalidJson = 'invalid json string';
    const result1 = parseBackupFile(invalidJson);
    expect(result1.success).toBe(false);

    const missingFieldsJson = JSON.stringify({ version: '1.0' });
    const result2 = parseBackupFile(missingFieldsJson);
    expect(result2.success).toBe(false);
    expect(result2.message).toContain('필수 요소');
  });
});

describe('Particle Effect & Sound FX Engine', () => {
  it('should safely trigger explosion and spawn floating text in non-DOM/SSR environment without throwing errors', () => {
    expect(() => {
      particleService.triggerExplosion(100, 100, '#38bdf8', 10);
      particleService.spawnFloatingText(100, 100, 'TEST DAMAGE', '#f87171', 16);
    }).not.toThrow();
  });
});

describe('Monster Auto-Preset Engine', () => {
  it('should automatically analyze bug titles and assign appropriate traits and dialogues', () => {
    const fePreset = generateMonsterPreset('React 무한 리렌더링 버그', 'Major');
    expect(fePreset.elementTrait).toBe('Frontend');
    expect(fePreset.defenseTrait).toBe('Dodge');
    expect(fePreset.dialogue).toBeTruthy();

    const dbPreset = generateMonsterPreset('SQL Deadlock 및 인덱스 미적용 이슈', 'Critical');
    expect(dbPreset.elementTrait).toBe('Database');
    expect(dbPreset.dialogue).toContain('CRITICAL');

    const secPreset = generateMonsterPreset('CORS 토큰 인증 실패 401 Error', 'Minor');
    expect(secPreset.elementTrait).toBe('Security');
    expect(secPreset.defenseTrait).toBe('Shield');
  });
});

describe('Live Webhook & LCOV Parser Services', () => {
  it('should manage Webhook config and handle disabled state gracefully', async () => {
    const config = getWebhookConfig();
    expect(config.isEnabled).toBe(false);

    saveWebhookConfig({ slackUrl: 'https://hooks.slack.com/test', teamsUrl: '', isEnabled: true });
    expect(getWebhookConfig().slackUrl).toBe('https://hooks.slack.com/test');

    const disabledRes = await notifyMonsterDefeated({ slackUrl: '', teamsUrl: '', isEnabled: false }, 'Bug Monster', 100, 'User');
    expect(disabledRes.success).toBe(false);
  });

  it('should parse LCOV info text and calculate line coverage percentage accurately', () => {
    const sampleLcov = `
TN:
SF:/src/app.ts
FNF:10
FNH:8
DA:1,1
DA:2,1
DA:3,0
DA:4,1
LF:4
LH:3
end_of_record
SF:/src/utils.ts
LF:6
LH:5
end_of_record
`;
    const summary = parseLcovContent(sampleLcov);
    expect(summary.totalFiles).toBe(2);
    expect(summary.linesFound).toBe(10);
    expect(summary.linesHit).toBe(8);
    expect(summary.coveragePercent).toBe(80); // (8/10) * 100 = 80%
  });
});

describe('Game progression rules', () => {
  it('applies elemental advantage and detects the enrage threshold', () => {
    const result = calculateElementalDamage(100, { elementTrait: 'Frontend' }, '프론트엔드 마법사');
    expect(result.damage).toBe(130);
    expect(result.advantage).toBe(true);
    expect(canEnrage({ currentHp: 30, maxHp: 100, isEnraged: false })).toBe(true);
    expect(canEnrage({ currentHp: 31, maxHp: 100, isEnraged: false })).toBe(false);
  });

  it('allows exactly one daily reward per date', () => {
    expect(isDailyClaimAvailable(null, '2026-08-11')).toBe(true);
    expect(isDailyClaimAvailable('2026-08-11', '2026-08-11')).toBe(false);
    expect(isDailyClaimAvailable('2026-08-10', '2026-08-11')).toBe(true);
  });
});

describe('Multi-Account Auth & Account Switching System', () => {
  beforeEach(() => {
    resetAuthStateForTesting();
    logout();
  });

  it('should handle account creation, login, logout, and account switching correctly', async () => {
    // 1. Create Account A
    const createRes = await createAccount('user_a', '유저A', '1234', '전사 (Frontend)');
    expect(createRes.success).toBe(true);
    expect(createRes.account?.displayName).toBe('유저A');

    // 2. Login User A
    const loginRes = await login('user_a', '1234');
    expect(loginRes.success).toBe(true);
    expect(isLoggedIn()).toBe(true);
    expect(getCurrentAccount()?.displayName).toBe('유저A');

    // 3. Create Account B
    const createBRes = await createAccount('user_b', '유저B', '5678', '마법사 (Backend)');
    expect(createBRes.success).toBe(true);

    // 4. Switch Account to B
    const switchRes = switchAccount(createBRes.account!.id, '5678');
    expect(switchRes.success).toBe(true);
    expect(getCurrentAccount()?.displayName).toBe('유저B');

    // 5. Logout
    logout();
    expect(isLoggedIn()).toBe(false);
    expect(getCurrentAccount()).toBeNull();
  });

  it('should handle session lock and unlock correctly', async () => {
    await createAccount('lock_user', '잠금유저', '4321', '성기사 (QA)');
    await login('lock_user', '4321');

    expect(isSessionLocked()).toBe(false);
    lockSession();
    expect(isSessionLocked()).toBe(true);

    const wrongRes = unlockSession('0000');
    expect(wrongRes.success).toBe(false);
    expect(isSessionLocked()).toBe(true);

    const rightRes = unlockSession('4321');
    expect(rightRes.success).toBe(true);
    expect(isSessionLocked()).toBe(false);
  });

  it('should reject invalid PIN or duplicated username', async () => {
    await createAccount('user_dup', '중복유저', '1111', '전사 (Frontend)');
    
    // Duplicate username attempt
    const dupRes = await createAccount('user_dup', '다른이름', '2222', '마법사 (Backend)');
    expect(dupRes.success).toBe(false);
    expect(dupRes.message).toContain('이미 사용 중');

    // Wrong PIN login attempt
    const wrongPinRes = await login('user_dup', '9999');
    expect(wrongPinRes.success).toBe(false);
    expect(wrongPinRes.message).toContain('PIN이 올바르지 않습니다');
  });
});
