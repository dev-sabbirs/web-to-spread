import { AI_CONFIG, SYSTEM_INSTRUCTIONS } from '../config';

export interface StreamParams {
  apiKey: string;
  prompt: string;
  tone: string;
  leadContext?: { name?: string; headline?: string; bio?: string };
  onChunk: (text: string) => void;
  onSubject?: (subject: string) => void;
}

export async function streamEmailGeneration({
  apiKey,
  prompt,
  tone,
  leadContext,
  onChunk,
  onSubject,
}: StreamParams): Promise<void> {
  // 1. Generate Subject First
  if (onSubject) {
    try {
      const subjRes = await fetch(
        `${AI_CONFIG.BASE_URL}/${AI_CONFIG.DEFAULT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate ONLY a short subject line for an email with goal: ${prompt}` }] }],
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

  // 2. Stream Body Content
  const userPrompt = `Goal: ${prompt}\nTone: ${tone}\n${
    leadContext?.name ? `Recipient Name: ${leadContext.name}\n` : ''
  }${leadContext?.headline ? `Recipient Title: ${leadContext.headline}` : ''}`;

  const streamUrl = `${AI_CONFIG.BASE_URL}/${AI_CONFIG.DEFAULT_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const response = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_INSTRUCTIONS.STREAM_COPYWRITER }, { text: userPrompt }],
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
          // ignore step parsing
        }
      }
    }
  }
}
