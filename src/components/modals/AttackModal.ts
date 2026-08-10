import type { AppState } from '../../store';
import { icon } from '../../icons';

export function renderAttackModal(state: AppState): string {
  const { monstersState, attackTargetId, isSkillActiveNextAttack, userState } = state;
  const targetMonster = monstersState.find(m => m.id === attackTargetId);

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

        <form id="form-attack" style="display: flex; flex-direction: column; gap: 0;">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('pr', '', 12)} Pull Request URL
            </label>
            <input type="text" class="form-input" id="attack-pr" value="https://github.com/org/repo/pull/142" required />
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
              ${icon('sword', 'color:white', 14)} 공격 실행
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
