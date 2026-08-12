import type { UserProfile } from '../types';
import { mockUser, mockMonsters } from '../mockData';
import type { BugMonster } from '../types';
import { hashPin, hashPinSync, verifyPin, verifyPinSync } from './cryptoService';

export interface AccountAvatar {
  bgColor: string; // e.g. 'linear-gradient(135deg, #6366f1, #38bdf8)'
  iconSymbol: string; // IconName string; legacy emoji values are migrated when rendered.
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
const LEGACY_DEMO_ACCOUNT_NAMES = new Set(['김개발', '김개발 (Hero)', '이백엔드', '이벡엔드', '이디자인', '박백엔드', '박풀스택', '최PM', '최디자인']);
const inMemoryStore: Record<string, string> = {};
let accountIdSequence = 0;

/** Date.now alone can collide when accounts are created in the same event loop tick. */
function createAccountId(): string {
  accountIdSequence += 1;
  return `acc-${Date.now()}-${accountIdSequence}`;
}

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

export function resetAuthStateForTesting(): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.clear();
    }
  } catch { /* fallback */ }
  for (const k in inMemoryStore) {
    delete inMemoryStore[k];
  }
  accountIdSequence = 0;
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

  if (!verifyPinSync(pin, account.username, account.pin)) {
    return { success: false, message: '보안 PIN이 올바르지 않습니다.' };
  }

  state.isLocked = false;
  saveAuthState(state);
  return { success: true, message: '화면 잠금이 해제되었습니다.' };
}

// ...

export function switchAccount(
  targetAccountId: string,
  pin: string
): { success: boolean; message: string; account?: Account } {
  const state = loadAuthState();
  const target = state.accounts.find(a => a.id === targetAccountId);

  if (!target) return { success: false, message: '계정을 찾을 수 없습니다.' };
  if (pin && !verifyPinSync(pin, target.username, target.pin)) return { success: false, message: 'PIN이 올바르지 않습니다.' };

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
  if (!verifyPinSync(pin, account.username, account.pin)) return { success: false, message: 'PIN이 올바르지 않습니다.' };

  if (state.currentAccountId === accountId) {
    state.currentAccountId = null;
    state.isLocked = false;
    removeItem('userState');
    removeItem('theme');
  }

  state.accounts = state.accounts.filter(a => a.id !== accountId);
  saveAuthState(state);

  return { success: true, message: `계정 "${account.displayName}"이(가) 삭제되었습니다.` };
}

export function getCurrentAccount(): Account | null {
  const { currentAccountId, accounts } = loadAuthState();
  return accounts.find(a => a.id === currentAccountId) ?? null;
}

export function getAllAccounts(): Account[] {
  return loadAuthState().accounts;
}

/** One-time migration that removes accounts bundled with the former demo build. */
export function purgeLegacyDemoAccounts(): number {
  const state = loadAuthState();
  const retained = state.accounts.filter(account => !LEGACY_DEMO_ACCOUNT_NAMES.has(account.displayName));
  const removedCurrentAccount = state.currentAccountId && !retained.some(account => account.id === state.currentAccountId);
  const removed = state.accounts.length - retained.length;
  if (!removed) return 0;

  state.accounts = retained;
  if (removedCurrentAccount) {
    state.currentAccountId = null;
    state.isLocked = false;
    removeItem('userState');
    removeItem('vacationsState');
  }
  saveAuthState(state);
  return removed;
}

