import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { data: category, error: catError } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (catError || !category) {
    console.error('category fetch error:', catError)
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('content')
    .select('id, title, description, type, xp_reward, duration_minutes, file_url, view_count, completion_count, order_index, is_published')
    .eq('category_id', id)
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  if (lessonsError) {
    console.error('lessons fetch error:', lessonsError)
  }

  return NextResponse.json(
    {
      category,
      lessons: lessons || [],
    },
    { status: 200 },
  )
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await req.json()
    const {
      name,
      description,
      icon,
      color,
      orderIndex,
    }: {
      name?: string
      description?: string | null
      icon?: string | null
      color?: string | null
      orderIndex?: number
    } = body

    const updates: Record<string, unknown> = {}

    if (typeof name === 'string') updates.name = name
    if (description !== undefined) updates.description = description
    if (icon !== undefined) updates.icon = icon
    if (color !== undefined) updates.color = color
    if (typeof orderIndex === 'number') updates.order_index = orderIndex

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      console.error('category update error:', error)
      return NextResponse.json({ error: 'Failed to update category' }, { status: 400 })
    }

    return NextResponse.json({ category: data }, { status: 200 })
  } catch (e) {
    console.error('categories PATCH error:', e)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)

  if (error) {
    console.error('category delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 400 },
    )
  }

  return NextResponse.json({ deleted: true }, { status: 200 })
}

