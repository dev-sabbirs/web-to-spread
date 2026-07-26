import { AlertIcon } from './icons';
import { Sidebar } from './components/Sidebar';
import { ConfigCard } from './components/ConfigCard';
import { HowItWorks } from './components/HowItWorks';
import { SheetColumns } from './components/SheetColumns';
import { useSettings } from './hooks/useSettings';
import './styles/tailwind.css';

export default function Options() {
  const hook = useSettings();

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans antialiased">
      <Sidebar isConfigured={hook.isConfigured} activeSection="settings" />

      <main className="flex-1 min-w-0 p-6 md:p-12 max-w-4xl">
        {/* Not-configured banner */}
        {!hook.isConfigured && (
          <div className="flex items-start gap-3 p-4 mb-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs leading-relaxed" role="alert">
            <AlertIcon size={18} className="shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#e6edf3] font-semibold">Extension not configured.</strong>{' '}
              Paste your Apps Script URL below and click Save to start extracting GitHub leads.
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        <section id="settings" className="mb-14">
          <div className="mb-5 pb-4 border-b border-[#21262d]">
            <h2 className="text-lg font-bold text-[#e6edf3]">Settings</h2>
            <p className="text-xs text-[#8b949e] mt-1">Connect to Google Sheets via a deployed Apps Script web app.</p>
          </div>
          <ConfigCard
            url={hook.settings.appsScriptUrl}
            sheetName={hook.settings.sheetName}
            isValidUrl={hook.isValidUrl}
            isConfigured={hook.isConfigured}
            saveState={hook.saveState}
            saveMsg={hook.saveMsg}
            testState={hook.testState}
            testMsg={hook.testMsg}
            onUrlChange={hook.updateUrl}
            onSheetNameChange={hook.updateSheetName}
            onSave={hook.save}
            onTest={hook.testConnection}
          />
        </section>

        {/* ── Setup Guide ── */}
        <section id="guide" className="mb-14">
          <div className="mb-5 pb-4 border-b border-[#21262d]">
            <h2 className="text-lg font-bold text-[#e6edf3]">Setup Guide</h2>
            <p className="text-xs text-[#8b949e] mt-1">One-time setup — takes about 5 minutes.</p>
          </div>
          <HowItWorks />
        </section>

        {/* ── Data Reference ── */}
        <section id="columns" className="mb-14">
          <div className="mb-5 pb-4 border-b border-[#21262d]">
            <h2 className="text-lg font-bold text-[#e6edf3]">Data Reference</h2>
            <p className="text-xs text-[#8b949e] mt-1">Each button click appends one row with the following columns.</p>
          </div>
          <SheetColumns />
        </section>
      </main>
    </div>
  );
}
