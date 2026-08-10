import type { AppState } from '../../store';

export function renderAttackModal(state: AppState): string {
  const { monstersState, attackTargetId, isSkillActiveNextAttack, userState } = state;
  const targetMonster = monstersState.find(m => m.id === attackTargetId);

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card dq-window">
        <h2 class="dq-text" style="color: var(--danger); margin-bottom: 0.35rem;">
          [ ATTACK: PR MERGE STRIKE ]
        </h2>
        <p style="font-size: 0.82rem; color: #ffffff; margin-bottom: 0.75rem;">
          타격 대상: <strong>${targetMonster?.title}</strong>
        </p>
        ${isSkillActiveNextAttack ? `
          <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
            ${userState.activeSkill.name} 스킬 적용! (2배 데미지)
          </div>
        ` : ''}
        <form id="form-attack">
          <div class="form-group">
            <label style="color: #ffffff;">Pull Request URL</label>
            <input type="text" class="form-input" id="attack-pr" value="https://github.com/org/repo/pull/142" required />
          </div>
          <div class="form-group">
            <label style="color: #ffffff;">공격력 선택 (PR 커밋 크기)</label>
            <select class="form-select" id="attack-damage">
              <option value="100">소형 PR (-100 HP)</option>
              <option value="250">중형 PR (-250 HP)</option>
              <option value="500">대형 PR (-500 HP)</option>
            </select>
          </div>
          <div style="margin-bottom: 0.85rem;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-get-ai-hint" style="width: 100%; justify-content: center; font-size: 0.75rem;">
              🤖 AI 힌트 및 디버깅 가이드 자동 생성
            </button>
          </div>
          <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.85rem;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
            <button type="submit" class="action-btn action-btn-danger">공격 실행</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
