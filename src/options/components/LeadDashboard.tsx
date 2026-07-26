import React, { useState, useEffect } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants';
import type { MessageResponse } from '../../shared/types';
import { SpinnerIcon, TrashIcon, RefreshIcon, EyeIcon, ExternalLinkIcon } from '../icons';

interface LeadDashboardProps {
  githubSheetName: string;
  linkedinSheetName: string;
  isConfigured: boolean;
  initialPlatform?: 'github' | 'linkedin';
}

export function LeadDashboard({
  githubSheetName,
  linkedinSheetName,
  isConfigured,
  initialPlatform = 'github',
}: LeadDashboardProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'linkedin'>(initialPlatform);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const currentSheetName = activeTab === 'github' ? githubSheetName : linkedinSheetName;

  const fetchLeads = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const res: MessageResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.FETCH_LEADS,
        sheetName: currentSheetName,
      });

      if (res.success && res.data) {
        setHeaders(res.data.headers || []);
        setRows(res.data.rows || []);
      } else {
        setError(res.error || 'Failed to load leads from spreadsheet.');
      }
    } catch {
      setError('Network error or background worker unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlush = async () => {
    setFlushing(true);
    setError(null);
    setStatusMsg(null);
    try {
      const res: MessageResponse = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.FLUSH_SHEET,
        sheetName: currentSheetName,
      });

      if (res.success) {
        setStatusMsg(`Successfully flushed all records from ${currentSheetName}!`);
        setShowConfirm(false);
        fetchLeads();
      } else {
        setError(res.error || 'Failed to flush sheet.');
      }
    } catch {
      setError('Network error trying to flush sheet.');
    } finally {
      setFlushing(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  useEffect(() => {
    if (isConfigured) {
      fetchLeads();
    }
  }, [activeTab, currentSheetName, isConfigured]);

  const renderCellContent = (header: string, cellValue: string) => {
    if (!cellValue) return <span className="text-[#484f58] italic">—</span>;

    const lowerHeader = header.toLowerCase();

    // 1. Truncate long text fields (About / Bio / Summary / Headline) in the table preview
    if (lowerHeader.includes('about') || lowerHeader.includes('bio') || lowerHeader.includes('summary') || lowerHeader.includes('headline')) {
      return (
        <span className="truncate max-w-xs block text-[#8b949e]" title={cellValue}>
          {cellValue}
        </span>
      );
    }

    // 2. Format Website / Contact Link cell (supports both http://... and plain domains like example.com)
    if (
      lowerHeader.includes('website') ||
      lowerHeader.includes('url') ||
      cellValue.includes('http') ||
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cellValue.trim())
    ) {
      const parts = cellValue.split(',').map((p) => p.trim()).filter(Boolean);
      const links = parts.map((p) => (p.startsWith('http://') || p.startsWith('https://') ? p : `https://${p}`));

      if (links.length > 0) {
        const firstLink = links[0];
        const extraCount = links.length - 1;

        return (
          <div className="flex items-center gap-1.5">
            <a
              href={firstLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-medium truncate max-w-[180px]"
              title={firstLink}
            >
              <span>{firstLink.replace(/^https?:\/\/(www\.)?/, '')}</span>
              <ExternalLinkIcon size={12} className="shrink-0 opacity-75" />
            </a>
            {extraCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0 font-mono" title={`${extraCount} more websites in preview modal`}>
                +{extraCount}
              </span>
            )}
          </div>
        );
      }
    }

    return cellValue;
  };

  if (!isConfigured) {
    return null;
  }

  const selectedRow = selectedRowIndex !== null ? rows[selectedRowIndex] : null;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-5 shadow-lg shadow-black/20">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
        <div>
          <h3 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
            Leads Dashboard
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {rows.length} {rows.length === 1 ? 'lead' : 'leads'}
            </span>
          </h3>
          <p className="text-xs text-[#8b949e] mt-1">
            Real-time preview of extracted leads from Google Sheets (<code className="text-indigo-300">{currentSheetName}</code>).
          </p>
        </div>

        {/* Tab switcher & actions */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-[#0d1117] border border-[#30363d] rounded-lg">
            <button
              onClick={() => { setActiveTab('github'); setSelectedRowIndex(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'github'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              GitHub
            </button>
            <button
              onClick={() => { setActiveTab('linkedin'); setSelectedRowIndex(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'linkedin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              LinkedIn
            </button>
          </div>

          <button
            onClick={fetchLeads}
            disabled={loading}
            title="Refresh table"
            className="p-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] rounded-lg text-xs transition-colors disabled:opacity-40"
          >
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading || flushing || rows.length === 0}
            title="Flush / Clear all rows in this sheet"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TrashIcon size={14} /> Flush Sheet
          </button>
        </div>
      </div>

      {/* Confirmation Modal / Banner for Flushing */}
      {showConfirm && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-300">
          <div>
            <strong className="text-red-400 font-bold">⚠️ Danger Zone: Flush {currentSheetName}</strong>
            <p className="mt-0.5 text-red-300/80">
              This will permanently delete all {rows.length} lead rows in Google Sheets. The header row will be retained.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFlush}
              disabled={flushing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {flushing ? <><SpinnerIcon size={12} /> Flushing…</> : 'Yes, Flush All'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-medium">
          {statusMsg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="border border-[#30363d] rounded-xl overflow-x-auto max-h-[70vh] min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-[#8b949e] gap-2">
            <SpinnerIcon size={18} /> Loading {currentSheetName} data…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm font-semibold text-[#e6edf3]">No extracted leads in {currentSheetName}</p>
            <p className="text-xs text-[#8b949e] mt-1 max-w-sm">
              Visit any profile on {activeTab === 'github' ? 'GitHub' : 'LinkedIn'} and click the floating button to capture your first lead!
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0d1117] border-b border-[#30363d] text-[11px] font-semibold uppercase tracking-wider text-[#8b949e] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center w-14">Action</th>
                <th className="px-4 py-3 text-center w-10">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#e6edf3]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setSelectedRowIndex(rIdx)}
                      title="Preview lead details"
                      className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors inline-flex items-center justify-center"
                    >
                      <EyeIcon size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-center text-[#8b949e] font-mono text-[11px]">{rIdx + 1}</td>
                  {headers.map((h, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 max-w-xs truncate">
                      {renderCellContent(h, row[cIdx])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Single Lead Preview Modal ── */}
      {selectedRow !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262d] bg-[#0d1117]">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                  activeTab === 'linkedin' ? 'bg-blue-600' : 'bg-indigo-600'
                }`}>
                  {activeTab === 'linkedin' ? 'li' : 'gh'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#e6edf3]">Lead Details Preview</h3>
                  <p className="text-[11px] text-[#8b949e]">Record #{selectedRowIndex! + 1} from {currentSheetName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRowIndex(null)}
                className="w-7 h-7 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {headers.map((header, idx) => {
                  const val = selectedRow[idx] || '';
                  const isLongText = header.toLowerCase().includes('about') || header.toLowerCase().includes('bio') || header.toLowerCase().includes('notes');

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
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#21262d] bg-[#0d1117] flex justify-end">
              <button
                onClick={() => setSelectedRowIndex(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

