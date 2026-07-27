import React, { useState } from 'react';
import { AlertIcon } from './icons';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { LeadDashboard } from './components/LeadDashboard';
import { ConfigCard } from './components/ConfigCard';
import { HowItWorks } from './components/HowItWorks';
import { useSettings } from './hooks/useSettings';
import './styles/tailwind.css';

import { SendMailPage } from './components/SendMailPage';
import { UserProfileCard } from './components/UserProfileCard';
import { UsagePage } from './components/UsagePage';

type TabId = 'dashboard' | 'leads' | 'send-mail' | 'profile' | 'usage' | 'settings' | 'guide';

function getInitialTabState(): { tab: TabId; platform: 'github' | 'linkedin' } {
  const hash = window.location.hash.replace(/^#/, '');
  const [tabPart, queryPart] = hash.split('?');
  const validTabs: TabId[] = ['dashboard', 'leads', 'send-mail', 'profile', 'usage', 'settings', 'guide'];

  const tab = validTabs.includes(tabPart as TabId) ? (tabPart as TabId) : 'dashboard';

  let platform: 'github' | 'linkedin' = 'github';
  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    const p = params.get('platform');
    if (p === 'linkedin' || p === 'github') platform = p;
  }

  return { tab, platform };
}

export default function Options() {
  const hook = useSettings();
  const initial = getInitialTabState();
  const [activeTab, setActiveTab] = useState<TabId>(initial.tab);
  const [leadsPlatform, setLeadsPlatform] = useState<'github' | 'linkedin'>(initial.platform);
  const [selectedMailLead, setSelectedMailLead] = useState<{ email?: string; name?: string }>({});


  // Synchronize state with URL hash changes (back/forward navigation, manual hash edits, page reloads)
  React.useEffect(() => {
    const handleHashChange = () => {
      const state = getInitialTabState();
      setActiveTab(state.tab);
      setLeadsPlatform(state.platform);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleSelectTab = (tab: string, platform?: 'github' | 'linkedin') => {
    setActiveTab(tab as TabId);
    if (platform) {
      setLeadsPlatform(platform);
    }
    const targetPlatform = platform || (tab === 'leads' ? leadsPlatform : undefined);
    const newHash = targetPlatform ? `#${tab}?platform=${targetPlatform}` : `#${tab}`;
    window.location.hash = newHash;
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans antialiased">
      <Sidebar
        isConfigured={hook.isConfigured}
        activeTab={activeTab}
        onSelectTab={(tab) => handleSelectTab(tab as TabId)}
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
              onClick={() => handleSelectTab('settings')}
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
              onNavigate={(tab, platform) => handleSelectTab(tab, platform)}
            />
          </section>
        )}

        {/* ── Send Mail Tab ── */}
        {activeTab === 'send-mail' && (
          <SendMailPage
            githubSheetName={hook.settings.githubSheetName}
            linkedinSheetName={hook.settings.linkedinSheetName}
            isConfigured={hook.isConfigured}
            initialLeadEmail={selectedMailLead.email}
            initialLeadName={selectedMailLead.name}
          />
        )}

        {/* ── Leads Tab ── */}
        {activeTab === 'leads' && (
          <section id="leads" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Extracted Leads</h2>
              <p className="text-xs text-[#8b949e] mt-1">Preview live extracted leads from your Google Sheet or flush existing records.</p>
            </div>
            <LeadDashboard
              key={leadsPlatform}
              githubSheetName={hook.settings.githubSheetName}
              linkedinSheetName={hook.settings.linkedinSheetName}
              isConfigured={hook.isConfigured}
              initialPlatform={leadsPlatform}
              onNavigateToSendMail={(email, name) => {
                setSelectedMailLead({ email, name });
                handleSelectTab('send-mail');
              }}
            />
          </section>
        )}

        {/* ── Personal Profile AI Tab ── */}
        {activeTab === 'profile' && (
          <section id="profile" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">My Personal AI Profile</h2>
              <p className="text-xs text-[#8b949e] mt-1">Configure your personal background, portfolio, and value offer so Gemini AI writes authentic outreach as you.</p>
            </div>
            <UserProfileCard />
          </section>
        )}

        {/* ── Dedicated Usage & Token Analytics Tab ── */}
        {activeTab === 'usage' && (
          <section id="usage" className="animate-in fade-in duration-200">
            <div className="mb-6 pb-4 border-b border-[#21262d]">
              <h2 className="text-xl font-bold text-[#e6edf3]">Usage & Plan Quotas</h2>
              <p className="text-xs text-[#8b949e] mt-1">Monitor real-time token consumption, request rate limits, and plan details.</p>
            </div>
            <UsagePage onNavigate={handleSelectTab} />
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
              geminiApiKey={hook.settings.geminiApiKey}
              geminiModel={hook.settings.geminiModel}
              isValidUrl={hook.isValidUrl}
              isConfigured={hook.isConfigured}
              saveState={hook.saveState}
              saveMsg={hook.saveMsg}
              testState={hook.testState}
              testMsg={hook.testMsg}
              onUrlChange={hook.updateUrl}
              onGithubSheetNameChange={hook.updateGithubSheetName}
              onLinkedinSheetNameChange={hook.updateLinkedinSheetName}
              onGeminiApiKeyChange={hook.updateGeminiApiKey}
              onGeminiModelChange={hook.updateGeminiModel}
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
