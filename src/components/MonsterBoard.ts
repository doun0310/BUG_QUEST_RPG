import type { AppState } from '../store';

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

  return `
    <!-- Battle Log Box -->
    <div class="dq-window" style="margin-bottom: 0.85rem;">
      <div class="dq-text" style="color: #38bdf8; margin-bottom: 0.25rem;">[ BATTLE LOG ]</div>
      <div style="font-size: 0.85rem; color: #ffffff;" id="dq-battle-log">
        ${battleLogMessage}
      </div>
    </div>

    <!-- Control Bar -->
    <div class="card" style="margin-bottom: 0.85rem;">
      <div class="card-header" style="margin-bottom: 0.65rem;">
        <div>
          <h2 class="card-title">몬스터 토벌 전장 (출현 ${activeBugs} / 토벌 ${defeatedBugs})</h2>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button class="action-btn" id="btn-open-create-monster" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">+ 몬스터 발견 등록</button>
          <button class="action-btn action-btn-secondary" id="btn-open-quests" style="padding: 0.3rem 0.6rem;">주간 퀘스트</button>
          <button class="action-btn action-btn-secondary" id="btn-open-webhook" style="padding: 0.3rem 0.6rem;">Webhook Log</button>
          <button class="action-btn action-btn-secondary" id="btn-leaderboard" style="padding: 0.3rem 0.6rem;">기여도 랭킹</button>
        </div>
      </div>

      <!-- Hero Skill & Filter Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-box-bg); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--panel-border);">
        <div style="font-size: 0.78rem; display: flex; align-items: center; gap: 0.4rem;">
          <span style="font-weight: 700; color: var(--primary);">${userState.activeSkill.name}</span>
          <span style="color: var(--text-sub);">(AI 검수 인가)</span>
          <span style="font-size: 0.7rem; color: var(--text-sub); margin-left: 0.5rem;">단축키: <kbd>S</kbd> 스킬 | <kbd>A</kbd> 공격 | <kbd>Esc</kbd> 닫기</span>
        </div>
        
        <div style="display: flex; gap: 0.35rem;">
          <button class="action-btn ${isSkillActiveNextAttack ? 'action-btn-danger' : ''}" id="btn-activate-skill" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;">
            ${isSkillActiveNextAttack ? '⚡ 스킬 발동!' : '⚡ 스킬 준비 (S)'}
          </button>
          <button class="action-btn ${bugFilter === 'all' ? '' : 'action-btn-secondary'}" id="filter-all" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;">전체</button>
          <button class="action-btn ${bugFilter === 'active' ? '' : 'action-btn-secondary'}" id="filter-active" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;">출현 중</button>
          <button class="action-btn ${bugFilter === 'defeated' ? '' : 'action-btn-secondary'}" id="filter-defeated" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;">토벌 완료</button>
        </div>
      </div>
    </div>

    <!-- Monster Grid Cards -->
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      ${filteredMonsters.map(m => {
        const isHit = hitMonsterId === m.id;
        const isEnraged = m.isEnraged || m.isOverdue;
        const elementIcon = {
          Frontend: '🎨 Frontend',
          Backend: '🧙‍♂️ Backend',
          Database: '🗄️ Database',
          Security: '🛡️ Security'
        }[m.elementTrait || 'Frontend'];

        return `
          <div class="card monster-card-animated ${isEnraged ? 'enraged-monster-card' : ''}" style="border-left: 4px solid ${isEnraged ? 'var(--danger)' : m.isBoss ? 'var(--danger)' : m.severity === 'Major' ? 'var(--warning)' : 'var(--primary)'};">
            
            <div class="dq-monster-container">
              <img src="${m.monsterImage || '/cyber_bug.jpg'}" alt="Monster" class="dq-monster-img ${m.status === 'Defeated' ? 'dq-monster-defeated' : ''} ${isHit ? 'hit-animation' : ''}" />
              
              ${isHit && lastHitDamageText ? `
                <div class="damage-float-text ${lastHitDamageText.includes('CRITICAL') || lastHitDamageText.includes('2X') ? 'critical' : ''}">${lastHitDamageText}</div>
              ` : ''}

              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                  <h3 style="font-size: 0.92rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem;">
                    ${m.title}
                    ${isEnraged ? '<span class="badge badge-danger low-hp-warning">🔥 광포화</span>' : ''}
                  </h3>
                  <div style="display: flex; gap: 0.3rem; align-items: center;">
                    <span class="badge" style="background: var(--inner-box-bg); border: 1px solid var(--panel-border); font-size: 0.68rem; color: var(--primary);">${elementIcon}</span>
                    <span class="badge ${m.status === 'Defeated' ? 'badge-success' : 'badge-danger'}">
                      ${m.status === 'Defeated' ? '토벌 완료' : m.severity}
                    </span>
                  </div>
                </div>

                ${m.dialogue && m.status === 'Active' ? `
                  <div style="background: rgba(56, 189, 248, 0.1); border-left: 3px solid var(--primary); padding: 0.25rem 0.5rem; font-size: 0.72rem; color: var(--primary); font-style: italic; margin-bottom: 0.3rem;">
                    💬 몬스터 피격 대사: "${m.dialogue}"
                  </div>
                ` : ''}

                ${m.dueDate ? `
                  <div style="font-size: 0.72rem; color: ${isEnraged ? 'var(--danger)' : 'var(--text-sub)'}; margin-bottom: 0.3rem;">
                    ${isEnraged ? `[경고] 마감시간 초과 광포화 반격! (공격력 2배 & 개발자 HP -30 피격)` : `마감기한: ${m.dueDate}`}
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.2rem;">
                  <span>HP: <strong>${m.currentHp} / ${m.maxHp}</strong></span>
                  <span style="color: var(--text-sub);">담당: ${m.assignee}</span>
                </div>
                <div class="hp-bar-outer">
                  <div class="hp-bar-inner" style="width: ${(m.currentHp / m.maxHp) * 100}%; background: ${isEnraged ? 'linear-gradient(90deg, #fb7185, #ff0055)' : ''};"></div>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; margin-top: 0.35rem;">
              <div>
                <span style="color: var(--warning); font-weight: 600;">보상: +${m.rewardXp} XP</span>
                ${m.prUrl ? `<a href="${m.prUrl}" target="_blank" style="color: var(--primary); margin-left: 0.5rem; text-decoration: none;">PR 링크</a>` : ''}
              </div>
              ${m.status === 'Active' ? `
                <button class="action-btn action-btn-danger btn-attack-trigger" data-id="${m.id}" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;">
                  PR 공격 / 통합
                </button>
              ` : `
                <div style="display: flex; gap: 0.35rem;">
                  <button class="action-btn action-btn-secondary btn-open-postmortem" data-id="${m.id}" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;">
                    ${m.postMortem ? '📝 회고 보기' : '📝 사후 분석 작성 (+50 XP)'}
                  </button>
                  <span class="badge badge-success">Slain</span>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
