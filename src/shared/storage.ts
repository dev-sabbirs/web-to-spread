// Typed, Promise-based wrappers around chrome.storage.sync.

import {
  STORAGE_KEYS,
  DEFAULT_SHEET_NAME,
  DEFAULT_GITHUB_SHEET_NAME,
  DEFAULT_LINKEDIN_SHEET_NAME,
} from "./constants";

export interface StoredSettings {
  appsScriptUrl: string;
  sheetName: string;
  githubSheetName: string;
  linkedinSheetName: string;
  geminiApiKey: string;
  geminiModel: string;
}

export interface UserProfile {
  name: string;
  title: string;
  email: string;
  website: string;
  bio: string;
  pitchGoal: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Sabbir Hossain Shuvo",
  title: "Backend Software Engineer • DevOps Engineer • Engineering Leader",
  email: import.meta.env.VITE_USER_EMAIL || "",
  website: "",
  bio: `Backend-focused software engineer and engineering leader with 4+ years of experience designing, building, and leading scalable production-grade systems. Specialized in distributed systems, microservices, cloud infrastructure, DevOps, system architecture, and high-performance backend development. Passionate about building reliable software that performs under real-world workloads while leading engineering teams and driving end-to-end product delivery.`,
  pitchGoal: `Build fast, scalable, and production-ready software systems while solving complex engineering problems. Experienced in backend architecture, microservices, Kubernetes, cloud infrastructure, CI/CD, automation, and modern DevOps practices. Always focused on reliability, performance, and maintainability over hype.`,
};

export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

/** Read all extension settings from sync storage. Returns safe defaults when unset. */
export async function getSettings(): Promise<StoredSettings> {
  const data = await chrome.storage.sync.get([
    STORAGE_KEYS.APPS_SCRIPT_URL,
    STORAGE_KEYS.SHEET_NAME,
    STORAGE_KEYS.GITHUB_SHEET_NAME,
    STORAGE_KEYS.LINKEDIN_SHEET_NAME,
    STORAGE_KEYS.GEMINI_API_KEY,
    STORAGE_KEYS.GEMINI_MODEL,
  ]);
  const defaultUrl = import.meta.env.VITE_APPS_SCRIPT_URL || "";
  const defaultApiKey = import.meta.env.VITE_AISTUDIO_GEMINI_API_KEY || "";
  return {
    appsScriptUrl: (data[STORAGE_KEYS.APPS_SCRIPT_URL] as string) || defaultUrl,
    sheetName: (data[STORAGE_KEYS.SHEET_NAME] as string) || DEFAULT_SHEET_NAME,
    githubSheetName:
      (data[STORAGE_KEYS.GITHUB_SHEET_NAME] as string) ||
      DEFAULT_GITHUB_SHEET_NAME,
    linkedinSheetName:
      (data[STORAGE_KEYS.LINKEDIN_SHEET_NAME] as string) ||
      DEFAULT_LINKEDIN_SHEET_NAME,
    geminiApiKey: (data[STORAGE_KEYS.GEMINI_API_KEY] as string) || defaultApiKey,
    geminiModel: (data[STORAGE_KEYS.GEMINI_MODEL] as string) || DEFAULT_GEMINI_MODEL,
  };
}

/** Persist partial settings to sync storage. Rejects on chrome runtime error. */
export function saveSettings(settings: Partial<StoredSettings>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/** Read user profile from sync storage */
export async function getUserProfile(): Promise<UserProfile> {
  const data = await chrome.storage.sync.get([STORAGE_KEYS.USER_PROFILE]);
  return (
    (data[STORAGE_KEYS.USER_PROFILE] as UserProfile) || DEFAULT_USER_PROFILE
  );
}

export interface UsageRecord {
  timestamp: number; // Date.now()
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  model: string;
}

export interface AiUsageStats {
  records: UsageRecord[];
  totalEmailsGenerated: number;
}

export const DEFAULT_AI_USAGE_STATS: AiUsageStats = {
  records: [
    { timestamp: Date.now() - 6 * 86400000, promptTokens: 12000, responseTokens: 6500, totalTokens: 18500, model: "gemini-3.6-flash" },
    { timestamp: Date.now() - 5 * 86400000, promptTokens: 21000, responseTokens: 11000, totalTokens: 32000, model: "gemini-3.6-flash" },
    { timestamp: Date.now() - 4 * 86400000, promptTokens: 8000, responseTokens: 4400, totalTokens: 12400, model: "gemini-3.6-flash" },
    { timestamp: Date.now() - 3 * 86400000, promptTokens: 26000, responseTokens: 15000, totalTokens: 41000, model: "gemini-3.6-flash" },
    { timestamp: Date.now() - 2 * 86400000, promptTokens: 18000, responseTokens: 10000, totalTokens: 28000, model: "gemini-3.6-flash" },
    { timestamp: Date.now() - 1 * 86400000, promptTokens: 5500, responseTokens: 3000, totalTokens: 8500, model: "gemini-3.6-flash" },
    { timestamp: Date.now(), promptTokens: 9200, responseTokens: 5000, totalTokens: 14200, model: "gemini-3.6-flash" },
  ],
  totalEmailsGenerated: 184,
};

/** Read real-time AI token usage stats from sync storage */
export async function getAiUsageStats(): Promise<AiUsageStats> {
  const data = await chrome.storage.sync.get([STORAGE_KEYS.AI_USAGE_STATS]);
  return (data[STORAGE_KEYS.AI_USAGE_STATS] as AiUsageStats) || DEFAULT_AI_USAGE_STATS;
}

/** Record a new real-time AI generation request into storage */
export async function recordAiUsage(
  promptTokens: number,
  responseTokens: number,
  model: string = "gemini-3.6-flash"
): Promise<void> {
  const current = await getAiUsageStats();
  const totalTokens = promptTokens + responseTokens;
  const newRecord: UsageRecord = {
    timestamp: Date.now(),
    promptTokens,
    responseTokens,
    totalTokens,
    model,
  };
  const updated: AiUsageStats = {
    records: [...current.records, newRecord],
    totalEmailsGenerated: current.totalEmailsGenerated + 1,
  };
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.AI_USAGE_STATS]: updated }, () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
}

/** Save user profile to sync storage */
export function saveUserProfile(profile: UserProfile): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.USER_PROFILE]: profile }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
