import { AI_CONFIG, SYSTEM_INSTRUCTIONS } from '../config';
import type { UserProfile } from '../../shared/storage';

export interface GenerateParams {
  apiKey: string;
  prompt: string;
  tone?: string;
  leadContext?: { name?: string; headline?: string; bio?: string };
  senderProfile?: UserProfile;
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
  senderProfile,
}: GenerateParams): Promise<GeneratedEmailResult> {
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
          parts: [{ text: SYSTEM_INSTRUCTIONS.client.email }, { text: userContextPrompt }],
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
