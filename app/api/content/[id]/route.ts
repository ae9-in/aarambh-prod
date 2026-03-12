import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminStorage } from '@/lib/firebase-admin'
import { getAccessibleCategoryIdsForUser } from '@/lib/category-access'

const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'arambh-prod.appspot.com'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const {
    data: content,
    error: contentError,
  } = await supabaseAdmin.from('content').select('*').eq('id', id).single()

  if (contentError || !content) {
    console.error('content fetch error:', contentError)
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  // Enforce category-level access for employee users.
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if ((content as any).org_id && (content as any).category_id && profile?.role) {
    const allowedCategoryIds = await getAccessibleCategoryIdsForUser(
      String((content as any).org_id),
      userId,
      String(profile.role),
    )
    if (!allowedCategoryIds.includes(String((content as any).category_id))) {
      return NextResponse.json({ error: 'Access denied for this category' }, { status: 403 })
    }
  }

  const {
    data: userProgress,
    error: progressError,
  } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', id)
    .maybeSingle()

  if (progressError) {
    console.error('user_progress fetch error:', progressError)
  }

  const currentViews = (content as any).view_count ?? 0
  const incrementPromise = supabaseAdmin
    .from('content')
    .update({ view_count: currentViews + 1 })
    .eq('id', id)

  const accessLogPromise = supabaseAdmin.from('access_logs').insert({
    action: 'VIEW',
    user_id: userId,
    content_id: id,
  })

  // Load reference materials from same category (non-video content)
  let materials: any[] = []
  if ((content as any).org_id && (content as any).category_id) {
    const { data: materialRows, error: materialError } = await supabaseAdmin
      .from('content')
      .select('id, title, type, file_url')
      .eq('org_id', (content as any).org_id)
      .eq('category_id', (content as any).category_id)
      .neq('id', id)
      .eq('is_published', true)
      .in('type', ['PDF', 'NOTE', 'PPT', 'LINK', 'AUDIO'])
      .order('created_at', { ascending: false })

    if (!materialError) {
      materials = materialRows ?? []
    } else {
      console.error('materials fetch error:', materialError)
    }
  }

  // Load quiz (if attached) from quizzes table
  let quiz: any = null
  const { data: quizRows, error: quizError } = await supabaseAdmin
    .from('quizzes')
    .select('id, title, questions, pass_percent, time_limit_seconds')
    .eq('content_id', id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!quizError) {
    quiz = (quizRows && quizRows.length > 0) ? quizRows[0] : null
  } else {
    // Keep page usable even if quizzes table isn't ready.
    console.error('quiz fetch error:', quizError)
  }

  // Fire-and-forget for side effects
  Promise.all([incrementPromise, accessLogPromise]).catch((e) => {
    console.error('view side effects error:', e)
  })

  return NextResponse.json(
    {
      content,
      progress: userProgress ?? null,
      materials,
      quiz,
    },
    { status: 200 },
  )
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await req.json()
    const {
      title,
      description,
      categoryId,
      isPublished,
      xpReward,
    }: {
      title?: string
      description?: string | null
      categoryId?: string
      isPublished?: boolean
      xpReward?: number | null
    } = body

    const updates: Record<string, unknown> = {}

    if (typeof title === 'string') updates.title = title
    if (description !== undefined) updates.description = description
    if (typeof categoryId === 'string') updates.category_id = categoryId
    if (typeof isPublished === 'boolean') updates.is_published = isPublished
    if (xpReward !== undefined) updates.xp_reward = xpReward

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      console.error('content update error:', error)
      return NextResponse.json({ error: 'Failed to update content' }, { status: 400 })
    }

    return NextResponse.json({ content: data }, { status: 200 })
  } catch (e) {
    console.error('content PATCH error:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const {
    data: content,
    error: contentError,
  } = await supabaseAdmin
    .from('content')
    .select('id, firebase_path')
    .eq('id', id)
    .single()

  if (contentError || !content) {
    console.error('content fetch before delete error:', contentError)
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  const storedPath = (content as any).firebase_path as string | null

  if (storedPath) {
    const storage = getAdminStorage()
    const bucket = storage.bucket(BUCKET_NAME)
    bucket.file(storedPath).delete().catch((e) => {
      console.error("Firebase Admin delete error:", e)
    })
  }

  const { error: deleteError } = await supabaseAdmin.from('content').delete().eq('id', id)

  if (deleteError) {
    console.error('content delete error:', deleteError)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 400 })
  }

  return NextResponse.json({ deleted: true }, { status: 200 })
}

