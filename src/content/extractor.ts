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
  // 1. Scrape top card fields from the MAIN PAGE DOM FIRST before clicking contact info modal
  const name = first(
    'h1.text-heading-xlarge',
    'h1.inline',
    'a[href*="/overlay/contact-info/"] h2',
    '.pv-text-details__left-panel h1',
    'h2._687a5045'
  );

  const headline = first(
    '.text-body-medium[data-generated-suggestion-target]',
    'p._8c535ff6',
    '.pv-text-details__left-panel .text-body-medium',
    '.pv-top-card--list-bullet .text-body-medium',
    'div[data-test-id="headline"]'
  );

  const location = first(
    'p._3ab7a3ad',
    '.pb5 .text-body-small.inline',
    '.pv-top-card--list-bullet + div .text-body-small',
    '.pv-text-details__left-panel .text-body-small'
  );

  const company = extractLinkedInCompany();

  // Degree badge (1st, 2nd, 3rd)
  const connectionDegreeEl = Array.from(document.querySelectorAll('p, span')).find((el) =>
    /^(·\s*)?(1st|2nd|3rd)$/i.test(el.textContent?.trim() || '')
  );
  const connectionDegree = connectionDegreeEl ? connectionDegreeEl.textContent?.replace(/^·\s*/, '').trim() || '' : '';

  // Followers (e.g. "10,279 followers")
  const followersEl = Array.from(document.querySelectorAll('p, span, a')).find((el) =>
    /\d+([,.]\d+)?\s+followers/i.test(el.textContent || '')
  );
  const followers = followersEl ? followersEl.textContent?.trim() || '' : '';

  // Extract full "About" section text
  const about = extractLinkedInAbout();

  // 2. NOW click contact info button to extract emails & external websites from the overlay modal
  const contactInfoBtn = document.querySelector<HTMLElement>(
    '#top-card-text-details-contact-info, a[href*="/overlay/contact-info/"]'
  );
  const isModalOpen = !!document.querySelector('.pv-contact-info__contact-type, .artdeco-modal[role="dialog"], [data-testid="lazy-column"]');

  if (contactInfoBtn && !isModalOpen) {
    contactInfoBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Extract website & contact links from modal
  const website = extractLinkedInWebsite();

  // Close modal automatically if we opened it
  const closeBtn = document.querySelector<HTMLElement>('.artdeco-modal__dismiss, button[aria-label="Dismiss"], button[aria-label="Close"]');
  if (closeBtn && contactInfoBtn && !isModalOpen) {
    closeBtn.click();
  }

  // Extract handle/username from LinkedIn URL (e.g. linkedin.com/in/john-doe)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const inIndex = pathParts.indexOf('in');
  const username = inIndex !== -1 && pathParts[inIndex + 1] ? pathParts[inIndex + 1] : pathParts[0] || '';

  // Clean canonical profile URL (e.g. https://www.linkedin.com/in/username)
  const cleanLinkedinUrl = username
    ? `https://www.linkedin.com/in/${username}`
    : window.location.origin + window.location.pathname.replace(/\/overlay\/.*$/, '');

  return {
    platform: 'linkedin',
    username,
    name,
    headline,
    company,
    about,
    location,
    website,
    linkedin: cleanLinkedinUrl,
    followers,
    connectionDegree,
    notes: '',
  };
}

function extractLinkedInCompany(): string {
  const companies: string[] = [];

  // Scope specifically to the top profile card header section
  const topCardHeader = document.querySelector('._096f0583, .pv-top-card, .scaffold-layout__main');
  if (topCardHeader) {
    const items = topCardHeader.querySelectorAll<HTMLElement>('[role="button"], button, li, .pv-text-details__right-panel li');
    items.forEach((item) => {
      const hasCompanySvg = item.querySelector('svg[id*="company-accent"], svg[id*="school-accent"], img[alt*="company"], img[src*="company-logo"], img[src*="school"]');
      if (hasCompanySvg) {
        const name = item.querySelector('p, span')?.textContent?.trim();
        if (name && !companies.includes(name)) {
          companies.push(name);
        }
      }
    });
  }

  if (companies.length > 0) {
    return companies.join(' · ');
  }

  // Fallback to traditional right panel
  return first(
    '.pv-text-details__right-panel span',
    'button[aria-label*="Current company"] span',
    'ul.pv-text-details__right-panel li span'
  );
}

