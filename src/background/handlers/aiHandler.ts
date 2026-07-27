import type {
  GenerateAiEmailMessage,
  MessageResponse,
} from "../../shared/types";

/**
 * Isolated Gemini AI Service Worker Handler.
 * Designed to call Google AI Studio Gemini API with customizable system instructions,
 * lead profile context, and prompt templates for future training and fine-tuning.
 */
export async function handleGenerateAiEmail(
  payload: Omit<GenerateAiEmailMessage, "type">,
): Promise<MessageResponse> {
  const apiKey = import.meta.env.VITE_AISTUDIO_GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "VITE_AISTUDIO_GEMINI_API_KEY is not set in your .env file.",
    };
  }

  const { prompt, tone = "Professional & Friendly", leadContext } = payload;

  const systemInstruction = `You are an elite AI email copywriter specializing in high-converting, personalized outreach.
Your task is to write a subject line and clean HTML email body.
Strict Rules:
1. Always format output as JSON with two keys: "subject" and "htmlBody".
2. The "htmlBody" MUST use clean semantic HTML tags (<p>, <strong>, <em>, <ul>, <li>, <h2>, <a href="...">).
3. Do NOT include markdown code blocks (\`\`\`json). Return ONLY valid raw JSON text.`;

  const userContextPrompt = `
Goal/Instructions: ${prompt}
Tone of Voice: ${tone}
${
  leadContext
    ? `Target Recipient Context:
- Name: ${leadContext.name || "Prospect"}
- Headline/Title: ${leadContext.headline || "Professional"}
- Bio/Notes: ${leadContext.bio || "N/A"}`
    : ""
}

Please generate the JSON output containing "subject" and "htmlBody".`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction }, { text: userContextPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Gemini API call failed (${res.status}): ${errText}`,
      };
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return {
        success: false,
        error: "Empty response returned from Gemini API.",
      };
    }

    const cleanJsonText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanJsonText);

    return {
      success: true,
      data: {
        headers: ["subject", "htmlBody"],
        rows: [[parsed.subject || "", parsed.htmlBody || ""]],
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error communicating with Gemini API worker.",
    };
  }
}
