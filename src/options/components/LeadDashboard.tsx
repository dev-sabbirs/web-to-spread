import React, { useState, useEffect } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants';
import type { MessageResponse } from '../../shared/types';
import { SpinnerIcon, TrashIcon, RefreshIcon } from '../icons';

interface LeadDashboardProps {
  githubSheetName: string;
  linkedinSheetName: string;
  isConfigured: boolean;
}

export function LeadDashboard({
  githubSheetName,
  linkedinSheetName,
  isConfigured,
}: LeadDashboardProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'linkedin'>('github');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  if (!isConfigured) {
    return null;
  }

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
              onClick={() => setActiveTab('github')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'github'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              GitHub
            </button>
            <button
              onClick={() => setActiveTab('linkedin')}
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
                <th className="px-4 py-3 text-center w-10">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#e6edf3]">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2.5 text-center text-[#8b949e] font-mono text-[11px]">{rIdx + 1}</td>
                  {headers.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 max-w-xs truncate">
                      {row[cIdx] ? (
                        row[cIdx].startsWith('http') ? (
                          <a
                            href={row[cIdx]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline"
                          >
                            {row[cIdx]}
                          </a>
                        ) : (
                          row[cIdx]
                        )
                      ) : (
                        <span className="text-[#484f58] italic">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
