// Manages the floating action button: injection, state, and click handling.

import { ELEMENT_IDS, MESSAGE_TYPES } from '../shared/constants';
import type { ExtractedData } from '../shared/types';
import { showToast } from './toast';
import { extractEmails, extractProfile } from './extractor';

// ─── Public API ───────────────────────────────────────────────────────────────

/** Append the FAB to document.body if not already present. Safe to call multiple times. */
export function injectButton(): void {
  if (document.getElementById(ELEMENT_IDS.BUTTON)) return;

  const btn = document.createElement('button');
  btn.id = ELEMENT_IDS.BUTTON;
  btn.title = 'Extract lead & send to Google Sheet';
  btn.setAttribute('aria-label', 'Extract lead to Google Sheet');

  const iconUrl = chrome.runtime.getURL('icon/128.png');
  btn.innerHTML = `<img src="${iconUrl}" alt="WebToSpread Logo" />`;

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
  const profile = await extractProfile();

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
      const platformLabel = profile.platform === 'linkedin' ? 'LinkedIn' : 'GitHub';
      showToast(`✅ ${platformLabel} lead @${profile.username || profile.name || 'user'} saved\n${emailLine}`, 'success', 6_000);
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
