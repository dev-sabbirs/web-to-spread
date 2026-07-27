// App-wide constants — single source of truth for IDs, keys, and config values.

export const MESSAGE_TYPES = {
  SEND_TO_SHEET: 'SEND_TO_SHEET',
  TEST_CONNECTION: 'TEST_CONNECTION',
  FETCH_LEADS: 'FETCH_LEADS',
  FLUSH_SHEET: 'FLUSH_SHEET',
  GENERATE_AI_EMAIL: 'GENERATE_AI_EMAIL',
} as const;

export const STORAGE_KEYS = {
  APPS_SCRIPT_URL: 'appsScriptUrl',
  SHEET_NAME: 'sheetName', // legacy / default sheet
  GITHUB_SHEET_NAME: 'githubSheetName',
  LINKEDIN_SHEET_NAME: 'linkedinSheetName',
  USER_PROFILE: 'userProfile',
  GEMINI_API_KEY: 'geminiApiKey',
  GEMINI_MODEL: 'geminiModel',
  AI_USAGE_STATS: 'aiUsageStats',
} as const;

export const ELEMENT_IDS = {
  BUTTON: 'ghe-fab',
  TOAST: 'ghe-toast',
  STYLES: 'ghe-styles',
} as const;

/** Email domains to strip from results — noise/bots/system addresses. */
export const EMAIL_SKIP_DOMAINS = [
  'noreply.github.com',
  'users.noreply.github.com',
  'example.com',
  'sentry.io',
  'wixpress.com',
  'prettier.io',
] as const;

export const APPS_SCRIPT_URL_PREFIX = 'https://script.google.com/macros/s/';
export const DEFAULT_SHEET_NAME = 'Leads';
export const DEFAULT_GITHUB_SHEET_NAME = 'GitHub Leads';
export const DEFAULT_LINKEDIN_SHEET_NAME = 'LinkedIn Leads';
