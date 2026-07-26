// Background message handlers — all chrome.storage reads and outbound fetches live here.

import {
  STORAGE_KEYS,
  DEFAULT_SHEET_NAME,
  DEFAULT_GITHUB_SHEET_NAME,
  DEFAULT_LINKEDIN_SHEET_NAME,
} from '../shared/constants';
import type { ExtractedData, MessageResponse } from '../shared/types';

// ─── Public Handlers ──────────────────────────────────────────────────────────

/**
 * Read settings from storage, enrich the payload with sheetName,
 * then POST to the user's Apps Script web app.
 */
export async function handleSendToSheet(payload: ExtractedData): Promise<MessageResponse> {
  const stored = await chrome.storage.sync.get([
    STORAGE_KEYS.APPS_SCRIPT_URL,
    STORAGE_KEYS.SHEET_NAME,
    STORAGE_KEYS.GITHUB_SHEET_NAME,
    STORAGE_KEYS.LINKEDIN_SHEET_NAME,
  ]);

  const scriptUrl = stored[STORAGE_KEYS.APPS_SCRIPT_URL] as string | undefined;

  if (!scriptUrl) {
    return {
      success: false,
      error: 'No Apps Script URL set. Right-click the extension icon → Options.',
    };
  }

  let sheetName = (stored[STORAGE_KEYS.SHEET_NAME] as string) || DEFAULT_SHEET_NAME;
  if (payload.platform === 'linkedin') {
    sheetName = (stored[STORAGE_KEYS.LINKEDIN_SHEET_NAME] as string) || DEFAULT_LINKEDIN_SHEET_NAME;
  } else if (payload.platform === 'github') {
    sheetName = (stored[STORAGE_KEYS.GITHUB_SHEET_NAME] as string) || DEFAULT_GITHUB_SHEET_NAME;
  }

  return postToScript(scriptUrl, { ...payload, sheetName });
}

/**
 * Fire a lightweight ping to verify the endpoint is reachable.
 * Does NOT write a row to the sheet.
 */
export async function handleTestConnection(scriptUrl: string): Promise<MessageResponse> {
  return postToScript(scriptUrl, {
    type: 'ping',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Fetch rows from Google Sheet for the requested sheet tab name.
 */
export async function handleFetchLeads(sheetName: string): Promise<MessageResponse> {
  const stored = await chrome.storage.sync.get([STORAGE_KEYS.APPS_SCRIPT_URL]);
  const scriptUrl = stored[STORAGE_KEYS.APPS_SCRIPT_URL] as string | undefined;

  if (!scriptUrl) {
    return { success: false, error: 'No Apps Script URL set.' };
  }

  return postToScript(scriptUrl, {
    action: 'getLeads',
    sheetName,
  });
}

/**
 * Flush all data rows in the target sheet tab (retaining header row).
 */
export async function handleFlushSheet(sheetName: string): Promise<MessageResponse> {
  const stored = await chrome.storage.sync.get([STORAGE_KEYS.APPS_SCRIPT_URL]);
  const scriptUrl = stored[STORAGE_KEYS.APPS_SCRIPT_URL] as string | undefined;

  if (!scriptUrl) {
    return { success: false, error: 'No Apps Script URL set.' };
  }

  return postToScript(scriptUrl, {
    action: 'flushSheet',
    sheetName,
  });
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function postToScript(url: string, body: object): Promise<MessageResponse> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow', // required: Apps Script issues a redirect on POST
    });

    if (!res.ok) {
      return {
        success: false,
        error: `HTTP ${res.status} — ensure "Who has access" is set to Anyone in Apps Script.`,
      };
    }

    let json: { success?: boolean } = {};
    try { json = await res.json(); } catch { /* non-JSON body — treat HTTP 200 as success */ }
    return { success: json.success ?? true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