const DEFAULT_AVATARS: Record<string, AccountAvatar> = {
  '전사 (Frontend)': { bgColor: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)', iconSymbol: 'roleWarrior' },
  '마법사 (Backend)': { bgColor: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', iconSymbol: 'roleMage' },
  '성기사 (QA)': { bgColor: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', iconSymbol: 'rolePaladin' },
};


/**
 * 신규 계정 생성 (PIN SHA-256 해시 저장)
 */
export async function createAccount(
  username: string,
  displayName: string,
  pin: string,
  heroClass: UserProfile['heroClass'],
  customAvatar?: AccountAvatar
): Promise<{ success: boolean; message: string; account?: Account }> {
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

  const avatar = customAvatar || DEFAULT_AVATARS[heroClass] || { bgColor: 'linear-gradient(135deg, #6366f1, #38bdf8)', iconSymbol: 'sword' };
  const hashedPin = hashPinSync(pin, username);

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
    id: createAccountId(),
    username,
    displayName,
    pin: hashedPin,
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
 * 동기 계정 생성 (기존 인터페이스 지원용)
 */
export function createAccountSync(
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

  const avatar = customAvatar || DEFAULT_AVATARS[heroClass] || { bgColor: 'linear-gradient(135deg, #6366f1, #38bdf8)', iconSymbol: 'sword' };

  // Sync fallback hash
  let hash = 0;
  const salted = `BUG_QUEST_RPG_SALT_${username.toLowerCase()}_${pin}`;
  for (let i = 0; i < salted.length; i++) hash = ((hash << 5) - hash + salted.charCodeAt(i)) | 0;
  const hashedPin = 'hashed_fb_' + Math.abs(hash).toString(16);

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
    id: createAccountId(),
    username,
    displayName,
    pin: hashedPin,
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
 * 로그인 (SHA-256 검증 및 구버전 평문 PIN 자동 마이그레이션)
 */
export async function login(
  username: string,
  pin: string
): Promise<{ success: boolean; message: string; account?: Account }> {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

  if (!account) {
    return { success: false, message: `사용자명 "${username}"을(를) 찾을 수 없습니다.` };
  }

  const { isValid, needsMigration } = await verifyPin(pin, account.username, account.pin);

  if (!isValid) {
    return { success: false, message: 'PIN이 올바르지 않습니다.' };
  }

  // 자동 마이그레이션: 평문 PIN → SHA-256 해시 업그레이드
  if (needsMigration) {
    account.pin = await hashPin(pin, account.username);
  }

  account.lastLoginAt = new Date().toISOString();
  state.currentAccountId = account.id;
  state.isLocked = false;
  saveAuthState(state);

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
  removeItem('theme');
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
    const rawTheme = getItem('theme');

    if (rawUser) account.userState = JSON.parse(rawUser);
    if (rawTheme) account.theme = rawTheme as any;
  } catch { /* ignore */ }

  saveAuthState(state);
}

/**
 * 현재 계정의 프로필 정보(표시 이름, 클래스, PIN, 아바타)를 수정합니다.
 */
export async function updateAccountProfile(updates: {
  displayName?: string;
  heroClass?: UserProfile['heroClass'];
  currentPin: string;
  newPin?: string;
  avatarBgColor?: string;
  avatarIconSymbol?: string;
}): Promise<{ success: boolean; message: string; account?: Account }> {
  const state = loadAuthState();
  const account = state.accounts.find(a => a.id === state.currentAccountId);

  if (!account) {
    return { success: false, message: '현재 로그인된 계정이 없습니다.' };
  }

  const { isValid } = await verifyPin(updates.currentPin, account.username, account.pin);
  if (!isValid) {
    return { success: false, message: '현재 보안 PIN이 올바르지 않습니다.' };
  }

  if (updates.newPin) {
    if (!/^\d{4}$/.test(updates.newPin)) {
      return { success: false, message: '새 PIN은 정확히 4자리 숫자여야 합니다.' };
    }
    account.pin = await hashPin(updates.newPin, account.username);
  }

  if (updates.displayName && updates.displayName.trim()) {
    const name = updates.displayName.trim();
    account.displayName = name;
    if (account.userState) {
      account.userState.name = name;
    }
  }

  if (updates.heroClass) {
    account.heroClass = updates.heroClass;
    if (account.userState) {
      account.userState.heroClass = updates.heroClass;
    }
  }

  if (updates.avatarBgColor || updates.avatarIconSymbol) {
    account.avatar = {
      bgColor: updates.avatarBgColor || account.avatar.bgColor,
      iconSymbol: updates.avatarIconSymbol || account.avatar.iconSymbol,
    };
  }

  saveAuthState(state);
  syncAccountToStore(account);

  return {
    success: true,
    message: '계정 정보가 성공적으로 수정되었습니다!',
    account,
  };
}

/**
 * 계정별 프로필만 메인 스토어에 동기화합니다.
 * 몬스터와 기타 업무 데이터는 모든 계정이 함께 보는 공용 워크스페이스이므로
 * 로그인/전환 과정에서 덮어쓰지 않습니다.
 */
function syncAccountToStore(account: Account): void {
  setItem('userState', JSON.stringify(account.userState));
  setItem('theme', account.theme);
}
