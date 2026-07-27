export const AI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.6-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

export const PRESET_PROMPTS = [
  { label: 'Cold Pitch', prompt: 'Write a personalized cold email pitch introducing our services.' },
  { label: 'Follow Up', prompt: 'Write a polite, direct follow-up email checking in on previous correspondence.' },
  { label: 'Meeting Request', prompt: 'Request a brief 15-minute introductory call.' },
] as const;

export const TONE_OPTIONS = [
  'Professional & Friendly',
  'Persuasive & High Energy',
  'Short & Direct',
  'Casual & Conversational',
] as const;

export const SYSTEM_INSTRUCTIONS = {
  EMAIL_COPYWRITER: `You are an elite AI email copywriter specializing in high-converting outreach.
Write a subject line and clean HTML body.
Rules:
1. Format output as JSON with "subject" and "htmlBody".
2. Use clean semantic HTML (<p>, <strong>, <em>, <ul>, <li>, <h2>, <a href="...">).
3. Do NOT include markdown code blocks. Return ONLY raw JSON text.`,
  STREAM_COPYWRITER: `You are an elite AI email copywriter. Write a clean, high-converting HTML email body based on the prompt.
Use clean semantic HTML (<p>, <strong>, <em>, <ul>, <li>, <h2>, <a href="...">). Do NOT wrap in markdown code blocks. Output ONLY raw HTML.`,
} as const;
