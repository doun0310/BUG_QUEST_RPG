import './style.css';
import confetti from 'canvas-confetti';
import Chart from 'chart.js/auto';
import { soundFx } from './soundManager';
import { showToast } from './toastManager';
import { getLang, setLang } from './i18n';
import { renderHeader } from './components/Header';
import { renderMonsterBoard } from './components/MonsterBoard';
import { renderSidebar } from './components/Sidebar';
import { renderCodexModal } from './components/modals/CodexModal';
import { renderAttackModal } from './components/modals/AttackModal';
import { renderCMSChartModal } from './components/modals/CMSChartModal';
import { renderCreateMonsterModal } from './components/modals/CreateMonsterModal';
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

let currentTheme: 'dark' | 'light' | 'matrix' = (localStorage.getItem('theme') as any) || 'dark';

let storedUser = localStorage.getItem('userState');
let storedMonsters = localStorage.getItem('monstersState');

let vacationsState: VacationRequest[] = [...mockVacations];
let teamState = [...mockTeamMembers];
let monstersState: BugMonster[] = storedMonsters ? JSON.parse(storedMonsters) : [...mockMonsters];
let webhooksState: WebhookPayload[] = [...mockWebhooks];
let questsState: WeeklyQuest[] = [...mockWeeklyQuests];
let userState = storedUser ? JSON.parse(storedUser) : { ...mockUser };
let coopBossState: TeamCoopBoss = { ...mockTeamCoopBoss };

function saveState() {
  localStorage.setItem('userState', JSON.stringify(userState));
  localStorage.setItem('monstersState', JSON.stringify(monstersState));
}

let simExtraDevs: number = 0;
let simExtraVacationDays: number = 0;

let bugFilter: 'all' | 'active' | 'defeated' = 'all';
let battleLogMessage: string = '버그 트래커 전장에 오신 것을 환영합니다! 몬스터를 타격하여 PR을 통합하세요.';

let hitMonsterId: string | null = null;
let lastHitDamageText: string | null = null;
let isSkillActiveNextAttack: boolean = false;

// Modal States
let activeModal: 'vacation' | 'attack' | 'leaderboard' | 'inventory' | 'webhook' | 'cmsDetails' | 'lootBox' | 'forge' | 'quests' | 'simulator' | 'radarStats' | 'seasonPass' | 'guildWar' | 'coopBoss' | 'createMonster' | 'postMortem' | 'codex' | 'execAnalytics' | 'achievements' | 'apiSync' | 'raidShop' | 'socialFeed' | 'aiPrediction' | 'cicdPipeline' | 'slackBot' | 'releaseMilestone' | null = null;
let selectedPostMortemMonsterId: string | null = null;
let attackTargetId: string | null = null;
let lastLootReward: string | null = null;

let burnChartInstance: Chart | null = null;
let radarChartInstance: Chart | null = null;

