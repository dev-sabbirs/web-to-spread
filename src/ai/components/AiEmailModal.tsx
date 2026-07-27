import React, { useState, useEffect } from 'react';
import { MODE_PRESETS, TONE_OPTIONS } from '../config';
import { generateEmailWithGemini } from '../services/geminiService';
import { getUserProfile, getSettings, type UserProfile } from '../../shared/storage';
import { SparklesIcon, SpinnerIcon } from '../../options/icons';

interface AiEmailModalProps {
  onClose: () => void;
  onApply: (generatedSubject: string, generatedHtmlBody: string) => void;
  leadContext?: { name?: string; headline?: string; bio?: string; email?: string };
}

export function AiEmailModal({ onClose, onApply, leadContext }: AiEmailModalProps) {
  const [prompt, setPrompt] = useState<string>(MODE_PRESETS.client[0].prompt);
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [customModel, setCustomModel] = useState<string>('gemini-3.6-flash');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedHtmlBody, setGeneratedHtmlBody] = useState('');

  useEffect(() => {
    getUserProfile().then(setUserProfile);
    getSettings().then((s) => {
      setCustomApiKey(s.geminiApiKey);
      setCustomModel(s.geminiModel);
    });
  }, []);

  const handleGenerate = async () => {
    const apiKey = customApiKey || import.meta.env.VITE_AISTUDIO_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not configured in Settings or .env');
      return;
    }
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await generateEmailWithGemini({
        apiKey,
        model: customModel,
        prompt,
        tone,
        leadContext,
        senderProfile: userProfile,
      });
      setGeneratedSubject(res.subject);
      setGeneratedHtmlBody(res.htmlBody);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate email content');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1c1c] bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#262626] border border-[#404040] flex items-center justify-center text-[#f5f5f5] font-bold text-xs">
              <SparklesIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f5f5f5]">Gemini AI Email Generator</h3>
              <p className="text-[11px] text-[#737373]">Generate high-converting outreach powered by Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#1c1c1c] hover:bg-[#262626] text-[#737373] hover:text-[#f5f5f5] flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#737373] uppercase mb-1.5">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {MODE_PRESETS.client.map((p: { label: string; prompt: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.prompt)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
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

          <div>
            <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1.5">Tone of Voice</label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium text-left transition-all ${
                    tone === t
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
                      : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8b949e] uppercase mb-1.5">Instructions / Goal</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe what you want Gemini to write..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#e6edf3] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {generating ? <><SpinnerIcon size={14} /> Generating with Gemini...</> : <><SparklesIcon size={14} /> Generate Email</>}
            </button>
          </div>

          {generatedSubject && (
            <div className="mt-2 p-4 bg-[#0d1117] border border-[#30363d] rounded-xl flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Generated Subject</span>
                <p className="text-xs font-semibold text-[#e6edf3] mt-0.5">{generatedSubject}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Generated HTML Body Preview</span>
                <div
                  className="mt-1 p-3 bg-white text-black rounded-lg text-xs prose prose-sm max-w-none max-h-48 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: generatedHtmlBody }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-[#21262d] bg-[#0d1117] flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 bg-[#21262d] text-[#e6edf3] text-xs font-semibold rounded-xl">
            Cancel
          </button>
          {generatedSubject && (
            <button
              onClick={() => {
                onApply(generatedSubject, generatedHtmlBody);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              ✓ Apply to Email Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
