import { describe, it, expect, beforeEach } from 'vitest';
import { calculateCapacity, mockTeamMembers } from './mockData';
import { store } from './store';
import { t, setLang } from './i18n';
import { getGitHubConfig, saveGitHubConfig, verifyGitHubConfig } from './services/githubService';

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
