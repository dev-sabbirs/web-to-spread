import React, { useState } from 'react';
import { PRESET_PROMPTS, TONE_OPTIONS } from '../config';
import { streamEmailGeneration } from '../services/geminiStream';
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
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0].prompt);
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStream = async () => {
    const apiKey = import.meta.env.VITE_AISTUDIO_GEMINI_API_KEY;
    if (!apiKey) {
      setError('VITE_AISTUDIO_GEMINI_API_KEY is not set in .env');
      return;
    }
    if (!prompt.trim()) return;

    setIsStreaming(true);
    setError(null);

    try {
      await streamEmailGeneration({
        apiKey,
        prompt,
        tone,
        leadContext,
        onChunk: onStreamChunk,
        onSubject: onSubjectGenerated,
      });
    } catch (err: any) {
      setError(err?.message || 'Streaming failed');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col gap-4 text-xs">
      <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
        <h3 className="font-bold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5 text-xs">
          <SparklesIcon size={14} className="text-purple-400" />
          AI Agent Assistant
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
          Gemini
        </span>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px]">
          {error}
        </div>
      )}

      {/* Quick Presets */}
      <div>
        <label className="block text-[10px] font-semibold text-[#8b949e] uppercase mb-1">Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPrompt(p.prompt)}
              className={`px-2 py-1 rounded border text-[11px] font-medium transition-all ${
                prompt === p.prompt
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tone Pills */}
      <div>
        <label className="block text-[10px] font-semibold text-[#8b949e] uppercase mb-1">Tone</label>
        <div className="grid grid-cols-2 gap-1.5">
          {TONE_OPTIONS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTone(t)}
              className={`px-2 py-1 rounded border text-[11px] text-center font-medium transition-all ${
                tone === t
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Instruction */}
      <div>
        <label className="block text-[10px] font-semibold text-[#8b949e] uppercase mb-1">Instruction / Goal</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="What should AI write about?"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {/* Stream Action Button */}
      <button
        onClick={handleGenerateStream}
        disabled={isStreaming || !prompt.trim()}
        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
      >
        {isStreaming ? (
          <>
            <SpinnerIcon size={14} /> Streaming Live...
          </>
        ) : (
          <>
            <SparklesIcon size={14} /> Write Email Live
          </>
        )}
      </button>
    </div>
  );
}
