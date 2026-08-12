import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalHeader } from '../ui';
import { getMonsterArtwork, monsterArtworkClass } from '../../services/monsterSpriteService';
import { getSeverityKorean } from '../../i18n';

export function renderCodexModal(state: AppState): string {
  const { monstersState } = state;
  const totalCount = monstersState.length;
  const defeatedCount = monstersState.filter(m => m.status === 'Defeated').length;
  const activeCount = totalCount - defeatedCount;

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card codex-modal">
        ${renderModalHeader({ icon: 'book', eyebrow: 'THE MONSTER CODEX', title: '버그 몬스터 도감' })}

        <!-- Codex Summary Bar -->
        <div class="archive-metrics">
          <div>
            <span>${icon('bug', '', 13)} 발견된 몬스터</span>
            <strong>${totalCount}종</strong>
          </div>
          <div class="is-success">
            <span>${icon('check', 'color:var(--success)', 13)} 토벌 완료</span>
            <strong>${defeatedCount}종</strong>
          </div>
          <div class="is-danger">
            <span>${icon('warning', 'color:var(--danger)', 13)} 토벌 대기</span>
            <strong>${activeCount}종</strong>
          </div>
        </div>

        <!-- Codex List Grid -->
        <div class="archive-list">
          ${monstersState.map(m => {
            const artwork = getMonsterArtwork(m);
            return `
            <div class="archive-item ${m.status === 'Defeated' ? 'is-resolved' : ''}">
              <div role="img" aria-label="${artwork.label}" class="archive-monster-sprite pixel-sprite pixel-monster-sprite ${monsterArtworkClass(m)}"></div>
              <div class="archive-item-content">
                  <div class="archive-item-title"><strong>${m.title}</strong>
                    <span class="badge ${m.status === 'Defeated' ? 'badge-success' : 'badge-danger'}">
                      ${m.status === 'Defeated' ? icon('check', '', 11) + ' 해결됨' : getSeverityKorean(m.severity)}
                    </span>
                  </div>
                  <div class="archive-item-meta">
                    위험도: <strong>${getSeverityKorean(m.severity)}</strong> | 처치 경험치: <strong style="color: var(--warning);">+${m.rewardXp} XP</strong>
                  </div>
                  ${m.postMortem ? `
                    <div class="archive-postmortem">
                      ${icon('book', '', 12)} 사후 분석: ${m.postMortem.category} (${m.postMortem.actionItem})
                    </div>
                  ` : ''}
              </div>
            </div>
          `; }).join('')}
        </div>
      </div>
    </div>
  `;
}
