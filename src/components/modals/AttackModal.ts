import type { AppState } from '../../store';
import { icon } from '../../icons';
import { getGitHubConfig, type GitHubPullRequest } from '../../services/githubService';

export function renderAttackModal(state: AppState & { openPRs?: GitHubPullRequest[] }): string {
  const { monstersState, attackTargetId, isSkillActiveNextAttack, userState, openPRs = [] } = state;
  const targetMonster = monstersState.find(m => m.id === attackTargetId);
  const ghConfig = getGitHubConfig();

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card" style="background: rgba(6, 10, 22, 0.96); backdrop-filter: blur(24px); border: 1px solid rgba(248, 113, 113, 0.2); box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.1), 0 32px 64px rgba(0,0,0,0.8);">

        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(248, 113, 113, 0.12); border: 1px solid rgba(248, 113, 113, 0.3); display: flex; align-items: center; justify-content: center;">
            ${icon('sword', 'color:var(--danger)', 18)}
          </div>
          <div>
            <p style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--danger); margin-bottom: 0.15rem;">PR MERGE STRIKE</p>
            <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main);">${targetMonster?.title ?? '버그 몬스터'}</h2>
          </div>
        </div>

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
              ${icon('target', '', 12)} 공격력 선택 (PR 커밋 크기)
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
          <div style="display: flex; gap: 0.6rem; justify-content: flex-end;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal" style="display: flex; align-items: center; gap: 0.35rem;">
              ${icon('close', '', 13)} 취소
            </button>
            <button type="submit" class="action-btn action-btn-danger" style="min-width: 110px; justify-content: center; display: flex; align-items: center; gap: 0.4rem;">
              ${icon('sword', 'color:white', 14)} ${ghConfig.isEnabled ? '실제 GitHub PR 머지 & 공격' : '공격 실행'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
