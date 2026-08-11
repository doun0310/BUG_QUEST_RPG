import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalActions, renderModalHeader } from '../ui';

export function renderCreateMonsterModal(state: AppState): string {
  const { userState } = state;
  const editing = (state as AppState & { editingMonster?: any }).editingMonster;
  const value = (text?: string) => (text || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const selected = (current: string | undefined, option: string) => current === option ? 'selected' : '';

  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card modal-form-card">
        ${renderModalHeader({ icon: 'bug', eyebrow: editing ? 'EDIT ISSUE' : 'NEW ISSUE', title: editing ? '버그 내용 수정' : '신규 이슈 등록' })}

        <form id="form-create-monster" style="display: flex; flex-direction: column; gap: 0;">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('bug', '', 12)} 이슈 제목
            </label>
            <input type="text" class="form-input" id="new-monster-title"
              value="${value(editing?.title)}" placeholder="e.g. AUTH-502 토큰 만료 무한 루프" required />
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('warning', '', 12)} 위험도 (Severity)
            </label>
            <select class="form-select" id="new-monster-severity">
              <option value="Critical" ${selected(editing?.severity, 'Critical')}>Critical — HP 1,000 / 보상 500 XP</option>
              <option value="Major" ${selected(editing?.severity, 'Major')}>Major — HP 500 / 보상 250 XP</option>
              <option value="Minor" ${selected(editing?.severity || 'Minor', 'Minor')}>Minor — HP 200 / 보상 100 XP</option>
            </select>
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('target', '', 12)} 담당 개발자
            </label>
            <input type="text" class="form-input" id="new-monster-assignee" value="${value(editing?.assignee || userState.name)}" required />
          </div>
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('clock', '', 12)} 마감기한 (SLA Deadline)
            </label>
            <input type="text" class="form-input" id="new-monster-duedate" value="${value(editing?.dueDate || '오늘 22:00 마감')}" required />
          </div>
          <div class="form-group">
            <label>${icon('clock', '', 12)} 예상 작업 시간</label>
            <input type="number" min="1" max="200" class="form-input" id="new-monster-hours" value="${editing?.estimatedHours ?? 8}" required />
          </div>
          <div class="form-group">
            <label>${icon('sparkle', '', 12)} 취약 속성</label>
            <select class="form-select" id="new-monster-element">
              ${['Frontend', 'Backend', 'Database', 'Security'].map(option => `<option value="${option}" ${selected(editing?.elementTrait || 'Backend', option)}>${option}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${icon('chat', '', 12)} 버그 대사</label>
            <textarea class="form-input" id="new-monster-dialogue" rows="3" placeholder="버그 상황을 설명하는 대사를 입력하세요">${value(editing?.dialogue)}</textarea>
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: flex; align-items: center; gap: 0.3rem;">
              ${icon('sparkle', '', 12)} 이슈 아트워크
            </label>
            <select class="form-select" id="new-monster-image">
              <option value="/pixel_slime.jpg" ${selected(editing?.monsterImage, '/pixel_slime.jpg')}>픽셀 블루 슬라임</option>
              <option value="/cyber_golem.jpg" ${selected(editing?.monsterImage, '/cyber_golem.jpg')}>사이버 메카 골렘 (보스)</option>
              <option value="/cyber_bug.jpg" ${selected(editing?.monsterImage || '/cyber_bug.jpg', '/cyber_bug.jpg')}>네온 사이버 버그</option>
              <option value="/shadow_boss.jpg" ${selected(editing?.monsterImage, '/shadow_boss.jpg')}>다크 섀도우 보스</option>
            </select>
          </div>

          ${renderModalActions(editing ? '수정 저장' : '이슈 등록', editing ? 'check' : 'plus')}
        </form>
      </div>
    </div>
  `;
}
