import type { AppState } from '../store';
import { icon } from '../icons';

export function renderMonsterBoard(state: AppState): string {
  const {
    monstersState,
    bugFilter,
    userState,
    isSkillActiveNextAttack,
    battleLogMessage,
    hitMonsterId,
    lastHitDamageText
  } = state;

  const activeBugs = monstersState.filter(m => m.status === 'Active').length;
  const defeatedBugs = monstersState.filter(m => m.status === 'Defeated').length;

  const filteredMonsters = monstersState.filter(m => {
    if (bugFilter === 'active') return m.status === 'Active';
    if (bugFilter === 'defeated') return m.status === 'Defeated';
    return true;
  });

  const severityAccent = (m: any) => {
    if (m.isEnraged || m.isOverdue) return 'var(--danger)';
    if (m.isBoss || m.severity === 'Critical') return 'var(--danger)';
    if (m.severity === 'Major') return 'var(--warning)';
    return 'var(--primary)';
  };

  const elementIcon: Record<string, string> = {
    Frontend: icon('paint', 'color:var(--primary-light)', 12) + ' 약점: Frontend',
    Backend: icon('server', 'color:var(--sky)', 12) + ' 약점: Backend',
    Database: icon('database', 'color:var(--warning)', 12) + ' 약점: Database',
    Security: icon('shield', 'color:var(--success)', 12) + ' 약점: Security',
  };

  return `
    <!-- Activity Log -->
    <div class="activity-log">
      <p class="activity-log-label">
        ${icon('activity', 'color:var(--primary)', 12)} LIVE ACTIVITY
      </p>
      <div id="dq-battle-log" style="font-size: 0.82rem; color: var(--text-main); line-height: 1.55;">
        ${battleLogMessage}
      </div>
    </div>

    <!-- Control Bar -->
    <div class="card" style="margin-bottom: 1rem;">
      <!-- Title Row -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
        <div>
          <h2 style="font-size: 0.95rem; font-weight: 700; background: linear-gradient(135deg, var(--primary-light), var(--sky)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('bug', 'color:var(--primary-light)', 16)} 이슈 보드
          </h2>
          <div style="display: flex; gap: 0.4rem;">
            <span class="badge badge-danger" style="border-radius: 99px; display: inline-flex; align-items: center; gap: 0.3rem;">
              ${icon('fire', 'color:var(--danger)', 11)} 출현 ${activeBugs}
            </span>
            <span class="badge badge-success" style="border-radius: 99px; display: inline-flex; align-items: center; gap: 0.3rem;">
              ${icon('check', 'color:var(--success)', 11)} 토벌 ${defeatedBugs}
            </span>
          </div>
        </div>
        <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
          <button class="action-btn" id="btn-open-create-monster" style="font-size: 0.73rem; padding: 0.38rem 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
            ${icon('plus', '', 13)} 이슈 등록
          </button>
          <button class="action-btn action-btn-secondary" id="btn-open-quests" style="font-size: 0.73rem; padding: 0.38rem 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
            ${icon('checklist', '', 13)} 주간 퀘스트
          </button>
          <button class="action-btn action-btn-secondary" id="btn-open-webhook" style="font-size: 0.73rem; padding: 0.38rem 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
            ${icon('link', '', 13)} Webhook
          </button>
          <button class="action-btn action-btn-secondary" id="btn-leaderboard" style="font-size: 0.73rem; padding: 0.38rem 0.75rem; display: flex; align-items: center; gap: 0.35rem;">
            ${icon('trophy', '', 13)} 기여도 랭킹
          </button>
        </div>
      </div>

      <!-- Skill & Filter Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-box-bg); padding: 0.55rem 0.85rem; border-radius: 10px; border: 1px solid var(--panel-border);">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.74rem;">
          ${icon('sparkle', 'color:var(--primary-light)', 14)}
          <span style="font-weight: 700; color: var(--primary-light);">${userState.activeSkill.name}</span>
          <span style="color: var(--text-muted);">— 품질 검수 자동화</span>
          <span style="color: var(--text-muted); font-size: 0.66rem; display: flex; align-items: center; gap: 0.3rem;">
            <kbd>S</kbd> 스킬 &nbsp; <kbd>A</kbd> 공격 &nbsp; <kbd>Esc</kbd> 닫기
          </span>
        </div>
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <button class="action-btn ${isSkillActiveNextAttack ? 'action-btn-danger' : 'action-btn-secondary'}" id="btn-activate-skill"
            style="font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 99px; display: flex; align-items: center; gap: 0.3rem;">
            ${icon('lightning', isSkillActiveNextAttack ? 'color:white' : '', 13)}
            ${isSkillActiveNextAttack ? '스킬 발동 중!' : '스킬 준비 (S)'}
          </button>
          <div style="width: 1px; height: 16px; background: var(--panel-border); margin: 0 0.1rem;"></div>
          <button class="action-btn ${bugFilter === 'all' ? '' : 'action-btn-secondary'}" id="filter-all"
            style="font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 99px;">전체</button>
          <button class="action-btn ${bugFilter === 'active' ? '' : 'action-btn-secondary'}" id="filter-active"
            style="font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 99px; display: flex; align-items: center; gap: 0.3rem;">
            ${icon('fire', '', 11)} 출현 중
          </button>
          <button class="action-btn ${bugFilter === 'defeated' ? '' : 'action-btn-secondary'}" id="filter-defeated"
            style="font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 99px; display: flex; align-items: center; gap: 0.3rem;">
            ${icon('check', '', 11)} 토벌 완료
          </button>
        </div>
      </div>
    </div>

    <!-- Monster Cards -->
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${filteredMonsters.length === 0 ? `
        <div class="empty-state"><div>${icon('bug', 'color:var(--primary-light)', 26)}</div><h3>표시할 이슈가 없습니다</h3><p>${bugFilter === 'defeated' ? '아직 해결된 이슈가 없습니다.' : '필터를 변경하거나 새로운 이슈를 등록하세요.'}</p><button class="action-btn" id="btn-open-create-monster">${icon('plus', 'color:white', 14)} 이슈 등록</button></div>
      ` : filteredMonsters.map(m => {
        const isHit = hitMonsterId === m.id;
        const isEnraged = m.isEnraged || m.isOverdue;
        const isCriticalImpact = isHit && !!lastHitDamageText?.includes('CRITICAL');
        const hpPct = (m.currentHp / m.maxHp) * 100;
        const accent = severityAccent(m);
        const elemLabel = elementIcon[m.elementTrait || 'Frontend'] || elementIcon['Frontend'];

        return `
          <div class="card monster-card-animated ${isEnraged ? 'enraged-monster-card' : ''} ${isHit ? 'monster-impact' : ''} ${isCriticalImpact ? 'monster-impact-critical' : ''}"
            style="border-left: 3px solid ${accent}; padding: 0;">

            <div class="dq-monster-container" style="margin: 0; border: none; background: transparent; border-radius: 16px; padding: 1rem 1.15rem;">

              <!-- Monster Image -->
              <img src="${m.monsterImage || '/cyber_bug.jpg'}" alt="Monster"
                class="dq-monster-img ${m.status === 'Defeated' ? 'dq-monster-defeated' : ''} ${isHit ? 'hit-animation' : ''}"
                style="width: 68px; height: 68px; border-radius: 12px;" />

              ${isHit && lastHitDamageText ? `
                <div class="damage-float-text ${lastHitDamageText.includes('CRITICAL') || lastHitDamageText.includes('2X') ? 'critical' : ''}">${lastHitDamageText}</div>
              ` : ''}

              <!-- Monster Info -->
              <div style="flex: 1; min-width: 0;">
                <!-- Title Row -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.3rem;">
                  <h3 style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    ${m.title}
                    ${isEnraged ? `<span class="badge badge-danger low-hp-warning" style="border-radius: 99px; display: inline-flex; align-items: center; gap: 0.25rem;">${icon('fire', 'color:var(--danger)', 10)} 광포화</span>` : ''}
                  </h3>
                  <div style="display: flex; gap: 0.3rem; align-items: center; flex-shrink: 0;">
                    <span class="badge" style="border-radius: 99px; font-size: 0.65rem; display: inline-flex; align-items: center; gap: 0.25rem;">${elemLabel}</span>
                    <span class="badge ${m.status === 'Defeated' ? 'badge-success' : 'badge-danger'}" style="border-radius: 99px; font-size: 0.65rem; display: inline-flex; align-items: center; gap: 0.25rem;">
                      ${m.status === 'Defeated'
                        ? icon('check', 'color:var(--success)', 10) + ' 토벌'
                        : icon('warning', 'color:var(--danger)', 10) + ' ' + m.severity}
                    </span>
                  </div>
                </div>

                <!-- Monster Dialogue -->
                ${m.dialogue && m.status === 'Active' ? `
                  <div style="background: rgba(129, 140, 248, 0.06); border-left: 2px solid var(--primary); padding: 0.25rem 0.55rem; font-size: 0.7rem; color: var(--text-muted); font-style: italic; border-radius: 0 6px 6px 0; margin-bottom: 0.35rem; display: flex; align-items: flex-start; gap: 0.35rem;">
                    ${icon('chat', 'color:var(--primary);flex-shrink:0;margin-top:1px', 12)} "${m.dialogue}"
                  </div>
                ` : ''}

                <!-- Due Date -->
                ${m.dueDate ? `
                  <div style="font-size: 0.7rem; color: ${isEnraged ? 'var(--danger)' : 'var(--text-muted)'}; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.3rem; ${isEnraged ? 'font-weight: 600;' : ''}">
                    ${isEnraged
                      ? icon('warning', 'color:var(--danger)', 12) + ' 마감 초과 — 광포화! 공격력 2배 & 개발자 HP -30'
                      : icon('clock', '', 12) + ` 마감: ${m.dueDate}`}
                  </div>
                ` : ''}

                <!-- HP Bar -->
                <div style="margin-bottom: 0.35rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.7rem; margin-bottom: 0.18rem; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 0.25rem; color: var(--text-muted);">
                      ${icon('shield', '', 11)} HP
                    </span>
                    <span style="color: var(--text-main); font-weight: 600;">${m.currentHp.toLocaleString()} / ${m.maxHp.toLocaleString()}</span>
                  </div>
                  <div class="hp-bar-outer">
                    <div class="hp-bar-inner" style="width: ${hpPct}%;${isEnraged ? ' background: linear-gradient(90deg, var(--danger), #fb923c);' : ''}"></div>
                  </div>
                </div>

                <!-- Footer Row -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 0.7rem; display: flex; align-items: center; gap: 0.6rem;">
                    <span style="display: flex; align-items: center; gap: 0.2rem; color: var(--warning); font-weight: 600;">
                      ${icon('crystal', 'color:var(--warning)', 12)} +${m.rewardXp} XP
                    </span>
                    <span style="display: flex; align-items: center; gap: 0.2rem; color: var(--text-muted);">
                      ${icon('target', '', 11)} ${m.assignee}
                    </span>
                    <button class="assignee-edit-btn btn-edit-monster" data-id="${m.id}" aria-label="${m.title} 수정">${icon('settings', '', 12)} 수정</button>
                    ${m.status === 'Active' ? `<button class="assignee-edit-btn btn-reassign-assignee" data-id="${m.id}" aria-label="${m.title} 담당자 변경">${icon('users', '', 12)} 담당 변경</button>` : ''}
                    ${m.prUrl ? `<a href="${m.prUrl}" target="_blank" style="color: var(--primary-light); text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 0.2rem;">${icon('pr', 'color:var(--primary-light)', 12)} PR</a>` : ''}
                  </div>

                  ${m.status === 'Active' ? `
                    <button class="action-btn action-btn-danger btn-attack-trigger" data-id="${m.id}"
                      style="font-size: 0.72rem; padding: 0.32rem 0.75rem; border-radius: 8px; display: flex; align-items: center; gap: 0.35rem;">
                      ${icon('pr', 'color:white', 13)} PR 병합
                    </button>
                  ` : `
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                      <button class="action-btn action-btn-secondary btn-open-postmortem" data-id="${m.id}"
                        style="font-size: 0.7rem; padding: 0.28rem 0.6rem; border-radius: 8px; display: flex; align-items: center; gap: 0.35rem;">
                        ${icon('book', '', 12)} ${m.postMortem ? '회고 보기' : '사후 분석 작성 (+50 XP)'}
                      </button>
                      <span class="badge badge-success" style="border-radius: 99px; display: inline-flex; align-items: center; gap: 0.25rem;">
                        ${icon('check', 'color:var(--success)', 10)} Slain
                      </span>
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
