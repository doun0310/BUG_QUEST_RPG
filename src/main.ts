import './style.css';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';
import { soundFx } from './soundManager';
import { showToast } from './toastManager';
import { getLang, setLang } from './i18n';
import { generateAIDebugGuide } from './aiService';
import { getGitHubConfig, saveGitHubConfig, verifyGitHubConfig, mergeGitHubPullRequest, fetchOpenPullRequests, type GitHubPullRequest } from './services/githubService';
import { exportAppData, parseBackupFile } from './services/dataBackupService';
import { particleService } from './services/particleService';
import { generateMonsterPreset } from './services/monsterPresetEngine';
import { getWebhookConfig, saveWebhookConfig, notifyMonsterDefeated } from './services/webhookNotifier';
import { parseLcovContent } from './services/lcovParser';
import { isLoggedIn, login, logout, createAccount, switchAccount, saveCurrentGameStateToAccount, getCurrentAccount, lockSession, unlockSession, isSessionLocked } from './services/authService';
import { renderLoginScreen } from './components/LoginScreen';
import { renderOnboardingWizard, type WizardStep } from './components/OnboardingWizard';
import { isOnboardingComplete, completeOnboarding, loadTeamSettings, saveTeamSettings, resetOnboarding, toTeamMemberCapacity } from './services/teamSettingsService';
import type { TeamMemberInput } from './types';
import { store } from './store';
import { icon } from './icons';
import { renderHeader } from './components/Header';
import { renderMonsterBoard } from './components/MonsterBoard';
import { renderSidebar } from './components/Sidebar';
import { renderCodexModal } from './components/modals/CodexModal';
import { renderAttackModal } from './components/modals/AttackModal';
import { renderCMSChartModal } from './components/modals/CMSChartModal';
import { renderCreateMonsterModal } from './components/modals/CreateMonsterModal';
import { renderTeamSettingsModal } from './components/modals/TeamSettingsModal';
import { renderUserProfileModal } from './components/modals/UserProfileModal';
import { renderOverview } from './components/Overview';
import { updateAccountProfile } from './services/authService';
import { calculateElementalDamage, canEnrage, isDailyClaimAvailable } from './services/gameRules';
import { recalculateWorkload } from './services/workloadService';

import { 
  mockUser, 
  mockVacations, 
  mockTeamMembers,
  calculateCapacity, 
  mockBudget, 
  mockDailySummary, 
  mockMonsters,
  mockWeeklyLeaderboard,
  mockWebhooks,
  mockWeeklyQuests,
  mockGuildWar,
  mockTeamCoopBoss
} from './mockData';
import type { VacationRequest, BugMonster, WebhookPayload, WeeklyQuest, TeamCoopBoss } from './types';

let currentTheme: 'dark' | 'light' | 'matrix' = 'dark';
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'matrix' || savedTheme === 'dark') {
    currentTheme = savedTheme;
  }
} catch {
  // fallback to dark
}

let storedUser = null;
let storedMonsters = null;
let storedProgress = null;
try {
  storedUser = localStorage.getItem('userState');
  storedMonsters = localStorage.getItem('monstersState');
  storedProgress = localStorage.getItem('gameProgressState');
} catch {
  // fallback
}

let vacationsState: VacationRequest[] = [...mockVacations];
let teamState = [...mockTeamMembers];
let monstersState: BugMonster[] = [...mockMonsters];
let webhooksState: WebhookPayload[] = [...mockWebhooks];
let questsState: WeeklyQuest[] = [...mockWeeklyQuests];
let userState = { ...mockUser };
let coopBossState: TeamCoopBoss = { ...mockTeamCoopBoss };
const dungeonProgress: Record<string, boolean> = { frontend: false, api: false, infra: false };

try {
  if (storedMonsters) monstersState = JSON.parse(storedMonsters);
} catch {
  monstersState = [...mockMonsters];
}

try {
  if (storedProgress) Object.assign(dungeonProgress, JSON.parse(storedProgress).dungeonProgress || {});
} catch { /* retain defaults */ }

try {
  if (storedUser) userState = JSON.parse(storedUser);
} catch {
  userState = { ...mockUser };
}

function saveState() {
  localStorage.setItem('userState', JSON.stringify(userState));
  localStorage.setItem('monstersState', JSON.stringify(monstersState));
  localStorage.setItem('gameProgressState', JSON.stringify({ dungeonProgress }));
}

let simExtraDevs: number = 0;
let simExtraVacationDays: number = 0;

let bugFilter: 'all' | 'active' | 'defeated' = 'all';
let battleLogMessage: string = '버그 퀘스트 전장에 오신 것을 환영합니다! 몬스터를 타격하여 PR을 통합하세요.';

let hitMonsterId: string | null = null;
let lastHitDamageText: string | null = null;
let isSkillActiveNextAttack: boolean = false;

// Modal States
let activeModal: 'vacation' | 'attack' | 'leaderboard' | 'inventory' | 'webhook' | 'cmsDetails' | 'lootBox' | 'forge' | 'quests' | 'simulator' | 'radarStats' | 'seasonPass' | 'guildWar' | 'coopBoss' | 'dungeonMap' | 'dailyRoulette' | 'reassign' | 'createMonster' | 'postMortem' | 'codex' | 'execAnalytics' | 'achievements' | 'apiSync' | 'raidShop' | 'socialFeed' | 'aiPrediction' | 'cicdPipeline' | 'slackBot' | 'releaseMilestone' | 'skillTree' | 'teamSettings' | 'userProfile' | null = null;
const dailyRewardKey = 'bug_quest_daily_reward_date';
/** Daily rewards follow the product's Korean business day, not UTC midnight. */
const todayKey = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value || '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
};
const currentWeekLabel = () => {
  const [year, month, day] = todayKey().split('-').map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const mondayOffset = (firstDay + 6) % 7;
  return `${month}월 ${Math.ceil((day + mondayOffset) / 7)}주차`;
};
let selectedPostMortemMonsterId: string | null = null;
let attackTargetId: string | null = null;
let lastLootReward: string | null = null;
let reassignTargetId: string | null = null;

let burnChartInstance: Chart | null = null;
let radarChartInstance: Chart | null = null;

// 팀 설정 및 프로필 모달 상태
let editModalMembers: TeamMemberInput[] = [];
let tsModalErrorMsg = '';
let tsModalSuccessMsg = '';
let upModalErrorMsg = '';
let upModalSuccessMsg = '';
let isRpgMenuOpen = false;

function applyTheme() {
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (currentTheme === 'matrix') {
    document.documentElement.setAttribute('data-theme', 'matrix');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

let renderModals: () => string;
let attachEvents: () => void;


let loginErrorMsg = '';
let loginSuccessMsg = '';
let attachLoginEvents: () => void;

// ─── Onboarding Wizard State ────────────────────────────────────────────────
let isOnboardingActive = false;
let wizardStep: WizardStep = 1;
let wizardMembers: TeamMemberInput[] = [];
let wizardErrorMsg = '';
let attachWizardEvents: () => void;

function renderApp() {
  applyTheme();

  const appContainer = document.querySelector<HTMLDivElement>('#app');
  if (!appContainer) return;

  if (!isLoggedIn() || isSessionLocked()) {
    appContainer.innerHTML = renderLoginScreen(loginErrorMsg, loginSuccessMsg);
    attachLoginEvents();
    return;
  }

  // 온보딩 미완료 시 위저드 표시
  if (!isOnboardingComplete()) {
    isOnboardingActive = true;
    appContainer.innerHTML = renderOnboardingWizard(wizardStep, wizardMembers, wizardErrorMsg);
    attachWizardEvents();
    return;
  }
  isOnboardingActive = false;

  teamState = recalculateWorkload(teamState, vacationsState, monstersState);

  const state = {
    userState,
    teamState,
    monstersState,
    vacationsState,
    bugFilter,
    battleLogMessage,
    isSkillActiveNextAttack,
    hitMonsterId,
    lastHitDamageText,
    calculateCapacity,
    mockBudget,
    mockDailySummary
  } as any;
  
  appContainer.innerHTML = `
    <div class="app-shell">
      <div id="app-header-container">${renderHeader(state)}</div>
      ${renderOverview(state)}
      <main id="app-main-layout" class="workspace-layout">
        <section id="app-board-container" class="workspace-primary">
        ${renderMonsterBoard(state)}
        </section>
        <aside id="app-sidebar-container" class="workspace-secondary">
        ${renderSidebar(state)}
        </aside>
      </main>
      <div id="app-modals">${renderModals()}</div>
    </div>
  `;

  attachEvents();
  renderChartIfModalOpen();
}

function renderChartIfModalOpen() {
  if (activeModal === 'cmsDetails') {
    setTimeout(() => {
      const ctx = document.getElementById('burnChartCanvas') as HTMLCanvasElement;
      if (ctx) {
        if (burnChartInstance) {
          burnChartInstance.destroy();
        }

        const chartCtx = ctx.getContext('2d');
        let idealGradient: any = '#38bdf8';
        let actualGradient: any = '#fb7185';

        if (chartCtx) {
          idealGradient = chartCtx.createLinearGradient(0, 0, 0, 250);
          idealGradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          idealGradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

          actualGradient = chartCtx.createLinearGradient(0, 0, 0, 250);
          actualGradient.addColorStop(0, 'rgba(251, 113, 133, 0.5)');
          actualGradient.addColorStop(1, 'rgba(251, 113, 133, 0.0)');
        }

        burnChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['10일차', '20일차', '35일차 (현재)', '45일차', '60일차 (완료)'],
            datasets: [
              {
                label: '목표 예산 소진 (Ideal)',
                data: [16.6, 33.3, 58.3, 75.0, 100],
                borderColor: '#38bdf8',
                backgroundColor: idealGradient,
                borderDash: [6, 6],
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: '#38bdf8'
              },
              {
                label: '실제 예산 소진 (Actual)',
                data: [22.0, 48.0, 73.0, null, null],
                borderColor: '#fb7185',
                backgroundColor: actualGradient,
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointBackgroundColor: '#fb7185'
              }
            ]
          },
          options: {
            responsive: true,
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            plugins: {
              tooltip: {
                backgroundColor: '#121824',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: '#232d3f',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += context.parsed.y + '%';
                      if (context.dataset.label?.includes('Actual')) {
                        label += ' (⚠️ 초과 소진 주의)';
                      }
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(35, 45, 63, 0.5)' },
                ticks: { color: '#94a3b8' }
              },
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(35, 45, 63, 0.5)' },
                ticks: {
                  color: '#94a3b8',
                  callback: (value) => `${value}%`
                }
              }
            }
          }
        });
      }
    }, 50);
  }

  if (activeModal === 'radarStats') {
    setTimeout(() => {
      const ctx = document.getElementById('radarChartCanvas') as HTMLCanvasElement;
      if (ctx) {
        if (radarChartInstance) {
          radarChartInstance.destroy();
        }

        radarChartInstance = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['공격력 (생산성)', '방어력 (테스트 커버리지)', '민첩성 (SLA 준수)', '지능 (코드 리뷰)'],
            datasets: [
              {
                label: `${userState.name} 개발 스탯`,
                data: [userState.stats.productivity, userState.stats.testCoverage, userState.stats.agility, userState.stats.codeReview],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.3)',
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#38bdf8',
                borderWidth: 3,
                pointRadius: 5
              }
            ]
          },
          options: {
            responsive: true,
            animation: {
              duration: 1200,
              easing: 'easeOutElastic'
            },
            plugins: {
              tooltip: {
                backgroundColor: '#121824',
                titleColor: '#38bdf8',
                bodyColor: '#f1f5f9',
                borderColor: '#232d3f',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: (context) => ` 현재 측정 수치: ${context.formattedValue}점 / 100점`
                }
              }
            },
            scales: {
              r: {
                angleLines: { color: '#232d3f' },
                grid: { color: '#232d3f' },
                pointLabels: { color: '#f1f5f9', font: { size: 12, weight: 'bold' } },
                ticks: { backdropColor: 'transparent', color: '#94a3b8' },
                suggestedMin: 0,
                suggestedMax: 100
              }
            }
          }
        });
      }
    }, 50);
  }
}
let openPRsList: GitHubPullRequest[] = [];
let isFetchingOpenPRs = false;

