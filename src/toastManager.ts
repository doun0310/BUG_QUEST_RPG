import { icon } from './icons';
import { escapeHtml } from './services/inputSafety';

// Toast Notification Service
export function showToast(message: string, type: 'info' | 'success' | 'danger' | 'warning' = 'info', duration: number = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  const iconMap = {
    info: 'feedback',
    success: 'check',
    danger: 'warning',
    warning: 'lightning'
  } as const;

  toast.innerHTML = `
    <span>${icon(iconMap[type], '', 16)}</span>
    <span style="flex: 1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
