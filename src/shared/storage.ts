// Typed, Promise-based wrappers around chrome.storage.sync.

import { STORAGE_KEYS, DEFAULT_SHEET_NAME } from './constants';

export interface StoredSettings {
  appsScriptUrl: string;
  sheetName: string;
}

/** Read all extension settings from sync storage. Returns safe defaults when unset. */
export async function getSettings(): Promise<StoredSettings> {
  const data = await chrome.storage.sync.get([
    STORAGE_KEYS.APPS_SCRIPT_URL,
    STORAGE_KEYS.SHEET_NAME,
  ]);
  return {
    appsScriptUrl: (data[STORAGE_KEYS.APPS_SCRIPT_URL] as string) || '',
    sheetName: (data[STORAGE_KEYS.SHEET_NAME] as string) || DEFAULT_SHEET_NAME,
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
