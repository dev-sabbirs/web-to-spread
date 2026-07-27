import React, { useState, useEffect } from 'react';
import { MODE_PRESETS, TONE_OPTIONS, type AiMode } from '../config';
import { streamEmailGeneration } from '../services/geminiStream';
import { getUserProfile, getSettings, type UserProfile } from '../../shared/storage';
import { SparklesIcon, SpinnerIcon } from '../../options/icons';

interface AiSidebarWidgetProps {
  leadContext?: { name?: string; headline?: string; bio?: string };
  onStreamChunk: (chunkText: string) => void;
  onSubjectGenerated?: (subject: string) => void;
}

export function AiSidebarWidget({
  leadContext,
  onStreamChunk,
  onSubjectGenerated,
}: AiSidebarWidgetProps) {
  const [mode, setMode] = useState<AiMode>('client');
  const [prompt, setPrompt] = useState<string>(MODE_PRESETS.client[0].prompt);
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('gemini-3.6-flash');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile().then(setUserProfile);
    getSettings().then((s) => {
      setCustomApiKey(s.geminiApiKey);
      setCustomModel(s.geminiModel);
    });
  }, []);

  const handleModeChange = (newMode: AiMode) => {
    setMode(newMode);
    setPrompt(MODE_PRESETS[newMode][0].prompt);
  };

  const handleGenerateStream = async () => {
    const apiKey = customApiKey || import.meta.env.VITE_AISTUDIO_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not configured in Settings or .env');
      return;
    }
    if (!prompt.trim()) return;

    setIsStreaming(true);
    setError(null);

    try {
      await streamEmailGeneration({
        apiKey,
        model: customModel,
        prompt,
        tone,
        mode,
        leadContext,
        senderProfile: userProfile,
        onChunk: onStreamChunk,
        onSubject: onSubjectGenerated,
      });
    } catch (err: any) {
      setError(err?.message || 'Streaming failed');
    } finally {
      setIsStreaming(false);
    }
  };

  const currentPresets = MODE_PRESETS[mode];

  return (
    <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#262626] border border-[#404040] flex items-center justify-center text-[#f5f5f5]">
            <SparklesIcon size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#f5f5f5]">Gemini AI Assistant</h4>
            <p className="text-[10px] text-[#737373]">Live SSE Stream Generator</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#d4d4d4] border border-[#262626]">
          AI
        </span>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px] font-medium">
          {error}
        </div>
      )}

      {/* Mode Switcher */}
      <div>
        <label className="block text-[10px] font-bold text-[#737373] uppercase mb-1">Outreach Mode</label>
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#141414] border border-[#262626] rounded-xl">
          <button
            onClick={() => handleModeChange('client')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'client'
                ? 'bg-[#262626] text-white shadow-sm border border-[#404040]'
                : 'text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            Client Acquisition
          </button>
          <button
            onClick={() => handleModeChange('job')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'job'
                ? 'bg-[#262626] text-white shadow-sm border border-[#404040]'
                : 'text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            Job Pitch
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-[10px] font-semibold text-[#737373] uppercase mb-1">
          {mode === 'client' ? 'Client Pitch Presets' : 'Job Outreach Presets'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {currentPresets.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p.prompt)}
              className={`px-2 py-1 rounded border text-[11px] font-medium transition-all cursor-pointer ${
                prompt === p.prompt
                  ? 'bg-[#262626] text-white border-[#404040]'
                  : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#f5f5f5]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone Pills */}
      <div>
        <label className="block text-[10px] font-semibold text-[#737373] uppercase mb-1">Tone</label>
        <div className="grid grid-cols-2 gap-1.5">
          {TONE_OPTIONS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTone(t)}
              className={`px-2 py-1 rounded border text-[11px] text-center font-medium transition-all cursor-pointer ${
                tone === t
                  ? 'bg-[#262626] text-white border-[#404040]'
                  : 'bg-[#141414] border-[#262626] text-[#737373] hover:text-[#f5f5f5]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Instruction */}
      <div>
        <label className="block text-[10px] font-semibold text-[#737373] uppercase mb-1">Instruction / Goal</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="What should AI write about?"
          className="w-full bg-[#141414] border border-[#262626] rounded-lg px-2.5 py-1.5 text-xs text-[#f5f5f5] focus:outline-none focus:border-[#404040] resize-none"
        />
      </div>

      {/* Stream Action Button */}
      <button
        onClick={handleGenerateStream}
        disabled={isStreaming || !prompt.trim()}
        className="w-full py-2.5 bg-[#171717] hover:bg-[#262626] border border-[#262626] hover:border-[#404040] text-[#f5f5f5] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
      >
        {isStreaming ? (
          <>
            <SpinnerIcon size={14} /> Streaming Live...
          </>
        ) : (
          <>
            <SparklesIcon size={14} /> Stream Email Draft
          </>
        )}
      </button>
    </div>
  );
}
