import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — List quizzes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')
    const contentId = searchParams.get('contentId')

    if (!orgId) {
      return NextResponse.json(
        { error: 'Missing orgId' },
        { status: 400 },
      )
    }

    let query = supabaseAdmin.from('quizzes').select('*').eq('org_id', orgId)

    if (contentId) {
      query = query.eq('content_id', contentId)
    }

    const { data, error } = await query

    if (error) {
      console.error('GET /api/quiz error:', error)
      return NextResponse.json(
        { error: 'Failed to load quizzes' },
        { status: 500 },
      )
    }

    return NextResponse.json({ quizzes: data ?? [] })
  } catch (e) {
    console.error('GET /api/quiz unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// POST — Create quiz
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      orgId,
      contentId,
      title,
      questions,
      timeLimitSeconds,
      passPercent,
      createdBy,
    }: {
      orgId: string
      contentId: string | null
      title: string
      questions: any
      timeLimitSeconds: number
      passPercent: number
      createdBy: string
    } = body

    if (!orgId || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing or invalid fields' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .insert({
        org_id: orgId,
        content_id: contentId,
        title,
        questions,
        time_limit_seconds: timeLimitSeconds,
        pass_percent: passPercent,
        created_by: createdBy,
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error('POST /api/quiz error:', error)
      return NextResponse.json(
        { error: 'Failed to create quiz' },
        { status: 500 },
      )
    }

    return NextResponse.json({ quiz: data })
  } catch (e) {
    console.error('POST /api/quiz unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

