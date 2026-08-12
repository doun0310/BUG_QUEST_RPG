import { soundFx } from '../soundManager';
import type { AppState } from '../store';
import { getLang } from '../i18n';
import { icon, iconLabel } from '../icons';

export function renderHeader(state: AppState): string {
  const { userState, currentTheme } = state;
  const hpPct = (userState.hp / userState.maxHp) * 100;
  const xpPct = (userState.xp / userState.maxXp) * 100;
  const themeIcon = currentTheme === 'dark'
    ? icon('moon', 'color:var(--primary-light)')
    : currentTheme === 'light'
      ? icon('sun', 'color:var(--warning)')
      : currentTheme === 'matrix'
        ? icon('matrix', 'color:var(--success)')
        : icon('matrix', 'color:var(--success)');
  // The pixel skin is a visual mode of the Matrix destination, so retain the established label.
  const themeLabel = currentTheme === 'dark' ? '다크' : currentTheme === 'light' ? '라이트' : '매트릭스';

  return `
    <header class="app-header" aria-label="BUG QUEST 상단 제어 영역">
      <!-- Logo + Identity -->
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">${icon('mark', '', 22)}</div>
        <div>
          <h1 class="logo-title" style="display: flex; align-items: center; gap: 0.4rem;">
            BUG QUEST <span>WORKSPACE</span>
          </h1>
          <div class="brand-context">
            ${icon('activity', 'color:var(--text-muted)', 12)} ${userState.name}
            <span style="color: var(--panel-border);">·</span>
            ${icon('lightning', 'color:var(--warning)', 12)} <span style="color: var(--warning); font-weight: 700;">${userState.streakCount} COMBO</span>
          </div>
        </div>
      </div>

      <!-- Player status HUD -->
      <div class="header-hud" role="group" aria-label="플레이어 상태">

        <!-- HP Bar -->
        <div class="stat-bar-box game-hud-gauge game-hud-hp">
          <div class="game-hud-label">
            ${icon('fire', 'color:var(--danger)', 11)} <span>HERO HP</span><strong>${userState.hp}/${userState.maxHp}</strong>
          </div>
          <div class="hp-bar-outer">
            <div class="hp-bar-inner" style="width: ${hpPct}%;"></div>
          </div>
        </div>

        <!-- XP Bar -->
        <div class="stat-bar-box game-hud-gauge game-hud-xp">
          <div class="game-hud-label">
            ${icon('crystal', 'color:var(--primary-light)', 11)} <span>LEVEL ${userState.level}</span><strong>${userState.xp} XP</strong>
          </div>
          <div class="hp-bar-outer">
            <div class="xp-bar-inner" style="width: ${xpPct}%;"></div>
          </div>
        </div>

      </div>

      <!-- Workspace actions -->
      <div class="header-actions" role="group" aria-label="작업 영역 제어">
        <button class="toolbar-pill-btn header-inventory-btn" id="btn-open-inventory">
          ${icon('box', '', 14)} 보상함
          <span class="header-count">${userState.inventory.length}</span>
        </button>

        <div class="dropdown-container">
          <button class="action-btn header-rpg-btn" id="btn-toggle-rpg-menu" aria-haspopup="menu" aria-expanded="false">
            ${icon('sword', '', 14)} RPG 메뉴
          </button>
          <div class="dropdown-menu" id="rpg-dropdown-menu">
            <button class="dropdown-item" id="btn-open-skilltree">${iconLabel('sword', '전직 클래스 & 스킬 트리', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-dungeon-map">${iconLabel('map', '던전 월드맵 & 보스 파밍', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-daily-roulette">${iconLabel('ticket', '일일 출석 룰렛 & 보물 상자', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-releasemilestone">${iconLabel('flag', '릴리즈 배포 마일스톤', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-slackbot">${iconLabel('slack', 'Slack / Teams 챗봇', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-cicdpipeline">${iconLabel('rocket', 'CI/CD 파이프라인', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-aiprediction">${iconLabel('brain', 'AI 버그 예측', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-socialfeed">${iconLabel('chat', '팀 소셜 피드', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-raidshop">${iconLabel('shop', '레이드 코인 상점', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-apisync">${iconLabel('plug', '외부 API 연동', '', 14)}</button>
            <button class="dropdown-item" id="btn-export-backup">${iconLabel('box', '데이터 백업 (JSON Export)', '', 14)}</button>
            <button class="dropdown-item" id="btn-import-backup">${iconLabel('checklist', '데이터 복원 (JSON Import)', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-achievements">${iconLabel('medal', '업적 &amp; 칭호', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-codex">${iconLabel('book', '몬스터 도감', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-execanalytics">${iconLabel('graph', '엑세큐티브 리포트', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-coopboss">${iconLabel('users', '팀 협동 레이드', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-seasonpass">${iconLabel('ticket', `시즌패스 (Tier ${userState.seasonPass.currentTier})`, '', 14)}</button>
            <button class="dropdown-item" id="btn-open-guildwar">${iconLabel('guild', '길드 대항전', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-radar">${iconLabel('radar', '육성 스탯 차트', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-simulator">${iconLabel('flask', '예산 시뮬레이터', '', 14)}</button>
            <button class="dropdown-item" id="btn-open-pet">${iconLabel('paw', `펫 Lv.${userState.pet.level}`, '', 14)}</button>
            <button class="dropdown-item" id="btn-open-forge">${iconLabel('hammer', `장비 강화 +${userState.weapon.enhanceLevel}`, '', 14)}</button>
            <button class="dropdown-item" id="btn-edit-profile" style="color: var(--primary-light);">${iconLabel('users', '계정 프로필 수정', 'color:var(--primary-light)', 14)}</button>
            <button class="dropdown-item" id="btn-switch-account" style="color: var(--sky);">${iconLabel('users', '다른 계정으로 전환', 'color:var(--sky)', 14)}</button>
            <button class="dropdown-item" id="btn-team-settings" style="color: var(--primary-light);">${iconLabel('sparkle', '팀 설정 (온보딩 재실행)', 'color:var(--primary-light)', 14)}</button>
            <button class="dropdown-item" id="btn-logout" style="color: var(--danger);">${iconLabel('warning', '로그아웃', 'color:var(--danger)', 14)}</button>
            <div style="height: 1px; background: var(--panel-border); margin: 0.25rem 0.4rem;"></div>
            <div style="padding: 0.4rem 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: var(--text-muted);">
                ${icon('volume', '', 13)} 볼륨
              </span>
              <input type="range" id="sound-volume-range" min="0" max="100"
                value="${Math.round(soundFx.getVolume() * 100)}"
                style="width: 72px; accent-color: var(--primary); cursor: pointer;" />
            </div>
            <button class="dropdown-item" id="btn-toggle-sound">
              ${soundFx.getIsMuted()
                ? iconLabel('mute', '사운드 OFF', '', 14)
                : iconLabel('volume', '사운드 ON', '', 14)}
            </button>
          </div>
        </div>

        <div class="header-utility" aria-label="언어 및 테마 설정">
          <button class="toolbar-pill-btn" id="btn-toggle-lang">
            ${icon('globe', '', 14)} ${getLang() === 'ko' ? '한국어' : 'English'}
          </button>
          <button class="toolbar-pill-btn" id="btn-toggle-theme">
            ${themeIcon} ${themeLabel}
          </button>
        </div>

      </div>
    </header>
  `;
}
