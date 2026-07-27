import React from 'react';
import { ExternalLinkIcon } from '../icons';

interface LeadDetailModalProps {
  activeTab: 'github' | 'linkedin';
  currentSheetName: string;
  selectedRowIndex: number;
  headers: string[];
  selectedRow: string[];
  showMailComposer: boolean;
  setShowMailComposer: (show: boolean) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function LeadDetailModal({
  activeTab,
  currentSheetName,
  selectedRowIndex,
  headers,
  selectedRow,
  showMailComposer,
  setShowMailComposer,
  onClose,
  children,
}: LeadDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d] bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                activeTab === 'linkedin' ? 'bg-blue-600' : 'bg-indigo-600'
              }`}
            >
              {activeTab === 'linkedin' ? 'li' : 'gh'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e6edf3]">Lead Details Preview</h3>
              <p className="text-[11px] text-[#8b949e]">
                Record #{selectedRowIndex + 1} from {currentSheetName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMailComposer(!showMailComposer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showMailComposer
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
              }`}
            >
              {showMailComposer ? '← View Details' : '✉ Send Mail'}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {showMailComposer ? (
            children
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map((header, idx) => {
                const val = selectedRow[idx] || '';
                const isLongText =
                  header.toLowerCase().includes('about') ||
                  header.toLowerCase().includes('bio') ||
                  header.toLowerCase().includes('notes');

                return (
                  <div
                    key={idx}
                    className={`p-3.5 bg-[#0d1117] border border-[#21262d] rounded-xl flex flex-col gap-1.5 ${
                      isLongText ? 'md:col-span-2' : ''
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
                      {header}
                    </span>
                    <div className="text-xs text-[#e6edf3] break-words whitespace-pre-wrap">
                      {val ? (
                        val.includes('http') ? (
                          <div className="flex flex-col gap-1">
                            {val.split(',').map((link, lIdx) => {
                              const trimmed = link.trim();
                              if (trimmed.startsWith('http')) {
                                return (
                                  <a
                                    key={lIdx}
                                    href={trimmed}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 underline font-medium"
                                  >
                                    <span>{trimmed}</span>
                                    <ExternalLinkIcon size={12} className="shrink-0" />
                                  </a>
                                );
                              }
                              return <span key={lIdx}>{trimmed}</span>;
                            })}
                          </div>
                        ) : (
                          val
                        )
                      ) : (
                        <span className="text-[#484f58] italic">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#21262d] bg-[#0d1117] flex justify-between items-center">
          <button
            onClick={() => setShowMailComposer(!showMailComposer)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            {showMailComposer ? '← Back to Lead Details' : '✉ Compose Mail'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
