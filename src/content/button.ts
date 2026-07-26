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

  let iconMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>`;
  try {
    const iconUrl = chrome.runtime.getURL('icon/128.png');
    iconMarkup = `<img src="${iconUrl}" alt="WebToSpread Logo" onerror="this.outerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'currentColor\' width=\'22\' height=\'22\'><path d=\'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z\'/></svg>'" />`;
  } catch { /* use SVG fallback */ }

  btn.innerHTML = `
    <div class="w2s-icon-wrapper">${iconMarkup}</div>
    <span class="w2s-label">Save Lead</span>
  `;

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
