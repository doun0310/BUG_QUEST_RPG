import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCapacity, mockTeamMembers } from './mockData';
import { store } from './store';
import { t, setLang } from './i18n';
import { getGitHubConfig, saveGitHubConfig, verifyGitHubConfig } from './services/githubService';
import { parseBackupFile } from './services/dataBackupService';
import { particleService } from './services/particleService';
import { generateMonsterPreset } from './services/monsterPresetEngine';
import { getWebhookConfig, saveWebhookConfig, notifyMonsterDefeated } from './services/webhookNotifier';
import { parseLcovContent } from './services/lcovParser';
import { createAccount, login, logout, switchAccount, isLoggedIn, getCurrentAccount, deleteAccount } from './services/authService';

describe('CMS Workload Capacity Calculations', () => {
  it('should correctly calculate total available and assigned hours for team members', () => {
    const capacity = calculateCapacity(mockTeamMembers);
    
    expect(capacity.totalSprintDays).toBe(10);
    expect(capacity.workingHoursPerDay).toBe(8);
    expect(capacity.members.length).toBe(4);
    
    // Sum of availableHours = 45 + 50 + 50 + 56 = 201
    expect(capacity.availableHours).toBe(201);
    // Sum of assignedHours = 52 + 38 + 48 + 40 = 178
    expect(capacity.assignedHours).toBe(178);
    expect(capacity.isOverloaded).toBe(true);
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
    expect(initialState.userState.name).toBe('김개발 (Hero)');
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
    expect(t('appTitle')).toBe('BUG TRACKER RPG');
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

describe('Multi-Account Auth & Account Switching System', () => {
  beforeEach(() => {
    logout();
  });

  it('should handle account creation, login, logout, and account switching correctly', () => {
    // 1. Create Account A
    const createRes = createAccount('user_a', '유저A', '1234', '전사 (Frontend)');
    expect(createRes.success).toBe(true);
    expect(createRes.account?.displayName).toBe('유저A');

    // 2. Login User A
    const loginRes = login('user_a', '1234');
    expect(loginRes.success).toBe(true);
    expect(isLoggedIn()).toBe(true);
    expect(getCurrentAccount()?.displayName).toBe('유저A');

    // 3. Create Account B
    const createBRes = createAccount('user_b', '유저B', '5678', '마법사 (Backend)');
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

  it('should reject invalid PIN or duplicated username', () => {
    createAccount('user_dup', '중복유저', '1111', '전사 (Frontend)');
    
    // Duplicate username attempt
    const dupRes = createAccount('user_dup', '다른이름', '2222', '마법사 (Backend)');
    expect(dupRes.success).toBe(false);
    expect(dupRes.message).toContain('이미 사용 중');

    // Wrong PIN login attempt
    const wrongPinRes = login('user_dup', '9999');
    expect(wrongPinRes.success).toBe(false);
    expect(wrongPinRes.message).toContain('PIN이 올바르지 않습니다');
  });
});
