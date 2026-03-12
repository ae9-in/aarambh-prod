import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — User notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const userId = searchParams.get('userId')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Number(limitParam) || 20 : 20

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('notifications GET error', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ notifications: data ?? [] })
  } catch (e) {
    console.error('notifications GET route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

type MarkReadBody = {
  userId?: string
  notificationId?: string
  markAll?: boolean
}

// PATCH — Mark read
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as MarkReadBody
    const { userId, notificationId, markAll } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    let query = supabaseAdmin.from('notifications').update({ is_read: true })

    if (markAll) {
      query = query.eq('user_id', userId)
    } else if (notificationId) {
      query = query.eq('id', notificationId).eq('user_id', userId)
    } else {
      return NextResponse.json(
        { error: 'Either markAll or notificationId must be provided' },
        { status: 400 },
      )
    }

    const { error } = await query

    if (error) {
      console.error('notifications PATCH error', error)
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('notifications PATCH route error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

