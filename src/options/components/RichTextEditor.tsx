import React, { useRef, useState } from 'react';
import { SparklesIcon } from '../icons';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');
  const [showAiNotice, setShowAiNotice] = useState(false);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt('Enter URL link:', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className="flex flex-col border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0d1117] border-b border-[#30363d] text-xs">
        <div className="flex items-center flex-wrap gap-1">
          {viewMode === 'visual' && (
            <>
              <button
                type="button"
                onClick={() => exec('bold')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-bold rounded"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => exec('italic')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] italic rounded"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => exec('underline')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] underline rounded"
                title="Underline"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => exec('strikeThrough')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] line-through rounded"
                title="Strikethrough"
              >
                S
              </button>

              <span className="w-px h-4 bg-[#30363d] mx-1" />

              <button
                type="button"
                onClick={() => exec('insertUnorderedList')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded"
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => exec('insertOrderedList')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded"
                title="Numbered List"
              >
                1. List
              </button>

              <span className="w-px h-4 bg-[#30363d] mx-1" />

              <button
                type="button"
                onClick={() => exec('formatBlock', '<h2>')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-bold rounded"
                title="Heading"
              >
                H2
              </button>
              <button
                type="button"
                onClick={addLink}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-indigo-400 font-semibold rounded"
                title="Insert Link"
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={() => exec('removeFormat')}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] rounded"
                title="Clear Formatting"
              >
                Clear
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              viewMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              viewMode === 'html' ? 'bg-indigo-600 text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            HTML Code
          </button>
        </div>
      </div>

      {showAiNotice && (
        <div className="p-2.5 bg-indigo-500/10 border-b border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
          <span>✨ AI Agent Assistant UI is ready for future integration!</span>
          <button onClick={() => setShowAiNotice(false)} className="text-[#8b949e] hover:text-[#e6edf3] font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Editor Body Area */}
      <div className="relative p-4 min-h-[220px]">
        {viewMode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={() => editorRef.current && onChange(editorRef.current.innerHTML)}
            dangerouslySetInnerHTML={{ __html: value }}
            className="outline-none min-h-[200px] text-xs text-[#e6edf3] leading-relaxed prose prose-invert max-w-none"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            className="w-full h-48 bg-transparent text-[#e6edf3] font-mono text-xs focus:outline-none resize-none"
          />
        )}

        {/* Floating AI Agent Button */}
        <button
          type="button"
          onClick={() => setShowAiNotice(true)}
          title="AI Assistant (Generate/Improve Mail)"
          className="absolute bottom-4 right-4 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <SparklesIcon size={14} className="animate-pulse" />
          <span className="text-[10px] pr-0.5">AI Agent</span>
        </button>
      </div>
    </div>
  );
}
