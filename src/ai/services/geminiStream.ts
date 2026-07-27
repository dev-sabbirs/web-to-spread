import { AI_CONFIG, SYSTEM_INSTRUCTIONS, type AiMode } from '../config';
import { getFormattedTrainingPrompt } from './knowledgeLoader';
import type { UserProfile } from '../../shared/storage';

export interface StreamParams {
  apiKey: string;
  prompt: string;
  tone: string;
  mode?: AiMode;
  leadContext?: { name?: string; headline?: string; bio?: string };
  senderProfile?: UserProfile;
  onChunk: (text: string) => void;
  onSubject?: (subject: string) => void;
}

export async function streamEmailGeneration({
  apiKey,
  prompt,
  tone,
  mode = 'client',
  leadContext,
  senderProfile,
  onChunk,
  onSubject,
}: StreamParams): Promise<void> {
  const trainingContext = getFormattedTrainingPrompt(mode);
  const systemInstructionText = SYSTEM_INSTRUCTIONS[mode].stream;

  // 1. Generate Subject Line First
  if (onSubject) {
    try {
      const subjRes = await fetch(
        `${AI_CONFIG.BASE_URL}/${AI_CONFIG.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a short, compelling email subject line for reaching out to (${
                      leadContext?.name || 'Recipient'
                    } - ${leadContext?.headline || ''}) for ${
                      mode === 'job' ? 'a Software Engineer Job Opportunity' : 'Client Acquisition Web Development'
                    } with goal: ${prompt}. Output ONLY the subject line text.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (subjRes.ok) {
        const subjData = await subjRes.json();
        const subjText = subjData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (subjText) {
          onSubject(subjText.replace(/^Subject:\s*/i, '').replace(/^"|"$/g, ''));
        }
      }
    } catch {
      // subject fallback
    }
  }

  // 2. Stream Email Body Content
  const senderContext = senderProfile
    ? `Sender Profile (You):
- Name: ${senderProfile.name || 'Sabbir'}
- Role/Title: ${senderProfile.title || 'Software Engineer'}
- Email: ${senderProfile.email || 'N/A'}
- Portfolio: ${senderProfile.website || 'N/A'}
- Bio/Background: ${senderProfile.bio || 'N/A'}
- Pitch Offer: ${senderProfile.pitchGoal || 'N/A'}`
    : '';

  const userPrompt = `Mode: ${mode.toUpperCase()} OUTREACH
Outreach Goal: ${prompt}
Tone: ${tone}

${senderContext}

${
  leadContext
    ? `Target Recipient Details:
- Name: ${leadContext.name || 'Recipient'}
- Headline/Title: ${leadContext.headline || 'Professional'}
- Context/Bio: ${leadContext.bio || 'N/A'}`
    : ''
}

Please write a highly tailored email body matching the sender background, recipient context, and mode instructions.`;

  const systemInstructionWithTraining = `${systemInstructionText}${trainingContext}`;

  const streamUrl = `${AI_CONFIG.BASE_URL}/${AI_CONFIG.DEFAULT_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const response = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemInstructionWithTraining }, { text: userPrompt }],
        },
      ],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Gemini Stream Error (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedHtml = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonStr = line.replace(/^data:\s*/, '');
          const parsed = JSON.parse(jsonStr);
          const textChunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textChunk) {
            accumulatedHtml += textChunk;
            const cleanHtml = accumulatedHtml.replace(/```html/g, '').replace(/```/g, '');
            onChunk(cleanHtml);
          }
        } catch {
          // ignore chunk parse
        }
      }
    }
  }
}
