export const AI_CONFIG = {
  DEFAULT_MODEL: 'gemini-3.6-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

export type AiMode = 'client' | 'job';

export const MODE_PRESETS: Record<AiMode, { label: string; prompt: string }[]> = {
  client: [
    {
      label: 'Website Pitch for Client',
      prompt: 'Offer a fast, modern personal website to strengthen their brand & attract more clients.',
    },
    {
      label: 'Portfolio Refresh Audit',
      prompt: 'Compliment their current role & offer to build/refresh their online portfolio with SEO.',
    },
    {
      label: 'Consultation Call',
      prompt: 'Propose a brief introductory chat to discuss digital presence and web engineering ideas.',
    },
    {
      label: 'Follow Up',
      prompt: 'Friendly, professional check-in regarding our previous outreach message.',
    },
  ],
  job: [
    {
      label: 'Software Engineer Application',
      prompt: 'Express interest in Software Engineer / Web Engineer roles at their company.',
    },
    {
      label: 'Recruiter / Hiring Manager Connect',
      prompt: 'Direct outreach to recruiter highlighting technical skills and portfolio.',
    },
    {
      label: 'Referral / Networking Intro',
      prompt: 'Inquire about open engineering positions and team growth opportunities.',
    },
    {
      label: 'Job Application Follow Up',
      prompt: 'Follow up on job application / previous conversation regarding engineering opening.',
    },
  ],
};

export const TONE_OPTIONS = [
  'Professional & Warm (US Tone)',
  'Direct & Concise',
  'Persuasive & High Value',
  'Casual & Friendly',
] as const;

export const SYSTEM_INSTRUCTIONS: Record<AiMode, { email: string; stream: string }> = {
  client: {
    email: `You are an elite Software Engineer targeting US professionals & business owners for web development services.
Follow this formula:
1. Warm opening citing their role/industry.
2. Respectful observation of how a personal website will strengthen their brand & attract clients.
3. Introduce yourself as a Software Engineer building fast, modern, mobile & SEO-optimized sites.
4. Low-friction Call-To-Action ("If you're ever considering refreshing your online presence...").
Output raw JSON with "subject" and "htmlBody".`,
    stream: `You are an elite Software Engineer targeting US professionals & business owners for web development services.
Follow this formula:
- Personal greeting mentioning their specific field/headline.
- Highlight the business value of a dedicated personal website for brand & client acquisition.
- Introduce yourself as a Software Engineer building fast, modern, SEO-optimized sites.
- Low-pressure, respectful Call-To-Action.
Output ONLY clean semantic HTML (<p>, <strong>, <em>, <ul>, <li>, <h2>, <a href="...">). No markdown blocks.`,
  },
  job: {
    email: `You are a talented Software Engineer reaching out to engineering managers, recruiters, and tech leads for software developer jobs.
Follow this formula:
1. Respectful greeting acknowledging their leadership at the company.
2. Express genuine interest in software engineering / full-stack developer roles.
3. Highlight core tech stack (React, TypeScript, Node.js, Web Applications, Extensions) and problem-solving drive.
4. Clear, confident Call-To-Action proposing a brief chat or sharing resume/portfolio.
Output raw JSON with "subject" and "htmlBody".`,
    stream: `You are a talented Software Engineer reaching out to engineering managers, recruiters, and tech leads for software developer jobs.
Follow this formula:
- Respectful greeting acknowledging their leadership at the company.
- Express interest in software engineering / web engineering opportunities.
- Highlight core technical skills (React, TypeScript, modern web engineering, web tools).
- Clear, confident Call-To-Action to discuss how you can contribute to their engineering team.
Output ONLY clean semantic HTML (<p>, <strong>, <em>, <ul>, <li>, <h2>, <a href="...">). No markdown blocks.`,
  },
};
