import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all categories with their access rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    // Fetch all categories for org
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('id, name, description, color, icon')
      .eq('org_id', orgId)
      .order('order_index', { ascending: true })

    if (catError) {
      console.error('Error fetching categories:', catError)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Fetch access rules for these categories
    const { data: accessRules, error: accessError } = await supabaseAdmin
      .from('category_access')
      .select('*')
      .eq('org_id', orgId)

    if (accessError) {
      console.error('Error fetching access rules:', accessError)
    }

    // Combine categories with their access rules
    const categoriesWithAccess = (categories || []).map((cat) => {
      const access = accessRules?.find((a) => a.category_id === cat.id)
      return {
        ...cat,
        access: access || {
          allowed_roles: [],
          allowed_user_ids: [],
        },
      }
    })

    return NextResponse.json({ categories: categoriesWithAccess }, { status: 200 })
  } catch (e) {
    console.error('GET /api/access-control error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// POST - Update access rules for a category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      categoryId,
      orgId,
      allowedRoles,
      allowedUserIds,
    }: {
      categoryId: string
      orgId: string
      allowedRoles: string[]
      allowedUserIds: string[]
    } = body

    if (!categoryId || !orgId) {
      return NextResponse.json(
        { error: 'Missing categoryId or orgId' },
        { status: 400 }
      )
    }

    // Upsert access rules
    const { data, error } = await supabaseAdmin
      .from('category_access')
      .upsert(
        {
          category_id: categoryId,
          org_id: orgId,
          allowed_roles: allowedRoles || [],
          allowed_user_ids: allowedUserIds || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'category_id, org_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving access rules:', error)
      return NextResponse.json(
        { error: 'Failed to save access rules' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, access: data }, { status: 200 })
  } catch (e) {
    console.error('POST /api/access-control error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
