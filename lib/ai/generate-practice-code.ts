import { GoogleGenAI } from '@google/genai';

const MOOD_GUIDE = {
  low: 'short, simple snippets (e.g. a small function or 3–5 lines). Easy syntax, minimal logic.',
  moderate:
    'medium snippets (e.g. one function with a loop or condition, ~10–20 lines). Mix of syntax and light logic.',
  high: 'longer, more challenging snippets (e.g. a small algorithm or class, ~25–40 lines). Include brackets, nesting, and varied syntax.',
} as const;

const TIME_GUIDE = {
  short: 'about 1–2 minutes to type (very short snippet)',
  medium: 'about 3–5 minutes to type (medium snippet)',
  long: 'about 5–10 minutes to type (longer snippet)',
} as const;

function getTimeCategory(minutes: number): keyof typeof TIME_GUIDE {
  if (minutes <= 20) return 'short';
  if (minutes <= 45) return 'medium';
  return 'long';
}

const LANGUAGES = ['javascript', 'python', 'typescript', 'java', 'cpp', 'rust'] as const;
export type PracticeLanguage = (typeof LANGUAGES)[number];

export interface GeneratePracticeCodeOptions {
  mood: 'low' | 'moderate' | 'high';
  timeAvailable: number;
  language?: PracticeLanguage;
}

export async function generatePracticeCode(options: GeneratePracticeCodeOptions): Promise<{
  code: string;
  language: PracticeLanguage;
}> {
  const apiKey = process.env.GEMINI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const lang = options.language ?? 'javascript';
  const moodGuide = MOOD_GUIDE[options.mood];
  const timeCat = getTimeCategory(options.timeAvailable);
  const timeGuide = TIME_GUIDE[timeCat];

  const prompt = `You are a coding teacher. Generate exactly ONE code snippet for typing practice.

Rules:
- Language: ${lang}
- Mood/energy level: ${options.mood}. Snippet should be ${moodGuide}
- Time available: ${options.timeAvailable} minutes. Snippet should take ${timeGuide}
- Output ONLY the raw code, no markdown fences, no explanation, no "Here is the code" text
- Use valid ${lang} syntax. The snippet must be copy-paste runnable (e.g. a function or small block)
- Prefer one cohesive block (one function, one class, or one small script)
- Do not include line numbers or comments that explain the snippet
- Keep indentation and newlines consistent (use spaces, 2 or 4 spaces per indent)

Generate the snippet now (only code, nothing else):`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    const text = (response.text ?? '').trim();

    if (!text || !text.trim()) {
      throw new Error('Gemini returned empty code');
    }

    // Strip markdown code blocks if the model added them
    let code = text.trim();
    const fenceMatch = code.match(/^```(?:\w+)?\s*\n?([\s\S]*?)```/m);
    if (fenceMatch) {
      code = fenceMatch[1].trim();
    }

    return { code, language: lang };
  } catch (err: unknown) {
    const msg = String((err as Error)?.message ?? '');
    const isRateLimit =
      (err as { status?: number })?.status === 429 ||
      msg.includes('429') ||
      msg.toLowerCase().includes('quota');
    if (isRateLimit) {
      console.warn('Gemini rate limit (429) in generate-practice-code.');
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }
    throw err;
  }
}
