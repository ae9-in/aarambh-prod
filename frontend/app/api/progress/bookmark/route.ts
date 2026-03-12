import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST — Toggle bookmark
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, contentId }: { userId: string; contentId: string } = body

    if (!userId || !contentId) {
      return NextResponse.json(
        { error: 'Missing userId or contentId' },
        { status: 400 },
      )
    }

    // Get existing progress to know current bookmark + org
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('user_progress')
      .select('id,is_bookmarked,org_id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle()

    if (existingError) {
      console.error('Fetch existing bookmark error:', existingError)
    }

    // If we don't know org_id yet, infer from content
    let orgId = existing?.org_id as string | undefined
    if (!orgId) {
      const { data: content, error: contentError } = await supabaseAdmin
        .from('content')
        .select('org_id')
        .eq('id', contentId)
        .maybeSingle()

      if (contentError) {
        console.error('Content org fetch error:', contentError)
      }
      orgId = content?.org_id
    }

    if (!orgId) {
      return NextResponse.json(
        { error: 'Could not resolve org for content' },
        { status: 400 },
      )
    }

    const newIsBookmarked = !existing?.is_bookmarked

    if (existing?.id) {
      const { error } = await supabaseAdmin
        .from('user_progress')
        .update({ is_bookmarked: newIsBookmarked })
        .eq('id', existing.id)

      if (error) {
        console.error('Update bookmark error:', error)
        return NextResponse.json(
          { error: 'Failed to update bookmark' },
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
        is_bookmarked: true,
      })

      if (error) {
        console.error('Insert bookmark progress error:', error)
        return NextResponse.json(
          { error: 'Failed to create bookmark' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ isBookmarked: newIsBookmarked })
  } catch (e) {
    console.error('POST /api/progress/bookmark unexpected:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

