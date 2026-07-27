import { CheckCircleIcon, AlertIcon, SpinnerIcon } from '../icons';
import { APPS_SCRIPT_URL_PREFIX } from '../../shared/constants';
import type { SaveState, TestState } from '../../shared/types';
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";

interface ConfigCardProps {
  url: string;
  githubSheetName: string;
  linkedinSheetName: string;
  geminiApiKey: string;
  geminiModel: string;
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
  onSave: () => void;
  onTest: () => void;
}

export function ConfigCard({
  url, githubSheetName, linkedinSheetName, geminiApiKey, geminiModel, isValidUrl, isConfigured,
  saveState, saveMsg, testState, testMsg,
  onUrlChange, onGithubSheetNameChange, onLinkedinSheetNameChange, onGeminiApiKeyChange, onGeminiModelChange, onSave, onTest,
}: ConfigCardProps) {
  const isTesting = testState === 'testing';
  const isSaving  = saveState === 'saving';
  const canSave   = url.trim().length > 0 && !isSaving;
  const canTest   = isValidUrl && !isTesting;

  return (
    <Card className="p-6 flex flex-col gap-5">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold">Connection Settings</CardTitle>
          <CardDescription className="mt-0.5">
            Link the extension to your Google Sheet via an Apps Script web app.
          </CardDescription>
        </div>
        {isConfigured && (
          <Badge variant="success" className="gap-1.5 px-2.5 py-1 text-xs">
            <CheckCircleIcon size={12} /> Configured
          </Badge>
        )}
      </div>

      {/* Apps Script URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]" htmlFor="script-url">
          Apps Script Web App URL <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Input
            id="script-url"
            type="url"
            className={`font-mono ${
              url && !isValidUrl
                ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                : isValidUrl
                ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 pr-9'
                : ''
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
      <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Appearance Theme</h4>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Switch workspace appearance between Dark, Light, or follow System preference.</p>
        </div>
        <ModeToggle />
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
        <Button
          variant={testState === 'success' ? 'secondary' : testState === 'error' ? 'destructive' : 'outline'}
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
        </Button>

        <Button
          variant="default"
          onClick={onSave}
          disabled={!canSave}
          type="button"
        >
          {isSaving && <><SpinnerIcon size={14} /> Saving…</>}
          {!isSaving && saveState === 'saved' && <><CheckCircleIcon size={14} /> Saved!</>}
          {!isSaving && saveState !== 'saved' && 'Save Settings'}
        </Button>
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
    </Card>
  );
}