renderModals = function renderModals() {
  if (!activeModal) return '';

  const state = {
    userState,
    teamState,
    monstersState,
    vacationsState,
    activeModal,
    selectedPostMortemMonsterId,
    attackTargetId,
    lastLootReward,
    isSkillActiveNextAttack,
    openPRs: openPRsList,
    isFetchingOpenPRs,
  } as any;

  if (activeModal === 'codex') return renderCodexModal(state);
  if (activeModal === 'attack') return renderAttackModal(state);
  if (activeModal === 'cmsDetails') return renderCMSChartModal(state);
  if (activeModal === 'createMonster') return renderCreateMonsterModal(state);
  if (activeModal === 'teamSettings') return renderTeamSettingsModal(editModalMembers, tsModalErrorMsg, tsModalSuccessMsg);
  if (activeModal === 'userProfile') return renderUserProfileModal(upModalErrorMsg, upModalSuccessMsg);

  if (activeModal === 'skillTree') {
    const cls = userState.devClass || '프론트엔드 마법사';
    const sp = userState.skillPoints ?? 0;
    const levels = userState.skillLevels || { shield: 0, transaction: 0, automation: 0 };

    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 560px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700;">⚔️ 전직 클래스 & 스킬 트리 (Class & Skill Tree)</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.78rem; color: var(--text-sub);">현재 클래스</span>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${cls}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.78rem; color: var(--text-sub);">보유 스킬 포인트</span>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--warning);">${sp} SP</div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.45rem;margin-bottom:1rem;">
            ${(['프론트엔드 마법사', '백엔드 전사', 'DevOps 성기사'] as const).map(devClass => `<button class="action-btn action-btn-secondary btn-select-dev-class ${cls === devClass ? 'is-selected-class' : ''}" data-class="${devClass}" style="justify-content:center;min-height:48px;font-size:0.7rem;${cls === devClass ? 'border-color:var(--primary);color:var(--primary-light);background:var(--primary-bg);' : ''}">${devClass}</button>`).join('')}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="background: var(--inner-box-bg); padding: 0.75rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem; color: #38bdf8;">✨ [액티브] CSS Z-Index 무적 실드</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.15rem;">버그 몬스터의 다음 공격 피해를 100% 무효화 (쿨타임 3턴)</div>
              </div>
              <button class="action-btn btn-upgrade-skill" data-skill="shield" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Lv.${levels.shield}/3 · 강화</button>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem; color: #fb7185;">💥 [액티브] DB 트랜잭션 2배 타격</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.15rem;">다음 PR Merge 공격 피해량 200% 폭발적 증가</div>
              </div>
              <button class="action-btn btn-upgrade-skill" data-skill="transaction" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Lv.${levels.transaction}/3 · 강화</button>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem; color: #4ade80;">🛡️ [패시브] CI/CD 무적 자동화</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.15rem;">SLA 초과 시 발생하는 HP 감소 피해를 50% 반감</div>
              </div>
              <button class="action-btn btn-upgrade-skill" data-skill="automation" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">Lv.${levels.automation}/3 · 강화</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'dungeonMap') {
    const dungeons = [
      { id: 'frontend', icon: 'paint', name: '프론트엔드 던전', boss: '레이아웃 쉐이프시프터', reward: 'CSS 아티팩트', tone: 'var(--primary-light)' },
      { id: 'api', icon: 'server', name: 'API 던전', boss: '타임아웃 하이드라', reward: 'API 아티팩트', tone: 'var(--sky)' },
      { id: 'infra', icon: 'rocket', name: '인프라 파이프라인', boss: '배포 드래곤', reward: '배포 아티팩트', tone: 'var(--success)' },
    ] as const;
    return `<div class="modal-backdrop" id="modal-backdrop"><div class="modal-card" style="max-width:680px;">
      <div class="modal-heading"><div class="modal-heading-icon">${icon('map', '', 18)}</div><div class="modal-heading-copy"><p>DUNGEON MAP</p><h2>던전 월드맵</h2></div><button class="modal-close" id="btn-close-modal">${icon('close', '', 16)}</button></div>
      <p class="modal-description">각 던전의 보스를 토벌해 팀 아티팩트를 수집하세요.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.7rem;">${dungeons.map(d => `<section style="padding:1rem;border:1px solid ${dungeonProgress[d.id] ? 'var(--success-border)' : 'var(--panel-border)'};border-radius:12px;background:var(--inner-box-bg);">
        <div style="color:${d.tone};margin-bottom:.55rem;">${icon(d.icon, '', 22)}</div><strong style="font-size:.85rem;">${d.name}</strong><p style="font-size:.7rem;color:var(--text-sub);margin:.35rem 0;">보스: ${d.boss}</p><span class="badge ${dungeonProgress[d.id] ? 'badge-success' : ''}">${dungeonProgress[d.id] ? '클리어' : `보상: ${d.reward}`}</span>
        <button class="action-btn btn-clear-dungeon" data-dungeon="${d.id}" style="width:100%;justify-content:center;margin-top:.75rem;" ${dungeonProgress[d.id] ? 'disabled' : ''}>${dungeonProgress[d.id] ? '완료' : '보스 도전'}</button>
      </section>`).join('')}</div>
    </div></div>`;
  }

  if (activeModal === 'dailyRoulette') {
    const claimedToday = !isDailyClaimAvailable(localStorage.getItem(dailyRewardKey), todayKey());
    const rewards = ['+50 XP', '커피 포션', '+1 SP', '희귀 아티팩트', '+100 XP', '보물 상자', 'HP +30', '골드 티켓'];
    return `<div class="modal-backdrop" id="modal-backdrop"><div class="modal-card" style="max-width:480px;text-align:center;">
      <div class="modal-heading"><div class="modal-heading-icon">${icon('ticket', '', 18)}</div><div class="modal-heading-copy" style="text-align:left;"><p>DAILY CHECK-IN</p><h2>일일 출석 룰렛</h2></div><button class="modal-close" id="btn-close-modal">${icon('close', '', 16)}</button></div>
      <p class="modal-description" style="text-align:left;">매일 한 번, 오늘의 개발 행운을 획득하세요.</p>
      <div class="daily-roulette" id="daily-roulette"><div class="roulette-pointer">◆</div><div class="roulette-wheel">${rewards.map((reward, i) => `<span style="transform:rotate(${i * 45}deg) translateY(-88px) rotate(-${i * 45}deg)">${reward}</span>`).join('')}</div></div>
      <button class="action-btn" id="btn-spin-daily-roulette" style="margin-top:1rem;min-width:180px;justify-content:center;" ${claimedToday ? 'disabled' : ''}>${claimedToday ? '오늘의 출석 완료' : '룰렛 돌리기'}</button>
      <p style="margin-top:.65rem;font-size:.7rem;color:var(--text-muted);">${claimedToday ? '내일 다시 도전할 수 있습니다.' : '출석 보상은 자정에 초기화됩니다.'}</p>
    </div></div>`;
  }

  if (activeModal === 'reassign') {
    const target = monstersState.find(monster => monster.id === reassignTargetId);
    const members = [...new Set([userState.name, ...teamState.map(member => member.userName)])];
    return `<div class="modal-backdrop" id="modal-backdrop"><div class="modal-card modal-form-card">
      <div class="modal-heading"><div class="modal-heading-icon">${icon('users', '', 18)}</div><div class="modal-heading-copy"><p>ASSIGN ISSUE</p><h2>담당자 변경</h2></div><button class="modal-close" id="btn-close-modal">${icon('close', '', 16)}</button></div>
      <p class="modal-description"><strong>${target?.title ?? '선택한 이슈'}</strong>의 담당 개발자를 변경합니다.</p>
      <form id="form-reassign"><div class="form-group"><label for="reassign-assignee">담당 개발자</label><select class="form-select" id="reassign-assignee">${members.map(name => `<option value="${name}" ${target?.assignee === name ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="modal-actions"><button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button><button type="submit" class="action-btn">${icon('check', 'color:white', 14)} 담당자 저장</button></div></form>
    </div></div>`;
  }

  if (activeModal === 'releaseMilestone') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('flag', 'color:var(--primary-light)', 18)} v2.0 릴리즈 배포 마일스톤</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span>v2.0 배포 준비율: <strong>85% (17/20 버그 토벌)</strong></span>
              <span style="color: var(--primary); font-weight: 700;">D-2 남음</span>
            </div>
            <div class="hp-bar-outer">
              <div class="xp-bar-inner" style="width: 85%;"></div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 1rem;">
            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.82rem;">✅ [보안] JWT 인증 토큰 갱신 버그 토벌</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">개발자 박지훈 완료</div>
              </div>
              <span class="badge badge-success">완료</span>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.82rem;">[결제] 결제 모듈 Memory Leak (BOSS RAID)</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">레이드 진행 중 (HP 400/1000)</div>
              </div>
              <span class="badge badge-warning">진행 중</span>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="action-btn" id="btn-deploy-release">v2.0 최종 배포 승인 & 전원 300 XP 수령</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'slackBot') {
    const whConfig = getWebhookConfig();
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('slack', 'color:var(--primary-light)', 18)} Slack / Teams 실시간 Webhook 연동</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <form id="form-webhook-config" style="margin-bottom: 1rem;">
            <div class="form-group">
              <label>Slack Incoming Webhook URL</label>
              <input type="text" class="form-input" id="wh-slack-url" value="${whConfig.slackUrl}" placeholder="https://hooks.slack.com/services/..." />
            </div>

            <div class="form-group">
              <label>Microsoft Teams Webhook URL</label>
              <input type="text" class="form-input" id="wh-teams-url" value="${whConfig.teamsUrl}" placeholder="https://outlook.office.com/webhook/..." />
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; text-transform: none; font-size: 0.78rem; color: var(--text-main);">
                <input type="checkbox" id="wh-enable" ${whConfig.isEnabled ? 'checked' : ''} style="accent-color: var(--primary); width: 15px; height: 15px;" />
                <span>몬스터 토벌 시 Slack / Teams 메신저로 실시간 카드 알림 전송 활성화</span>
              </label>
            </div>

            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button type="submit" class="action-btn" style="display: flex; align-items: center; gap: 0.35rem;">
                ${icon('check', 'color:white', 13)} Webhook 설정 저장 &amp; 알림 테스트
              </button>
            </div>
          </form>

          <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
            <div style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 0.35rem;">슬래시 명령어 실시간 실행 테스트</div>
            <div style="display: flex; gap: 0.35rem;">
              <input type="text" class="form-input" id="slack-cmd-input" value="/bug-attack AUTH-401 https://github.com/org/repo/pull/142" style="flex: 1;" />
              <button class="action-btn" id="btn-run-slack-cmd" style="padding: 0.35rem 0.75rem;">전송</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'cicdPipeline') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('rocket', 'color:var(--primary-light)', 18)} CI/CD 파이프라인 실시간 상태</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem;">
              <span>연동 워크플로우: <strong>GitHub Actions (#8841)</strong></span>
              <span style="color: var(--success); font-weight: 700;">● SUCCESS</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-sub);">최근 빌드: main 브랜치 PR #142 자동 검증 완료 (경과 시간: 1분 12초)</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem;">
            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.82rem;">1. Lint & TypeScript Compile</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">0 Errors / 0 Warnings</div>
              </div>
              <span class="badge badge-success">PASSED</span>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.82rem;">2. Unit & Integration Test Suite</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">48 / 48 Tests Passed (Coverage 94%)</div>
              </div>
              <span class="badge badge-success">PASSED</span>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.82rem;">3. RPG Auto-Damage Webhook Trigger</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">[PAY-909] 몬스터 체력 -500 HP 자동 차감 트리거발동</div>
              </div>
              <span class="badge badge-success">TRIGGERED</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'aiPrediction') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('brain', 'color:var(--primary-light)', 18)} AI 버그 위험도 예측 분석기</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 0.35rem;">전체 코드베이스 버그 위험 지수</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 1.4rem; font-weight: 800; color: var(--warning);">38% (안정)</span>
              <span style="font-size: 0.72rem; color: var(--success);">최근 24시간 동안 위험 12% 감소</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem;">
            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.2rem;">
                <span>AuthMiddleware.ts (토큰 검증 모듈)</span>
                <span style="color: var(--danger);">위험도 88% (높음)</span>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-sub);">AI 진단: 야간 커밋 비중이 높고 테스트 커버리지가 45%로 낮아 잠재적 버그 출현 가능성 높음.</div>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.2rem;">
                <span>PaymentGateway.ts (결제 API)</span>
                <span style="color: var(--warning);">위험도 54% (보통)</span>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-sub);">AI 진단: 외부 PG사 연동 타임아웃 예외 처리 보강 필요.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'socialFeed') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('chat', 'color:var(--primary-light)', 18)} 팀 소셜 피드 & 칭찬 (Kudos)</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 320px; overflow-y: auto;">
            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-sub); margin-bottom: 0.25rem;">
                <strong>🔥 개발자 박지훈</strong>
                <span>방금 전</span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 0.4rem;">
                [PAY-909 결제 모듈 Memory Leak (BOSS RAID)] 몬스터에게 500 크리티컬 피해를 입혔습니다!
              </p>
              <button class="action-btn btn-send-kudos" style="padding: 0.2rem 0.55rem; font-size: 0.7rem;">👏 박수 보내기 (+10 Kudos)</button>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-sub); margin-bottom: 0.25rem;">
                <strong>🔨 개발자 김민수</strong>
                <span>10분 전</span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-main); margin-bottom: 0.4rem;">
                기계식 청축 키보드 +7 강화에 성공하였습니다! 🎉
              </p>
              <button class="action-btn btn-send-kudos" style="padding: 0.2rem 0.55rem; font-size: 0.7rem;">👏 박수 보내기 (+10 Kudos)</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'raidShop') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('shop', 'color:var(--warning)', 18)} 보스 레이드 코인 교환 상점</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 0.85rem; font-size: 0.82rem;">
            보유 레이드 코인: <strong style="color: var(--warning); font-size: 1rem;">1,250 코인</strong>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem;">
            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem;">☕ 스타벅스 아메리카노 모바일 기프티콘</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.1rem;">실물 모바일 쿠폰 발송 (500 코인)</div>
              </div>
              <button class="action-btn btn-buy-shop-item" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">구매</button>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.85rem;">⚡ 크리티컬 2배 버프 포션</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.1rem;">다음 공격 피해 200% 증가 (300 코인)</div>
              </div>
              <button class="action-btn btn-buy-shop-item" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">구매</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'apiSync') {
    const ghConfig = getGitHubConfig();
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('plug', 'color:var(--primary-light)', 18)} GitHub 및 외부 이슈 연동 설정
          </h2>
          <p style="font-size: 0.76rem; color: var(--text-sub); margin-bottom: 1rem;">
            실제 GitHub 계정의 Personal Access Token(PAT)과 저장소를 등록하면, 게임 내에서 [PR 통합 공격] 실행 시 <strong>실제 GitHub 저장소의 Pull Request가 자동으로 머지</strong>됩니다.
          </p>

          <form id="form-api-sync">
            <div class="form-group">
              <label>연동 플랫폼 선택</label>
              <select class="form-select" id="api-provider">
                <option value="github" selected>GitHub (REST API v3 / Pull Request Auto-Merge)</option>
                <option value="jira">Jira Software Cloud (Atlassian REST API v3)</option>
                <option value="gitlab">GitLab Issue Board (REST API v4)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.3rem;">
                ${icon('key', '', 12)} GitHub Personal Access Token (PAT)
              </label>
              <input type="password" class="form-input" id="gh-token" value="${ghConfig.token}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" required />
              <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 0.2rem;">
                필요 권한: <code>repo</code> 또는 <code>pull_requests:write</code> (GitHub -> Settings -> Developer settings -> Tokens)
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
              <div class="form-group">
                <label>저장소 소유자 (Owner)</label>
                <input type="text" class="form-input" id="gh-owner" value="${ghConfig.owner}" placeholder="e.g. octocat" required />
              </div>
              <div class="form-group">
                <label>저장소 이름 (Repository)</label>
                <input type="text" class="form-input" id="gh-repo" value="${ghConfig.repo}" placeholder="e.g. my-cool-project" required />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; text-transform: none; font-size: 0.78rem; color: var(--text-main);">
                <input type="checkbox" id="gh-enable" ${ghConfig.isEnabled ? 'checked' : ''} style="accent-color: var(--primary); width: 15px; height: 15px;" />
                <span>실제 GitHub 자동 PR 머지 기능 활성화 (Uncheck 시 시뮬레이션 모드)</span>
              </label>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
              <button type="submit" class="action-btn" id="btn-save-gh-config" style="display: flex; align-items: center; gap: 0.4rem;">
                ${icon('check', 'color:white', 13)} 연동 테스트 &amp; 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (activeModal === 'achievements') {
    const achievementsList = [
      { id: 'a1', title: '첫 버그 슬레이어', desc: '첫 번째 버그 몬스터를 성공적으로 토벌함', isUnlocked: true },
      { id: 'a2', title: '콤보 연승의 지배자', desc: 'PR Merge 연속 3회 이상 콤보 달성', isUnlocked: userState.streakCount >= 3 },
      { id: 'a3', title: '대장간의 전설', desc: '기계식 청축 키보드 +7 이상 강화 달성', isUnlocked: userState.weapon.enhanceLevel >= 7 },
      { id: 'a4', title: '카페인 마스터', desc: '지친 개발자의 HP를 100까지 회복함', isUnlocked: userState.hp >= 100 },
      { id: 'a5', title: '레이드 파티 리더', desc: '초월급 팀 협동 레이드 보스 타격 참여', isUnlocked: true }
    ];

    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('medal', 'color:var(--warning)', 18)} 명예의 전당: 업적 & 칭호</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.55rem; max-height: 320px; overflow-y: auto;">
            ${achievementsList.map(a => `
              <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center; opacity: ${a.isUnlocked ? 1 : 0.5};">
                <div>
                  <div style="font-weight: 800; font-size: 0.85rem; color: ${a.isUnlocked ? 'var(--warning)' : 'var(--text-sub)'};">${a.title}</div>
                  <div style="font-size: 0.73rem; color: var(--text-sub); margin-top: 0.1rem;">${a.desc}</div>
                </div>
                <div>
                  ${a.isUnlocked ? '<span class="badge badge-warning">해금 완료</span>' : '<span class="badge">미해금</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }



  if (activeModal === 'execAnalytics') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('graph', 'color:var(--success)', 18)} 엑세큐티브 종합 리포트</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 1rem;">
            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.72rem; color: var(--text-sub);">평균 해결 시간 (MTTR)</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-top: 0.2rem;">14.2 시간</div>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.72rem; color: var(--text-sub);">SLA 마감 준수율</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--success); margin-top: 0.2rem;">92.5%</div>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.72rem; color: var(--text-sub);">주간 버그 토벌률</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--warning); margin-top: 0.2rem;">85.0%</div>
            </div>

            <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.72rem; color: var(--text-sub);">누적 리워드 지출액</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">₩140,000</div>
            </div>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border); font-size: 0.78rem; margin-bottom: 0.85rem;">
            <strong style="color: var(--primary);">AI 요약 인사이트:</strong>
            <p style="color: var(--text-sub); margin-top: 0.2rem; line-height: 1.4;">
              팀의 개발 생산성이 전주 대비 +14% 향상되었습니다. SLA 마감 초과 비중이 7.5% 감소하여 서비스 안정성이 대폭 개선되고 있습니다.
            </p>
          </div>

          <div style="background: rgba(129, 140, 248, 0.08); border: 1px solid rgba(129, 140, 248, 0.25); padding: 0.75rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.82rem; color: var(--primary-light);">🧪 LCOV 테스트 커버리지 파일 연동</strong>
              <div style="font-size: 0.7rem; color: var(--text-sub);">lcov.info 파일을 파싱하여 방어력(Test Coverage: ${userState.stats.testCoverage}%) 스탯 자동 업데이트</div>
            </div>
            <button type="button" class="action-btn action-btn-secondary" id="btn-upload-lcov" style="padding: 0.3rem 0.65rem; font-size: 0.72rem; display: flex; align-items: center; gap: 0.3rem;">
              ${icon('checklist', 'color:var(--primary-light)', 13)} lcov.info 업로드
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'postMortem') {
    const targetM = monstersState.find(m => m.id === selectedPostMortemMonsterId);
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">${icon('book', 'color:var(--primary-light)', 18)} 버그 사후 분석 리포트 (Post-Mortem)</h2>
          <p style="font-size: 0.82rem; color: var(--text-sub); margin-bottom: 0.85rem;">
            대상 버그: <strong>${targetM?.title}</strong>
          </p>

          ${targetM?.postMortem ? `
            <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--panel-border); font-size: 0.8rem; margin-bottom: 1rem;">
              <div style="margin-bottom: 0.35rem;">
                <span class="badge">${targetM.postMortem.category}</span>
                <span style="color: var(--text-sub); float: right; font-size: 0.72rem;">${targetM.postMortem.createdAt}</span>
              </div>
              <div style="margin-bottom: 0.35rem;">
                <strong>근본 원인 (Root Cause):</strong>
                <p style="color: var(--text-main); margin-top: 0.1rem;">${targetM.postMortem.rootCause}</p>
              </div>
              <div>
                <strong>재발 방지책 (Action Item):</strong>
                <p style="color: var(--primary); margin-top: 0.1rem;">${targetM.postMortem.actionItem}</p>
              </div>
            </div>
            <div style="display: flex; justify-content: flex-end;">
              <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
            </div>
          ` : `
            <form id="form-post-mortem">
              <div class="form-group">
                <label>원인 유형 (Root Cause Category)</label>
                <select class="form-select" id="pm-category">
                  <option value="코드 구현 오류">코드 구현 오류 (Bug in Code)</option>
                  <option value="아키텍처/설계 미흡">아키텍처/설계 미흡 (Design Flaw)</option>
                  <option value="테스트 커버리지 누락">테스트 커버리지 누락 (Missing Unit Test)</option>
                  <option value="서버/인프라 과부하">서버/인프라 과부하 (Infra Spike)</option>
                </select>
              </div>
              <div class="form-group">
                <label>기술적 근본 원인 (Root Cause Detail)</label>
                <textarea class="form-input" id="pm-root-cause" rows="2" placeholder="e.g. JWT Refresh 토큰 만료 로직에서 예외 처리가 빠져 무한 재시도가 발생함" required></textarea>
              </div>
              <div class="form-group">
                <label>재발 방지 조치 (Action Item)</label>
                <input type="text" class="form-input" id="pm-action-item" placeholder="e.g. Unit Test 케이스 추가 및 Axios Interceptor 에러 억제 로직 추가" required />
              </div>
              <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.85rem;">
                <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
                <button type="submit" class="action-btn">회고 저장 (+50 XP 수령)</button>
              </div>
            </form>
          `}
        </div>
      </div>
    `;
  }



  if (activeModal === 'coopBoss') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card dq-window" style="max-width: 520px; text-align: center;">
          <h2 class="dq-text" style="color: var(--danger); margin-bottom: 0.6rem;">[ 팀 협동 초월급 레이드 보스 ]</h2>
          <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 0.5rem;">
            ${coopBossState.name}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-sub); margin-bottom: 0.85rem;">
            HP: <strong>${coopBossState.currentHp} / ${coopBossState.maxHp}</strong> | 최종 보상: <strong style="color: var(--warning);">${coopBossState.rewardItem}</strong>
          </div>

          <div class="hp-bar-outer" style="height: 12px; margin-bottom: 1rem;">
            <div style="width: ${(coopBossState.currentHp / coopBossState.maxHp) * 100}%; height: 100%; background: var(--danger); border-radius: 3px;"></div>
          </div>

          <div style="background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 1rem; text-align: left;">
            <div style="font-weight: 700; font-size: 0.82rem; color: var(--primary); margin-bottom: 0.4rem;">🛡️ 참가 개발자 누적 딜량:</div>
            ${coopBossState.participants.map(p => `
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.2rem;">
                <span>${p.name}</span>
                <strong>-${p.damageDealt} HP</strong>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 0.4rem; justify-content: center;">
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
            <button class="action-btn action-btn-danger" id="btn-attack-coopboss">합동 PR 타격 (-300 HP)</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'seasonPass') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('ticket', 'color:var(--warning)', 18)} 월간 개발 시즌패스</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 1rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 0.85rem;">
            <div style="font-size: 0.95rem; font-weight: 800; color: var(--primary); margin-bottom: 0.3rem;">
              ${userState.seasonPass.seasonName}
            </div>
            <div style="font-size: 0.82rem; color: var(--text-sub); margin-bottom: 0.75rem;">
              현재 티어: <strong>Tier ${userState.seasonPass.currentTier} / ${userState.seasonPass.maxTier}</strong>
            </div>

            <div style="margin-bottom: 0.85rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.2rem;">
                <span>시즌 Pass XP (${userState.seasonPass.passXp} / ${userState.seasonPass.maxPassXp})</span>
              </div>
              <div class="hp-bar-outer">
                <div class="xp-bar-inner" style="width: ${(userState.seasonPass.passXp / userState.seasonPass.maxPassXp) * 100}%;"></div>
              </div>
            </div>

            <div style="border-top: 1px solid var(--panel-border); padding-top: 0.75rem; font-size: 0.82rem;">
              <span style="color: var(--warning); font-weight: 700;">🎁 최종 달성 보상:</span>
              <div style="color: var(--text-main); margin-top: 0.2rem;">${userState.seasonPass.rewardSkin}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'guildWar') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 480px; text-align: center;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('guild', 'color:var(--danger)', 18)} 팀 간 길드 대항전 (Dev Guild War)</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 1.25rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 0.85rem;">
            <div style="font-size: 0.82rem; color: var(--danger); font-weight: 700; margin-bottom: 1rem;">
              ⏳ 주간 대항전 종료까지 ${mockGuildWar.daysLeft}일 남음!
            </div>

            <div style="display: flex; justify-content: space-around; align-items: center;">
              <div>
                <div style="font-size: 1.8rem;">${mockGuildWar.guildA.avatar}</div>
                <strong style="font-size: 0.9rem;">${mockGuildWar.guildA.name}</strong>
                <div style="font-size: 1.1rem; color: var(--primary); font-weight: 800; margin-top: 0.2rem;">${mockGuildWar.guildA.score} P</div>
              </div>

              <div style="font-size: 1.2rem; font-weight: 900; color: var(--danger);">VS</div>

              <div>
                <div style="font-size: 1.8rem;">${mockGuildWar.guildB.avatar}</div>
                <strong style="font-size: 0.9rem;">${mockGuildWar.guildB.name}</strong>
                <div style="font-size: 1.1rem; color: var(--warning); font-weight: 800; margin-top: 0.2rem;">${mockGuildWar.guildB.score} P</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'radarStats') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 480px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('radar', 'color:var(--sky)', 18)} 개별 개발자 스탯 레이더 차트</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 1rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 0.85rem;">
            <canvas id="radarChartCanvas" style="max-height: 280px;"></canvas>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-sub); text-align: center;">
            버그 이슈 해결 패턴 및 코드 품질 분석에 기반한 개별 능력치 핑거프린트입니다.
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'simulator') {
    const baseBudget = mockBudget.spentBudget;
    const simBudget = baseBudget + (simExtraDevs * 5000000) - (simExtraVacationDays * 500000);
    const simBurnRate = Math.min(100, Math.round((simBudget / mockBudget.totalBudget) * 100));

    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('flask', 'color:var(--primary-light)', 18)} CMS 예산 & 가동률 시뮬레이터</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 1rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label>추가 개발 인력 투입: <strong style="color: var(--primary);">${simExtraDevs}명</strong></label>
              <input type="range" min="0" max="5" value="${simExtraDevs}" id="slider-devs" style="width: 100%;" />
            </div>

            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label>추가 팀원 휴가 일수: <strong style="color: var(--warning);">${simExtraVacationDays}일</strong></label>
              <input type="range" min="0" max="10" value="${simExtraVacationDays}" id="slider-vacations" style="width: 100%;" />
            </div>

            <div style="border-top: 1px solid var(--panel-border); padding-top: 0.85rem; margin-top: 0.85rem; font-size: 0.82rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                <span>예상 총 소진액:</span>
                <strong>₩${simBudget.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
                <span>예상 예산 소진율:</span>
                <strong style="color: ${simBurnRate > 80 ? 'var(--danger)' : 'var(--success)'};">${simBurnRate}%</strong>
              </div>
              <div class="hp-bar-outer">
                <div style="width: ${simBurnRate}%; height: 100%; background: ${simBurnRate > 80 ? 'var(--danger)' : 'var(--success)'}; border-radius: 3px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }



  if (activeModal === 'forge') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card dq-window" style="max-width: 440px; text-align: center;">
          <h2 class="dq-text" style="color: var(--warning); margin-bottom: 0.6rem;">[ 코드 대장간 ]</h2>
          <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 0.75rem;">
            +${userState.weapon.enhanceLevel} ${userState.weapon.name}
          </div>
          <p style="font-size: 0.82rem; color: var(--text-sub); margin-bottom: 1rem;">
            현재 성능: <strong>${userState.weapon.statBonus}</strong> | 강화 성공 시: <strong>공격력 +${(userState.weapon.enhanceLevel + 1) * 5}%</strong>
          </p>
          <div style="display: flex; gap: 0.4rem; justify-content: center;">
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
            <button class="action-btn action-btn-danger" id="btn-do-enhance">장비 +1 강화 (성공률 70%)</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'quests') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">${icon('checklist', 'color:var(--primary-light)', 18)} 주간 개발자 퀘스트</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${questsState.map(q => `
              <div style="background: var(--inner-box-bg); padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--panel-border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 700; font-size: 0.82rem;">${q.title}</div>
                  <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.1rem;">${q.description}</div>
                  <div style="font-size: 0.7rem; color: var(--warning); margin-top: 0.15rem;">보상: +${q.rewardXp} XP (${q.rewardItem})</div>
                </div>
                <div>
                  ${q.isCompleted ? `
                    <span class="badge badge-success">완료됨</span>
                  ` : `
                    <button class="action-btn btn-complete-quest" data-id="${q.id}" style="padding: 0.25rem 0.5rem; font-size: 0.7rem;">달성 완료</button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'lootBox') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card dq-window" style="text-align: center; max-width: 420px;">
          <h2 class="dq-text" style="color: var(--warning); margin-bottom: 0.6rem;">[ 몬스터 전리품 상자 획득 ]</h2>
          <p style="font-size: 0.82rem; color: #ffffff; margin-bottom: 1rem;">
            몬스터를 처치하여 럭키 전리품 상자를 얻었습니다!
          </p>

          <div style="background: rgba(255,255,255,0.1); border: 2px dashed #ffffff; padding: 0.85rem; border-radius: 6px; font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">
            ${lastLootReward}
          </div>

          <button class="action-btn" id="btn-close-modal" style="width: 100%; justify-content: center;">보상함에 수령하기</button>
        </div>
      </div>
    `;
  }

  if (activeModal === 'vacation') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem;">휴가 / 외근 신청 (HP +50 회복 연동)</h2>
          <form id="form-vacation">
            <div class="form-group">
              <label>신청자 이름</label>
              <input type="text" class="form-input" id="vacation-user" value="${userState.name}" required />
            </div>
            <div class="form-group">
              <label>구분</label>
              <select class="form-select" id="vacation-type">
                <option value="연차">연차 (HP +50 회복)</option>
                <option value="월차">월차 (HP +30 회복)</option>
                <option value="외근">외근</option>
                <option value="병가">병가</option>
              </select>
            </div>
            <div class="form-group">
              <label>시작일</label>
              <input type="date" class="form-input" id="vacation-start" value="${todayKey()}" required />
            </div>
            <div class="form-group">
              <label>종료일</label>
              <input type="date" class="form-input" id="vacation-end" value="${todayKey()}" required />
            </div>
            <div class="form-group">
              <label>신청 사유</label>
              <input type="text" class="form-input" id="vacation-reason" placeholder="사유를 입력하세요" required />
            </div>
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.85rem;">
              <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
              <button type="submit" class="action-btn">신청 완료</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }



  if (activeModal === 'webhook') {
    const ghConfig = getGitHubConfig();
    const whConfig = getWebhookConfig();
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <h2 style="font-size: 1rem; font-weight: 700;">Git Webhook / Slack 메신저 실시간 로그</h2>
            <span class="badge">Live Stream</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem; max-height: 300px; overflow-y: auto;">
            ${webhooksState.map(wh => `
              <div style="background: var(--inner-box-bg); padding: 0.55rem 0.75rem; border-radius: 6px; border: 1px solid var(--panel-border);">
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 0.1rem;">
                  <span class="badge">${wh.eventType}</span>
                  <span style="color: var(--text-sub);">${wh.timestamp} | ${wh.repository}</span>
                </div>
                <div style="font-size: 0.78rem; font-weight: 600;">${wh.summary}</div>
                <div style="font-size: 0.7rem; color: var(--primary); margin-top: 0.1rem;">작성자: ${wh.author} (${wh.branch})</div>
              </div>
            `).join('')}
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:.85rem;">
            <div class="inline-alert ${ghConfig.isEnabled ? 'inline-alert-success' : 'inline-alert-danger'}" style="margin:0;justify-content:space-between;"><span>GitHub ${ghConfig.isEnabled ? '연결됨' : '미연결'}</span><button class="action-btn action-btn-secondary" id="btn-open-api-from-webhook">설정</button></div>
            <div class="inline-alert ${whConfig.isEnabled ? 'inline-alert-success' : 'inline-alert-danger'}" style="margin:0;justify-content:space-between;"><span>메신저 ${whConfig.isEnabled ? '활성' : '비활성'}</span><button class="action-btn action-btn-secondary" id="btn-open-slack-from-webhook">설정</button></div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'leaderboard') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 460px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <h2 style="font-size: 1rem; font-weight: 700;">주간 토벌 랭킹</h2>
            <span class="badge">${currentWeekLabel()}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem;">
            ${mockWeeklyLeaderboard.map(rank => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-box-bg); padding: 0.55rem 0.75rem; border-radius: 6px; border: 1px solid var(--panel-border);">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-weight: 700; font-size: 0.82rem; width: 24px;">${rank.rank}위</span>
                  <div>
                    <strong style="font-size: 0.82rem;">${rank.userName}</strong>
                    <div style="font-size: 0.7rem; color: var(--text-sub);">${rank.role}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="color: var(--warning); font-weight: 700; font-size: 0.82rem;">+${rank.xpEarned} XP</div>
                  <div style="font-size: 0.7rem; color: var(--text-sub);">${rank.bugsSlain}개 완료</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'inventory') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 460px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
            <h2 style="font-size: 1rem; font-weight: 700;">내 도구</h2>
            <span class="badge badge-success">${userState.name} 보유</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 0.85rem;">
            ${userState.inventory.map((item: any) => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-box-bg); padding: 0.55rem 0.75rem; border-radius: 6px; border: 1px solid var(--panel-border);">
                <div>
                  <strong style="font-size: 0.82rem;">${item.name}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.1rem;">${item.description}</div>
                </div>
                <button class="action-btn action-btn-secondary btn-use-item" data-id="${item.id}" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;">
                  사용
                </button>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'codex') {
    const totalCount = monstersState.length;
    const defeatedCount = monstersState.filter(m => m.status === 'Defeated').length;
    const activeCount = totalCount - defeatedCount;

    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 580px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700;">몬스터 도감 & 버그 토벌 전적 (Codex)</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <!-- Codex Summary Header -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="background: var(--inner-box-bg); padding: 0.65rem; border-radius: 8px; text-align: center; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.7rem; color: var(--text-sub);">발견된 버그 몬스터</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">${totalCount} 마리</div>
            </div>
            <div style="background: var(--inner-box-bg); padding: 0.65rem; border-radius: 8px; text-align: center; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.7rem; color: var(--text-sub);">토벌 완료 (Slain)</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--success);">${defeatedCount} 마리</div>
            </div>
            <div style="background: var(--inner-box-bg); padding: 0.65rem; border-radius: 8px; text-align: center; border: 1px solid var(--panel-border);">
              <div style="font-size: 0.7rem; color: var(--text-sub);">전장 출현 중 (Active)</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--danger);">${activeCount} 마리</div>
            </div>
          </div>

          <!-- Codex List Grid -->
          <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 320px; overflow-y: auto; padding-right: 0.3rem;">
            ${monstersState.map(m => `
              <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid ${m.status === 'Defeated' ? 'var(--success-light)' : 'var(--panel-border)'}; opacity: ${m.status === 'Defeated' ? 0.85 : 1};">
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                  <img src="${m.monsterImage || '/cyber_bug.jpg'}" alt="Monster" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid var(--panel-border); ${m.status === 'Defeated' ? 'filter: grayscale(100%);' : ''}" />
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                      <strong style="font-size: 0.85rem; color: ${m.status === 'Defeated' ? 'var(--text-sub)' : 'var(--text-main)'};">
                        ${m.title}
                      </strong>
                      <span class="badge ${m.status === 'Defeated' ? 'badge-success' : 'badge-danger'}">
                        ${m.status === 'Defeated' ? '🏆 토벌 도감 등록' : m.severity}
                      </span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-sub);">
                      위험도: <strong>${m.severity}</strong> | 처치 경험치: <strong style="color: var(--warning);">+${m.rewardXp} XP</strong>
                    </div>
                    ${m.postMortem ? `
                      <div style="font-size: 0.7rem; color: var(--primary); margin-top: 0.2rem; background: rgba(56, 189, 248, 0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">
                        📌 사후 분석: ${m.postMortem.category} (${m.postMortem.actionItem})
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

attachEvents = function attachEvents() {
  if (activeModal === 'teamSettings') {
    attachTeamSettingsModalEvents();
    return;
  }
  if (activeModal === 'userProfile') {
    attachUserProfileModalEvents();
    return;
  }

  const rpgMenuBtn = document.querySelector('#btn-toggle-rpg-menu');
  const rpgDropdownMenu = document.querySelector('#rpg-dropdown-menu');

  if (isRpgMenuOpen && rpgDropdownMenu) {
    rpgDropdownMenu.classList.add('show');
  }

  rpgMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isRpgMenuOpen = !isRpgMenuOpen;
    rpgDropdownMenu?.classList.toggle('show', isRpgMenuOpen);
  });

  rpgDropdownMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const item = target.closest('.dropdown-item');
    if (item && item.id !== 'btn-toggle-sound') {
      isRpgMenuOpen = false;
      rpgDropdownMenu.classList.remove('show');
    }
  });

  document.addEventListener('click', () => {
    isRpgMenuOpen = false;
    rpgDropdownMenu?.classList.remove('show');
  });

  document.querySelector('#btn-open-skilltree')?.addEventListener('click', () => {
    activeModal = 'skillTree';
    renderApp();
  });

  document.querySelector('#btn-open-dungeon-map')?.addEventListener('click', () => {
    activeModal = 'dungeonMap';
    renderApp();
  });

  document.querySelector('#btn-open-daily-roulette')?.addEventListener('click', () => {
    activeModal = 'dailyRoulette';
    renderApp();
  });

  document.querySelector<HTMLButtonElement>('#btn-spin-daily-roulette')?.addEventListener('click', () => {
    const wheel = document.querySelector<HTMLElement>('.roulette-wheel');
    const rewards = [
      { name: '+50 XP', xp: 50 }, { name: '커피 포션', item: '포션: 커피 힐링 (HP +30)' },
      { name: '+1 SP', sp: 1 }, { name: '희귀 아티팩트', item: '희귀 아티팩트: 픽셀 코어' },
      { name: '+100 XP', xp: 100 }, { name: '보물 상자', item: '가차 보물 상자' },
      { name: 'HP +30', hp: 30 }, { name: '골드 티켓', item: '골드 티켓: 조기 퇴근권' }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    wheel?.classList.add('is-spinning');
    setTimeout(() => {
      if (reward.xp) userState.xp += reward.xp;
      if (reward.sp) userState.skillPoints = (userState.skillPoints ?? 0) + reward.sp;
      if (reward.hp) userState.hp = Math.min(userState.maxHp, userState.hp + reward.hp);
      if (reward.item) userState.inventory.push({ id: `daily-${Date.now()}`, name: reward.item, type: '아이템', icon: '✦', description: '일일 출석 룰렛 보상', acquiredAt: todayKey() });
      localStorage.setItem(dailyRewardKey, todayKey());
      soundFx.playVictorySound();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.55 } });
      showToast(`출석 보상 획득: ${reward.name}`, 'success');
      saveState();
      renderApp();
    }, 850);
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-clear-dungeon').forEach(btn => {
    btn.addEventListener('click', () => {
      const dungeon = btn.dataset.dungeon;
      if (!dungeon || dungeonProgress[dungeon]) return;
      dungeonProgress[dungeon] = true;
      const rewards: Record<string, string> = { frontend: 'CSS 아티팩트: 레이아웃 코어', api: 'API 아티팩트: 하이드라 키', infra: '배포 아티팩트: 드래곤 엔진' };
      userState.inventory.push({ id: `artifact-${dungeon}-${Date.now()}`, name: rewards[dungeon], type: '아이템', icon: '✦', description: '던전 보스 토벌로 획득한 팀 아티팩트', acquiredAt: new Date().toISOString().slice(0, 10) });
      userState.xp += 150;
      particleService.triggerImpact(window.innerWidth / 2, window.innerHeight / 2, true);
      soundFx.playVictorySound();
      showToast(`${rewards[dungeon]} 획득! +150 XP`, 'success');
      saveState();
      renderApp();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-select-dev-class').forEach(btn => {
    btn.addEventListener('click', () => {
      userState.devClass = btn.dataset.class as NonNullable<typeof userState.devClass>;
      const multiplier = userState.devClass === '백엔드 전사' ? 2.2 : userState.devClass === 'DevOps 성기사' ? 1.7 : 1.9;
      userState.activeSkill = { ...userState.activeSkill, name: userState.devClass === '백엔드 전사' ? 'DB 트랜잭션 강타' : userState.devClass === 'DevOps 성기사' ? 'CI/CD 자동 방어' : 'CSS Z-Index 실드', damageMultiplier: multiplier };
      saveState();
      renderApp();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-upgrade-skill').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.skill as 'shield' | 'transaction' | 'automation';
      userState.skillLevels ||= { shield: 0, transaction: 0, automation: 0 };
      if (userState.skillLevels[skill] >= 3) {
        showToast('해당 스킬은 이미 최대 레벨입니다.', 'info');
      } else if ((userState.skillPoints ?? 0) > 0) {
        userState.skillPoints = (userState.skillPoints ?? 0) - 1;
        userState.skillLevels[skill] += 1;
        if (skill === 'transaction') userState.activeSkill.damageMultiplier = 2 + userState.skillLevels[skill] * 0.15;
        soundFx.playVictorySound();
        confetti({ particleCount: 35, spread: 40 });
        battleLogMessage = `⚔️ [스킬 강화] 전직 스킬이 한 단계 더 강력해졌습니다!`;
        saveState();
        renderApp();
      } else {
        alert('보유한 스킬 포인트(SP)가 부족합니다! 버그 몬스터를 처치하여 레벨업하세요.');
      }
    });
  });

  document.querySelector('#btn-open-releasemilestone')?.addEventListener('click', () => {
    activeModal = 'releaseMilestone';
    renderApp();
  });

  document.querySelector('#btn-deploy-release')?.addEventListener('click', () => {
    soundFx.playVictorySound();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    userState.xp += 300;
    saveState();
    battleLogMessage = `[v2.0 배포 성공] 프로덕션 정기 릴리즈가 성공적으로 통합되어 전원에 300 XP 수령 보상이 지급되었습니다!`;
    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-open-slackbot')?.addEventListener('click', () => {
    activeModal = 'slackBot';
    renderApp();
  });

  document.querySelector('#btn-run-slack-cmd')?.addEventListener('click', () => {
    const cmdText = (document.querySelector('#slack-cmd-input') as HTMLInputElement).value;
    soundFx.playHitSound();
    confetti({ particleCount: 40 });
    battleLogMessage = `[Slack Bot 응답] '${cmdText}' 명령으로 AUTH-401 몬스터에게 250 타격을 입혔습니다!`;
    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-open-cicdpipeline')?.addEventListener('click', () => {
    activeModal = 'cicdPipeline';
    renderApp();
  });

  document.querySelector('#btn-open-aiprediction')?.addEventListener('click', () => {
    activeModal = 'aiPrediction';
    renderApp();
  });

  document.querySelector('#btn-open-socialfeed')?.addEventListener('click', () => {
    activeModal = 'socialFeed';
    renderApp();
  });

  document.querySelectorAll('.btn-send-kudos').forEach(btn => {
    btn.addEventListener('click', (e) => {
      soundFx.playHitSound();
      confetti({ particleCount: 30, spread: 40 });
      (e.currentTarget as HTMLElement).innerText = '✅ Kudos 송부 완료!';
      (e.currentTarget as HTMLElement).setAttribute('disabled', 'true');
    });
  });

  document.querySelector('#btn-open-raidshop')?.addEventListener('click', () => {
    activeModal = 'raidShop';
    renderApp();
  });

  document.querySelectorAll('.btn-buy-shop-item').forEach(btn => {
    btn.addEventListener('click', () => {
      soundFx.playVictorySound();
      confetti({ particleCount: 50 });
      battleLogMessage = ` [상점 구매 완료] 리워드 상품이 정상 교환되어 보상함으로 지급되었습니다!`;
      activeModal = null;
      renderApp();
    });
  });

  document.querySelector('#btn-open-apisync')?.addEventListener('click', () => {
    activeModal = 'apiSync';
    renderApp();
  });

  document.querySelector('#form-api-sync')?.addEventListener('submit', (e) => {
    e.preventDefault();
    soundFx.playVictorySound();
    confetti({ particleCount: 50 });
    battleLogMessage = ` [API 연동 성공] 외부 이슈와의 동기화가 성공적으로 설정되었습니다!`;
    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-open-achievements')?.addEventListener('click', () => {
    activeModal = 'achievements';
    renderApp();
  });

  document.querySelector('#btn-open-codex')?.addEventListener('click', () => {
    activeModal = 'codex';
    renderApp();
  });

  document.querySelector('#btn-open-execanalytics')?.addEventListener('click', () => {
    activeModal = 'execAnalytics';
    renderApp();
  });

  document.querySelector('#btn-open-create-monster')?.addEventListener('click', () => {
    activeModal = 'createMonster';
    renderApp();
  });

  document.querySelector('#form-create-monster')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = (document.querySelector('#new-monster-title') as HTMLInputElement).value;
    const severity = (document.querySelector('#new-monster-severity') as HTMLSelectElement).value as 'Critical' | 'Major' | 'Minor';
    const assignee = (document.querySelector('#new-monster-assignee') as HTMLInputElement).value;
    const dueDate = (document.querySelector('#new-monster-duedate') as HTMLInputElement).value;
    const selectedImage = (document.querySelector('#new-monster-image') as HTMLSelectElement)?.value;

    const hpMap: Record<'Critical' | 'Major' | 'Minor', number> = { Critical: 1000, Major: 500, Minor: 200 };
    const xpMap: Record<'Critical' | 'Major' | 'Minor', number> = { Critical: 500, Major: 250, Minor: 100 };

    // 100% Automatic preset generation based on bug context & title keywords
    const autoPreset = generateMonsterPreset(title, severity);

    const newMonster: BugMonster = {
      id: 'b-' + (monstersState.length + 1),
      title,
      severity,
      currentHp: hpMap[severity],
      maxHp: hpMap[severity],
      rewardXp: xpMap[severity],
      assignee,
      estimatedHours: severity === 'Critical' ? 16 : severity === 'Major' ? 8 : 4,
      status: 'Active',
      monsterImage: selectedImage || autoPreset.monsterImage,
      dueDate,
      isBoss: severity === 'Critical',
      elementTrait: autoPreset.elementTrait,
      dialogue: autoPreset.dialogue,
      defenseTrait: autoPreset.defenseTrait,
      traitDescription: autoPreset.traitDescription,
    };

    monstersState.unshift(newMonster);
    saveState();
    soundFx.playHitSound();
    confetti({ particleCount: 50 });
    battleLogMessage = ` [신규 몬스터 출현] ${title} 버그 몬스터가 전장에 배치되었습니다!`;

    activeModal = null;
    renderApp();
  });

  document.querySelector('#form-webhook-config')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const slackUrl = (document.querySelector('#wh-slack-url') as HTMLInputElement).value;
    const teamsUrl = (document.querySelector('#wh-teams-url') as HTMLInputElement).value;
    const isEnabled = (document.querySelector('#wh-enable') as HTMLInputElement).checked;

    const newConfig = { slackUrl, teamsUrl, isEnabled };
    saveWebhookConfig(newConfig);

    if (isEnabled) {
      const res = await notifyMonsterDefeated(newConfig, '[테스트 알림] JWT Auth Token Leak Monster', 500, userState.name);
      showToast(res.message, res.success ? 'success' : 'warning');
    } else {
      showToast('Webhook 설정이 저장되었습니다.', 'info');
    }
  });

  document.querySelector('#btn-upload-lcov')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.info,.txt';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const summary = parseLcovContent(content);
          if (summary.coveragePercent > 0) {
            userState.stats.testCoverage = summary.coveragePercent;
            saveState();
            showToast(`🧪 ${summary.message}`, 'success');
            renderApp();
          } else {
            showToast(`⚠️ ${summary.message}`, 'warning');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  document.querySelectorAll('.btn-open-postmortem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedPostMortemMonsterId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      activeModal = 'postMortem';
      renderApp();
    });
  });

  document.querySelector('#form-post-mortem')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = (document.querySelector('#pm-category') as HTMLSelectElement).value;
    const rootCause = (document.querySelector('#pm-root-cause') as HTMLTextAreaElement).value;
    const actionItem = (document.querySelector('#pm-action-item') as HTMLInputElement).value;

    const monster = monstersState.find(m => m.id === selectedPostMortemMonsterId);
    if (monster) {
      monster.postMortem = {
        category,
        rootCause,
        actionItem,
        createdAt: new Date().toLocaleDateString('ko-KR')
      };
      userState.xp += 50;
      soundFx.playVictorySound();
      confetti({ particleCount: 40 });
      battleLogMessage = ` [${monster.title}] 사후 분석 회고가 기록되었습니다! (+50 XP 수령)`;
      saveState();
    }

    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-open-coopboss')?.addEventListener('click', () => {
    activeModal = 'coopBoss';
    renderApp();
  });

  document.querySelector('#btn-attack-coopboss')?.addEventListener('click', () => {
    soundFx.playHitSound();
    coopBossState.currentHp = Math.max(0, coopBossState.currentHp - 300);
    confetti({ particleCount: 60, spread: 50 });
    
    let userP = coopBossState.participants.find(p => p.name === userState.name);
    if (userP) {
      userP.damageDealt += 300;
    } else {
      coopBossState.participants.push({ name: userState.name, damageDealt: 300 });
    }

    if (coopBossState.currentHp === 0) {
      soundFx.playVictorySound();
      confetti({ particleCount: 150, spread: 100 });
      battleLogMessage = ` [${coopBossState.name}] 레이드 완전 처치! 팀원 전체에게 [${coopBossState.rewardItem}] 보상이 수령되었습니다!`;
    } else {
      battleLogMessage = ` [${coopBossState.name}] 레이드 보스에게 -300 HP의 팀 합동 공격을 성공시켰습니다!`;
    }
    renderApp();
  });

  document.querySelector('#btn-open-seasonpass')?.addEventListener('click', () => {
    activeModal = 'seasonPass';
    renderApp();
  });

  document.querySelector('#btn-open-guildwar')?.addEventListener('click', () => {
    activeModal = 'guildWar';
    renderApp();
  });

  document.querySelector('#btn-open-radar')?.addEventListener('click', () => {
    activeModal = 'radarStats';
    renderApp();
  });

  document.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
    soundFx.toggleMute();
    renderApp();
  });

  document.querySelector('#btn-open-simulator')?.addEventListener('click', () => {
    activeModal = 'simulator';
    renderApp();
  });

  document.querySelector('#slider-devs')?.addEventListener('input', (e) => {
    simExtraDevs = parseInt((e.target as HTMLInputElement).value, 10);
    renderApp();
  });

  document.querySelector('#slider-vacations')?.addEventListener('input', (e) => {
    simExtraVacationDays = parseInt((e.target as HTMLInputElement).value, 10);
    renderApp();
  });

  document.querySelector('#filter-all')?.addEventListener('click', () => {
    bugFilter = 'all';
    renderApp();
  });

  document.querySelector('#filter-active')?.addEventListener('click', () => {
    bugFilter = 'active';
    renderApp();
  });

  document.querySelector('#filter-defeated')?.addEventListener('click', () => {
    bugFilter = 'defeated';
    renderApp();
  });

  document.querySelector('#btn-open-pet')?.addEventListener('click', () => {
    alert(`마스코트 펫: ${userState.pet.name}\n종류: ${userState.pet.species}\n레벨: Lv.${userState.pet.level}\n패시브 버프: ${userState.pet.passiveBuff}`);
  });

  document.querySelector('#btn-open-forge')?.addEventListener('click', () => {
    activeModal = 'forge';
    renderApp();
  });

  document.querySelector('#btn-do-enhance')?.addEventListener('click', (e: Event) => {
    soundFx.playEnhanceSound();
    const mouseEvt = e as MouseEvent;
    const x = mouseEvt.clientX || window.innerWidth / 2;
    const y = mouseEvt.clientY || window.innerHeight / 2;

    if (Math.random() < 0.7) {
      userState.weapon.enhanceLevel += 1;
      userState.stats.productivity += 2;
      confetti({ particleCount: 80, spread: 60 });
      particleService.triggerExplosion(x, y, '#fbbf24', 30);
      particleService.spawnFloatingText(x, y - 30, `✨ ENHANCE SUCCESS! +${userState.weapon.enhanceLevel}`, '#fbbf24', 20);
      battleLogMessage = `강화 성공! [${userState.weapon.name}] 이 +${userState.weapon.enhanceLevel} 강화되었습니다! (공격력 스탯 +2 상승)`;
    } else {
      particleService.spawnFloatingText(x, y - 30, '⚡ ENHANCE FAILED', '#f87171', 18);
      battleLogMessage = `강화 실패! 장비 레벨이 유지되었습니다.`;
    }
    renderApp();
  });

  document.querySelector('#btn-open-quests')?.addEventListener('click', () => {
    activeModal = 'quests';
    renderApp();
  });

  document.querySelectorAll('.btn-complete-quest').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const quest = questsState.find(q => q.id === qId);
      if (quest) {
        quest.isCompleted = true;
        userState.xp += quest.rewardXp;
        soundFx.playVictorySound();
        confetti({ particleCount: 50 });
        battleLogMessage = `[${quest.title}] 퀘스트 완료! +${quest.rewardXp} XP 획득`;
        renderApp();
      }
    });
  });

  document.querySelector('#btn-activate-skill')?.addEventListener('click', () => {
    isSkillActiveNextAttack = !isSkillActiveNextAttack;
    if (isSkillActiveNextAttack) {
      battleLogMessage = `[${userState.activeSkill.name}] 스킬 준비 완료! AI 코드 품질 우수 판정 시 2배 데미지가 폭발합니다.`;
    } else {
      battleLogMessage = `스킬 사용이 취소되었습니다.`;
    }
    renderApp();
  });

  document.querySelector('#btn-toggle-sound')?.addEventListener('click', (e) => {
    e.stopPropagation();
    soundFx.toggleMute();
    renderApp();
  });

  const volumeRange = document.querySelector('#sound-volume-range');
  volumeRange?.addEventListener('input', (e) => {
    e.stopPropagation();
    const val = parseInt((e.target as HTMLInputElement).value, 10) / 100;
    soundFx.setVolume(val);
  });
  volumeRange?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    const nextLang = getLang() === 'ko' ? 'en' : 'ko';
    setLang(nextLang);
    showToast(nextLang === 'ko' ? '한국어 모드로 전환되었습니다.' : 'Switched to English mode.', 'info');
    renderApp();
  });

  document.querySelector('#btn-toggle-theme')?.addEventListener('click', () => {
    if (currentTheme === 'dark') currentTheme = 'light';
    else if (currentTheme === 'light') currentTheme = 'matrix';
    else currentTheme = 'dark';
    
    localStorage.setItem('theme', currentTheme);
    renderApp();
  });

  document.querySelector('#btn-open-inventory')?.addEventListener('click', () => {
    activeModal = 'inventory';
    renderApp();
  });

  document.querySelector('#btn-open-cms-details')?.addEventListener('click', () => {
    activeModal = 'cmsDetails';
    renderApp();
  });

  document.querySelector('#btn-open-vacation-modal')?.addEventListener('click', () => {
    activeModal = 'vacation';
    renderApp();
  });

  document.querySelectorAll('#btn-open-webhook').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModal = 'webhook';
      renderApp();
    });
  });

  document.querySelector('#btn-open-api-from-webhook')?.addEventListener('click', () => { activeModal = 'apiSync'; renderApp(); });
  document.querySelector('#btn-open-slack-from-webhook')?.addEventListener('click', () => { activeModal = 'slackBot'; renderApp(); });

  document.querySelectorAll('#btn-leaderboard').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModal = 'leaderboard';
      renderApp();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-reassign-assignee').forEach(btn => {
    btn.addEventListener('click', () => {
      reassignTargetId = btn.dataset.id || null;
      activeModal = 'reassign';
      renderApp();
    });
  });

  document.querySelector('#form-reassign')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = monstersState.find(monster => monster.id === reassignTargetId);
    const assignee = (document.querySelector('#reassign-assignee') as HTMLSelectElement).value;
    if (!target || !assignee) return;
    target.assignee = assignee;
    battleLogMessage = `${target.title} 이슈의 담당자가 ${assignee}(으)로 변경되었습니다.`;
    saveState();
    showToast('담당자가 변경되었습니다.', 'success');
    reassignTargetId = null;
    activeModal = null;
    renderApp();
  });

  document.querySelectorAll('.btn-attack-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      attackTargetId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      activeModal = 'attack';
      renderApp();
    });
  });

  document.querySelector('#btn-get-ai-hint')?.addEventListener('click', async () => {
    const targetMonster = monstersState.find(m => m.id === attackTargetId);
    if (targetMonster) {
      const aiReport = await generateAIDebugGuide(targetMonster);
      battleLogMessage = `[AI 디버깅 가이드 - ${targetMonster.title}]\n\n📌 진단 요약: ${aiReport.summary}\n🔍 추정 원인: ${aiReport.rootCauseHypothesis}\n💡 권장 조치사항:\n${aiReport.recommendedActionItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}\n🧪 테스트 가이드: ${aiReport.unitTestRecommendation}\n⏱️ 예상 조치 소요시간: 약 ${aiReport.estimatedFixTimeHours}시간`;
      renderApp();
    }
  });

  document.querySelectorAll('.btn-use-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const itemIndex = userState.inventory.findIndex((i: any) => i.id === itemId);
      if (itemIndex !== -1) {
        const item = userState.inventory[itemIndex];
        confetti({ particleCount: 40, spread: 50 });
        
        if (item.name.includes('HP') || item.name.includes('커피')) {
          userState.hp = Math.min(userState.maxHp, userState.hp + 30);
          battleLogMessage = `[${item.name}] 사용으로 개발자의 체력(HP)이 +30 회복되었습니다!`;
        } else {
          battleLogMessage = `[${item.name}] 도구를 사용하였습니다.`;
        }
        userState.inventory.splice(itemIndex, 1);
        activeModal = null;
        renderApp();
      }
    });
  });

  document.querySelectorAll('.btn-send-kudos').forEach(btn => {
    btn.addEventListener('click', () => {
      soundFx.playVictorySound();
      confetti({ particleCount: 60, spread: 60 });
      showToast('👏 동료에게 칭찬(Kudos +10)과 박수를 보냈습니다!', 'success');
      userState.xp += 10;
      saveState();
      renderApp();
    });
  });

  document.querySelector('#btn-goto-apisync')?.addEventListener('click', () => {
    activeModal = 'apiSync';
    renderApp();
  });

  document.querySelector('#form-api-sync')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = (document.querySelector('#gh-token') as HTMLInputElement)?.value.trim();
    const owner = (document.querySelector('#gh-owner') as HTMLInputElement)?.value.trim();
    const repo = (document.querySelector('#gh-repo') as HTMLInputElement)?.value.trim();
    const isEnabled = (document.querySelector('#gh-enable') as HTMLInputElement)?.checked ?? false;

    const newConfig = { token, owner, repo, isEnabled };

    if (isEnabled && token) {
      showToast('GitHub API 연동 확인 중...', 'warning');
      const verifyResult = await verifyGitHubConfig(newConfig);
      if (!verifyResult.success) {
        showToast(`❌ ${verifyResult.message}`, 'danger');
        return;
      }
      showToast(`✅ ${verifyResult.message}`, 'success');
    } else {
      showToast('GitHub API 설정이 저장되었습니다 (시뮬레이션 모드)', 'info');
    }

    saveGitHubConfig(newConfig);
    activeModal = null;
    renderApp();
  });

  // ─── Data Backup & Restore Handlers ───
  document.querySelector('#btn-export-backup')?.addEventListener('click', () => {
    exportAppData({ userState, monstersState, vacationsState, questsState });
    showToast('현재 전장 및 유저 데이터 백업 파일(.json)이 다운로드되었습니다.', 'success');
  });

  document.querySelector('#btn-import-backup')?.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const result = parseBackupFile(content);
          if (result.success && result.data) {
            userState = result.data.userState;
            monstersState = result.data.monstersState;
            if (result.data.vacationsState) vacationsState = result.data.vacationsState;
            if (result.data.questsState) questsState = result.data.questsState;
            saveState();
            showToast('백업 데이터 복원 성공! 전장 및 스탯이 업데이트되었습니다.', 'success');
            battleLogMessage = `백업 파일(${file.name})로부터 시스템 데이터가 성공적으로 복원되었습니다.`;
            renderApp();
          } else {
            showToast(`❌ ${result.message}`, 'danger');
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  });

  // ─── Live GitHub Fetch Open PRs Handler ───
  document.querySelector('#btn-fetch-open-prs')?.addEventListener('click', async () => {
    const ghConfig = getGitHubConfig();
    isFetchingOpenPRs = true;
    renderApp();
    showToast('🔎 open 상태인 GitHub PR 목록 조회 중...', 'warning');
    const prs = await fetchOpenPullRequests(ghConfig);
    isFetchingOpenPRs = false;
    if (prs.length === 0) {
      showToast('열려있는 GitHub PR이 없거나 연동 권한을 확인해주세요.', 'info');
    } else {
      openPRsList = prs;
      showToast(`open 상태인 PR ${prs.length}개를 발견하였습니다!`, 'success');
      renderApp();
    }
    if (prs.length === 0) renderApp();
  });

  document.querySelector('#select-open-pr')?.addEventListener('change', (e) => {
    const prUrl = (e.target as HTMLSelectElement).value;
    const prInput = document.querySelector('#attack-pr') as HTMLInputElement;
    if (prInput && prUrl) {
      prInput.value = prUrl;
    }
  });

  document.querySelectorAll('#btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      activeModal = null;
      renderApp();
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
        activeModal = null;
        renderApp();
      }
    });
  });

  document.querySelector('#form-vacation')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = (document.querySelector('#vacation-user') as HTMLInputElement).value;
    const type = (document.querySelector('#vacation-type') as HTMLSelectElement).value as any;
    const reason = (document.querySelector('#vacation-reason') as HTMLInputElement).value;
    const startDate = (document.querySelector('#vacation-start') as HTMLInputElement).value;
    const endDate = (document.querySelector('#vacation-end') as HTMLInputElement).value;
    const days = Math.floor((new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime()) / 86400000) + 1;
    if (days <= 0) {
      showToast('종료일은 시작일 이후로 선택해주세요.', 'warning');
      return;
    }

    vacationsState.unshift({
      id: 'v' + (vacationsState.length + 1),
      userName: user,
      type,
      startDate,
      endDate,
      days,
      status: '대기',
      reason
    });

    const recovery = type === '연차' ? 50 : type === '월차' ? 30 : 0;
    userState.hp = Math.min(userState.maxHp, userState.hp + recovery);
    battleLogMessage = `${type} 신청이 등록되었습니다. ${recovery ? `HP가 +${recovery} 회복되었습니다.` : '승인 상태를 기다립니다.'}`;

    activeModal = null;
    renderApp();
  });

  document.querySelector('#form-attack')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let baseDamage = parseInt((document.querySelector('#attack-damage') as HTMLSelectElement).value, 10);
    const prInput = (document.querySelector('#attack-pr') as HTMLInputElement)?.value || '';
    const monster = monstersState.find(m => m.id === attackTargetId);
    
    if (monster && monster.status === 'Active') {
      const ghConfig = getGitHubConfig();

      // Check if real GitHub integration is enabled
      if (ghConfig.isEnabled && ghConfig.token && ghConfig.owner && ghConfig.repo) {
        // Extract PR number from URL (e.g., https://github.com/owner/repo/pull/142 or 142)
        const match = prInput.match(/pull\/(\d+)/) || prInput.match(/^(\d+)$/);
        if (!match) {
          showToast('올바른 GitHub PR URL 또는 번호를 입력해주세요. (예: https://github.com/org/repo/pull/142)', 'warning');
          return;
        }
        const prNumber = parseInt(match[1], 10);

        showToast(`🚀 GitHub PR #${prNumber} 머지 요청 전송 중...`, 'warning');

        const mergeRes = await mergeGitHubPullRequest(ghConfig, prNumber, `Merge PR #${prNumber} via Bug Quest RPG strike on [${monster.title}]`);

        if (!mergeRes.success) {
          showToast(`❌ GitHub Merge 실패: ${mergeRes.message}`, 'danger');
          battleLogMessage = `⚠️ [GitHub API 경고] PR #${prNumber} 온라인 머지 실패: ${mergeRes.message}`;
          renderApp();
          return;
        }

        showToast(`🎉 GitHub PR #${prNumber} 온라인 머지 성공! (${mergeRes.message})`, 'success');
        monster.prUrl = `https://github.com/${ghConfig.owner}/${ghConfig.repo}/pull/${prNumber}`;
      }

      const isCritical = isSkillActiveNextAttack || Math.random() > 0.6;
      
      if (isSkillActiveNextAttack) {
        soundFx.playSkillCastSound();
      } else if (isCritical) {
        soundFx.playCriticalHitSound();
      } else {
        soundFx.playHitSound();
      }

      // AI Code Quality Rating Simulation
      const aiQualityMultiplier = Math.random() > 0.3 ? 1.2 : 0.8;
      baseDamage = Math.round(baseDamage * aiQualityMultiplier);

      const elementalResult = calculateElementalDamage(baseDamage, monster, userState.devClass);
      baseDamage = elementalResult.damage;
      const hasElementalAdvantage = elementalResult.advantage;

      if (isSkillActiveNextAttack) {
        baseDamage = Math.round(baseDamage * userState.activeSkill.damageMultiplier);
        isSkillActiveNextAttack = false;
      }

      // Anchor the impact to the targeted issue card instead of the viewport center.
      const attackButton = Array.from(document.querySelectorAll<HTMLButtonElement>('.btn-attack-trigger'))
        .find(button => button.dataset.id === monster.id);
      const targetRect = attackButton?.closest('.monster-card-animated')?.getBoundingClientRect();
      const screenCenterX = targetRect ? targetRect.left + targetRect.width * 0.35 : window.innerWidth / 2;
      const screenCenterY = targetRect ? targetRect.top + targetRect.height * 0.48 : window.innerHeight / 2;
      const didDodge = monster.defenseTrait === 'Dodge' && Math.random() < 0.2;

      if (didDodge) {
        soundFx.playDodgeSound();
        particleService.spawnFloatingText(screenCenterX, screenCenterY - 40, '💨 DODGE!', '#94a3b8', 20);
        battleLogMessage = `[${monster.title}] 몬스터가 회피 스킬을 사용하여 데미지를 입지 않았습니다!`;
        hitMonsterId = monster.id;
        lastHitDamageText = `DODGE!`;
        activeModal = null;
        renderApp();
        setTimeout(() => {
          hitMonsterId = null;
          lastHitDamageText = null;
          renderApp();
        }, 800);
        return;
      }

      particleService.triggerImpact(screenCenterX, screenCenterY, isCritical);
      particleService.spawnFloatingText(
        screenCenterX,
        screenCenterY - 32,
        isCritical ? `CRITICAL  -${baseDamage}` : `-${baseDamage}`,
        isCritical ? '#fbbf24' : '#f1f5f9',
        isCritical ? 30 : 22
      );
      document.body.classList.add(isCritical ? 'impact-critical' : 'impact-hit');
      window.setTimeout(() => document.body.classList.remove('impact-hit', 'impact-critical'), isCritical ? 320 : 180);

      monster.currentHp = Math.max(0, monster.currentHp - baseDamage);
      const shouldEnrage = canEnrage(monster) && Math.random() < 0.45;
      if (shouldEnrage) {
        monster.isEnraged = true;
        battleLogMessage = `⚠️ ${monster.title}이(가) HP 30% 이하에서 광폭화했습니다. 다음 공격 전 빠르게 처리하세요!`;
        showToast('보스 광폭화 발동 — 타임어택 상태입니다!', 'warning');
      }
      userState.streakCount += 1;

      // Season Pass XP Gain
      userState.seasonPass.passXp += 40;
      if (userState.seasonPass.passXp >= userState.seasonPass.maxPassXp) {
        userState.seasonPass.currentTier += 1;
        userState.seasonPass.passXp -= userState.seasonPass.maxPassXp;
      }

      // Guild War Score Increase!
      mockGuildWar.guildA.score += baseDamage;
      
      hitMonsterId = monster.id;
      lastHitDamageText = isCritical ? `CRITICAL! -${baseDamage} HP` : `-${baseDamage} HP`;

      if (!shouldEnrage) {
        battleLogMessage = `[${hasElementalAdvantage ? '약점 속성 적중 +30%' : 'AI 코드 검수'}] ${userState.name}의 공격! ${monster.title}에게 ${baseDamage} 데미지!`;
      }

      webhooksState.unshift({
        id: 'wh-' + (webhooksState.length + 1),
        eventType: 'pull_request_merged',
        repository: 'org/cms-project',
        author: userState.name,
        branch: 'fix/bug-' + monster.id,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        summary: `[Slack 연동] ${monster.title} PR Merge (-${baseDamage} HP)`
      });

      if (monster.currentHp === 0) {
        monster.status = 'Defeated';
        userState.xp += monster.rewardXp;
        userState.defeatedBugs += 1;
        userState.skillPoints = (userState.skillPoints ?? 0) + 1;
        userState.hp = Math.min(userState.maxHp, userState.hp + 10);

        // Send live Slack & Teams incoming webhook notifications
        const whConfig = getWebhookConfig();
        if (whConfig.isEnabled) {
          notifyMonsterDefeated(whConfig, monster.title, monster.rewardXp, userState.name);
        }

        userState.pet.xp += 30;
        if (userState.pet.xp >= userState.pet.maxXp) {
          userState.pet.level += 1;
          userState.pet.xp -= userState.pet.maxXp;
        }

        soundFx.playVictorySound();
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 } });

        battleLogMessage = `${monster.title} 몬스터 토벌 완료! (+${monster.rewardXp} XP 획득, Slack 축하 메시지 전송)`;

        const lootPool = [
          '포션: 커피 힐링 (HP +30)',
          '조기 퇴근 1시간 권',
          '스타벅스 1만원 상품권',
          '칭호: [버그 파괴자]'
        ];
        const lootReward = lootPool[Math.floor(Math.random() * lootPool.length)];
        lastLootReward = lootReward;

        userState.inventory.push({
          id: 'i' + (userState.inventory.length + 1),
          name: lootReward,
          type: '쿠폰',
          icon: '🎁',
          description: `${monster.title} 레이드 처치 보상`,
          acquiredAt: '2026-08-07'
        });

        if (userState.xp >= userState.maxXp) {
          userState.level += 1;
          userState.xp -= userState.maxXp;
          userState.maxXp += 200;
          soundFx.playLevelUpSound();
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 } });
        }

        activeModal = 'lootBox';
        renderApp();
        
        saveState();
        setTimeout(() => {
          hitMonsterId = null;
          lastHitDamageText = null;
        }, 1500);
        return;
      } else {
        confetti({ particleCount: 20, spread: 35 });
        
        window.setTimeout(() => {
          hitMonsterId = null;
          lastHitDamageText = null;
        }, 500);
      }
      saveState();
    }

    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-generate-ai')?.addEventListener('click', () => {
    showToast('AI 개발 요약 리포트가 최신화되었습니다.', 'info');
  });

  const openProfileModal = () => {
    upModalErrorMsg = '';
    upModalSuccessMsg = '';
    activeModal = 'userProfile';
    renderApp();
  };

  document.querySelector('#btn-edit-profile')?.addEventListener('click', openProfileModal);
  document.querySelector('#btn-sidebar-edit-profile')?.addEventListener('click', openProfileModal);

  document.querySelector('#btn-switch-account')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '계정 전환을 위해 로그아웃되었습니다. 원하시는 계정으로 로그인해주세요.';
    showToast('계정 전환을 위해 로그아웃되었습니다.', 'info');
    renderApp();
  });

  document.querySelector('#btn-logout')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '성공적으로 로그아웃되었습니다.';
    showToast('로그아웃되었습니다.', 'info');
    renderApp();
  });

  document.querySelector('#btn-team-settings')?.addEventListener('click', () => {
    // 팀 설정 모달 오픈 (위저드 없이 인라인 편집)
    const cfg = loadTeamSettings();
    editModalMembers = cfg.members ? cfg.members.map(m => ({ ...m })) : [];
    tsModalErrorMsg = '';
    tsModalSuccessMsg = '';
    activeModal = 'teamSettings';
    renderApp();
  });

  document.querySelector('#btn-sidebar-switch-acc')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '계정 전환을 위해 로그아웃되었습니다.';
    showToast('계정 전환 모드로 이동합니다.', 'info');
    renderApp();
  });

  document.querySelector('#btn-sidebar-logout')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '성공적으로 로그아웃되었습니다.';
    showToast('성공적으로 로그아웃되었습니다.', 'info');
    renderApp();
  });
}

