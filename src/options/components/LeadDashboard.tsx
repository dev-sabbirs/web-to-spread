import React, { useState, useEffect } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants';
import type { MessageResponse } from '../../shared/types';
import { SpinnerIcon, EyeIcon, ExternalLinkIcon, MailIcon } from '../icons';
import { LeadDetailModal } from './LeadDetailModal';
import { SendMailComposer } from './SendMailComposer';
import { DashboardHeader } from './DashboardHeader';

interface LeadDashboardProps {
  githubSheetName: string;
  linkedinSheetName: string;
  isConfigured: boolean;
  initialPlatform?: 'github' | 'linkedin';
  onNavigateToSendMail?: (email?: string, name?: string) => void;
}

export function LeadDashboard({
  githubSheetName,
  linkedinSheetName,
  isConfigured,
  initialPlatform = 'github',
  onNavigateToSendMail,
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
  const [showMailComposer, setShowMailComposer] = useState(false);

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

    if (lowerHeader.includes('about') || lowerHeader.includes('bio') || lowerHeader.includes('summary') || lowerHeader.includes('headline')) {
      return (
        <span className="truncate max-w-xs block text-[#8b949e]" title={cellValue}>
          {cellValue}
        </span>
      );
    }

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
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold shrink-0 font-mono">
                +{extraCount}
              </span>
            )}
          </div>
        );
      }
    }

    return cellValue;
  };

  if (!isConfigured) return null;

  const selectedRow = selectedRowIndex !== null ? rows[selectedRowIndex] : null;

  let recipientEmail = '';
  let leadName = '';
  if (selectedRow) {
    headers.forEach((h, i) => {
      const lower = h.toLowerCase();
      if (lower.includes('email') && selectedRow[i]) recipientEmail = selectedRow[i];
      if ((lower.includes('name') || lower.includes('username')) && selectedRow[i] && !leadName) leadName = selectedRow[i];
    });
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col gap-5 shadow-lg shadow-black/20">
      <DashboardHeader
        rowsCount={rows.length}
        currentSheetName={currentSheetName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fetchLeads={fetchLeads}
        loading={loading}
        flushing={flushing}
        setShowConfirm={setShowConfirm}
        setSelectedRowIndex={setSelectedRowIndex}
        setShowMailComposer={setShowMailComposer}
      />

      {showConfirm && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-300">
          <div>
            <strong className="text-red-400 font-bold">⚠️ Danger Zone: Flush {currentSheetName}</strong>
            <p className="mt-0.5 text-red-300/80">
              This will permanently delete all {rows.length} lead rows in Google Sheets. Header row will be retained.
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
                  <td className="px-3 py-2.5 text-center flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => { setSelectedRowIndex(rIdx); setShowMailComposer(false); }}
                      title="Preview lead details"
                      className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors inline-flex items-center justify-center"
                    >
                      <EyeIcon size={14} />
                    </button>
                    <button
                      onClick={() => {
                        let email = '';
                        let name = '';
                        headers.forEach((h, i) => {
                          const lower = h.toLowerCase();
                          if (lower.includes('email') && row[i]) email = row[i];
                          if ((lower.includes('name') || lower.includes('username')) && row[i] && !name) name = row[i];
                        });
                        if (onNavigateToSendMail) {
                          onNavigateToSendMail(email, name);
                        } else {
                          setSelectedRowIndex(rIdx);
                          setShowMailComposer(true);
                        }
                      }}
                      title="Compose email to lead"
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors inline-flex items-center justify-center"
                    >
                      <MailIcon size={14} />
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

      {selectedRowIndex !== null && selectedRow && (
        <LeadDetailModal
          activeTab={activeTab}
          currentSheetName={currentSheetName}
          selectedRowIndex={selectedRowIndex}
          headers={headers}
          selectedRow={selectedRow}
          showMailComposer={showMailComposer}
          setShowMailComposer={setShowMailComposer}
          onClose={() => { setSelectedRowIndex(null); setShowMailComposer(false); }}
        >
          <SendMailComposer recipientEmail={recipientEmail} leadName={leadName} />
        </LeadDetailModal>
      )}
    </div>
  );
}
