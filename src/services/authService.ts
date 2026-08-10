import type { UserProfile } from '../types';
import { mockUser, mockMonsters } from '../mockData';
import type { BugMonster } from '../types';

export interface AccountAvatar {
  bgColor: string; // e.g. 'linear-gradient(135deg, #6366f1, #38bdf8)'
  iconSymbol: string; // e.g. '⚡', '💻', '🛡️', '👾', '🚀'
}

export interface Account {
  id: string;
  username: string;
  displayName: string;
  pin: string; // Plaintext or hashed PIN
  avatar: AccountAvatar;
  heroClass: UserProfile['heroClass'];
  createdAt: string;
  lastLoginAt: string;
  userState: UserProfile;
  monstersState: BugMonster[];
  theme: 'dark' | 'light' | 'matrix';
}

export interface AuthState {
  currentAccountId: string | null;
  isLocked: boolean; // 화면 잠금 여부
  accounts: Account[];
}

const AUTH_KEY = 'bug_tracker_auth';
const inMemoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage.getItem(key);
    }
  } catch { /* fallback */ }
  return inMemoryStore[key] ?? null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(key, value);
    }
  } catch { /* fallback */ }
  inMemoryStore[key] = value;
}

function removeItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.removeItem(key);
    }
  } catch { /* fallback */ }
  delete inMemoryStore[key];
}

function loadAuthState(): AuthState {
  try {
    const raw = getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        currentAccountId: parsed.currentAccountId || null,
        isLocked: parsed.isLocked || false,
        accounts: parsed.accounts || [],
      };
    }
  } catch { /* fallback */ }
  return { currentAccountId: null, isLocked: false, accounts: [] };
}

function saveAuthState(state: AuthState): void {
  setItem(AUTH_KEY, JSON.stringify(state));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAuthState(): AuthState {
  return loadAuthState();
}

export function isLoggedIn(): boolean {
  const { currentAccountId, accounts } = loadAuthState();
  return !!currentAccountId && accounts.some(a => a.id === currentAccountId);
}

export function isSessionLocked(): boolean {
  const { currentAccountId, isLocked } = loadAuthState();
  return !!currentAccountId && isLocked;
}

export function lockSession(): void {
  const state = loadAuthState();
  if (state.currentAccountId) {
    state.isLocked = true;
    saveAuthState(state);
  }
}

export function unlockSession(pin: string): { success: boolean; message: string } {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.id === state.currentAccountId);
  if (!account) return { success: false, message: '로그인된 계정이 없습니다.' };

  if (account.pin !== pin) {
    return { success: false, message: '보안 PIN이 올바르지 않습니다.' };
  }

  state.isLocked = false;
  saveAuthState(state);
  return { success: true, message: '화면 잠금이 해제되었습니다.' };
}

export function getCurrentAccount(): Account | null {
  const { currentAccountId, accounts } = loadAuthState();
  return accounts.find(a => a.id === currentAccountId) ?? null;
}

export function getAllAccounts(): Account[] {
  return loadAuthState().accounts;
}

