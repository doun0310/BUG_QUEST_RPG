import { icon, type IconName } from './icons';
import { escapeHtml } from './services/inputSafety';

type ToastType = 'info' | 'success' | 'danger' | 'warning';

const EMOJI_PATTERN = /[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

function notificationIcon(message: string, type: ToastType): IconName {
  const normalized = message.toLowerCase();

  if (/ai|분석|예측/.test(normalized)) return 'robot';
  if (/github|\bpr\b|머지|브랜치/.test(normalized)) return 'pr';
  if (/slack|teams|webhook|연동|api/.test(normalized)) return 'link';
  if (/보스|전장|토벌|공격|광폭화/.test(normalized)) return type === 'warning' ? 'fire' : 'sword';
  if (/보상|xp|출석|인벤토리|보상함/.test(normalized)) return 'crystal';
  if (/팀|동료|담당자|워크로드/.test(normalized)) return 'users';
  if (/계정|로그인|로그아웃|세션|프로필/.test(normalized)) return 'mark';
  if (/사운드|음소거|볼륨/.test(normalized)) return normalized.includes('음소거') ? 'mute' : 'volume';
  if (/설정|저장|완료/.test(normalized)) return type === 'success' ? 'check' : 'settings';

  return type === 'success' ? 'check' : type === 'danger' ? 'warning' : type === 'warning' ? 'lightning' : 'feedback';
}

function notificationColor(type: ToastType): string {
  if (type === 'success') return 'var(--success)';
  if (type === 'danger') return 'var(--danger)';
  if (type === 'warning') return 'var(--warning)';
  return 'var(--primary-light)';
}

// Toast Notification Service
export function showToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.setAttribute('role', type === 'danger' || type === 'warning' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'danger' || type === 'warning' ? 'assertive' : 'polite');

  // Call sites can keep their existing messages; decorative emoji is replaced by
  // the project's semantic SVG notification icon at this single rendering point.
  const cleanMessage = message.replace(EMOJI_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
  const toastIcon = notificationIcon(cleanMessage, type);

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icon(toastIcon, `color:${notificationColor(type)}`, 16)}</span>
    <span style="flex: 1;">${escapeHtml(cleanMessage)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
