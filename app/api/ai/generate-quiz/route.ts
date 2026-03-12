import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { openai } from '@/lib/openai'

type GenerateQuizRequestBody = {
  contentId?: string
  count?: number
  orgId?: string
}

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateQuizRequestBody
    const { contentId, count, orgId } = body

    if (!contentId || !count || !orgId) {
      return NextResponse.json(
        { error: 'Missing contentId, count, or orgId' },
        { status: 400 },
      )
    }

    // 1. Get chunks for content
    const { data: chunks, error } = await supabaseAdmin
      .from('ai_chunks')
      .select<'chunk_text', { chunk_text: string }>('chunk_text')
      .eq('content_id', contentId)
      .limit(10)

    if (error) {
      console.error('generate-quiz: chunks fetch error', error)
      return NextResponse.json({ error: 'Failed to fetch content chunks' }, { status: 500 })
    }

    if (!chunks || !chunks.length) {
      return NextResponse.json({ error: 'No chunks found for content' }, { status: 404 })
    }

    // 2. Build context
    const context = chunks.map((c) => c.chunk_text).join('\n')

    // 3. Prompt for MCQs
    const prompt = `You are an expert corporate training quiz creator.
Using the following training content, generate ${count} multiple-choice (MCQ) questions.

Content:
${context}

Return ONLY a valid JSON array, no markdown, no explanation outside JSON:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "string"
  }
]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'You create high-quality training quizzes for Indian corporate learners. Follow the user instructions strictly.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // 4. Parse safely with try/catch
    let questions: QuizQuestion[] = []
    try {
      const trimmed = raw.trim()
      const jsonLike = trimmed.startsWith('```')
        ? trimmed.replace(/```json|```/g, '').trim()
        : trimmed
      const parsed = JSON.parse(jsonLike)
      if (Array.isArray(parsed)) {
        questions = parsed as QuizQuestion[]
      }
    } catch (e) {
      console.error('generate-quiz: JSON parse error', e, 'raw:', raw)
      questions = []
    }

    // 5. Return questions (may be empty if parsing failed)
    return NextResponse.json({ questions })
  } catch (e) {
    console.error('generate-quiz route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

