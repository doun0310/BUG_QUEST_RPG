import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalActions, renderModalHeader } from '../ui';

export function renderCreateMonsterModal(state: AppState): string {
  const { userState } = state;

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card modal-form-card">
        ${renderModalHeader({ icon: 'bug', eyebrow: 'NEW ISSUE', title: '신규 이슈 등록' })}

        <form id="form-create-monster" style="display: flex; flex-direction: column; gap: 0;">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('bug', '', 12)} 이슈 제목
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
              ${icon('sparkle', '', 12)} 이슈 아트워크
            </label>
            <select class="form-select" id="new-monster-image">
              <option value="/pixel_slime.jpg">픽셀 블루 슬라임</option>
              <option value="/cyber_golem.jpg">사이버 메카 골렘 (보스)</option>
              <option value="/cyber_bug.jpg" selected>네온 사이버 버그</option>
              <option value="/shadow_boss.jpg">다크 섀도우 보스</option>
            </select>
          </div>

          ${renderModalActions('이슈 등록', 'plus')}
        </form>
      </div>
    </div>
  `;
}
