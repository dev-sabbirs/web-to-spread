import React from 'react';
import { SpinnerIcon, TrashIcon, RefreshIcon } from '../icons';

interface DashboardHeaderProps {
  rowsCount: number;
  currentSheetName: string;
  activeTab: 'github' | 'linkedin';
  setActiveTab: (tab: 'github' | 'linkedin') => void;
  fetchLeads: () => void;
  loading: boolean;
  flushing: boolean;
  setShowConfirm: (show: boolean) => void;
  setSelectedRowIndex: (idx: number | null) => void;
  setShowMailComposer: (show: boolean) => void;
}

export function DashboardHeader({
  rowsCount,
  currentSheetName,
  activeTab,
  setActiveTab,
  fetchLeads,
  loading,
  flushing,
  setShowConfirm,
  setSelectedRowIndex,
  setShowMailComposer,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21262d]">
      <div>
        <h3 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
          Leads Dashboard
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            {rowsCount} {rowsCount === 1 ? 'lead' : 'leads'}
          </span>
        </h3>
        <p className="text-xs text-[#8b949e] mt-1">
          Real-time preview of extracted leads from Google Sheets (<code className="text-indigo-300">{currentSheetName}</code>).
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex p-1 bg-[#0d1117] border border-[#30363d] rounded-lg">
          <button
            onClick={() => { setActiveTab('github'); setSelectedRowIndex(null); setShowMailComposer(false); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'github' ? 'bg-indigo-600 text-white shadow-sm' : 'text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            GitHub
          </button>
          <button
            onClick={() => { setActiveTab('linkedin'); setSelectedRowIndex(null); setShowMailComposer(false); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'linkedin' ? 'bg-blue-600 text-white shadow-sm' : 'text-[#8b949e] hover:text-[#e6edf3]'
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
          disabled={loading || flushing || rowsCount === 0}
          title="Flush / Clear all rows in this sheet"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <TrashIcon size={14} /> Flush Sheet
        </button>
      </div>
    </div>
  );
}
