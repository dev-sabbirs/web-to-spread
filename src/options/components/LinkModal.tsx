import React from 'react';

interface LinkModalProps {
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  linkText: string;
  setLinkText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function LinkModal({
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  onSubmit,
  onClose,
}: LinkModalProps) {
  return (
    <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 w-full max-w-sm flex flex-col gap-3 shadow-2xl">
        <h4 className="text-xs font-bold text-[#e6edf3]">Insert Hyperlink</h4>
        <div>
          <label className="block text-[10px] text-[#8b949e] mb-1 uppercase font-semibold">Link URL</label>
          <input
            type="url"
            required
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-[#8b949e] mb-1 uppercase font-semibold">Display Text (Optional)</label>
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Click here"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-xs font-medium rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
          >
            Insert Link
          </button>
        </div>
      </form>
    </div>
  );
}
