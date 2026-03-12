import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAccessibleCategoryIdsForUser } from '@/lib/category-access'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const orgId = searchParams.get('orgId')
  const userId = searchParams.get('userId')
  const userRole = searchParams.get('userRole')
  const categoryId = searchParams.get('categoryId')
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
  }

  let query = supabaseAdmin
    .from('content')
    .select(
      `
      *,
      categories(name),
      uploader:profiles!content_uploaded_by_fkey(name)
    `,
      { count: 'exact' },
    )
    .eq('org_id', orgId)
    .eq('is_published', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (type) {
    query = query.eq('type', type)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  if (userId && userRole) {
    const accessibleCategoryIds = await getAccessibleCategoryIdsForUser(orgId, userId, userRole)
    if (accessibleCategoryIds.length === 0) {
      return NextResponse.json({ content: [], count: 0 }, { status: 200 })
    }
    query = query.in('category_id', accessibleCategoryIds)
  }

  const { data, count, error } = await query.order('order_index', {
    ascending: true,
  }).order('created_at', { ascending: false })

  if (error) {
    console.error('content list error:', error)
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 })
  }

  const content =
    data?.map((item: any) => ({
      ...item,
      category_name: item.categories?.name ?? null,
      uploader_name: item.uploader?.name ?? null,
    })) ?? []

  return NextResponse.json(
    {
      content,
      count: count ?? content.length,
    },
    { status: 200 },
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orgId,
      categoryId,
      title,
      type,
      description,
      xpReward,
      fileUrl,
    }: {
      orgId: string
      categoryId: string
      title: string
      type: string
      description?: string | null
      xpReward?: number | null
      fileUrl?: string | null
    } = body

    if (!orgId || !categoryId || !title || !type) {
      return NextResponse.json(
        { error: 'Missing orgId, categoryId, title, or type' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .insert({
        org_id: orgId,
        category_id: categoryId,
        title,
        type,
        description: description ?? null,
        xp_reward: xpReward ?? null,
        file_url: fileUrl ?? null,
        is_published: true,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('content create error:', error)
      return NextResponse.json({ error: 'Failed to create content' }, { status: 400 })
    }

    // Fire-and-forget embedding trigger for AI-searchable lesson types.
    const aiSearchableTypes = new Set(['PDF', 'NOTE', 'PPT', 'VIDEO'])
    if (aiSearchableTypes.has(type.toUpperCase())) {
      const origin = req.nextUrl.origin
      fetch(`${origin}/api/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: data.id,
          fileUrl: fileUrl ?? null,
          orgId,
        }),
      }).catch((embedErr) => {
        console.error('content: embed trigger error', embedErr)
      })
    }

    return NextResponse.json({ content: data }, { status: 201 })
  } catch (e) {
    console.error('content POST error:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