attachLoginEvents = function attachLoginEvents() {
  document.querySelector('#btn-lock-logout')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '성공적으로 로그아웃되었습니다.';
    showToast('로그아웃되었습니다.', 'info');
    renderApp();
  });

  document.querySelector('#form-unlock-session')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = (document.querySelector('#unlock-pin') as HTMLInputElement).value;
    const res = unlockSession(pin);
    if (res.success) {
      loginErrorMsg = '';
      loginSuccessMsg = '';
      showToast(res.message, 'success');
      renderApp();
    } else {
      loginErrorMsg = res.message;
      renderApp();
    }
  });

  document.querySelector('#btn-lock-switch-account')?.addEventListener('click', () => {
    logout();
    loginErrorMsg = '';
    loginSuccessMsg = '다른 계정으로 로그인해주세요.';
    renderApp();
  });

  // Account Card Items click
  document.querySelectorAll('.account-card-item').forEach(card => {
    card.addEventListener('click', (e) => {
      const username = (e.currentTarget as HTMLElement).getAttribute('data-username');
      const inputEl = document.querySelector('#login-username') as HTMLInputElement;
      const pinEl = document.querySelector('#login-pin') as HTMLInputElement;
      if (inputEl) inputEl.value = username || '';
      if (pinEl) pinEl.focus();
    });
  });

  // Toggle Create Account Section
  document.querySelector('#btn-toggle-create-acc')?.addEventListener('click', () => {
    const sec = document.querySelector('#create-account-section') as HTMLElement;
    if (sec) {
      sec.style.display = sec.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Login Form Submit
  document.querySelector('#form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.querySelector('#login-username') as HTMLInputElement).value;
    const pin = (document.querySelector('#login-pin') as HTMLInputElement).value;

    const res = await login(username, pin);
    if (res.success) {
      loginErrorMsg = '';
      loginSuccessMsg = '';
      store.reloadFromLocalStorage();
      showToast(res.message, 'success');
      renderApp();
    } else {
      loginErrorMsg = res.message;
      renderApp();
    }
  });

  // Create Account Form Submit
  document.querySelector('#form-create-account')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.querySelector('#new-acc-username') as HTMLInputElement).value;
    const displayName = (document.querySelector('#new-acc-displayname') as HTMLInputElement).value;
    const heroClass = (document.querySelector('#new-acc-class') as HTMLSelectElement).value as any;
    const pin = (document.querySelector('#new-acc-pin') as HTMLInputElement).value;

    const res = await createAccount(username, displayName, pin, heroClass);
    if (res.success) {
      // Auto login
      await login(username, pin);
      loginErrorMsg = '';
      loginSuccessMsg = '';
      store.reloadFromLocalStorage();
      showToast(res.message, 'success');
      renderApp();
    } else {
      loginErrorMsg = res.message;
      renderApp();
    }
  });
};

