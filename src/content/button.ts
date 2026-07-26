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

  const sparkIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/></svg>`;

  btn.innerHTML = `
    <div class="w2s-icon-wrapper">${sparkIcon}</div>
    <span class="w2s-label">Save Lead</span>
  `;

  btn.addEventListener('click', handleClick);
  document.body.appendChild(btn);
}

// ─── Click Handler ────────────────────────────────────────────────────────────

async function handleClick(): Promise<void> {
  const btn = document.getElementById(ELEMENT_IDS.BUTTON);
  if (!btn || btn.classList.contains('ghe-loading')) return;

  setLoading(btn, true, 'Extracting…');

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

  // Structured extraction console log for verification
  console.log('--- Extracted Lead Structured JSON ---');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SEND_TO_SHEET,
      payload,
    });

    if (response?.success) {
      setLoading(btn, false, 'Saved! ✓', 'success');
    } else {
      setLoading(btn, false, 'Failed ✕', 'error');
    }
  } catch {
    setLoading(btn, false, 'Error ✕', 'error');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"/></svg>`;
const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const CROSS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

function setLoading(btn: HTMLElement, loading: boolean, labelText?: string, state?: 'success' | 'error'): void {
  btn.classList.toggle('ghe-loading', loading);
  btn.classList.toggle('w2s-success', state === 'success');
  btn.classList.toggle('w2s-error', state === 'error');

  const labelEl = btn.querySelector('.w2s-label');
  const iconWrap = btn.querySelector('.w2s-icon-wrapper');

  if (labelEl && labelText) {
    labelEl.textContent = labelText;
  }

  if (iconWrap) {
    if (state === 'success') {
      iconWrap.innerHTML = CHECK_SVG;
    } else if (state === 'error') {
      iconWrap.innerHTML = CROSS_SVG;
    } else {
      iconWrap.innerHTML = SPARK_SVG;
    }
  }

  if (state === 'success' || state === 'error') {
    setTimeout(() => {
      btn.classList.remove('w2s-success', 'w2s-error');
      if (labelEl) labelEl.textContent = 'Save Lead';
      if (iconWrap) iconWrap.innerHTML = SPARK_SVG;
    }, 3500);
  }
}

function buildEmailLine(emails: string[]): string {
  if (!emails.length) return '⚠️ No public email found on this profile';
  const preview = emails.slice(0, 2).join(', ');
  const extra = emails.length > 2 ? ` +${emails.length - 2} more` : '';
  return `📧 ${preview}${extra}`;
}
