import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAccessibleCategoryIdsForUser } from '@/lib/category-access'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get('orgId')
  const userId = searchParams.get('userId')
  const userRole = searchParams.get('userRole')

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
  }

  // If userId provided, filter by access control
  let categoriesQuery = supabaseAdmin
    .from('categories')
    .select('*')
    .eq('org_id', orgId)
    .order('order_index', { ascending: true })

  const { data: categories, error } = await categoriesQuery

  if (error) {
    console.error('categories list error:', error)
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
  }

  let accessibleCategoryIds: string[] | null = null
  
  if (userId && userRole) {
    try {
      accessibleCategoryIds = await getAccessibleCategoryIdsForUser(orgId, userId, userRole)
    } catch (e) {
      console.log('[Categories] Access control check failed:', e)
      accessibleCategoryIds = []
    }
  }

  // Get content counts per category
  const { data: contentRows } = await supabaseAdmin
    .from('content')
    .select('category_id')
    .eq('org_id', orgId)

  const lessonCountMap: Record<string, number> = {}
  contentRows?.forEach((r: { category_id: string | null }) => {
    if (r.category_id) {
      lessonCountMap[r.category_id] = (lessonCountMap[r.category_id] ?? 0) + 1
    }
  })

  const enriched = (categories ?? [])
    .filter((cat) => {
      // If filtering by access, only include accessible categories
      if (accessibleCategoryIds) {
        return accessibleCategoryIds.includes(cat.id)
      }
      return true
    })
    .map((c: { id: string; [k: string]: unknown }) => ({
      ...c,
      lesson_count: lessonCountMap[c.id] ?? (c.lesson_count as number) ?? 0,
      completion_percent: 0,
    }))

  return NextResponse.json({ categories: enriched }, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orgId,
      name,
      description,
      icon,
      color,
      createdBy,
    }: {
      orgId: string
      name: string
      description?: string | null
      icon?: string | null
      color?: string | null
      createdBy: string
    } = body

    if (!orgId || !name || !createdBy) {
      return NextResponse.json(
        { error: 'Missing orgId, name, or createdBy' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        org_id: orgId,
        name,
        description: description ?? null,
        icon: icon ?? null,
        color: color ?? null,
        created_by: createdBy,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('category create error:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (e) {
    console.error('categories POST error:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
