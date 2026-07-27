import verifiedOutreach1 from '../knowledge/verified_outreach_1.txt?raw';
import jobPlacement1 from '../knowledge/job_placement_1.txt?raw';
import type { AiMode } from '../config';

export function getFormattedTrainingPrompt(mode: AiMode = 'client'): string {
  const examples =
    mode === 'job'
      ? [
          {
            name: 'Software Engineer Job Outreach Example',
            content: jobPlacement1,
          },
        ]
      : [
          {
            name: 'Client Acquisition Outreach Example',
            content: verifiedOutreach1,
          },
        ];

  const concatenated = examples
    .map((ex, idx) => `--- Training Example ${idx + 1}: ${ex.name} ---\n${ex.content.trim()}`)
    .join('\n\n');

  return `\n\n=== VERIFIED HIGH-CONVERTING OUTREACH TRAINING EXAMPLES (${mode.toUpperCase()} MODE) ===\nUse the tone, structure, and style of these real examples as your primary benchmark:\n\n${concatenated}\n============================================================\n`;
}