// ─── Team Settings Modal Event Handler ──────────────────────────────────────
function attachTeamSettingsModalEvents() {
  // 닫기
  const closeModal = () => {
    activeModal = null;
    tsModalErrorMsg = '';
    tsModalSuccessMsg = '';
    renderApp();
  };
  document.querySelector('#ts-close')?.addEventListener('click', closeModal);
  document.querySelector('#ts-close-footer')?.addEventListener('click', closeModal);
  document.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'modal-backdrop') closeModal();
  });

  // 팀원 삭제
  document.querySelectorAll('.ts-remove-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      editModalMembers.splice(idx, 1);
      tsModalErrorMsg = '';
      tsModalSuccessMsg = '';
      renderApp();
      setTimeout(attachTeamSettingsModalEvents, 0);
    });
  });

  // 팀원 이름 인라인 수정
  document.querySelectorAll('.ts-member-name').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      const val = (e.target as HTMLInputElement).value.trim();
      if (val && editModalMembers[idx]) editModalMembers[idx].name = val;
    });
  });

  // 팀원 역할 인라인 수정
  document.querySelectorAll('.ts-member-role').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      if (editModalMembers[idx]) {
        editModalMembers[idx].role = (e.target as HTMLSelectElement).value as TeamMemberInput['role'];
        // 이모지 업데이트를 위해 partial re-render
        renderApp();
        setTimeout(attachTeamSettingsModalEvents, 0);
      }
    });
  });

  // 팀원 근무시간 인라인 수정
  document.querySelectorAll('.ts-member-hours').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      const val = parseInt((e.target as HTMLInputElement).value || '8', 10);
      if (editModalMembers[idx]) editModalMembers[idx].workingHoursPerDay = Math.min(12, Math.max(1, val));
    });
  });

  // 팀원 집중 비율 인라인 수정
  document.querySelectorAll('.ts-member-ratio').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      const val = parseInt((e.target as HTMLInputElement).value || '70', 10);
      if (editModalMembers[idx]) editModalMembers[idx].deepWorkRatio = Math.min(0.9, Math.max(0.4, val / 100));
    });
  });

  // 팀원 추가
  document.querySelector('#ts-add-member')?.addEventListener('click', () => {
    const name = (document.querySelector('#ts-new-name') as HTMLInputElement)?.value?.trim();
    const role = (document.querySelector('#ts-new-role') as HTMLSelectElement)?.value as TeamMemberInput['role'];
    const hours = parseInt((document.querySelector('#ts-new-hours') as HTMLInputElement)?.value || '8', 10);
    const ratio = parseInt((document.querySelector('#ts-new-ratio') as HTMLInputElement)?.value || '70', 10);

    if (!name) {
      tsModalErrorMsg = '팀원 이름을 입력해주세요.';
      tsModalSuccessMsg = '';
      renderApp();
      setTimeout(attachTeamSettingsModalEvents, 0);
      return;
    }
    if (editModalMembers.find(m => m.name === name)) {
      tsModalErrorMsg = `"${name}"은(는) 이미 등록된 팀원입니다.`;
      tsModalSuccessMsg = '';
      renderApp();
      setTimeout(attachTeamSettingsModalEvents, 0);
      return;
    }
    editModalMembers.push({
      id: 'tm-' + Date.now(),
      name,
      role,
      workingHoursPerDay: Math.min(12, Math.max(1, hours)),
      deepWorkRatio: Math.min(0.9, Math.max(0.4, ratio / 100)),
    });
    tsModalErrorMsg = '';
    tsModalSuccessMsg = '';
    renderApp();
    setTimeout(attachTeamSettingsModalEvents, 0);
  });

  // 스프린트 빠른 선택
  document.querySelectorAll('.ts-sprint-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const days = parseInt((e.currentTarget as HTMLElement).getAttribute('data-days') || '10', 10);
      const input = document.querySelector('#ts-sprint-days') as HTMLInputElement;
      if (input) input.value = String(days);
      document.querySelectorAll('.ts-sprint-btn').forEach(b => {
        const bDays = parseInt((b as HTMLElement).getAttribute('data-days') || '0', 10);
        (b as HTMLElement).style.background = bDays === days ? 'var(--primary-bg)' : 'var(--inner-box-bg)';
        (b as HTMLElement).style.borderColor = bDays === days ? 'var(--primary)' : 'var(--panel-border)';
        (b as HTMLElement).style.color = bDays === days ? 'var(--primary-light)' : 'var(--text-sub)';
      });
    });
  });

  // 예산 미리보기
  document.querySelector('#ts-total-budget')?.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value || '0', 10);
    const el = document.querySelector('#ts-budget-preview');
    if (el) el.textContent = `= ${val.toLocaleString('ko-KR')}원 (${(val / 100000000).toFixed(2)}억원)`;
  });

  // 저장
  document.querySelector('#ts-save')?.addEventListener('click', () => {
    const teamName = (document.querySelector('#ts-team-name') as HTMLInputElement)?.value?.trim();
    const projectName = (document.querySelector('#ts-project-name') as HTMLInputElement)?.value?.trim();
    const startDate = (document.querySelector('#ts-start-date') as HTMLInputElement)?.value;
    const projectDays = parseInt((document.querySelector('#ts-project-days') as HTMLInputElement)?.value || '60', 10);
    const sprintDays = parseInt((document.querySelector('#ts-sprint-days') as HTMLInputElement)?.value || '10', 10);
    const totalBudget = parseInt((document.querySelector('#ts-total-budget') as HTMLInputElement)?.value || '0', 10);
    const guildA = (document.querySelector('#ts-guild-a') as HTMLInputElement)?.value?.trim();
    const guildB = (document.querySelector('#ts-guild-b') as HTMLInputElement)?.value?.trim();

    if (!teamName || !projectName) {
      tsModalErrorMsg = '팀 이름과 프로젝트 이름은 필수 입력 항목입니다.';
      tsModalSuccessMsg = '';
      renderApp();
      setTimeout(attachTeamSettingsModalEvents, 0);
      return;
    }
    if (editModalMembers.length === 0) {
      tsModalErrorMsg = '최소 1명 이상의 팀원이 필요합니다.';
      tsModalSuccessMsg = '';
      renderApp();
      setTimeout(attachTeamSettingsModalEvents, 0);
      return;
    }

    // 저장
    saveTeamSettings({
      teamName,
      projectName,
      projectStartDate: startDate,
      projectDurationDays: projectDays,
      sprintDays,
      totalBudget,
      guildAName: guildA || '프론트엔드 길드',
      guildBName: guildB || '백엔드 길드',
      members: editModalMembers,
    });

    // Store & 로컬 teamState 즉시 동기화
    store.reloadFromTeamSettings();
    teamState = toTeamMemberCapacity(editModalMembers, sprintDays);

    tsModalErrorMsg = '';
    tsModalSuccessMsg = `✅ 설정이 저장되었습니다. 팀원 ${editModalMembers.length}명 반영 완료.`;
    showToast('⚙️ 팀 설정이 저장되었습니다!', 'success');
  });
}

