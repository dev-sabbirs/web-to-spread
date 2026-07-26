import { InfoIcon } from '../icons';

const COLUMNS = [
  { col: 'Timestamp', source: 'System clock', note: 'ISO 8601 — when button was clicked' },
  { col: 'Username', source: 'URL path', note: 'e.g. github.com/torvalds → torvalds' },
  { col: 'Full Name', source: 'Profile DOM', note: 'Public display name' },
  { col: 'Company', source: 'Profile DOM', note: 'Organization/Company name' },
  { col: 'Primary Email', source: 'mailto link / regex scan', note: 'First & most relevant email' },
  { col: 'Secondary Emails', source: 'mailto link / regex scan', note: 'Comma-separated additional emails' },
  { col: 'Bio', source: 'Profile bio section', note: 'User bio statement' },
  { col: 'Location', source: 'Profile location field', note: 'City / Country' },
  { col: 'Website', source: 'Profile website link', note: 'Personal website or blog' },
  { col: 'Twitter / X', source: 'Social links', note: 'Twitter / X handle URL' },
  { col: 'LinkedIn', source: 'Social links', note: 'LinkedIn profile URL' },
  { col: 'Repositories', source: 'Profile stats', note: 'Public repository count' },
  { col: 'Followers', source: 'Profile stats', note: 'Number of followers' },
  { col: 'Following', source: 'Profile stats', note: 'Number of accounts followed' },
  { col: 'GitHub URL', source: 'Browser address bar', note: 'Direct link to profile' },
] as const;

export function SheetColumns() {
  return (
    <div className="flex flex-col gap-4">
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
            {COLUMNS.map(({ col, source, note }) => (
              <tr key={col} className="hover:bg-white/[0.02] transition-colors">
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

      <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-[#8b949e] leading-relaxed">
        <InfoIcon size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <p>
          Emails are only captured if the engineer has set their GitHub email to{' '}
          <strong className="text-[#e6edf3]">Public</strong> in their account settings. Many engineers keep it private —
          in that case you'll still get username, bio, location, and LinkedIn.
        </p>
      </div>
    </div>
  );
}
