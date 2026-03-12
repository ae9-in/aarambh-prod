import { NextResponse, type NextRequest } from 'next/server'
import { openai } from '@/lib/openai'

type GenerateRequestBody = {
  topic?: string
  tone?: string
  targetRole?: string
  orgId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequestBody
    const { topic, tone, targetRole } = body

    if (!topic || !tone || !targetRole) {
      return NextResponse.json(
        { error: 'Missing topic, tone, or targetRole' },
        { status: 400 },
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert corporate training content writer for Indian businesses.',
        },
        {
          role: 'user',
          content: `Write a training document about "${topic}" for ${targetRole} employees. Tone: ${tone}. Format: Markdown with ## headings and bullet points.
Sections: Overview, Learning Objectives, Key Concepts, Best Practices, Common Mistakes, Summary. 600-800 words. India-relevant examples.`,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0

    return NextResponse.json({ content, wordCount })
  } catch (e) {
    console.error('generate route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