// ─── User Profile Modal Event Handler ──────────────────────────────────────
function attachUserProfileModalEvents() {
  const closeModal = () => {
    activeModal = null;
    upModalErrorMsg = '';
    upModalSuccessMsg = '';
    renderApp();
  };

  document.querySelector('#up-close')?.addEventListener('click', closeModal);
  document.querySelector('#up-close-footer')?.addEventListener('click', closeModal);
  document.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'modal-backdrop') closeModal();
  });

  // 아바타 배경 프리셋 선택
  document.querySelectorAll('.up-bg-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bg = (e.currentTarget as HTMLElement).getAttribute('data-bg');
      if (!bg) return;
      const preview = document.querySelector('#up-avatar-preview') as HTMLElement;
      const hiddenInput = document.querySelector('#up-avatar-bg') as HTMLInputElement;
      if (preview) preview.style.background = bg;
      if (hiddenInput) hiddenInput.value = bg;

      document.querySelectorAll('.up-bg-preset-btn').forEach(b => {
        (b as HTMLElement).style.borderColor = (b as HTMLElement).getAttribute('data-bg') === bg ? 'white' : 'transparent';
      });
    });
  });

  // 아바타 아이콘 프리셋 선택
  document.querySelectorAll('.up-icon-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const symbol = (e.currentTarget as HTMLElement).getAttribute('data-symbol');
      if (!symbol) return;
      const preview = document.querySelector('#up-avatar-preview') as HTMLElement;
      const hiddenInput = document.querySelector('#up-avatar-symbol') as HTMLInputElement;
      if (preview) preview.textContent = symbol;
      if (hiddenInput) hiddenInput.value = symbol;

      document.querySelectorAll('.up-icon-preset-btn').forEach(b => {
        const bSymbol = (b as HTMLElement).getAttribute('data-symbol');
        (b as HTMLElement).style.background = bSymbol === symbol ? 'var(--primary-bg)' : 'var(--inner-box-bg)';
        (b as HTMLElement).style.borderColor = bSymbol === symbol ? 'var(--primary)' : 'var(--panel-border)';
      });
    });
  });

  // 프로필 수정 폼 제출
  document.querySelector('#form-update-profile')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = (document.querySelector('#up-display-name') as HTMLInputElement)?.value;
    const heroClass = (document.querySelector('#up-hero-class') as HTMLSelectElement)?.value as any;
    const currentPin = (document.querySelector('#up-current-pin') as HTMLInputElement)?.value;
    const newPin = (document.querySelector('#up-new-pin') as HTMLInputElement)?.value;
    const avatarBgColor = (document.querySelector('#up-avatar-bg') as HTMLInputElement)?.value;
    const avatarIconSymbol = (document.querySelector('#up-avatar-symbol') as HTMLInputElement)?.value;

    const res = await updateAccountProfile({
      displayName,
      heroClass,
      currentPin,
      newPin: newPin || undefined,
      avatarBgColor,
      avatarIconSymbol,
    });

    if (res.success) {
      store.reloadFromLocalStorage();
      userState = { ...store.getState().userState };
      upModalErrorMsg = '';
      upModalSuccessMsg = res.message;
      showToast('👤 프로필 수정이 완료되었습니다!', 'success');
      renderApp();
      setTimeout(attachUserProfileModalEvents, 0);
    } else {
      upModalErrorMsg = res.message;
      upModalSuccessMsg = '';
      renderApp();
      setTimeout(attachUserProfileModalEvents, 0);
    }
  });
}

