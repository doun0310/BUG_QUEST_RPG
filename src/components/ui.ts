import { icon, type IconName } from '../icons';

/** Shared HTML primitives for the string-rendered UI. */
export function renderModalHeader(options: {
  icon: IconName;
  eyebrow?: string;
  title: string;
  tone?: 'default' | 'danger';
  closeId?: string;
}): string {
  const tone = options.tone === 'danger' ? ' modal-heading-danger' : '';
  return `
    <div class="modal-heading${tone}">
      <div class="modal-heading-icon">${icon(options.icon, '', 18)}</div>
      <div class="modal-heading-copy">
        <h2>${options.title}</h2>
      </div>
      <button type="button" class="modal-close" id="${options.closeId ?? 'btn-close-modal'}" aria-label="닫기">${icon('close', '', 16)}</button>
    </div>`;
}

export function renderModalActions(primaryLabel: string, primaryIcon: IconName, primaryTone = ''): string {
  return `
    <div class="modal-actions">
      <button type="button" class="action-btn action-btn-secondary" id="btn-close-modal">${icon('close', '', 13)} 취소</button>
      <button type="submit" class="action-btn ${primaryTone}">${icon(primaryIcon, 'color:white', 14)} ${primaryLabel}</button>
    </div>`;
}
