// Custom hook — owns all options page state and chrome.storage interactions.

import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, type StoredSettings } from '../../shared/storage';
import { APPS_SCRIPT_URL_PREFIX, MESSAGE_TYPES } from '../../shared/constants';
import type { SaveState, TestState, MessageResponse } from '../../shared/types';

export interface UseSettingsReturn {
  settings: StoredSettings;
  updateUrl: (v: string) => void;
  updateGithubSheetName: (v: string) => void;
  updateLinkedinSheetName: (v: string) => void;
  updateGeminiApiKey: (v: string) => void;
  updateGeminiModel: (v: string) => void;
  updateTheme: (v: 'dark' | 'light' | 'system') => void;
  save: () => Promise<void>;
  saveState: SaveState;
  saveMsg: string;
  testConnection: () => Promise<void>;
  testState: TestState;
  testMsg: string;
  isValidUrl: boolean;
  isConfigured: boolean;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<StoredSettings>({
    appsScriptUrl: '',
    sheetName: 'Leads',
    githubSheetName: 'GitHub Leads',
    linkedinSheetName: 'LinkedIn Leads',
    geminiApiKey: '',
    geminiModel: 'gemini-3.6-flash',
    theme: 'dark',
  });
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [testState, setTestState] = useState<TestState>('idle');
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => { getSettings().then(setSettings); }, []);

  const updateUrl = useCallback((appsScriptUrl: string) => {
    setSettings((p: StoredSettings) => ({ ...p, appsScriptUrl }));
  }, []);

  const updateGithubSheetName = useCallback((githubSheetName: string) => {
    setSettings((p: StoredSettings) => ({ ...p, githubSheetName }));
  }, []);

  const updateLinkedinSheetName = useCallback((linkedinSheetName: string) => {
    setSettings((p: StoredSettings) => ({ ...p, linkedinSheetName }));
  }, []);

  const updateGeminiApiKey = useCallback((geminiApiKey: string) => {
    setSettings((p: StoredSettings) => ({ ...p, geminiApiKey }));
  }, []);

  const updateGeminiModel = useCallback((geminiModel: string) => {
    setSettings((p: StoredSettings) => ({ ...p, geminiModel }));
  }, []);

  const updateTheme = useCallback((theme: 'dark' | 'light' | 'system') => {
    setSettings((p: StoredSettings) => ({ ...p, theme }));
  }, []);

  const save = useCallback(async () => {
    setSaveState('saving');
    setSaveMsg('');
    try {
      await saveSettings(settings);
      setSaveState('saved');
      setSaveMsg('Settings saved successfully!');
      setTimeout(() => { setSaveState('idle'); setSaveMsg(''); }, 3000);
    } catch (err) {
      setSaveState('error');
      setSaveMsg(err instanceof Error ? err.message : 'Save failed.');
    }
  }, [settings]);

  const testConnection = useCallback(async () => {
    if (!settings.appsScriptUrl) return;
    setTestState('testing');
    setTestMsg('');
    try {
      const res: MessageResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TEST_CONNECTION,
        scriptUrl: settings.appsScriptUrl,
      });
      if (res.success) {
        setTestState('success');
        setTestMsg('Connected! Your Apps Script endpoint is reachable.');
      } else {
        setTestState('error');
        setTestMsg(res.error ?? 'Connection failed. Check the URL and "Who has access" setting.');
      }
    } catch {
      setTestState('error');
      setTestMsg('Could not reach background worker. Try reloading this page.');
    }
    setTimeout(() => { setTestState('idle'); setTestMsg(''); }, 6000);
  }, [settings.appsScriptUrl]);

  return {
    settings,
    updateUrl,
    updateGithubSheetName,
    updateLinkedinSheetName,
    updateGeminiApiKey,
    updateGeminiModel,
    updateTheme,
    save,
    saveState,
    saveMsg,
    testConnection,
    testState,
    testMsg,
    isValidUrl: settings.appsScriptUrl.startsWith(APPS_SCRIPT_URL_PREFIX),
    isConfigured: Boolean(settings.appsScriptUrl),
  };
}
