// Shared TypeScript interfaces and union types used across all extension contexts.

export interface ExtractedProfile {
  username: string;
  name: string;
  bio: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ExtractedData extends ExtractedProfile {
  url: string;
  timestamp: string;
  emails: string[];
}

// ─── Chrome Extension Messages ────────────────────────────────────────────────

export interface SendToSheetMessage {
  type: 'SEND_TO_SHEET';
  payload: ExtractedData;
}

export interface TestConnectionMessage {
  type: 'TEST_CONNECTION';
  scriptUrl: string;
}

export type ExtensionMessage = SendToSheetMessage | TestConnectionMessage;

export interface MessageResponse {
  success: boolean;
  error?: string;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
export type TestState = 'idle' | 'testing' | 'success' | 'error';