// ─── Onboarding Wizard Event Handler ────────────────────────────────────────
attachWizardEvents = function attachWizardEvents() {

  // 다음 버튼
  document.querySelector('#btn-wizard-next')?.addEventListener('click', () => {
    wizardErrorMsg = '';

    if (wizardStep === 1) {
      const teamName = (document.querySelector('#wizard-team-name') as HTMLInputElement)?.value?.trim();
      const projectName = (document.querySelector('#wizard-project-name') as HTMLInputElement)?.value?.trim();
      const startDate = (document.querySelector('#wizard-start-date') as HTMLInputElement)?.value;
      const projectDays = parseInt((document.querySelector('#wizard-project-days') as HTMLInputElement)?.value || '60', 10);

      if (!teamName || !projectName) {
        wizardErrorMsg = '팀 이름과 프로젝트 이름은 필수 입력 항목입니다.';
        renderApp();
        return;
      }
      saveTeamSettings({ teamName, projectName, projectStartDate: startDate, projectDurationDays: projectDays });
      wizardStep = 2;

    } else if (wizardStep === 2) {
      if (wizardMembers.length === 0) {
        wizardErrorMsg = '최소 1명 이상의 팀원을 등록해주세요.';
        renderApp();
        return;
      }
      wizardStep = 3;

    } else if (wizardStep === 3) {
      const sprintDays = parseInt((document.querySelector('#wizard-sprint-days') as HTMLInputElement)?.value || '10', 10);
      const totalBudget = parseInt((document.querySelector('#wizard-total-budget') as HTMLInputElement)?.value || '50000000', 10);
      saveTeamSettings({ sprintDays, totalBudget });
      wizardStep = 4;
    }

    renderApp();
  });

  // 이전 버튼
  document.querySelector('#btn-wizard-back')?.addEventListener('click', () => {
    wizardErrorMsg = '';
    if (wizardStep > 1) {
      wizardStep = (wizardStep - 1) as WizardStep;
      renderApp();
    }
  });

  // 팀원 추가 버튼
  document.querySelector('#btn-add-wizard-member')?.addEventListener('click', () => {
    const name = (document.querySelector('#new-member-name') as HTMLInputElement)?.value?.trim();
    const role = (document.querySelector('#new-member-role') as HTMLSelectElement)?.value as TeamMemberInput['role'];
    const hours = parseInt((document.querySelector('#new-member-hours') as HTMLInputElement)?.value || '8', 10);
    const ratio = parseInt((document.querySelector('#new-member-ratio') as HTMLInputElement)?.value || '70', 10);

    if (!name) {
      wizardErrorMsg = '팀원 이름을 입력해주세요.';
      renderApp();
      return;
    }
    if (wizardMembers.find(m => m.name === name)) {
      wizardErrorMsg = `"${name}"은 이미 등록된 팀원입니다.`;
      renderApp();
      return;
    }
    wizardMembers.push({
      id: 'tm-' + Date.now(),
      name,
      role,
      workingHoursPerDay: Math.min(12, Math.max(1, hours)),
      deepWorkRatio: Math.min(0.9, Math.max(0.4, ratio / 100)),
    });
    wizardErrorMsg = '';
    renderApp();
  });

  // 팀원 삭제 버튼들
  document.querySelectorAll('.wizard-remove-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
      wizardMembers.splice(idx, 1);
      renderApp();
    });
  });

  // 스프린트 빠른 선택 버튼들
  document.querySelectorAll('.wizard-sprint-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const days = parseInt((e.currentTarget as HTMLElement).getAttribute('data-days') || '10', 10);
      const hiddenInput = document.querySelector('#wizard-sprint-days') as HTMLInputElement;
      if (hiddenInput) hiddenInput.value = String(days);
      document.querySelectorAll('.wizard-sprint-btn').forEach(b => {
        const bDays = parseInt((b as HTMLElement).getAttribute('data-days') || '0', 10);
        (b as HTMLElement).style.background = bDays === days ? 'var(--primary-bg)' : 'var(--inner-box-bg)';
        (b as HTMLElement).style.borderColor = bDays === days ? 'var(--primary)' : 'var(--panel-border)';
        (b as HTMLElement).style.color = bDays === days ? 'var(--primary-light)' : 'var(--text-sub)';
      });
    });
  });

  // 커스텀 스프린트 입력
  document.querySelector('#wizard-sprint-custom')?.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    const hiddenInput = document.querySelector('#wizard-sprint-days') as HTMLInputElement;
    if (hiddenInput && val) hiddenInput.value = val;
  });

  // 예산 미리보기
  document.querySelector('#wizard-total-budget')?.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value || '0', 10);
    const preview = document.querySelector('#wizard-budget-preview');
    if (preview) {
      preview.textContent = `= ${val.toLocaleString('ko-KR')}원 (${(val / 100000000).toFixed(2)}억원)`;
    }
  });

  // 완료 버튼
  document.querySelector('#btn-wizard-complete')?.addEventListener('click', () => {
    const guildA = (document.querySelector('#wizard-guild-a') as HTMLInputElement)?.value?.trim() || '프론트엔드 길드';
    const guildB = (document.querySelector('#wizard-guild-b') as HTMLInputElement)?.value?.trim() || '백엔드 길드';

    const finalSettings = loadTeamSettings();
    completeOnboarding({
      ...finalSettings,
      members: wizardMembers,
      guildAName: guildA,
      guildBName: guildB,
    });

    // Store에 팀 설정 반영
    store.reloadFromTeamSettings();

    // 로컬 teamState도 즉시 동기화
    teamState = toTeamMemberCapacity(wizardMembers, finalSettings.sprintDays);

    wizardStep = 1;
    wizardErrorMsg = '';
    isOnboardingActive = false;

    showToast('🎉 팀 설정 완료! BUG QUEST RPG 전장에 오신 것을 환영합니다!', 'success', 4000);
    renderApp();
  });

  // 4단계 설정 요약 업데이트
  const summaryEl = document.querySelector('#wizard-final-summary');
  if (summaryEl && wizardStep === 4) {
    const cfg = loadTeamSettings();
    summaryEl.innerHTML = [
      `🏰 팀: <strong>${cfg.teamName || '(미입력)'}</strong>`,
      `📁 프로젝트: <strong>${cfg.projectName || '(미입력)'}</strong>`,
      `👥 팀원: <strong>${wizardMembers.length}명</strong> 등록됨`,
      `📅 스프린트: <strong>${cfg.sprintDays}일</strong> / 전체 기간: <strong>${cfg.projectDurationDays}일</strong>`,
      `💰 총 예산: <strong>${(cfg.totalBudget || 0).toLocaleString('ko-KR')}원</strong>`,
    ].map(s => `<div>${s}</div>`).join('');
  }

  // 건너뛰기
  document.querySelector('#btn-wizard-skip')?.addEventListener('click', () => {
    if (confirm('지금 건너뛰면 기본 Mock 데이터로 시작됩니다.\n나중에 헤더의 ⚙️ 설정 버튼에서 팀 정보를 설정할 수 있습니다.\n\n건너뛰시겠습니까?')) {
      completeOnboarding({
        ...loadTeamSettings(),
        members: wizardMembers,
        teamName: '내 팀',
        projectName: 'BUG QUEST RPG 프로젝트',
      });
      isOnboardingActive = false;
      wizardStep = 1;
      renderApp();
    }
  });
};

