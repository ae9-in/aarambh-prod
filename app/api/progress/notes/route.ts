import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST — Save lesson notes
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      userId,
      contentId,
      notes,
    }: {
      userId: string
      contentId: string
      notes: string
    } = body

    if (!userId || !contentId) {
      return NextResponse.json(
        { error: 'Missing userId or contentId' },
        { status: 400 },
      )
    }

    // Get existing progress to retain org / other fields
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('user_progress')
      .select('id,org_id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle()

    if (existingError) {
      console.error('Fetch existing notes error:', existingError)
    }

    let orgId = existing?.org_id as string | undefined

    if (!orgId) {
      const { data: content, error: contentError } = await supabaseAdmin
        .from('content')
        .select('org_id')
        .eq('id', contentId)
        .maybeSingle()

      if (contentError) {
        console.error('Content org fetch error (notes):', contentError)
      }
      orgId = content?.org_id
    }

    if (!orgId) {
      return NextResponse.json(
        { error: 'Could not resolve org for content' },
        { status: 400 },
      )
    }

    if (existing?.id) {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ notes })
        .eq('id', existing.id)

      if (error) {
        console.error('Update notes error:', error)
        return NextResponse.json(
          { error: 'Failed to save notes' },
          { status: 500 },
        )
      }
    } else {
      const { error } = await supabaseAdmin.from('user_progress').insert({
        user_id: userId,
        content_id: contentId,
        org_id: orgId,
        status: 'IN_PROGRESS',
        progress_percent: 0,
        time_spent_minutes: 0,
        notes,
      })

      if (error) {
        console.error('Insert notes progress error:', error)
        return NextResponse.json(
          { error: 'Failed to create notes record' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ saved: true })
  } catch (e) {
    console.error('POST /api/progress/notes unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

