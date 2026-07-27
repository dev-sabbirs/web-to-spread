// Shared TypeScript interfaces and union types used across all extension contexts.

export type Platform = 'github' | 'linkedin';

export interface BaseExtractedProfile {
  platform: Platform;
  name: string;
  company: string;
  location: string;
  website: string;
  notes?: string;
}

export interface GitHubProfile extends BaseExtractedProfile {
  platform: 'github';
  username: string;
  bio: string;
  twitter: string;
  linkedin: string;
  followers: string;
  following: string;
  repositoriesCount: string;
}

export interface LinkedInProfile extends BaseExtractedProfile {
  platform: 'linkedin';
  username: string;
  headline: string;
  about: string;
  linkedin: string;
  connectionDegree: string;
  followers: string;
}

export type ExtractedProfile = GitHubProfile | LinkedInProfile;

export type ExtractedData = ExtractedProfile & {
  url: string;
  timestamp: string;
  primaryEmail: string;
  secondaryEmails: string;
  emails: string[];
  targetSheetName?: string;
};

// ─── Chrome Extension Messages ────────────────────────────────────────────────

export interface SendToSheetMessage {
  type: 'SEND_TO_SHEET';
  payload: ExtractedData;
}

export interface TestConnectionMessage {
  type: 'TEST_CONNECTION';
  scriptUrl: string;
}

export interface FetchLeadsMessage {
  type: 'FETCH_LEADS';
  sheetName: string;
}

export interface FlushSheetMessage {
  type: 'FLUSH_SHEET';
  sheetName: string;
}

export interface GenerateAiEmailMessage {
  type: 'GENERATE_AI_EMAIL';
  prompt: string;
  tone?: string;
  leadContext?: {
    name?: string;
    headline?: string;
    bio?: string;
    email?: string;
  };
}

export type ExtensionMessage =
  | SendToSheetMessage
  | TestConnectionMessage
  | FetchLeadsMessage
  | FlushSheetMessage
  | GenerateAiEmailMessage;

export interface MessageResponse {
  success: boolean;
  error?: string;
  data?: {
    headers: string[];
    rows: string[][];
  };
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
export type TestState = 'idle' | 'testing' | 'success' | 'error';
