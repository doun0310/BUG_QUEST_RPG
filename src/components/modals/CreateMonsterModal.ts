import type { AppState } from '../../store';
import { icon } from '../../icons';

export function renderCreateMonsterModal(state: AppState): string {
  const { userState } = state;

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card">

        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--primary-bg); border: 1px solid var(--primary-border); display: flex; align-items: center; justify-content: center;">
            ${icon('bug', 'color:var(--primary-light)', 18)}
          </div>
          <div>
            <p style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.1rem;">Create Issue</p>
            <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main);">신규 버그 몬스터 등록</h2>
          </div>
        </div>

        <form id="form-create-monster" style="display: flex; flex-direction: column; gap: 0;">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('bug', '', 12)} 몬스터/버그 이슈 제목
            </label>
            <input type="text" class="form-input" id="new-monster-title"
              placeholder="e.g. AUTH-502 토큰 만료 무한 루프" required />
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('warning', '', 12)} 위험도 (Severity)
            </label>
            <select class="form-select" id="new-monster-severity">
              <option value="Critical">Critical — HP 1,000 / 보상 500 XP</option>
              <option value="Major">Major — HP 500 / 보상 250 XP</option>
              <option value="Minor" selected>Minor — HP 200 / 보상 100 XP</option>
            </select>
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('target', '', 12)} 담당 개발자
            </label>
            <input type="text" class="form-input" id="new-monster-assignee" value="${userState.name}" required />
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('clock', '', 12)} 마감기한 (SLA Deadline)
            </label>
            <input type="text" class="form-input" id="new-monster-duedate" value="오늘 22:00 마감" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('sparkle', '', 12)} 몬스터 외형 아트워크
            </label>
            <select class="form-select" id="new-monster-image">
              <option value="/pixel_slime.jpg">픽셀 블루 슬라임</option>
              <option value="/cyber_golem.jpg">사이버 메카 골렘 (보스)</option>
              <option value="/cyber_bug.jpg" selected>네온 사이버 버그</option>
              <option value="/shadow_boss.jpg">다크 섀도우 보스</option>
            </select>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 0.6rem; justify-content: flex-end;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal" style="display: flex; align-items: center; gap: 0.35rem;">
              ${icon('close', '', 13)} 취소
            </button>
            <button type="submit" class="action-btn" style="min-width: 130px; justify-content: center; display: flex; align-items: center; gap: 0.4rem;">
              ${icon('lightning', 'color:white', 14)} 몬스터 전장 출현
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
