import React, { useState, useEffect } from 'react';
import { MESSAGE_TYPES } from '../../shared/constants';
import type { MessageResponse } from '../../shared/types';
import { UsersIcon, SettingsIcon, ExternalLinkIcon } from '../icons';

interface OverviewDashboardProps {
  githubSheetName: string;
  linkedinSheetName: string;
  isConfigured: boolean;
  appsScriptUrl: string;
  onNavigate: (tab: 'dashboard' | 'leads' | 'profile' | 'settings' | 'guide', platform?: 'github' | 'linkedin') => void;
}

export function OverviewDashboard({
  githubSheetName,
  linkedinSheetName,
  isConfigured,
  appsScriptUrl,
  onNavigate,
}: OverviewDashboardProps) {
  const [githubCount, setGithubCount] = useState<number | null>(null);
  const [linkedinCount, setLinkedinCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    setLoading(true);

    Promise.all([
      chrome.runtime.sendMessage({ type: MESSAGE_TYPES.FETCH_LEADS, sheetName: githubSheetName }),
      chrome.runtime.sendMessage({ type: MESSAGE_TYPES.FETCH_LEADS, sheetName: linkedinSheetName }),
    ]).then(([ghRes, liRes]: [MessageResponse, MessageResponse]) => {
      if (ghRes?.success && ghRes.data) {
        setGithubCount(ghRes.data.rows.length);
      }
      if (liRes?.success && liRes.data) {
        setLinkedinCount(liRes.data.rows.length);
      }
    }).finally(() => setLoading(false));
  }, [isConfigured, githubSheetName, linkedinSheetName]);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Hero Banner */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1c1c] text-[#d4d4d4] text-xs font-semibold w-fit border border-[#262626]">
            ✨ Ultimate Lead Capture Suite v1.2.5
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#f5f5f5] tracking-tight">
            Capture Leads Directly Into Google Sheets
          </h2>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Extract profile data, emails, company info, and bio details from GitHub and LinkedIn profiles with a single click.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('leads')}
            className="px-5 py-2.5 bg-[#171717] hover:bg-[#262626] border border-[#262626] hover:border-[#404040] text-[#f5f5f5] font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            View Extracted Leads →
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* GitHub Leads Card */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg hover:border-[#262626] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">GitHub Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#d4d4d4]">
              <UsersIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#f5f5f5]">
              {loading ? '…' : (githubCount ?? 0)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Tab: <code className="text-[#d4d4d4] font-mono">{githubSheetName}</code>
            </p>
          </div>
          <button
            onClick={() => onNavigate('leads', 'github')}
            className="text-xs font-semibold text-[#d4d4d4] hover:text-white text-left transition-colors pt-2 border-t border-[#1c1c1c] cursor-pointer"
          >
            Manage GitHub Table →
          </button>
        </div>

        {/* LinkedIn Leads Card */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg hover:border-[#262626] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">LinkedIn Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-[#d4d4d4]">
              <UsersIcon size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#f5f5f5]">
              {loading ? '…' : (linkedinCount ?? 0)}
            </div>
            <p className="text-xs text-[#737373] mt-1">
              Tab: <code className="text-[#d4d4d4] font-mono">{linkedinSheetName}</code>
            </p>
          </div>
          <button
            onClick={() => onNavigate('leads', 'linkedin')}
            className="text-xs font-semibold text-[#d4d4d4] hover:text-white text-left transition-colors pt-2 border-t border-[#1c1c1c] cursor-pointer"
          >
            Manage LinkedIn Table →
          </button>
        </div>

        {/* System Status Card */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">System Status</span>
            <button
              onClick={() => onNavigate('settings')}
              title="Open Settings"
              className="w-8 h-8 rounded-lg bg-[#141414] hover:bg-[#262626] border border-[#262626] flex items-center justify-center text-[#d4d4d4] transition-colors cursor-pointer"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'}`} />
              <span className="text-lg font-bold text-[#f5f5f5]">
                {isConfigured ? 'Active & Ready' : 'Setup Required'}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-1 truncate max-w-[200px]" title={appsScriptUrl}>
              {isConfigured ? appsScriptUrl : 'No Web App URL set'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-semibold text-[#d4d4d4] hover:text-white text-left transition-colors pt-2 border-t border-[#1c1c1c] cursor-pointer"
          >
            Configure Connection →
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-[#f5f5f5]">Quick Links & Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-[#141414] border border-[#262626] hover:border-[#404040] rounded-xl flex items-center justify-between transition-all group cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-[#f5f5f5] group-hover:text-white transition-colors">
                Open Google Sheets
              </span>
              <p className="text-[11px] text-[#737373] mt-0.5">View full spreadsheet in Google Workspace</p>
            </div>
            <ExternalLinkIcon size={16} className="text-[#737373] group-hover:text-white transition-colors" />
          </a>

          <button
            onClick={() => onNavigate('guide')}
            className="p-4 bg-[#141414] border border-[#262626] hover:border-[#404040] rounded-xl flex items-center justify-between transition-all text-left group cursor-pointer"
          >
            <div>
              <span className="text-xs font-bold text-[#f5f5f5] group-hover:text-white transition-colors">
                View Setup Guide
              </span>
              <p className="text-[11px] text-[#737373] mt-0.5">Step-by-step Apps Script configuration tutorial</p>
            </div>
            <span className="text-xs font-semibold text-[#d4d4d4] group-hover:text-white">Guide →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
