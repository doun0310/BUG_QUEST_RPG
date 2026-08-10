import type { AppState } from '../../store';

export function renderCodexModal(state: AppState): string {
  const { monstersState } = state;
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
