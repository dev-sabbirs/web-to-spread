import { CheckCircleIcon, AlertIcon, SpinnerIcon, ExternalLinkIcon } from '../icons';
import { APPS_SCRIPT_URL_PREFIX } from '../../shared/constants';
import type { SaveState, TestState } from '../../shared/types';

interface ConfigCardProps {
  url: string;
  githubSheetName: string;
  linkedinSheetName: string;
  isValidUrl: boolean;
  isConfigured: boolean;
  saveState: SaveState;
  saveMsg: string;
  testState: TestState;
  testMsg: string;
  onUrlChange: (v: string) => void;
  onGithubSheetNameChange: (v: string) => void;
  onLinkedinSheetNameChange: (v: string) => void;
  onSave: () => void;
  onTest: () => void;
}

export function ConfigCard({
  url, githubSheetName, linkedinSheetName, isValidUrl, isConfigured,
  saveState, saveMsg, testState, testMsg,
  onUrlChange, onGithubSheetNameChange, onLinkedinSheetNameChange, onSave, onTest,
}: ConfigCardProps) {
  const isTesting = testState === 'testing';
  const isSaving  = saveState === 'saving';
  const canSave   = url.trim().length > 0 && !isSaving;
  const canTest   = isValidUrl && !isTesting;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-5 shadow-lg shadow-black/20">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#e6edf3]">Connection Settings</h3>
          <p className="text-xs text-[#8b949e] mt-0.5">
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
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]" htmlFor="script-url">
          Apps Script Web App URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            id="script-url"
            type="url"
            className={`w-full px-3 py-2 bg-[#0d1117] border rounded-lg text-xs font-mono text-[#e6edf3] placeholder-[#484f58] outline-none transition-all ${
              url && !isValidUrl
                ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                : isValidUrl
                ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 pr-9'
                : 'border-[#30363d] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
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
        <p className="text-xs text-[#8b949e]">
          Deploy your Apps Script as a Web App, then paste the URL here.{' '}
          <a href="#guide" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
            Setup guide ↓
          </a>
        </p>
      </div>

      {/* Sheet tab names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]" htmlFor="github-sheet-name">
            GitHub Leads Tab
          </label>
          <input
            id="github-sheet-name"
            type="text"
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs font-mono text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="GitHub Leads"
            value={githubSheetName}
            onChange={(e) => onGithubSheetNameChange(e.target.value)}
          />
          <p className="text-xs text-[#8b949e]">Target tab for GitHub profiles.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]" htmlFor="linkedin-sheet-name">
            LinkedIn Leads Tab
          </label>
          <input
            id="linkedin-sheet-name"
            type="text"
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs font-mono text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="LinkedIn Leads"
            value={linkedinSheetName}
            onChange={(e) => onLinkedinSheetNameChange(e.target.value)}
          />
          <p className="text-xs text-[#8b949e]">Target tab for LinkedIn profiles.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
            testState === 'success'
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : testState === 'error'
              ? 'border-red-500/50 text-red-400 bg-red-500/10'
              : 'bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
          onClick={onTest}
          disabled={!canTest}
        >
          {isTesting ? <><SpinnerIcon size={14} /> Testing…</> : 'Test Connection'}
        </button>

        <button
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-md ${
            saveState === 'saved'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
              : saveState === 'error'
              ? 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none'
          }`}
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
