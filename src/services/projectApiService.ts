import type { BugMonster, TeamCoopBoss, VacationRequest, WebhookPayload, WeeklyQuest, WeeklyRank } from '../types';
import type { UserProfile } from '../types';

export interface ProjectApiConfig {
  baseUrl: string;
  enabled: boolean;
}

export interface ProjectSnapshot {
  userState?: UserProfile;
  monstersState?: BugMonster[];
  vacationsState?: VacationRequest[];
  webhooksState?: WebhookPayload[];
  questsState?: WeeklyQuest[];
  leaderboardState?: WeeklyRank[];
  coopBossState?: TeamCoopBoss;
  dungeonProgress?: Record<string, boolean>;
  updatedAt?: string;
}

const CONFIG_KEY = 'project_api_config';
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getProjectApiConfig(): ProjectApiConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) return { baseUrl: '', enabled: false, ...JSON.parse(stored) };
  } catch { /* browser storage unavailable */ }
  return { baseUrl: envBaseUrl, enabled: Boolean(envBaseUrl) };
}

export function saveProjectApiConfig(config: ProjectApiConfig): void {
  const normalized = { ...config, baseUrl: config.baseUrl.trim().replace(/\/$/, '') };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(normalized));
}

export async function projectApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getProjectApiConfig();
  if (!config.enabled || !config.baseUrl) throw new Error('프로젝트 API 서버가 설정되지 않았습니다.');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`API 요청 실패 (${response.status})`);
    return response.status === 204 ? (undefined as T) : await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

/** Backend contract: GET/PUT {baseUrl}/v1/project-state, authenticated by a secure session cookie. */
export async function fetchProjectSnapshot(): Promise<ProjectSnapshot | null> {
  const config = getProjectApiConfig();
  if (!config.enabled || !config.baseUrl) return null;
  return projectApiRequest<ProjectSnapshot>('/v1/project-state');
}

export async function saveProjectSnapshot(snapshot: ProjectSnapshot): Promise<void> {
  const config = getProjectApiConfig();
  if (!config.enabled || !config.baseUrl) return;
  await projectApiRequest<void>('/v1/project-state', { method: 'PUT', body: JSON.stringify(snapshot) });
}

export async function verifyProjectApi(): Promise<{ success: boolean; message: string }> {
  try {
    await fetchProjectSnapshot();
    return { success: true, message: '프로젝트 API 서버와 연결되었습니다.' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : '프로젝트 API에 연결할 수 없습니다.' };
  }
}
