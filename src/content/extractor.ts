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

/** Scrape profile fields from the current page (GitHub or LinkedIn). */
export async function extractProfile(): Promise<ExtractedProfile> {
  const isLinkedIn = window.location.hostname.includes('linkedin.com');
  if (isLinkedIn) {
    return extractLinkedInProfile();
  }
  return extractGitHubProfile();
}

function extractGitHubProfile(): ExtractedProfile {
  return {
    platform: 'github',
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

export async function extractLinkedInProfile(): Promise<ExtractedProfile> {
  // If contact info popup button is present and modal is not already open, click it automatically
  const contactInfoBtn = document.querySelector<HTMLElement>('#top-card-text-details-contact-info, a[href*="/overlay/contact-info/"]');
  const isModalOpen = !!document.querySelector('.pv-contact-info__contact-type, .artdeco-modal[role="dialog"]');

  if (contactInfoBtn && !isModalOpen) {
    contactInfoBtn.click();
    // Wait briefly for modal to render in DOM
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const name = first('h1.text-heading-xlarge', 'h1.inline', '.pv-top-card--list li', '.pv-text-details__left-panel h1');
  const headline = first(
    '.text-body-medium[data-generated-suggestion-target]',
    '.pv-top-card--list-bullet .text-body-medium',
    '.pv-text-details__left-panel .text-body-medium',
    'div[data-test-id="headline"]'
  );
  const location = first(
    '.pb5 .text-body-small.inline',
    '.pv-top-card--list-bullet + div .text-body-small',
    '.pv-text-details__left-panel .text-body-small'
  );
  const company = first(
    '.pv-text-details__right-panel span',
    'button[aria-label*="Current company"] span',
    'ul.pv-text-details__right-panel li span'
  );
  const connectionDegree = first('.dist-value', 'span.distance-badge');

  // Extract full "About" section text
  const about = extractLinkedInAbout();

  // Extract website & contact links (modal is now open)
  const website = extractLinkedInWebsite();

  // Close modal automatically if we opened it
  const closeBtn = document.querySelector<HTMLElement>('.artdeco-modal__dismiss, button[aria-label="Dismiss"], button[aria-label="Close"]');
  if (closeBtn && contactInfoBtn && !isModalOpen) {
    closeBtn.click();
  }

  // Extract handle/username from LinkedIn URL (e.g. linkedin.com/in/john-doe)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const username = pathParts[pathParts.indexOf('in') + 1] || pathParts[0] || '';

  return {
    platform: 'linkedin',
    username,
    name,
    headline,
    company,
    about,
    location,
    website,
    linkedin: window.location.href,
    followers: first('span.pvs-header__optional-link span', '.pv-recent-activity-section__follower-count'),
    connectionDegree,
    notes: '',
  };
}

function extractLinkedInAbout(): string {
  // Try finding the About section container
  const aboutSection = document.querySelector('#about')?.closest('section');
  if (aboutSection) {
    const textEl = aboutSection.querySelector('.display-flex .inline-show-more-text, .pv-about__summary-text, span[aria-hidden="true"]');
    if (textEl) return textEl.textContent?.trim() || '';
  }
  return first('.pv-about-section', '#about + div span');
}

function extractLinkedInWebsite(): string {
  const websites: string[] = [];

  // 1. Check open Contact Info modal links (e.g. .pv-contact-info__contact-type.ci-websites a)
  const modalWebsites = document.querySelectorAll<HTMLAnchorElement>(
    '.pv-contact-info__contact-type a[href], .pv-contact-info__contact-link, a[href*="http"]:not([href*="linkedin.com"])'
  );
  modalWebsites.forEach((a) => {
    const href = a.href || a.getAttribute('href') || '';
    if (href && !href.includes('linkedin.com') && !href.startsWith('javascript:') && !websites.includes(href)) {
      websites.push(href);
    }
  });

  // 2. Check main top-card website buttons/links (e.g. "Visit my website", custom link button)
  const topCardSites = document.querySelectorAll<HTMLAnchorElement>(
    '.pv-top-card--experience-list a[href*="http"], a[id*="top-card-primary-button"], a[aria-label*="Website"], a.pv-top-card--website'
  );
  topCardSites.forEach((a) => {
    const href = a.href || a.getAttribute('href') || '';
    if (href && !href.includes('linkedin.com') && !href.startsWith('javascript:') && !websites.includes(href)) {
      websites.push(href);
    }
  });

  // 3. Fallback: Any external link inside main profile container
  if (websites.length === 0) {
    const fallbackLink = document.querySelector<HTMLAnchorElement>('.scaffold-layout__main a[href*="http"]:not([href*="linkedin.com"])');
    if (fallbackLink?.href) return fallbackLink.href;
  }

  return websites.join(', ');
}

function extractLinkedInTwitter(): string {
  const el = document.querySelector<HTMLAnchorElement>('a[href*="twitter.com"], a[href*="x.com"]');
  return el ? el.href : '';
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
