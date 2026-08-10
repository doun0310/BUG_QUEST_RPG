import { soundFx } from '../soundManager';
import type { AppState } from '../store';
import { getLang } from '../i18n';
import { icon, iconLabel } from '../icons';

export function renderHeader(state: AppState): string {
  const { userState, currentTheme } = state;
  const hpPct = (userState.hp / userState.maxHp) * 100;
  const xpPct = (userState.xp / userState.maxXp) * 100;
  const themeIcon = currentTheme === 'dark' ? icon('moon', 'color:var(--primary-light)') : currentTheme === 'light' ? icon('sun', 'color:var(--warning)') : icon('matrix', 'color:var(--success)');
  const themeLabel = currentTheme === 'dark' ? '다크' : currentTheme === 'light' ? '라이트' : '매트릭스';

  return `
    <header>
      <!-- Logo + Identity -->
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div>
          <h1 class="logo-title" style="display: flex; align-items: center; gap: 0.4rem;">
            ${icon('bug', 'color:var(--primary-light)', 18)} BUG TRACKER RPG
          </h1>
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('target', 'color:var(--text-muted)', 12)} ${userState.name}
            <span style="color: var(--panel-border);">·</span>
            ${icon('lightning', 'color:var(--warning)', 12)} <span style="color: var(--warning); font-weight: 700;">${userState.streakCount} COMBO</span>
          </div>
        </div>
      </div>

      <!-- Stat Bars & Controls -->
      <div class="user-badge-container">

        <!-- HP Bar -->
        <div class="stat-bar-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.67rem; margin-bottom: 0.18rem; align-items: center; gap: 0.25rem;">
            ${icon('fire', 'color:var(--danger)', 11)} <span style="color: var(--danger); font-weight: 700; flex: 1;">${userState.hp}/${userState.maxHp}</span>
          </div>
          <div class="hp-bar-outer">
            <div class="hp-bar-inner" style="width: ${hpPct}%;"></div>
          </div>
        </div>

        <!-- XP Bar -->
        <div class="stat-bar-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.67rem; margin-bottom: 0.18rem; align-items: center; gap: 0.25rem;">
            ${icon('crystal', 'color:var(--primary-light)', 11)} <span style="color: var(--primary-light); font-weight: 700; flex: 1;">Lv.${userState.level} · ${userState.xp}xp</span>
          </div>
          <div class="hp-bar-outer">
            <div class="xp-bar-inner" style="width: ${xpPct}%;"></div>
          </div>
        </div>

        <!-- Inventory -->
        <button class="toolbar-pill-btn" id="btn-open-inventory">
          ${icon('box', '', 14)} 보상함
          <span style="background: var(--primary-bg); color: var(--primary-light); font-size: 0.63rem; padding: 0 0.32rem; border-radius: 99px; font-weight: 700; margin-left: 0.1rem;">${userState.inventory.length}</span>
        </button>

        <!-- RPG Features Dropdown -->
        <div class="dropdown-container">
          <button class="action-btn" id="btn-toggle-rpg-menu" style="font-size: 0.73rem; padding: 0.42rem 0.85rem; border-radius: 99px; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('sword', '', 14)} RPG 메뉴
          </button>
          <div class="dropdown-menu" id="rpg-dropdown-menu">
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
            <div style="height: 1px; background: var(--panel-border); margin: 0.25rem 0.4rem;"></div>
            <button class="dropdown-item" id="btn-switch-account" style="color: var(--sky);">${iconLabel('users', '다른 계정으로 전환', 'color:var(--sky)', 14)}</button>
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

        <!-- Language & Theme Toggles -->
        <button class="toolbar-pill-btn" id="btn-toggle-lang" style="display: flex; align-items: center; gap: 0.35rem;">
          ${icon('globe', '', 14)} ${getLang() === 'ko' ? '한국어' : 'English'}
        </button>
        <button class="toolbar-pill-btn" id="btn-toggle-theme" style="display: flex; align-items: center; gap: 0.35rem;">
          ${themeIcon} ${themeLabel}
        </button>

      </div>
    </header>
  `;
}
