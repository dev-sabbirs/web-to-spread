import React, { useRef, useState, useEffect } from "react";
import { SparklesIcon } from "../icons";
import { AiEmailModal } from "./AiEmailModal";
import { LinkModal } from "./LinkModal";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onApplySubject?: (subject: string) => void;
  leadContext?: {
    name?: string;
    headline?: string;
    bio?: string;
    email?: string;
  };
}

export function RichTextEditor({
  value,
  onChange,
  onApplySubject,
  leadContext,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"visual" | "html" | "preview">(
    "visual",
  );
  const [showAiModal, setShowAiModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Synchronize initial content to contentEditable DOM node without causing cursor jumps
  useEffect(() => {
    if (editorRef.current && viewMode === "visual") {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [viewMode]);

  const exec = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const savedRangeRef = useRef<Range | null>(null);

  const openLinkModal = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    const selectionText = sel?.toString() || "";
    setLinkText(selectionText);
    setLinkUrl("https://");
    setShowLinkModal(true);
  };

  const insertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    if (linkText) {
      const aHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      exec("insertHTML", aHtml);
    } else {
      exec("createLink", linkUrl);
    }
    setShowLinkModal(false);
  };

  return (
    <div className="flex flex-col border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22] relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0d1117] border-b border-[#30363d] text-xs">
        <div className="flex items-center flex-wrap gap-1">
          {viewMode === "visual" && (
            <>
              <button
                type="button"
                onClick={() => exec("bold")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-bold rounded"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => exec("italic")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] italic rounded"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => exec("underline")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] underline rounded"
                title="Underline"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => exec("strikeThrough")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] line-through rounded"
                title="Strikethrough"
              >
                S
              </button>

              <span className="w-px h-4 bg-[#30363d] mx-1" />

              <button
                type="button"
                onClick={() => exec("insertUnorderedList")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded font-medium"
                title="Bullet List"
              >
                • Bullet List
              </button>
              <button
                type="button"
                onClick={() => exec("insertOrderedList")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded font-medium"
                title="Numbered List"
              >
                1. Numbered List
              </button>

              <span className="w-px h-4 bg-[#30363d] mx-1" />

              <button
                type="button"
                onClick={() => exec("formatBlock", "<h2>")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-bold rounded"
                title="Heading"
              >
                H2
              </button>
              <button
                type="button"
                onClick={openLinkModal}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-indigo-400 font-semibold rounded"
                title="Insert Link"
              >
                🔗 Link
              </button>
              <button
                type="button"
                onClick={() => exec("removeFormat")}
                className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] rounded"
                title="Clear Formatting"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
          <button
            type="button"
            onClick={() => setViewMode("visual")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === "visual"
                ? "bg-indigo-600 text-white"
                : "text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode("html")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === "html"
                ? "bg-indigo-600 text-white"
                : "text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            HTML Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
              viewMode === "preview"
                ? "bg-indigo-600 text-white"
                : "text-[#8b949e] hover:text-[#e6edf3]"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Insert Link Modal */}
      {showLinkModal && (
        <LinkModal
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          linkText={linkText}
          setLinkText={setLinkText}
          onSubmit={insertLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}

      {/* Editor Main Content Area */}
      <div className="relative p-4 min-h-[220px]">
        {viewMode === "visual" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="editor-content outline-none min-h-[200px] text-xs text-[#e6edf3] leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_a]:text-emerald-400 [&_a]:bg-emerald-500/10 [&_a]:px-1.5 [&_a]:py-0.5 [&_a]:rounded [&_a]:border [&_a]:border-emerald-500/30 [&_a]:underline [&_a]:decoration-emerald-500 [&_a]:decoration-2 [&_a]:underline-offset-2 [&_a]:font-semibold [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2"
          />
        )}

        {viewMode === "html" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            className="w-full h-48 bg-transparent text-[#e6edf3] font-mono text-xs focus:outline-none resize-none"
          />
        )}

        {viewMode === "preview" && (
          <div className="p-4 bg-white text-black rounded-lg min-h-[200px] overflow-y-auto">
            <div
              className="preview-content prose prose-sm max-w-none text-xs text-gray-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-emerald-600 [&_a]:bg-emerald-50 [&_a]:px-1 [&_a]:py-0.5 [&_a]:rounded [&_a]:underline [&_a]:decoration-emerald-500 [&_a]:decoration-2 [&_a]:underline-offset-2 [&_a]:font-semibold"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        )}

        {/* Ai Email Generator Modal */}
        {showAiModal && (
          <AiEmailModal
            leadContext={leadContext}
            onClose={() => setShowAiModal(false)}
            onApply={(subj, html) => {
              if (onApplySubject) onApplySubject(subj);
              onChange(html);
              if (editorRef.current) {
                editorRef.current.innerHTML = html;
              }
            }}
          />
        )}

        {/* Floating AI Agent Button */}
        {viewMode !== "preview" && (
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            title="AI Assistant (Generate/Improve Mail)"
            className="absolute bottom-4 right-4 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <SparklesIcon size={14} className="animate-pulse" />
            <span className="text-[10px] pr-0.5">AI Agent</span>
          </button>
        )}
      </div>
    </div>
  );
}
