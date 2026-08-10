import { soundFx } from '../soundManager';
import type { AppState } from '../store';
import { getLang } from '../i18n';

export function renderHeader(state: AppState): string {
  const { userState, currentTheme } = state;

  return `
    <header>
      <div>
        <h1 class="logo-title">BUG TRACKER RPG</h1>
        <div style="font-size: 0.78rem; color: var(--text-sub); margin-top: 0.1rem;">
          개발자 <strong>${userState.name}</strong> | 콤보: <strong style="color: var(--warning);">${userState.streakCount} COMBO</strong>
        </div>
      </div>

      <!-- Clean Action Badges & Stats Bar -->
      <div class="user-badge-container">
        <!-- Developer HP Bar -->
        <div class="stat-bar-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
            <span style="color: var(--danger); font-weight: 700;">HP ${userState.hp}/${userState.maxHp}</span>
          </div>
          <div class="hp-bar-outer">
            <div style="width: ${(userState.hp / userState.maxHp) * 100}%; height: 100%; background: var(--danger); border-radius: 3px;"></div>
          </div>
        </div>

        <!-- Developer XP Bar -->
        <div class="stat-bar-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
            <span style="color: var(--primary); font-weight: 700;">Lv.${userState.level} (${userState.xp}/${userState.maxXp})</span>
          </div>
          <div class="hp-bar-outer">
            <div class="xp-bar-inner" style="width: ${(userState.xp / userState.maxXp) * 100}%;"></div>
          </div>
        </div>

        <!-- Inventory Pill Button -->
        <button class="toolbar-pill-btn" id="btn-open-inventory">
          보상함 (${userState.inventory.length})
        </button>

        <!-- Clean Dropdown Menu for all RPG Features -->
        <div class="dropdown-container">
          <button class="action-btn" id="btn-toggle-rpg-menu" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">
             RPG 메뉴 ▼
          </button>
          <div class="dropdown-menu" id="rpg-dropdown-menu">
            <button class="dropdown-item" id="btn-open-releasemilestone">🚀 v2.0 릴리즈 배포 마일스톤</button>
            <button class="dropdown-item" id="btn-open-slackbot">🤖 Slack / Teams 챗봇 연동</button>
            <button class="dropdown-item" id="btn-open-cicdpipeline">🚀 CI/CD 파이프라인 모니터링</button>
            <button class="dropdown-item" id="btn-open-aiprediction"> AI 버그 예측 모니터링</button>
            <button class="dropdown-item" id="btn-open-socialfeed"> 팀 소셜 피드 & 칭찬</button>
            <button class="dropdown-item" id="btn-open-raidshop"> 레이드 코인 상점</button>
            <button class="dropdown-item" id="btn-open-apisync"> 외부 API 연동 설정</button>
            <button class="dropdown-item" id="btn-open-achievements"> 업적 & 칭호 (Achievements)</button>
            <button class="dropdown-item" id="btn-open-codex"> 몬스터 도감 (Codex)</button>
            <button class="dropdown-item" id="btn-open-execanalytics"> 엑세큐티브 분석 리포트</button>
            <button class="dropdown-item" id="btn-open-coopboss"> 팀 협동 레이드</button>
            <button class="dropdown-item" id="btn-open-seasonpass"> 시즌패스 (Tier ${userState.seasonPass.currentTier})</button>
            <button class="dropdown-item" id="btn-open-guildwar"> 길드 대항전</button>
            <button class="dropdown-item" id="btn-open-radar"> 육성 스탯 차트</button>
            <button class="dropdown-item" id="btn-open-simulator"> 예산 시뮬레이터</button>
            <button class="dropdown-item" id="btn-open-pet"> 펫 Lv.${userState.pet.level}</button>
            <button class="dropdown-item" id="btn-open-forge"> 장비 강화 +${userState.weapon.enhanceLevel}</button>
            <div style="border-top: 1px solid var(--panel-border); margin: 0.2rem 0;"></div>
            <div style="padding: 0.4rem 0.8rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-main);">
              <span>🔊 볼륨:</span>
              <input type="range" id="sound-volume-range" min="0" max="100" value="${Math.round(soundFx.getVolume() * 100)}" style="width: 80px; accent-color: var(--primary); cursor: pointer;" />
            </div>
            <button class="dropdown-item" id="btn-toggle-sound"> 사운드 ${soundFx.getIsMuted() ? 'OFF' : 'ON'}</button>
          </div>
        </div>

        <button class="theme-toggle-btn" id="btn-toggle-lang" style="font-size: 0.75rem; padding: 0.4rem 0.65rem; background: var(--inner-box-bg); border: 1px solid var(--panel-border);">
          🌐 ${getLang() === 'ko' ? '한국어' : 'English'}
        </button>

        <button class="theme-toggle-btn" id="btn-toggle-theme" style="font-size: 0.75rem; padding: 0.4rem 0.65rem;">
          테마: ${currentTheme === 'dark' ? '다크' : currentTheme === 'light' ? '라이트' : '매트릭스'}
        </button>
      </div>
    </header>
  `;
}
