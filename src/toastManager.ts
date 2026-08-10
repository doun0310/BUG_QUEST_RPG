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
    info: 'ℹ️',
    success: '✅',
    danger: '⚠️',
    warning: '⚡'
  };

  toast.innerHTML = `
    <span>${iconMap[type]}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}
