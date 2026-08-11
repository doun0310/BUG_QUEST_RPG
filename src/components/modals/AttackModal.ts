import type { AppState } from '../../store';
import { icon } from '../../icons';
import { getGitHubConfig, type GitHubPullRequest } from '../../services/githubService';
import { renderModalHeader } from '../ui';

export function renderAttackModal(state: AppState & { openPRs?: GitHubPullRequest[] }): string {
  const { monstersState, attackTargetId, isSkillActiveNextAttack, userState, openPRs = [] } = state;
  const targetMonster = monstersState.find(m => m.id === attackTargetId);
  const ghConfig = getGitHubConfig();

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card modal-form-card">
        ${renderModalHeader({ icon: 'pr', eyebrow: 'PULL REQUEST', title: targetMonster?.title ?? '이슈 PR 병합', tone: 'danger' })}

        ${isSkillActiveNextAttack ? `
          <div style="background: rgba(129, 140, 248, 0.1); border: 1px solid rgba(129, 140, 248, 0.3); color: var(--primary-light); padding: 0.5rem 0.75rem; border-radius: 10px; font-size: 0.76rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('sparkle', 'color:var(--primary-light)', 14)}
            <span>${userState.activeSkill.name} 스킬 발동 — 데미지 2배!</span>
          </div>
        ` : ''}

        ${ghConfig.isEnabled && ghConfig.token && ghConfig.owner && ghConfig.repo ? `
          <div style="background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.3); color: var(--success); padding: 0.45rem 0.65rem; border-radius: 8px; font-size: 0.73rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
              ${icon('check', 'color:var(--success)', 13)}
              <span>GitHub 온라인 연동 (<strong>${ghConfig.owner}/${ghConfig.repo}</strong>)</span>
            </span>
            <button type="button" class="action-btn action-btn-secondary" id="btn-fetch-open-prs" style="padding: 0.15rem 0.45rem; font-size: 0.68rem; display: flex; align-items: center; gap: 0.25rem;">
              ${icon('pr', 'color:var(--success)', 11)} 열린 PR 목록 불러오기
            </button>
          </div>
        ` : `
          <div style="background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.25); color: var(--warning); padding: 0.45rem 0.65rem; border-radius: 8px; font-size: 0.72rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
              ${icon('warning', 'color:var(--warning)', 12)}
              <span>현재 Mock 시뮬레이션 모드입니다.</span>
            </span>
            <button type="button" class="action-btn action-btn-secondary" id="btn-goto-apisync" style="padding: 0.15rem 0.45rem; font-size: 0.68rem;">GitHub 연동 설정</button>
          </div>
        `}

        <form id="form-attack" style="display: flex; flex-direction: column; gap: 0;">
          ${openPRs.length > 0 ? `
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.3rem; color: var(--success);">
                ${icon('pr', 'color:var(--success)', 12)} GitHub 열린 PR 선택 (${openPRs.length}개 발견)
              </label>
              <select class="form-select" id="select-open-pr" style="border-color: var(--success);">
                ${openPRs.map(pr => `
                  <option value="${pr.html_url}">
                    #${pr.number} — ${pr.title} (by @${pr.user.login})
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('pr', '', 12)} Pull Request URL 또는 PR 번호
            </label>
            <input type="text" class="form-input" id="attack-pr" value="${openPRs.length > 0 ? openPRs[0].html_url : ghConfig.isEnabled && ghConfig.owner && ghConfig.repo ? `https://github.com/${ghConfig.owner}/${ghConfig.repo}/pull/1` : 'https://github.com/org/repo/pull/142'}" required />
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('target', '', 12)} 변경 규모 (PR 커밋 크기)
            </label>
            <select class="form-select" id="attack-damage">
              <option value="100">소형 PR — -100 HP</option>
              <option value="250">중형 PR — -250 HP</option>
              <option value="500">대형 PR — -500 HP</option>
            </select>
          </div>

          <!-- AI Hint -->
          <button type="button" class="action-btn action-btn-secondary" id="btn-get-ai-hint"
            style="width: 100%; justify-content: center; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('robot', '', 14)} AI 디버깅 가이드 자동 생성
          </button>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">${icon('close', '', 13)} 취소</button>
            <button type="submit" class="action-btn action-btn-danger">${icon('pr', 'color:white', 14)} ${ghConfig.isEnabled ? 'GitHub PR 병합' : 'PR 병합 실행'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
