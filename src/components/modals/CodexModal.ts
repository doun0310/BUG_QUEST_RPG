import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalHeader } from '../ui';

export function renderCodexModal(state: AppState): string {
  const { monstersState } = state;
  const totalCount = monstersState.length;
  const defeatedCount = monstersState.filter(m => m.status === 'Defeated').length;
  const activeCount = totalCount - defeatedCount;

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card codex-modal">
        ${renderModalHeader({ icon: 'book', eyebrow: 'ISSUE ARCHIVE', title: '이슈 아카이브' })}

        <!-- Codex Summary Header -->
        <div class="archive-metrics">
          <div>
            <span>${icon('bug', '', 14)} 전체 이슈</span>
            <strong>${totalCount}</strong>
          </div>
          <div class="is-success">
            <span>${icon('check', '', 14)} 해결됨</span>
            <strong>${defeatedCount}</strong>
          </div>
          <div class="is-danger">
            <span>${icon('activity', '', 14)} 진행 중</span>
            <strong>${activeCount}</strong>
          </div>
        </div>

        <!-- Codex List Grid -->
        <div class="archive-list">
          ${monstersState.map(m => `
            <div class="archive-item ${m.status === 'Defeated' ? 'is-resolved' : ''}">
              <img src="${m.monsterImage || '/cyber_bug.jpg'}" alt="" />
              <div class="archive-item-content">
                  <div class="archive-item-title"><strong>${m.title}</strong>
                    <span class="badge ${m.status === 'Defeated' ? 'badge-success' : 'badge-danger'}">
                      ${m.status === 'Defeated' ? icon('check', '', 11) + ' 해결됨' : m.severity}
                    </span>
                  </div>
                  <div class="archive-item-meta">
                    위험도: <strong>${m.severity}</strong> | 처치 경험치: <strong style="color: var(--warning);">+${m.rewardXp} XP</strong>
                  </div>
                  ${m.postMortem ? `
                    <div class="archive-postmortem">
                      ${icon('book', '', 12)} 사후 분석: ${m.postMortem.category} (${m.postMortem.actionItem})
                    </div>
                  ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