function extractLinkedInAbout(): string {
  // 1. Try modern LinkedIn expandable text box (e.g. data-testid="expandable-text-box")
  const expandableBox = document.querySelector('[data-testid="expandable-text-box"]');
  if (expandableBox) {
    const clone = expandableBox.cloneNode(true) as HTMLElement;
    // Remove "… more" button before extracting text content
    clone.querySelectorAll('button, [data-testid="expandable-text-button"]').forEach((btn) => btn.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  // 2. Try finding section via #about header
  const aboutSection = document.querySelector('#about')?.closest('section, div');
  if (aboutSection) {
    const textEl = aboutSection.querySelector(
      '[data-testid="expandable-text-box"], .inline-show-more-text, .pv-about__summary-text, span[aria-hidden="true"]'
    );
    if (textEl) {
      const clone = textEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('button').forEach((b) => b.remove());
      const text = clone.textContent?.trim();
      if (text) return text;
    }
  }

  // 3. Fallbacks for legacy/mobile structures
  return first('.pv-about-section', '#about + div span');
}

function extractLinkedInWebsite(): string {
  const websites: string[] = [];

  // Parse LinkedIn safety redirect URLs (e.g. linkedin.com/safety/go/?url=https%3A%2F%2Fdevlopersabbir.github.io)
  const parseRealUrl = (href: string): string => {
    try {
      if (href.includes('/safety/go/') && href.includes('url=')) {
        const query = new URL(href).searchParams.get('url');
        if (query) return decodeURIComponent(query);
      }
    } catch { /* ignore parse error */ }
    return href;
  };

  const isExcludedLink = (url: string): boolean => {
    if (!url || url.startsWith('javascript:')) return true;
    const lower = url.toLowerCase();

    // Skip all internal LinkedIn links & jobs
    if (lower.includes('linkedin.com/')) {
      if (
        lower.includes('linkedin.com/feed') ||
        lower.includes('linkedin.com/pulse') ||
        lower.includes('linkedin.com/premium') ||
        lower.includes('linkedin.com/search') ||
        lower.includes('linkedin.com/messaging') ||
        lower.includes('linkedin.com/newsletters') ||
        lower.includes('linkedin.com/jobs/') ||
        lower.includes('linkedin.com/services/') ||
        lower.includes('linkedin.com/in/') ||
        lower.includes('linkedin.com/company/')
      ) {
        return true;
      }
    }

    return false;
  };

  // Strictly target explicit Website container inside contact info modal (ci-websites / Website header / safety redirect)
  const contactModal = document.querySelector('[data-testid="lazy-column"], .pv-contact-info__contact-type, .artdeco-modal');
  if (contactModal) {
    const websiteItems = contactModal.querySelectorAll<HTMLAnchorElement>(
      '.ci-websites a[href], a[href*="safety/go/"], [componentkey*="website"] a[href], .pv-contact-info__contact-type--website a[href]'
    );
    websiteItems.forEach((a) => {
      const cleanUrl = parseRealUrl(a.href || a.getAttribute('href') || '');
      if (!isExcludedLink(cleanUrl) && !websites.includes(cleanUrl)) {
        websites.push(cleanUrl);
      }
    });
  }

  // Check main top-card website button
  const topCardSite = document.querySelector<HTMLAnchorElement>(
    'a[aria-label*="Website"], a.pv-top-card--website'
  );
  if (topCardSite) {
    const cleanUrl = parseRealUrl(topCardSite.href || topCardSite.getAttribute('href') || '');
    if (!isExcludedLink(cleanUrl) && !websites.includes(cleanUrl)) {
      websites.push(cleanUrl);
    }
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

/** Return the trimmed textContent of the first matching selector, or ''. Strips SVG icons/badges. */
function first(...selectors: string[]): string {
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('svg').forEach((s) => s.remove());
      const text = clone.textContent?.trim();
      if (text) return text;
    }
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
