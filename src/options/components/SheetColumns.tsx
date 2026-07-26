import { InfoIcon } from '../icons';

const COMMON_NOTES = 'Common field present in all lead records across platforms.';

const GITHUB_COLUMNS = [
  { col: 'Timestamp', source: 'System clock', note: 'ISO 8601 — when button was clicked' },
  { col: 'Username', source: 'URL path', note: 'e.g. github.com/torvalds → torvalds' },
  { col: 'Full Name', source: 'Profile DOM', note: 'Public display name' },
  { col: 'Company', source: 'Profile DOM', note: 'Organization / Company name' },
  { col: 'Primary Email', source: 'mailto link / regex scan', note: 'First & most relevant email' },
  { col: 'Secondary Emails', source: 'mailto link / regex scan', note: 'Comma-separated additional emails' },
  { col: 'Bio', source: 'Profile bio section', note: 'Developer bio statement' },
  { col: 'Location', source: 'Profile location field', note: 'City / Country' },
  { col: 'Website', source: 'Profile website link', note: 'Personal website or blog' },
  { col: 'Twitter / X', source: 'Social links', note: 'Twitter / X handle URL' },
  { col: 'LinkedIn', source: 'Social links', note: 'LinkedIn profile URL' },
  { col: 'Repositories', source: 'Profile stats', note: 'Public repository count' },
  { col: 'Followers', source: 'Profile stats', note: 'Number of followers' },
  { col: 'Following', source: 'Profile stats', note: 'Number of accounts followed' },
  { col: 'GitHub URL', source: 'Browser address bar', note: 'Direct link to profile' },
  { col: 'Notes', source: 'Manual entry', note: 'Empty column reserved for your personal notes' },
] as const;

const LINKEDIN_COLUMNS = [
  { col: 'Timestamp', source: 'System clock', note: 'ISO 8601 — when button was clicked' },
  { col: 'Name', source: 'Top card DOM', note: 'Lead full display name' },
  { col: 'Headline', source: 'Top card DOM', note: 'Professional headline / current title' },
  { col: 'About / Summary', source: 'About section DOM', note: 'Full bio text for email personalization' },
  { col: 'Company', source: 'Experience DOM', note: 'Current organization' },
  { col: 'Location', source: 'Top card DOM', note: 'Stated city / country' },
  { col: 'Primary Email', source: 'Contact info / regex', note: 'Primary email address' },
  { col: 'Secondary Emails', source: 'Contact info / regex', note: 'Comma-separated secondary emails' },
  { col: 'LinkedIn Profile URL', source: 'Browser address bar', note: 'Direct link to LinkedIn profile' },
  { col: 'Website / Contact Link', source: 'Contact info DOM', note: 'Personal website / portfolio link' },
  { col: 'Connection Degree', source: 'Top card DOM', note: '1st, 2nd, or 3rd degree connection' },
  { col: 'Source Platform', source: 'Extension system', note: 'Set to "LinkedIn"' },
  { col: 'Notes', source: 'Manual entry', note: 'Empty column reserved for your personal notes' },
] as const;

export function SheetColumns() {
  return (
    <div className="flex flex-col gap-8">
      {/* GitHub Columns */}
      <div>
        <h3 className="text-sm font-bold text-[#e6edf3] mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
          GitHub Leads Sheet Columns (<code className="text-xs text-indigo-300">GitHub Leads</code>)
        </h3>
        <div className="border border-[#30363d] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161b22] border-b border-[#30363d] text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
              <tr>
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#e6edf3]">
              {GITHUB_COLUMNS.map(({ col, source, note }) => (
                <tr key={col} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2.5">
                    <code className="bg-[#21262d] text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {col}
                    </code>
                  </td>
                  <td className="px-4 py-2.5">{source}</td>
                  <td className="px-4 py-2.5 text-[#8b949e]">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LinkedIn Columns */}
      <div>
        <h3 className="text-sm font-bold text-[#e6edf3] mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          LinkedIn Leads Sheet Columns (<code className="text-xs text-blue-300">LinkedIn Leads</code>)
        </h3>
        <div className="border border-[#30363d] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161b22] border-b border-[#30363d] text-[11px] font-semibold uppercase tracking-wider text-[#8b949e]">
              <tr>
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d] text-[#e6edf3]">
              {LINKEDIN_COLUMNS.map(({ col, source, note }) => (
                <tr key={col} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2.5">
                    <code className="bg-[#21262d] text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {col}
                    </code>
                  </td>
                  <td className="px-4 py-2.5">{source}</td>
                  <td className="px-4 py-2.5 text-[#8b949e]">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-[#8b949e] leading-relaxed">
        <InfoIcon size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p>
          Both sheets include a dedicated <strong className="text-[#e6edf3]">Notes</strong> column at the end left intentionally empty so you can add custom status, follow-up dates, or email drafts manually in Google Sheets.
        </p>
      </div>
    </div>
  );
}
