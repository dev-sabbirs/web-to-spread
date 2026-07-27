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

/** Read all extension settings from sync storage. Returns safe defaults when unset. */
export async function getSettings(): Promise<StoredSettings> {
  const data = await chrome.storage.sync.get([
    STORAGE_KEYS.APPS_SCRIPT_URL,
    STORAGE_KEYS.SHEET_NAME,
    STORAGE_KEYS.GITHUB_SHEET_NAME,
    STORAGE_KEYS.LINKEDIN_SHEET_NAME,
  ]);
  const defaultUrl = import.meta.env.VITE_APPS_SCRIPT_URL || "";
  return {
    appsScriptUrl: (data[STORAGE_KEYS.APPS_SCRIPT_URL] as string) || defaultUrl,
    sheetName: (data[STORAGE_KEYS.SHEET_NAME] as string) || DEFAULT_SHEET_NAME,
    githubSheetName:
      (data[STORAGE_KEYS.GITHUB_SHEET_NAME] as string) ||
      DEFAULT_GITHUB_SHEET_NAME,
    linkedinSheetName:
      (data[STORAGE_KEYS.LINKEDIN_SHEET_NAME] as string) ||
      DEFAULT_LINKEDIN_SHEET_NAME,
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
