import type { VacationRequest, BugMonster, WebhookPayload, WeeklyQuest, TeamCoopBoss, UserProfile } from './types';
import { 
  mockUser, 
  mockVacations, 
  mockTeamMembers, 
  mockMonsters, 
  mockWebhooks, 
  mockWeeklyQuests, 
  mockTeamCoopBoss 
} from './mockData';
import { loadTeamSettings, toTeamMemberCapacity, buildProjectBudget } from './services/teamSettingsService';

export interface AppState {
  currentTheme: 'dark' | 'light' | 'matrix';
  userState: UserProfile;
  monstersState: BugMonster[];
  vacationsState: VacationRequest[];
  teamState: typeof mockTeamMembers;
  webhooksState: WebhookPayload[];
  questsState: WeeklyQuest[];
  coopBossState: TeamCoopBoss;
  simExtraDevs: number;
  simExtraVacationDays: number;
  bugFilter: 'all' | 'active' | 'defeated';
  battleLogMessage: string;
  hitMonsterId: string | null;
  lastHitDamageText: string | null;
  isSkillActiveNextAttack: boolean;
  activeModal: 'vacation' | 'attack' | 'leaderboard' | 'inventory' | 'webhook' | 'cmsDetails' | 'lootBox' | 'forge' | 'quests' | 'simulator' | 'radarStats' | 'seasonPass' | 'guildWar' | 'coopBoss' | 'createMonster' | 'postMortem' | 'codex' | 'execAnalytics' | 'achievements' | 'apiSync' | 'raidShop' | 'socialFeed' | 'aiPrediction' | 'cicdPipeline' | 'slackBot' | 'releaseMilestone' | null;
  selectedPostMortemMonsterId: string | null;
  attackTargetId: string | null;
  lastLootReward: string | null;
}

const isStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null;

const storedTheme = isStorageAvailable ? (localStorage.getItem('theme') as any) || 'dark' : 'dark';
const storedUser = isStorageAvailable ? localStorage.getItem('userState') : null;
const storedMonsters = isStorageAvailable ? localStorage.getItem('monstersState') : null;

// 팀 설정 기반 동적 초기화
const teamCfg = loadTeamSettings();
const dynamicTeamState = teamCfg.isConfigured && teamCfg.members.length > 0
  ? toTeamMemberCapacity(teamCfg.members, teamCfg.sprintDays)
  : [...mockTeamMembers];

class Store {
  private state: AppState = {
    currentTheme: storedTheme,
    userState: storedUser ? JSON.parse(storedUser) : { ...mockUser },
    monstersState: storedMonsters ? JSON.parse(storedMonsters) : [...mockMonsters],
    vacationsState: [...mockVacations],
    teamState: dynamicTeamState,
    webhooksState: [...mockWebhooks],
    questsState: [...mockWeeklyQuests],
    coopBossState: { ...mockTeamCoopBoss },
    simExtraDevs: 0,
    simExtraVacationDays: 0,
    bugFilter: 'all',
    battleLogMessage: '버그 퀘스트 전장에 오신 것을 환영합니다! 몬스터를 타격하여 PR을 통합하세요.',
    hitMonsterId: null,
    lastHitDamageText: null,
    isSkillActiveNextAttack: false,
    activeModal: null,
    selectedPostMortemMonsterId: null,
    attackTargetId: null,
    lastLootReward: null,
  };

  private listeners: (() => void)[] = [];

  public getState(): AppState {
    return this.state;
  }

  public setState(partialState: Partial<AppState>) {
    this.state = { ...this.state, ...partialState };
    this.saveLocalStorage();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public reloadFromLocalStorage() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null) {
      const u = localStorage.getItem('userState');
      const m = localStorage.getItem('monstersState');
      const t = localStorage.getItem('theme');
      if (u) this.state.userState = JSON.parse(u);
      if (m) this.state.monstersState = JSON.parse(m);
      if (t) this.state.currentTheme = t as any;
    }
  }

  public saveLocalStorage() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null) {
      localStorage.setItem('theme', this.state.currentTheme);
      localStorage.setItem('userState', JSON.stringify(this.state.userState));
      localStorage.setItem('monstersState', JSON.stringify(this.state.monstersState));
    }
  }

  /** 온보딩 완료 후 팀 설정을 스토어에 반영 */
  public reloadFromTeamSettings() {
    const cfg = loadTeamSettings();
    if (cfg.isConfigured && cfg.members.length > 0) {
      this.state.teamState = toTeamMemberCapacity(cfg.members, cfg.sprintDays);
    }
    this.notify();
  }
}

export const store = new Store();