// Global Keyboard Shortcuts (A11y & UX)
window.addEventListener('keydown', (e) => {
  // ESC: Close Modal
  if (e.key === 'Escape' && activeModal) {
    activeModal = null;
    renderApp();
    showToast('모달을 닫았습니다.', 'info', 1500);
    return;
  }

  // Prevent shortcuts when typing in inputs/textareas
  const targetTag = (e.target as HTMLElement)?.tagName;
  if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
    return;
  }

  // Ctrl+L or Cmd+L: Lock Session
  if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    lockSession();
    renderApp();
    showToast('🔒 화면 세션이 잠겼습니다.', 'info');
    return;
  }

  // Key S: Skill Activate Toggle
  if (e.key === 's' || e.key === 'S' || e.key === 'ㄴ') {
    isSkillActiveNextAttack = !isSkillActiveNextAttack;
    if (isSkillActiveNextAttack) {
      battleLogMessage = `[${userState.activeSkill.name}] 스킬 단축키(S)로 준비 완료!`;
      showToast(`⚡ ${userState.activeSkill.name} 스킬이 발동 준비되었습니다!`, 'warning');
    } else {
      battleLogMessage = `스킬 사용이 취소되었습니다.`;
      showToast('스킬 발동이 취소되었습니다.', 'info');
    }
    renderApp();
  }

  // Key A: Open Attack Modal for active monster
  if (e.key === 'a' || e.key === 'A' || e.key === 'ㅁ') {
    const activeMonster = monstersState.find(m => m.status === 'Active');
    if (activeMonster) {
      attackTargetId = activeMonster.id;
      activeModal = 'attack';
      renderApp();
      showToast(`⚔️ [${activeMonster.title}] 타격 모달 오픈 (단축키 A)`, 'info');
    }
  }

  // Key M: Mute Sound Toggle
  if (e.key === 'm' || e.key === 'M' || e.key === 'ㅡ') {
    const isMuted = soundFx.toggleMute();
    renderApp();
    showToast(isMuted ? '🔇 사운드 음소거 설정' : '🔊 사운드 음소거 해제', 'info');
  }
});

