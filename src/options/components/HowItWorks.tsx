const STEPS = [
  {
    n: '1',
    title: 'Create a Google Sheet',
    body: 'Go to sheets.google.com and create a new spreadsheet. Rename the first tab to "Leads" (or your preferred name).',
  },
  {
    n: '2',
    title: 'Open Apps Script',
    body: 'In the spreadsheet click Extensions → Apps Script. Delete the placeholder code and paste the script from APPS_SCRIPT.md in the project folder.',
  },
  {
    n: '3',
    title: 'Deploy as Web App',
    body: 'Click Deploy → New deployment. Select Web app. Set Execute as: Me and Who has access: Anyone. Click Deploy and authorize.',
  },
  {
    n: '4',
    title: 'Paste the URL above',
    body: 'After deploying, copy the Web app URL (https://script.google.com/macros/s/…/exec) and paste it in the Settings form above. Then click Save.',
  },
] as const;

export function HowItWorks() {
  return (
    <div className="flex flex-col">
      {STEPS.map((step, idx) => (
        <div className="flex gap-4 relative pb-7 last:pb-0" key={step.n}>
          {idx !== STEPS.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#21262d]" />
          )}
          <div className="w-8 h-8 rounded-full bg-[#161b22] border-2 border-indigo-500 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 z-10">
            {step.n}
          </div>
          <div className="pt-1">
            <h4 className="text-sm font-semibold text-[#e6edf3]">{step.title}</h4>
            <p className="text-xs text-[#8b949e] leading-relaxed mt-1">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
