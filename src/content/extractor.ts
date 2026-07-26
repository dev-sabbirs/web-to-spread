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
  // Find contact info button on LinkedIn profile
  const contactInfoBtn = document.querySelector<HTMLElement>(
    '#top-card-text-details-contact-info, a[href*="/overlay/contact-info/"], a[id*="contact-info"]'
  );
  const isModalOpen = !!document.querySelector('.pv-contact-info__contact-type, .artdeco-modal[role="dialog"], .pv-contact-info__header');

  if (contactInfoBtn && !isModalOpen) {
    contactInfoBtn.click();
    // Increase wait time to 1200ms so LinkedIn SPA has ample time to fetch modal payload over network
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  const name = first(
    'h1.text-heading-xlarge',
    'h1.inline',
    'h2._687a5045',
    'a[href*="/overlay/contact-info/"] h2',
    '.pv-top-card--list li',
    '.pv-text-details__left-panel h1'
  );
  const headline = first(
    '.text-body-medium[data-generated-suggestion-target]',
    '.pv-top-card--list-bullet .text-body-medium',
    '.pv-text-details__left-panel .text-body-medium',
    'div[data-test-id="headline"]',
    'p._8c535ff6',
    'a[href*="/overlay/contact-info/"] ~ p'
  );
  const location = first(
    '.pb5 .text-body-small.inline',
    '.pv-top-card--list-bullet + div .text-body-small',
    '.pv-text-details__left-panel .text-body-small',
    'p._3ab7a3ad'
  );
  const company = extractLinkedInCompany();
  const connectionDegree = first('.dist-value', 'span.distance-badge', 'p._a1e2d8b2');

  // Extract full "About" section text
  const about = extractLinkedInAbout();

  // Extract website & contact links (modal is now open)
  const website = extractLinkedInWebsite();

  // Close modal automatically if we opened it
  const closeBtn = document.querySelector<HTMLElement>('.artdeco-modal__dismiss, button[aria-label="Dismiss"], button[aria-label="Close"], button.artdeco-modal__dismiss');
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
    followers: first('span.pvs-header__optional-link span', '.pv-recent-activity-section__follower-count'),
    connectionDegree,
    notes: '',
  };
}

function extractLinkedInCompany(): string {
  const companies: string[] = [];

  // 1. Check experience/education buttons featuring company or school SVG accents/logos
  const items = document.querySelectorAll<HTMLElement>('[role="button"], button, li, .pv-text-details__right-panel li');
  items.forEach((item) => {
    const hasCompanySvg = item.querySelector('svg[id*="company-accent"], svg[id*="school-accent"], img[alt*="company"], img[src*="company-logo"], img[src*="school"]');
    if (hasCompanySvg) {
      const name = item.querySelector('p, span')?.textContent?.trim();
      if (name && !companies.includes(name)) {
        companies.push(name);
      }
    }
  });

  if (companies.length > 0) {
    return companies.join(' · ');
  }

  // 2. Check traditional right-panel top card selectors
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

    // Skip all internal LinkedIn application links
    if (lower.includes('linkedin.com/')) {
      if (
        lower.includes('linkedin.com/feed') ||
        lower.includes('linkedin.com/pulse') ||
        lower.includes('linkedin.com/premium') ||
        lower.includes('linkedin.com/search') ||
        lower.includes('linkedin.com/messaging') ||
        lower.includes('linkedin.com/newsletters') ||
        lower.includes('linkedin.com/in/') ||
        lower.includes('linkedin.com/company/')
      ) {
        return true;
      }
    }

    return false;
  };

  // 1. Prioritize explicit Website container inside contact info modal (ci-websites / Website header)
  const contactModal = document.querySelector('[data-testid="lazy-column"], .pv-contact-info__contact-type, .artdeco-modal');
  if (contactModal) {
    // Look specifically for website section links
    const websiteItems = contactModal.querySelectorAll<HTMLAnchorElement>('.ci-websites a[href], [componentkey*="link"] a[href], a[href*="safety/go/"]');
    websiteItems.forEach((a) => {
      const cleanUrl = parseRealUrl(a.href || a.getAttribute('href') || '');
      if (!isExcludedLink(cleanUrl) && !websites.includes(cleanUrl)) {
        websites.push(cleanUrl);
      }
    });

    // If still no website found from explicit selectors, check modal links
    if (websites.length === 0) {
      contactModal.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
        const cleanUrl = parseRealUrl(a.href || a.getAttribute('href') || '');
        if (!isExcludedLink(cleanUrl) && !websites.includes(cleanUrl)) {
          websites.push(cleanUrl);
        }
      });
    }
  }

  // 2. Check main top-card website buttons/links (e.g. "Visit my website", custom link button)
  const topCardSites = document.querySelectorAll<HTMLAnchorElement>(
    '.pv-top-card--experience-list a[href*="http"], a[id*="top-card-primary-button"], a[aria-label*="Website"], a.pv-top-card--website'
  );
  topCardSites.forEach((a) => {
    const cleanUrl = parseRealUrl(a.href || a.getAttribute('href') || '');
    if (!isExcludedLink(cleanUrl) && !websites.includes(cleanUrl)) {
      websites.push(cleanUrl);
    }
  });

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
