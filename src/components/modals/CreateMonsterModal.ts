import type { AppState } from '../../store';

export function renderCreateMonsterModal(state: AppState): string {
  const { userState } = state;

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card">
        <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem;">📝 신규 버그 몬스터 등록 (Create Issue)</h2>
        <form id="form-create-monster">
          <div class="form-group">
            <label>몬스터/버그 이슈 제목</label>
            <input type="text" class="form-input" id="new-monster-title" placeholder="e.g. AUTH-502 토큰 만료 무한 루프" required />
          </div>
          <div class="form-group">
            <label>위험도 (Severity)</label>
            <select class="form-select" id="new-monster-severity">
              <option value="Critical">Critical (HP 1000 / 보상 500 XP)</option>
              <option value="Major">Major (HP 500 / 보상 250 XP)</option>
              <option value="Minor" selected>Minor (HP 200 / 보상 100 XP)</option>
            </select>
          </div>
          <div class="form-group">
            <label>담당 개발자</label>
            <input type="text" class="form-input" id="new-monster-assignee" value="${userState.name}" required />
          </div>
          <div class="form-group">
            <label>마감기한 (SLA Deadline)</label>
            <input type="text" class="form-input" id="new-monster-duedate" value="오늘 22:00 마감" required />
          </div>
          <div class="form-group">
            <label>몬스터 외형 아트워크</label>
            <select class="form-select" id="new-monster-image">
              <option value="/pixel_slime.jpg">픽셀 블루 슬라임</option>
              <option value="/cyber_golem.jpg">사이버 메카 골렘 (보스)</option>
              <option value="/cyber_bug.jpg" selected>네온 사이버 버그</option>
              <option value="/shadow_boss.jpg">다크 섀도우 보스</option>
            </select>
          </div>
          <div style="display: flex; gap: 0.35rem; justify-content: flex-end; margin-top: 0.85rem;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">취소</button>
            <button type="submit" class="action-btn">몬스터 전장 출현</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
