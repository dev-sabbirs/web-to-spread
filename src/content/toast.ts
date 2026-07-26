import { ELEMENT_IDS } from '../shared/constants';

export type ToastType = 'success' | 'error' | 'info';

/** Display a temporary toast notification on the page. Auto-removes after durationMs. */
export function showToast(msg: string, type: ToastType = 'info', durationMs = 5000): void {
  const existing = document.getElementById(ELEMENT_IDS.TOAST);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = ELEMENT_IDS.TOAST;
  if (type !== 'info') toast.classList.add(`ghe-${type}`);
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) toast.remove();
  }, durationMs);
}
