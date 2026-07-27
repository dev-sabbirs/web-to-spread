import { CheckCircleIcon, AlertIcon, SpinnerIcon, ExternalLinkIcon } from '../icons';
import { APPS_SCRIPT_URL_PREFIX } from '../../shared/constants';
import type { SaveState, TestState } from '../../shared/types';
import type { AppTheme } from '../../shared/storage';

interface ConfigCardProps {
  url: string;
  githubSheetName: string;
  linkedinSheetName: string;
  geminiApiKey: string;
  geminiModel: string;
  theme?: AppTheme;
  isValidUrl: boolean;
  isConfigured: boolean;
  saveState: SaveState;
  saveMsg: string;
  testState: TestState;
  testMsg: string;
  onUrlChange: (v: string) => void;
  onGithubSheetNameChange: (v: string) => void;
  onLinkedinSheetNameChange: (v: string) => void;
  onGeminiApiKeyChange: (v: string) => void;
  onGeminiModelChange: (v: string) => void;
  onThemeChange: (v: AppTheme) => void;
  onSave: () => void;
  onTest: () => void;
}

export function ConfigCard({
  url, githubSheetName, linkedinSheetName, geminiApiKey, geminiModel, theme = 'dark', isValidUrl, isConfigured,
  saveState, saveMsg, testState, testMsg,
  onUrlChange, onGithubSheetNameChange, onLinkedinSheetNameChange, onGeminiApiKeyChange, onGeminiModelChange, onThemeChange, onSave, onTest,
}: ConfigCardProps) {
  const isTesting = testState === 'testing';
  const isSaving  = saveState === 'saving';
  const canSave   = url.trim().length > 0 && !isSaving;
  const canTest   = isValidUrl && !isTesting;

  return (
    <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-6 flex flex-col gap-5 shadow-2xl">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#f5f5f5]">Connection Settings</h3>
          <p className="text-xs text-[#a3a3a3] mt-0.5">
            Link the extension to your Google Sheet via an Apps Script web app.
          </p>
        </div>
        {isConfigured && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-medium shrink-0">
            <CheckCircleIcon size={12} /> Configured
          </span>
        )}
      </div>

      {/* Apps Script URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="script-url">
          Apps Script Web App URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id="script-url"
            type="url"
            className={`w-full px-3 py-2 bg-[#141414] border rounded-lg text-xs font-mono text-[#f5f5f5] placeholder-[#525252] outline-none transition-all ${
              url && !isValidUrl
                ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                : isValidUrl
                ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 pr-9'
                : 'border-[#262626] focus:border-[#404040]'
            }`}
            placeholder={`${APPS_SCRIPT_URL_PREFIX}AKfycb.../exec`}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          {isValidUrl && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
              <CheckCircleIcon size={14} />
            </span>
          )}
        </div>
        {url && !isValidUrl && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5">
            <AlertIcon size={12} /> Must start with <code className="bg-red-500/10 px-1 py-0.5 rounded">{APPS_SCRIPT_URL_PREFIX}</code>
          </p>
        )}
        <p className="text-xs text-[#737373]">
          Deploy your Apps Script as a Web App, then paste the URL here.{' '}
          <a href="#guide" className="text-[#d4d4d4] hover:text-white font-medium hover:underline">
            Setup guide ↓
          </a>
        </p>
      </div>

      {/* Sheet tab names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="github-sheet-name">
            GitHub Leads Tab
          </label>
          <input
            id="github-sheet-name"
            type="text"
            className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-xs font-mono text-[#f5f5f5] placeholder-[#525252] outline-none focus:border-[#404040] transition-all"
            placeholder="GitHub Leads"
            value={githubSheetName}
            onChange={(e) => onGithubSheetNameChange(e.target.value)}
          />
          <p className="text-xs text-[#737373]">Target tab for GitHub profiles.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="linkedin-sheet-name">
            LinkedIn Leads Tab
          </label>
          <input
            id="linkedin-sheet-name"
            type="text"
            className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-xs font-mono text-[#f5f5f5] placeholder-[#525252] outline-none focus:border-[#404040] transition-all"
            placeholder="LinkedIn Leads"
            value={linkedinSheetName}
            onChange={(e) => onLinkedinSheetNameChange(e.target.value)}
          />
          <p className="text-xs text-[#737373]">Target tab for LinkedIn profiles.</p>
        </div>
      </div>

      {/* Theme Preference Section */}
      <div className="pt-4 border-t border-[#1c1c1c] flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-[#f5f5f5] uppercase tracking-wider">Appearance Theme</h4>
          <p className="text-xs text-[#737373] mt-0.5">Switch workspace appearance theme across Dark, Light, or System preference.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#262626] text-white border-[#404040] shadow-md'
                : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            <span>🌙</span> Dark
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'light'
                ? 'bg-[#262626] text-white border-[#404040] shadow-md'
                : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            <span>☀️</span> Light
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('system')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'system'
                ? 'bg-[#262626] text-white border-[#404040] shadow-md'
                : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            <span>💻</span> System
          </button>
        </div>
      </div>

      {/* Gemini AI Settings Section */}
      <div className="pt-4 border-t border-[#1c1c1c] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#f5f5f5] uppercase tracking-wider">Gemini AI Studio Credentials</h4>
            <p className="text-xs text-[#737373] mt-0.5">Customize your own API Key and Gemini Model tier.</p>
          </div>
          <span className="text-[10px] font-mono bg-[#1c1c1c] text-[#d4d4d4] border border-[#262626] px-2 py-0.5 rounded">
            Default: System Key Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="gemini-api-key">
              Custom Gemini API Key
            </label>
            <input
              id="gemini-api-key"
              type="password"
              className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-xs font-mono text-[#f5f5f5] placeholder-[#525252] outline-none focus:border-[#404040] transition-all"
              placeholder="AIzaSy... (Leave empty to use system default key)"
              value={geminiApiKey}
              onChange={(e) => onGeminiApiKeyChange(e.target.value)}
            />
            <p className="text-[11px] text-[#737373]">
              If left blank, the extension automatically uses your built-in environment AI key.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="gemini-model">
              Gemini Model Tier
            </label>
            <select
              id="gemini-model"
              className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-lg text-xs font-semibold text-[#f5f5f5] outline-none focus:border-[#404040] transition-all cursor-pointer"
              value={geminiModel || "gemini-3.6-flash"}
              onChange={(e) => onGeminiModelChange(e.target.value)}
            >
              <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast & Default)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
            </select>
            <p className="text-[11px] text-[#737373]">Model endpoint for content generation.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            testState === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : testState === 'error'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-[#141414] hover:bg-[#262626] text-[#d4d4d4] hover:text-white border-[#262626]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          onClick={onTest}
          disabled={!canTest}
          type="button"
        >
          {isTesting ? (
            <>
              <SpinnerIcon size={14} /> Testing URL...
            </>
          ) : (
            'Test Connection'
          )}
        </button>

        <button
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#171717] hover:bg-[#262626] border border-[#262626] hover:border-[#404040] text-[#f5f5f5] font-semibold text-xs rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onSave}
          disabled={!canSave}
        >
          {isSaving && <><SpinnerIcon size={14} /> Saving…</>}
          {!isSaving && saveState === 'saved' && <><CheckCircleIcon size={14} /> Saved!</>}
          {!isSaving && saveState !== 'saved' && 'Save Settings'}
        </button>
      </div>

      {/* Feedback messages */}
      {testMsg && (
        <div className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${
          testState === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {testState === 'success' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{testMsg}</span>
        </div>
      )}
      {saveMsg && (
        <div className={`flex items-start gap-2 text-xs p-3 rounded-lg border ${
          saveState === 'saved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {saveState === 'saved' ? <CheckCircleIcon size={14} /> : <AlertIcon size={14} />}
          <span>{saveMsg}</span>
        </div>
      )}

      {/* External links */}
      <div className="flex gap-4 pt-3 border-t border-[#21262d]">
        <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-indigo-400 transition-colors">
          <ExternalLinkIcon size={12} /> Open Google Apps Script
        </a>
        <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-indigo-400 transition-colors">
          <ExternalLinkIcon size={12} /> Open Google Sheets
        </a>
      </div>
    </div>
  );
}
