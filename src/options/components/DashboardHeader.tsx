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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
      <div>
        <h3 className="text-base font-bold text-[#f5f5f5] flex items-center gap-2">
          Leads Dashboard
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#d4d4d4] border border-[#262626] font-mono">
            {rowsCount} {rowsCount === 1 ? 'lead' : 'leads'}
          </span>
        </h3>
        <p className="text-xs text-[#737373] mt-1">
          Real-time preview of extracted leads from Google Sheets (<code className="text-[#d4d4d4] font-mono">{currentSheetName}</code>).
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex p-1 bg-[#141414] border border-[#262626] rounded-lg">
          <button
            onClick={() => { setActiveTab('github'); setSelectedRowIndex(null); setShowMailComposer(false); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'github' ? 'bg-[#262626] text-white shadow-sm border border-[#404040]' : 'text-[#737373] hover:text-[#f5f5f5]'
            }`}
          >
            GitHub
          </button>
          <button
            onClick={() => { setActiveTab('linkedin'); setSelectedRowIndex(null); setShowMailComposer(false); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'linkedin' ? 'bg-[#262626] text-white shadow-sm border border-[#404040]' : 'text-[#737373] hover:text-[#f5f5f5]'
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
