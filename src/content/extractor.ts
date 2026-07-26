// Extracts emails and public profile data from the current GitHub page DOM.

import { EMAIL_SKIP_DOMAINS } from '../shared/constants';
import type { ExtractedProfile } from '../shared/types';

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// ─── Public API ───────────────────────────────────────────────────────────────

/** Scrape all visible email addresses from the page. Deduplicates and filters noise. */
export function extractEmails(): string[] {
  const found = new Set<string>();

  // Priority 1: explicit mailto: links (most reliable signal)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]').forEach((a) => {
    const email = decodeURIComponent(a.href.replace('mailto:', '').split('?')[0])
      .trim()
      .toLowerCase();
    if (email) found.add(email);
  });

  // Priority 2: regex over all visible text (catches bio, readme, etc.)
  (document.body.innerText.match(EMAIL_RE) ?? [])
    .forEach((e) => found.add(e.toLowerCase()));

  return Array.from(found).filter(isValidEmail);
}

/** Scrape GitHub profile fields from the sidebar DOM. */
export function extractProfile(): ExtractedProfile {
  return {
    username: window.location.pathname.split('/').filter(Boolean)[0] ?? '',
    name: first('span[itemprop="name"]', 'h1.vcard-fullname', '.p-name'),
    company: extractCompany(),
    bio: extractBio(),
    location: first(
      'li[itemprop="homeLocation"] span.p-label',
      'li[itemprop="homeLocation"] span',
      'span[itemprop="homeLocation"]',
    ),
    website: extractWebsite(),
    twitter: extractTwitter(),
    linkedin: extractLinkedIn(),
    followers: extractCount('a[href$="?tab=followers"] .Counter', 'a[href*="tab=followers"]'),
    following: extractCount('a[href$="?tab=following"] .Counter', 'a[href*="tab=following"]'),
    repositoriesCount: extractCount('a[href$="?tab=repositories"] .Counter', 'span[data-tab-item="repositories"] .Counter'),
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  if (!email.includes('@') || email.includes('..')) return false;
  const domain = email.split('@')[1] ?? '';
  return !EMAIL_SKIP_DOMAINS.some(
    (skip) => domain === skip || domain.endsWith('.' + skip),
  );
}

/** Return the trimmed textContent of the first matching selector, or ''. */
function first(...selectors: string[]): string {
  for (const sel of selectors) {
    const text = document.querySelector<HTMLElement>(sel)?.textContent?.trim();
    if (text) return text;
  }
  return '';
}

function extractCompany(): string {
  const el = document.querySelector<HTMLElement>('li[itemprop="worksFor"]');
  if (!el) return '';
  // Clean SVG icons or child node noise
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('svg').forEach((svg) => svg.remove());
  return clone.textContent?.replace(/^[\s@]+/, '').trim() || '';
}

function extractBio(): string {
  // GitHub uses a data-attribute for the bio on newer profile pages
  const el = document.querySelector<HTMLElement>('[data-bio-text]');
  if (el) {
    return el.getAttribute('data-bio-text')?.trim() || el.textContent?.trim() || '';
  }
  return first('.p-note', '.user-profile-bio');
}

function extractWebsite(): string {
  const el = document.querySelector<HTMLAnchorElement>('li[itemprop="url"] a');
  return el ? (el.href || el.textContent?.trim() || '') : '';
}

function extractTwitter(): string {
  const el = document.querySelector<HTMLAnchorElement>('li[itemprop="social"] a[href*="twitter.com"], li[itemprop="social"] a[href*="x.com"]');
  if (el) return el.href;
  return '';
}

function extractLinkedIn(): string {
  const el = document.querySelector<HTMLAnchorElement>('li[itemprop="social"] a[href*="linkedin.com"]');
  if (el) return el.href;

  let url = '';
  document.querySelectorAll<HTMLAnchorElement>('a[href*="linkedin.com/in/"], a[href*="linkedin.com"]')
    .forEach((a) => { if (!url) url = a.href; });
  return url;
}

function extractCount(...selectors: string[]): string {
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      const title = el.getAttribute('title');
      if (title) return title.replace(/,/g, '').trim();
      const text = el.textContent?.trim();
      if (text) return text.replace(/,/g, '').trim();
    }
  }
  return '';
}