const DEFAULT_AVATARS: Record<string, AccountAvatar> = {
  '전사 (Frontend)': { bgColor: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)', iconSymbol: '🎨' },
  '마법사 (Backend)': { bgColor: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', iconSymbol: '💻' },
  '성기사 (QA)': { bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', iconSymbol: '🛡️' },
};

/**
 * 신규 계정 생성
 */
export function createAccount(
  username: string,
  displayName: string,
  pin: string,
  heroClass: UserProfile['heroClass'],
  customAvatar?: AccountAvatar
): { success: boolean; message: string; account?: Account } {
  const state = loadAuthState();

  if (!username.trim() || !displayName.trim() || !pin.trim()) {
    return { success: false, message: '사용자명, 표시 이름, PIN을 모두 입력해주세요.' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { success: false, message: 'PIN은 정확히 4자리 숫자여야 합니다.' };
  }
  if (state.accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: `사용자명 "${username}"은(는) 이미 사용 중입니다.` };
  }

  const avatar = customAvatar || DEFAULT_AVATARS[heroClass] || { bgColor: 'linear-gradient(135deg, #6366f1, #38bdf8)', iconSymbol: '⚔️' };

  const newUserState: UserProfile = {
    ...mockUser,
    name: displayName,
    heroClass,
    xp: 0,
    level: 1,
    hp: 100,
    maxHp: 100,
    defeatedBugs: 0,
    streakCount: 0,
    title: '버그 헌터 신참',
    inventory: [],
  };

  const newAccount: Account = {
    id: 'acc-' + Date.now(),
    username,
    displayName,
    pin,
    avatar,
    heroClass,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    userState: newUserState,
    monstersState: [...mockMonsters],
    theme: 'dark',
  };

  state.accounts.push(newAccount);
  saveAuthState(state);

  return { success: true, message: `계정 "${displayName}" 생성 완료!`, account: newAccount };
}

/**
 * 로그인
 */
export function login(
  username: string,
  pin: string
): { success: boolean; message: string; account?: Account } {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

  if (!account) {
    return { success: false, message: `사용자명 "${username}"을(를) 찾을 수 없습니다.` };
  }
  if (account.pin !== pin) {
    return { success: false, message: 'PIN이 올바르지 않습니다.' };
  }

  account.lastLoginAt = new Date().toISOString();
  state.currentAccountId = account.id;
  state.isLocked = false;
  saveAuthState(state);

  // 해당 계정 상태를 메인 스토어 LocalStorage 키에 반영
  syncAccountToStore(account);

  return { success: true, message: `${account.displayName}님, 환영합니다!`, account };
}

/**
 * 로그아웃
 */
export function logout(): void {
  const state = loadAuthState();
  if (!state.currentAccountId) return;

  saveCurrentGameStateToAccount();

  state.currentAccountId = null;
  state.isLocked = false;
  saveAuthState(state);

  removeItem('userState');
  removeItem('monstersState');
  removeItem('theme');
}

/**
 * 계정 전환
 */
export function switchAccount(
  targetAccountId: string,
  pin: string
): { success: boolean; message: string; account?: Account } {
  const state = loadAuthState();
  const target = state.accounts.find(a => a.id === targetAccountId);

  if (!target) return { success: false, message: '계정을 찾을 수 없습니다.' };
  if (pin && target.pin !== pin) return { success: false, message: 'PIN이 올바르지 않습니다.' };

  if (state.currentAccountId) {
    saveCurrentGameStateToAccount();
  }

  target.lastLoginAt = new Date().toISOString();
  state.currentAccountId = targetAccountId;
  state.isLocked = false;
  saveAuthState(state);

  syncAccountToStore(target);

  return { success: true, message: `${target.displayName}님의 계정으로 전환되었습니다!`, account: target };
}

/**
 * 계정 삭제
 */
export function deleteAccount(accountId: string, pin: string): { success: boolean; message: string } {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.id === accountId);

  if (!account) return { success: false, message: '계정을 찾을 수 없습니다.' };
  if (account.pin !== pin) return { success: false, message: 'PIN이 올바르지 않습니다.' };

  if (state.currentAccountId === accountId) {
    state.currentAccountId = null;
    state.isLocked = false;
    removeItem('userState');
    removeItem('monstersState');
    removeItem('theme');
  }

  state.accounts = state.accounts.filter(a => a.id !== accountId);
  saveAuthState(state);

  return { success: true, message: `계정 "${account.displayName}"이(가) 삭제되었습니다.` };
}

/**
 * 현재 게임 상태를 현재 계정에 저장합니다.
 */
export function saveCurrentGameStateToAccount(): void {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.id === state.currentAccountId);
  if (!account) return;

  try {
    const rawUser = getItem('userState');
    const rawMonsters = getItem('monstersState');
    const rawTheme = getItem('theme');

    if (rawUser) account.userState = JSON.parse(rawUser);
    if (rawMonsters) account.monstersState = JSON.parse(rawMonsters);
    if (rawTheme) account.theme = rawTheme as any;
  } catch { /* ignore */ }

  saveAuthState(state);
}

/**
 * 계정 상태를 메인 스토어 LocalStorage 키에 동기화합니다.
 */
function syncAccountToStore(account: Account): void {
  setItem('userState', JSON.stringify(account.userState));
  setItem('monstersState', JSON.stringify(account.monstersState));
  setItem('theme', account.theme);
}