function applyTheme() {
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (currentTheme === 'matrix') {
    document.documentElement.setAttribute('data-theme', 'matrix');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function renderApp() {
  applyTheme();

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
  
  const appContainer = document.querySelector<HTMLDivElement>('#app')!;
  
  appContainer.innerHTML = `
    ${renderHeader(state)}

    <!-- Main Layout: Grid 2.3 : 1 -->
    <div style="display: grid; grid-template-columns: 2.3fr 1fr; gap: 1rem;">
      <!-- MAIN SECTION -->
      <section>
        ${renderMonsterBoard(state)}
      </section>

      <!-- SIDEBAR SECTION -->
      ${renderSidebar(state)}
    </div>

    ${renderModals()}
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
        let idealGradient = '#38bdf8';
        let actualGradient = '#fb7185';

        if (chartCtx) {
          idealGradient = chartCtx.createLinearGradient(0, 0, 0, 250) as any;
          (idealGradient as any).addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          (idealGradient as any).addColorStop(1, 'rgba(56, 189, 248, 0.0)');

          actualGradient = chartCtx.createLinearGradient(0, 0, 0, 250) as any;
          (actualGradient as any).addColorStop(0, 'rgba(251, 113, 133, 0.5)');
          (actualGradient as any).addColorStop(1, 'rgba(251, 113, 133, 0.0)');
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

function renderModals() {
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
  } as any;

  if (activeModal === 'codex') return renderCodexModal(state);
  if (activeModal === 'attack') return renderAttackModal(state);
  if (activeModal === 'cmsDetails') return renderCMSChartModal(state);
  if (activeModal === 'createMonster') return renderCreateMonsterModal(state);

  if (activeModal === 'releaseMilestone') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700;">🚀 v2.0 프로덕션 정기 릴리즈 마일스톤</h2>
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
                <strong style="font-size: 0.82rem;">🔥 [결제] 결제 모듈 Memory Leak (BOSS RAID)</strong>
                <div style="font-size: 0.72rem; color: var(--text-sub);">레이드 진행 중 (HP 400/1000)</div>
              </div>
              <span class="badge badge-warning">진행 중</span>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="action-btn" id="btn-deploy-release">💥 v2.0 최종 배포 승인 & 전원 300 XP 수령</button>
          </div>
        </div>
      </div>
    `;
  }

  if (activeModal === 'slackBot') {
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 540px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700;">🤖 Slack / Teams 대화형 슬래시 명령 시뮬레이터</h2>
            <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
            <div style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 0.35rem;">사용 가능한 Slack 슬래시 명령어 모음</div>
            <code style="display: block; background: #000; color: #4ade80; padding: 0.45rem 0.65rem; border-radius: 4px; font-size: 0.78rem; margin-bottom: 0.35rem;">/bug-attack [몬스터ID] [PR-URL]</code>
            <code style="display: block; background: #000; color: #38bdf8; padding: 0.45rem 0.65rem; border-radius: 4px; font-size: 0.78rem;">/bug-status (전장 몬스터 HP 실시간 조회)</code>
          </div>

          <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border);">
            <strong style="font-size: 0.82rem;">슬래시 명령 실시간 실행 테스트:</strong>
            <div style="display: flex; gap: 0.35rem; margin-top: 0.45rem;">
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">🚀 CI/CD 파이프라인 실시간 상태</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">🔮 AI 버그 발생 위험도 예측 분석기</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">💬 실시간 팀 소셜 피드 & 칭찬(Kudos)</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">🛍️ 보스 레이드 코인 교환 상점</h2>
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
    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem;">🔌 외부 이슈 트래커 REST API 동기화 설정</h2>
          <form id="form-api-sync">
            <div class="form-group">
              <label>연동 연동 플랫폼 선택</label>
              <select class="form-select" id="api-provider">
                <option value="jira">Jira Software Cloud (Atlassian REST API v3)</option>
                <option value="github">GitHub Issues / Pull Requests (GraphQL API)</option>
                <option value="gitlab">GitLab Issue Board (REST API v4)</option>
              </select>
            </div>
            <div class="form-group">
              <label>API 엔드포인트 URL</label>
              <input type="text" class="form-input" id="api-endpoint" value="https://company.atlassian.net/rest/api/3/issue" required />
            </div>
            <div class="form-group">
              <label>Access Token / API Key</label>
              <input type="password" class="form-input" id="api-token" value="bearer_tok_demo_99827164" required />
            </div>
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.85rem;">
              <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
              <button type="submit" class="action-btn">연동 테스트 & 동기화 실행</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (activeModal === 'achievements') {
    const achievementsList = [
      { id: 'a1', title: '🏅 첫 버그 슬레이어', desc: '첫 번째 버그 몬스터를 성공적으로 토벌함', isUnlocked: true },
      { id: 'a2', title: '🔥 콤보 연승의 지배자', desc: 'PR Merge 연속 3회 이상 콤보 달성', isUnlocked: userState.streakCount >= 3 },
      { id: 'a3', title: '🔨 대장간의 전설', desc: '기계식 청축 키보드 +7 이상 강화 달성', isUnlocked: userState.weapon.enhanceLevel >= 7 },
      { id: 'a4', title: '☕ 카페인 마스터', desc: '지친 개발자의 HP를 100까지 회복함', isUnlocked: userState.hp >= 100 },
      { id: 'a5', title: '🐲 레이드 파티 리더', desc: '초월급 팀 협동 레이드 보스 타격 참여', isUnlocked: true }
    ];

    return `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h2 style="font-size: 1.05rem; font-weight: 700;">🏆 명예의 전당: 개발자 업적 & 칭호</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">📈 경영진/PM 종합 엑세큐티브 리포트</h2>
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

          <div style="background: var(--inner-box-bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--panel-border); font-size: 0.78rem;">
            <strong style="color: var(--primary);">AI 요약 인사이트:</strong>
            <p style="color: var(--text-sub); margin-top: 0.2rem; line-height: 1.4;">
              팀의 개발 생산성이 전주 대비 +14% 향상되었습니다. SLA 마감 초과 비중이 7.5% 감소하여 서비스 안정성이 대폭 개선되고 있습니다.
            </p>
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
          <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.6rem;">📝 버그 사후 분석 리포트 (Post-Mortem)</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">🏆 월간 개발 시즌패스</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">⚔️ 팀 간 길드 대항전 (Dev Guild War)</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">📊 개별 개발자 능력치 레이더 차트</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">🛡️ CMS 예산 & 가동률 모의 시뮬레이터</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">주간 개발자 퀘스트</h2>
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
              <label>기간</label>
              <input type="date" class="form-input" id="vacation-start" value="2026-08-17" required />
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
            <span class="badge">8월 1주차</span>
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
            <h2 style="font-size: 1rem; font-weight: 700;">내 도구함</h2>
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
            <h2 style="font-size: 1.05rem; font-weight: 700;">📖 몬스터 도감 & 버그 토벌 전적 (Codex)</h2>
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

function attachEvents() {
  const rpgMenuBtn = document.querySelector('#btn-toggle-rpg-menu');
  const rpgDropdownMenu = document.querySelector('#rpg-dropdown-menu');

  rpgMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    rpgDropdownMenu?.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    rpgDropdownMenu?.classList.remove('show');
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
    battleLogMessage = `🎉 [v2.0 배포 성공] 프로덕션 정기 릴리즈가 성공적으로 통합되어 전원에 300 XP 수령 보상이 지급되었습니다!`;
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
    battleLogMessage = `💬 [Slack Bot 응답] '${cmdText}' 명령으로 AUTH-401 몬스터에게 250 타격을 입혔습니다!`;
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
    battleLogMessage = ` [API 연동 성공] 외부 이슈 트래커 동기화가 성공적으로 설정되었습니다!`;
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
    const monsterImage = (document.querySelector('#new-monster-image') as HTMLSelectElement).value;

    const hpMap: Record<'Critical' | 'Major' | 'Minor', number> = { Critical: 1000, Major: 500, Minor: 200 };
    const xpMap: Record<'Critical' | 'Major' | 'Minor', number> = { Critical: 500, Major: 250, Minor: 100 };

    const newMonster: BugMonster = {
      id: 'b-' + (monstersState.length + 1),
      title,
      severity,
      currentHp: hpMap[severity],
      maxHp: hpMap[severity],
      rewardXp: xpMap[severity],
      assignee,
      status: 'Active',
      monsterImage,
      dueDate,
      isBoss: severity === 'Critical',
      dialogue: '새롭게 출현한 버그 몬스터다! 무찌르고 PR을 통합하라!'
    };

    monstersState.unshift(newMonster);
    saveState();
    soundFx.playHitSound();
    confetti({ particleCount: 50 });
    battleLogMessage = ` [신규 몬스터 출현] ${title} 버그 몬스터가 전장에 배치되었습니다!`;

    activeModal = null;
    renderApp();
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

  document.querySelector('#btn-do-enhance')?.addEventListener('click', () => {
    soundFx.playEnhanceSound();
    if (Math.random() < 0.7) {
      userState.weapon.enhanceLevel += 1;
      userState.stats.productivity += 2;
      confetti({ particleCount: 80, spread: 60 });
      battleLogMessage = `강화 성공! [${userState.weapon.name}] 이 +${userState.weapon.enhanceLevel} 강화되었습니다! (공격력 스탯 +2 상승)`;
    } else {
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

  document.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
    soundFx.toggleMute();
    renderApp();
  });

  document.querySelector('#sound-volume-range')?.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10) / 100;
    soundFx.setVolume(val);
  });

  document.querySelector('#btn-toggle-lang')?.addEventListener('click', () => {
    const nextLang = getLang() === 'ko' ? 'en' : 'ko';
    setLang(nextLang);
    showToast(nextLang === 'ko' ? '🌐 한국어 모드로 전환되었습니다.' : '🌐 Switched to English mode.', 'info');
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

  document.querySelector('#btn-open-webhook')?.addEventListener('click', () => {
    activeModal = 'webhook';
    renderApp();
  });

  document.querySelector('#btn-leaderboard')?.addEventListener('click', () => {
    activeModal = 'leaderboard';
    renderApp();
  });

  document.querySelectorAll('.btn-attack-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      attackTargetId = (e.currentTarget as HTMLElement).getAttribute('data-id');
      activeModal = 'attack';
      renderApp();
    });
  });

  document.querySelector('#btn-get-ai-hint')?.addEventListener('click', () => {
    const targetMonster = monstersState.find(m => m.id === attackTargetId);
    battleLogMessage = ` [AI 디버깅 가이드 - ${targetMonster?.title}]\n\n추천 힌트:\n1. 소스코드 내 예외 처리(try-catch) 블록을 확인하세요.\n2. Unit Test 커버리지를 80% 이상 확보하여 PR을 생성하면 크리티컬 히트(2배 피해)가 발동합니다!`;
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

  document.querySelector('#btn-close-modal')?.addEventListener('click', () => {
    activeModal = null;
    renderApp();
  });

  document.querySelector('#form-vacation')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = (document.querySelector('#vacation-user') as HTMLInputElement).value;
    const type = (document.querySelector('#vacation-type') as HTMLSelectElement).value as any;
    const reason = (document.querySelector('#vacation-reason') as HTMLInputElement).value;

    vacationsState.unshift({
      id: 'v' + (vacationsState.length + 1),
      userName: user,
      type,
      startDate: '2026-08-17',
      endDate: '2026-08-18',
      days: 2,
      status: '승인',
      reason
    });

    userState.hp = Math.min(userState.maxHp, userState.hp + 50);
    battleLogMessage = `휴가 신청 승인 완료! 충분한 휴식으로 개발자 HP가 +50 회복되었습니다!`;

    activeModal = null;
    renderApp();
  });

  document.querySelector('#form-attack')?.addEventListener('submit', (e) => {
    e.preventDefault();
    let baseDamage = parseInt((document.querySelector('#attack-damage') as HTMLSelectElement).value, 10);
    const monster = monstersState.find(m => m.id === attackTargetId);
    
    if (monster && monster.status === 'Active') {
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

      if (isSkillActiveNextAttack) {
        baseDamage = Math.round(baseDamage * userState.activeSkill.damageMultiplier);
        isSkillActiveNextAttack = false;
      }

      if (monster.defenseTrait === 'Dodge' && Math.random() < 0.2) {
        soundFx.playDodgeSound();
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

      monster.currentHp = Math.max(0, monster.currentHp - baseDamage);
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

      battleLogMessage = `[AI 코드 검수 우수] ${userState.name}의 공격! ${monster.title}에게 ${baseDamage} 데미지! (Slack 채널 알림 발송 완료)`;

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
        userState.hp = Math.min(userState.maxHp, userState.hp + 10);

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
        
        setTimeout(() => {
          hitMonsterId = null;
          lastHitDamageText = null;
        }, 1500);
        return;
      } else {
        confetti({ particleCount: 30, spread: 40 });
        
        setTimeout(() => {
          hitMonsterId = null;
          lastHitDamageText = null;
          renderApp();
        }, 600);
      }
    }

    activeModal = null;
    renderApp();
  });

  document.querySelector('#btn-generate-ai')?.addEventListener('click', () => {
    showToast('AI 개발 요약 리포트가 최신화되었습니다.', 'info');
  });
}

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

renderApp();
