import { GoogleGenAI } from '@google/genai';

interface RecommendationContext {
  mood: 'low' | 'moderate' | 'high';
  timeAvailable: number; // minutes
  assignments: any[];
  exams: any[];
  studyHistory: any[];
  preferences: any;
  currentTime: Date;
}

export async function getStudyRecommendation(context: RecommendationContext) {
  const prompt = `
You are an AI study assistant helping a student decide what to study right now.

STUDENT CONTEXT:
- Current Mood/Energy: ${context.mood}
- Available Time: ${context.timeAvailable} minutes
- Current Time: ${context.currentTime.toLocaleString()}

UPCOMING DEADLINES:
${JSON.stringify(context.assignments.slice(0, 5), null, 2)}

UPCOMING EXAMS:
${JSON.stringify(context.exams.slice(0, 3), null, 2)}

RECENT STUDY HISTORY:
${JSON.stringify(context.studyHistory.slice(0, 5), null, 2)}

STUDENT PREFERENCES:
${JSON.stringify(context.preferences, null, 2)}

TASK:
Based on the student's current energy level, available time, and deadlines, recommend ONE specific task they should work on right now.

RULES:
1. Match task difficulty to energy level:
   - LOW energy → Easy tasks (coding practice, review, light reading)
   - MODERATE energy → Medium tasks (assignment sections, practice problems)
   - HIGH energy → Hard tasks (deep exam prep, complex assignments, essay writing)

2. Prioritize urgent deadlines (due within 24-48 hours)

3. Break large tasks into time-appropriate chunks

4. Consider study history (don't repeat same task type too often)

5. Respect preferences (study style, preferred times)

RESPONSE FORMAT (JSON only, no explanation):
{
  "task_type": "assignment|exam_prep|typing_game|general_study",
  "task_id": "uuid or null for new task",
  "task_name": "Specific task name",
  "description": "What exactly to work on (be specific)",
  "reasoning": "Why this task now (1-2 sentences)",
  "sub_steps": ["Step 1", "Step 2", "Step 3"],
  "estimated_completion": 25
}
`;

  const apiKey = process.env.GEMINI_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey?.trim()) {
    console.warn('GEMINI_KEY is not set; using fallback recommendation.');
    return getFallbackRecommendation(context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    const responseText = (response.text ?? '')?.trim() ?? '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    data.task_type = normalizeTaskType(data.task_type);
    return data;
  } catch (error: unknown) {
    const isRateLimit =
      (error as { status?: number })?.status === 429 ||
      String((error as Error)?.message ?? '').includes('429') ||
      String((error as Error)?.message ?? '')
        .toLowerCase()
        .includes('quota');
    if (isRateLimit) {
      console.warn('Gemini rate limit (429); using fallback recommendation.');
    } else {
      console.error('AI recommendation error:', error);
    }
    return getFallbackRecommendation(context);
  }
}

function normalizeTaskType(
  raw: unknown,
): 'assignment' | 'exam_prep' | 'general_study' | 'typing_game' {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'assignment') return 'assignment';
  if (s === 'exam_prep' || s === 'exam') return 'exam_prep';
  if (s === 'coding' || s === 'typing_game') return 'typing_game';
  return 'general_study';
}

function getFallbackRecommendation(context: RecommendationContext) {
  return {
    task_type: 'typing_game',
    task_id: null,
    task_name: 'Code Typing Practice',
    description: 'Practice typing code to improve muscle memory',
    reasoning:
      'AI service temporarily unavailable. Default to code practice as a productive use of time.',
    sub_steps: [
      'Choose a programming language',
      'Complete 5-minute typing challenge',
      'Review mistakes and retry',
    ],
    estimated_completion: Math.min(context.timeAvailable, 15),
  };
}
