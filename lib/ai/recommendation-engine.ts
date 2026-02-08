import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
})

interface RecommendationContext {
    mood: 'low' | 'moderate' | 'high'
    timeAvailable: number // minutes
    assignments: any[]
    exams: any[]
    studyHistory: any[]
    preferences: any
    currentTime: Date
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
  "task_type": "assignment|exam|coding|reading|review",
  "task_id": "uuid or null for new task",
  "task_name": "Specific task name",
  "description": "What exactly to work on (be specific)",
  "reasoning": "Why this task now (1-2 sentences)",
  "sub_steps": ["Step 1", "Step 2", "Step 3"],
  "estimated_completion": 25
}
`

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })

        const responseText = message.content[0].type === 'text'
            ? message.content[0].text
            : ''

        // Parse JSON response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response')
        }

        return JSON.parse(jsonMatch[0])
    } catch (error) {
        console.error('AI recommendation error:', error)
        // Fallback recommendation
        return {
            task_type: 'coding',
            task_id: null,
            task_name: 'Code Typing Practice',
            description: 'Practice typing code to improve muscle memory',
            reasoning: 'AI service temporarily unavailable. Default to code practice as a productive use of time.',
            sub_steps: [
                'Choose a programming language',
                'Complete 5-minute typing challenge',
                'Review mistakes and retry'
            ],
            estimated_completion: Math.min(context.timeAvailable, 15)
        }
    }
}
