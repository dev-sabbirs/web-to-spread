import { AI_CONFIG, SYSTEM_INSTRUCTIONS } from '../config';

export interface GenerateParams {
  apiKey: string;
  prompt: string;
  tone?: string;
  leadContext?: { name?: string; headline?: string; bio?: string };
}

export interface GeneratedEmailResult {
  subject: string;
  htmlBody: string;
}

export async function generateEmailWithGemini({
  apiKey,
  prompt,
  tone = 'Professional',
  leadContext,
}: GenerateParams): Promise<GeneratedEmailResult> {
  const userContextPrompt = `Goal: ${prompt}\nTone: ${tone}\n${
    leadContext
      ? `Recipient Context: Name: ${leadContext.name || 'Prospect'}, Title: ${
          leadContext.headline || 'Professional'
        }, Bio: ${leadContext.bio || 'N/A'}`
      : ''
  }\nPlease generate JSON output containing "subject" and "htmlBody".`;

  const url = `${AI_CONFIG.BASE_URL}/${AI_CONFIG.DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_INSTRUCTIONS.EMAIL_COPYWRITER }, { text: userContextPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API.');

  const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJsonText);

  return {
    subject: parsed.subject || '',
    htmlBody: parsed.htmlBody || '',
  };
}