// Real-Time Simulated Webhook Push Events (Every 25 seconds)
setInterval(() => {
  const authors = ['김개발', '이백엔드', '박풀스택', '최디자인', 'AI-Bot'];
  const eventTypes: ('pull_request_merged' | 'issue_opened' | 'commit_pushed')[] = ['pull_request_merged', 'issue_opened', 'commit_pushed'];
  const repos = ['org/cms-core', 'org/rpg-backend', 'org/ai-engine'];
  
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
  const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const randomRepo = repos[Math.floor(Math.random() * repos.length)];

  const eventMessages = {
    pull_request_merged: `PR #${Math.floor(Math.random() * 200 + 100)}가 main 브랜치에 성공적으로 병합되었습니다!`,
    issue_opened: `새로운 버그 이슈가 신규로 감지 등록되었습니다.`,
    commit_pushed: `main 브랜치에 신규 커밋이 푸시되었습니다.`
  };

  const newWebhook: WebhookPayload = {
    id: 'wh-sim-' + Date.now(),
    eventType: randomEvent,
    repository: randomRepo,
    author: randomAuthor,
    branch: 'main',
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    summary: `[실시간 연동] ${eventMessages[randomEvent]}`
  };

  webhooksState.unshift(newWebhook);
  if (webhooksState.length > 20) webhooksState.pop();

  showToast(`🔔 [Git Event] ${randomAuthor}: ${eventMessages[randomEvent]}`, 'success', 4000);
}, 25000);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('PWA Service Worker registered:', reg.scope);
    }).catch(err => {
      console.warn('PWA Service Worker registration failed:', err);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => renderApp());
} else {
  renderApp();
}
