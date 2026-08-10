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

const storedTheme = (localStorage.getItem('theme') as any) || 'dark';
const storedUser = localStorage.getItem('userState');
const storedMonsters = localStorage.getItem('monstersState');

class Store {
  private state: AppState = {
    currentTheme: storedTheme,
    userState: storedUser ? JSON.parse(storedUser) : { ...mockUser },
    monstersState: storedMonsters ? JSON.parse(storedMonsters) : [...mockMonsters],
    vacationsState: [...mockVacations],
    teamState: [...mockTeamMembers],
    webhooksState: [...mockWebhooks],
    questsState: [...mockWeeklyQuests],
    coopBossState: { ...mockTeamCoopBoss },
    simExtraDevs: 0,
    simExtraVacationDays: 0,
    bugFilter: 'all',
    battleLogMessage: '버그 트래커 전장에 오신 것을 환영합니다! 몬스터를 타격하여 PR을 통합하세요.',
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

  public saveLocalStorage() {
    localStorage.setItem('theme', this.state.currentTheme);
    localStorage.setItem('userState', JSON.stringify(this.state.userState));
    localStorage.setItem('monstersState', JSON.stringify(this.state.monstersState));
  }
}

export const store = new Store();
