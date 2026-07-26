# Changelog

All notable changes to the **WebToSpread** Chrome extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.2.4] - 2026-07-26

### 🚀 Added
- **GitHub Actions Release Pipeline**: Automated build and GitHub Release workflow (`.github/workflows/release.yml`) that triggers on pushes to `main`.
- **Extension Dist Zip Package**: Automatically packages the `dist/` build directory into `web-to-spread-vX.Y.Z.zip` and attaches it to GitHub releases.
- **Lead Deduplication & Upsert**: Google Apps Script backend now checks profile URLs & usernames to update existing rows instead of creating duplicates.
- **Enhanced Extraction Visual Feedback**: In-button animated loading state (`Extracting…`), green glow pulse with SVG checkmark (`Saved! ✓`), and error shake (`Failed ✕`).
- **DevTools Payload Logging**: Added structured JSON `console.log()` payload output to verify extracted profile data.

### 🐛 Fixed & Improved
- **Extension Context Invalidated Safeguard**: Guarded `content.ts` with `isExtensionValid()` to disconnect observers on extension reloads and eliminate `net::ERR_FAILED` console spam.
- **LinkedIn Extractor Precision**:
  - Re-ordered extraction sequence to scrape main page top card fields (`Name`, `Headline`, `Location`, `Followers`, `Connection Degree`) **before** opening the contact info modal.
  - Restricted company selector search strictly to top-card containers (`pv-text-details__right-panel`).
  - Isolated external website links inside the contact info modal while ignoring `mailto:` and YouTube links.
  - Stripped SVG verification badges (`verified-medium`) before reading element text content.

---

## [v1.2.3] - 2026-07-26

### 🚀 Added
- Single-item lead preview modal (`👁️`) on the Leads Dashboard.
- Hash-based URL routing (`#dashboard`, `#leads`, `#settings`, `#guide`) with platform sub-tab state persistence (`#leads?platform=linkedin`).
- Multi-website link count badges (`+1`, `+2`) and clickable domain linkification.

---

## [v1.2.0] - 2026-07-26

### 🚀 Initial Release
- Initial release of WebToSpread Chrome Extension supporting GitHub & LinkedIn profile scraping with Google Sheets Apps Script integration.
