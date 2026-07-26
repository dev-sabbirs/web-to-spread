// Manages the floating action button: injection, state, and click handling.

import { ELEMENT_IDS, MESSAGE_TYPES } from '../shared/constants';
import type { ExtractedData } from '../shared/types';
import { showToast } from './toast';
import { extractEmails, extractProfile } from './extractor';

const ICON_SVG = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 15.8a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.12 5h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 12.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 21 20.92z"/>
</svg>`;

// ─── Public API ───────────────────────────────────────────────────────────────

/** Append the FAB to document.body if not already present. Safe to call multiple times. */
export function injectButton(): void {
  if (document.getElementById(ELEMENT_IDS.BUTTON)) return;

  const btn = document.createElement('button');
  btn.id = ELEMENT_IDS.BUTTON;
  btn.title = 'Extract profile & send to Google Sheet';
  btn.setAttribute('aria-label', 'Extract GitHub profile to Google Sheet');
  btn.innerHTML = ICON_SVG;
  btn.addEventListener('click', handleClick);
  document.body.appendChild(btn);
}

// ─── Click Handler ────────────────────────────────────────────────────────────

async function handleClick(): Promise<void> {
  const btn = document.getElementById(ELEMENT_IDS.BUTTON);
  if (!btn || btn.classList.contains('ghe-loading')) return;

  setLoading(btn, true);
  showToast('🔍 Extracting…', 'info', 10_000);

  const emails = extractEmails();
  const profile = extractProfile();

  const primaryEmail = emails[0] || '';
  const secondaryEmails = emails.slice(1).join(', ');

  const payload: ExtractedData = {
    ...profile,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    primaryEmail,
    secondaryEmails,
    emails,
  };

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SEND_TO_SHEET,
      payload,
    });

    if (response?.success) {
      const emailLine = buildEmailLine(emails);
      showToast(`✅ @${profile.username || 'user'} saved\n${emailLine}`, 'success', 6_000);
    } else {
      const errMsg = response?.error ?? 'Failed — open extension Options to check your URL.';
      showToast(`❌ ${errMsg}`, 'error', 7_000);
    }
  } catch {
    showToast('❌ Background unreachable. Reload the page and try again.', 'error', 6_000);
  }

  setLoading(btn, false);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setLoading(btn: HTMLElement, on: boolean): void {
  btn.classList.toggle('ghe-loading', on);
}

function buildEmailLine(emails: string[]): string {
  if (!emails.length) return '⚠️ No public email found on this profile';
  const preview = emails.slice(0, 2).join(', ');
  const extra = emails.length > 2 ? ` +${emails.length - 2} more` : '';
  return `📧 ${preview}${extra}`;
}
