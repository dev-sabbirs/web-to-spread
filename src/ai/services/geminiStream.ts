import { AI_CONFIG, SYSTEM_INSTRUCTIONS, type AiMode } from '../config';
import { getFormattedTrainingPrompt } from './knowledgeLoader';
import { type UserProfile, recordAiUsage } from '../../shared/storage';

export interface StreamParams {
  apiKey: string;
  model?: string;
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
  model = AI_CONFIG.DEFAULT_MODEL,
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
  const targetModel = model || AI_CONFIG.DEFAULT_MODEL;

  // 1. Generate Subject Line First
  if (onSubject) {
    try {
      const subjRes = await fetch(
        `${AI_CONFIG.BASE_URL}/${targetModel}:generateContent?key=${apiKey}`,
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
      // non-fatal subject error
    }
  }

  // 2. Stream Full Email Body SSE
  const senderContext = senderProfile
    ? `Sender Profile (You):
- Name: ${senderProfile.name}
- Role/Title: ${senderProfile.title}
- Email: ${senderProfile.email || 'N/A'}
- Portfolio: ${senderProfile.website || 'N/A'}
- Bio/Background: ${senderProfile.bio}
- Pitch Offer: ${senderProfile.pitchGoal}`
    : '';

  const userContextPrompt = `Goal: ${prompt}\nTone: ${tone}\n\n${senderContext}\n\n${
    leadContext
      ? `Recipient Context: Name: ${leadContext.name || 'Prospect'}, Title: ${
          leadContext.headline || ''
        }, Bio: ${leadContext.bio || 'N/A'}`
      : ''
  }`;

  const res = await fetch(
    `${AI_CONFIG.BASE_URL}/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemInstructionText },
              { text: trainingContext },
              { text: userContextPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
  );

  if (!res.ok || !res.body) {
    const errText = await res.text();
    throw new Error(`Gemini Stream Error (${res.status}): ${errText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
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

  // Record dynamic streaming token consumption
  const promptTokens = Math.ceil((prompt.length + systemInstructionText.length + trainingContext.length) / 4);
  const responseTokens = Math.ceil(accumulatedHtml.length / 4);
  recordAiUsage(promptTokens, responseTokens, targetModel).catch(() => {});
}
