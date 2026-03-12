import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')
    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    const [{ data: categories, error: catError }, { data: defaults, error: defaultsError }] =
      await Promise.all([
        supabaseAdmin
          .from('categories')
          .select('id, name, color')
          .eq('org_id', orgId)
          .order('order_index', { ascending: true }),
        supabaseAdmin
          .from('role_category_defaults')
          .select('role_key, category_id')
          .eq('org_id', orgId),
      ])

    if (catError) {
      return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
    }

    // Gracefully handle environments where migration isn't applied yet.
    if (defaultsError) {
      return NextResponse.json({ categories: categories || [], mappings: {} }, { status: 200 })
    }

    const mappings: Record<string, string[]> = {}
    for (const row of defaults || []) {
      const key = String(row.role_key || '').toUpperCase()
      if (!key) continue
      if (!mappings[key]) mappings[key] = []
      mappings[key].push(String(row.category_id))
    }

    return NextResponse.json({ categories: categories || [], mappings }, { status: 200 })
  } catch (error) {
    console.error('GET /api/role-default-access error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgId, roleKey, categoryIds } = body as {
      orgId?: string
      roleKey?: string
      categoryIds?: string[]
    }

    if (!orgId || !roleKey || !Array.isArray(categoryIds)) {
      return NextResponse.json({ error: 'Missing orgId, roleKey, or categoryIds' }, { status: 400 })
    }

    const normalizedRoleKey = roleKey.toUpperCase()

    const { error: deleteError } = await supabaseAdmin
      .from('role_category_defaults')
      .delete()
      .eq('org_id', orgId)
      .eq('role_key', normalizedRoleKey)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to reset existing defaults' }, { status: 500 })
    }

    if (categoryIds.length > 0) {
      const rows = categoryIds.map((categoryId) => ({
        org_id: orgId,
        role_key: normalizedRoleKey,
        category_id: categoryId,
      }))
      const { error: insertError } = await supabaseAdmin.from('role_category_defaults').insert(rows)
      if (insertError) {
        return NextResponse.json({ error: 'Failed to save defaults' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('POST /api/role-default-access error:', error)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
