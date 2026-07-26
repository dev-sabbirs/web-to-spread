import React, { useState } from 'react';
import { AlertIcon } from './icons';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { LeadDashboard } from './components/LeadDashboard';
import { ConfigCard } from './components/ConfigCard';
import { HowItWorks } from './components/HowItWorks';
import { useSettings } from './hooks/useSettings';
import './styles/tailwind.css';

type TabId = 'dashboard' | 'leads' | 'settings' | 'guide';

export default function Options() {
  const hook = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans antialiased">
      <Sidebar
        isConfigured={hook.isConfigured}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as TabId)}
      />

      <main className="flex-1 min-w-0 p-6 md:p-10 w-full">
        {/* Not-configured banner */}
        {!hook.isConfigured && activeTab !== 'settings' && (
          <div className="flex items-start justify-between gap-3 p-4 mb-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs leading-relaxed" role="alert">
            <div className="flex items-start gap-3">
              <AlertIcon size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#e6edf3] font-semibold">Extension not configured.</strong>{' '}
                Paste your Apps Script URL in settings to start capturing leads.
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg shrink-0 transition-colors"
            >
              Configure Settings →
            </button>
          </div>
        )}

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <section id="dashboard" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Dashboard Overview</h2>
              <p className="text-xs text-[#8b949e] mt-1">High-level lead metrics, system connection status, and quick shortcuts.</p>
            </div>
            <OverviewDashboard
              githubSheetName={hook.settings.githubSheetName}
              linkedinSheetName={hook.settings.linkedinSheetName}
              isConfigured={hook.isConfigured}
              appsScriptUrl={hook.settings.appsScriptUrl}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          </section>
        )}

        {/* ── Leads Tab ── */}
        {activeTab === 'leads' && (
          <section id="leads" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Extracted Leads</h2>
              <p className="text-xs text-[#8b949e] mt-1">Preview live extracted leads from your Google Sheet or flush existing records.</p>
            </div>
            <LeadDashboard
              githubSheetName={hook.settings.githubSheetName}
              linkedinSheetName={hook.settings.linkedinSheetName}
              isConfigured={hook.isConfigured}
            />
          </section>
        )}

        {/* ── Settings Tab ── */}
        {activeTab === 'settings' && (
          <section id="settings" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Settings</h2>
              <p className="text-xs text-[#8b949e] mt-1">Connect to Google Sheets via a deployed Apps Script web app.</p>
            </div>
            <ConfigCard
              url={hook.settings.appsScriptUrl}
              githubSheetName={hook.settings.githubSheetName}
              linkedinSheetName={hook.settings.linkedinSheetName}
              isValidUrl={hook.isValidUrl}
              isConfigured={hook.isConfigured}
              saveState={hook.saveState}
              saveMsg={hook.saveMsg}
              testState={hook.testState}
              testMsg={hook.testMsg}
              onUrlChange={hook.updateUrl}
              onGithubSheetNameChange={hook.updateGithubSheetName}
              onLinkedinSheetNameChange={hook.updateLinkedinSheetName}
              onSave={hook.save}
              onTest={hook.testConnection}
            />
          </section>
        )}

        {/* ── Setup Guide Tab ── */}
        {activeTab === 'guide' && (
          <section id="guide" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Setup Guide</h2>
              <p className="text-xs text-[#8b949e] mt-1">One-time setup — takes about 5 minutes.</p>
            </div>
            <HowItWorks />
          </section>
        )}
      </main>
    </div>
  );
}
