import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get('orgId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('access_requests')
      .select(`
        *,
        category:category_id(id, name, icon, color),
        user:user_id(id, name, email, role),
        reviewer:reviewed_by(id, name)
      `)
      .eq('org_id', orgId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    query = query.order('created_at', { ascending: false })

    const { data: requests, error } = await query

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('Could not find the table')) {
        console.log('[AccessRequests] Table may not exist yet')
        return NextResponse.json({ requests: [] }, { status: 200 })
      }
      console.error('Error fetching access requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] }, { status: 200 })
  } catch (e) {
    console.error('GET /api/access-requests error:', e)
    return NextResponse.json({ requests: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      categoryId,
      userId,
      orgId,
      reason,
    }: {
      categoryId: string
      userId: string
      orgId: string
      reason?: string
    } = body

    if (!categoryId || !userId || !orgId) {
      return NextResponse.json(
        { error: 'Missing categoryId, userId, or orgId' },
        { status: 400 }
      )
    }

    const { data: existingRequest, error: checkError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError && (checkError.code === 'PGRST205' || checkError.message?.includes('does not exist') || checkError.message?.includes('Could not find the table'))) {
      return NextResponse.json(
        { error: 'Access requests feature not available. Please contact admin.' },
        { status: 503 }
      )
    }

    if (existingRequest?.status === 'pending') {
      return NextResponse.json({ error: 'Access request already pending' }, { status: 400 })
    }

    if (existingRequest?.status === 'approved') {
      return NextResponse.json({ error: 'Category already approved for this user' }, { status: 400 })
    }

    const payload = {
      category_id: categoryId,
      user_id: userId,
      org_id: orgId,
      status: 'pending' as const,
      reason: reason?.trim() || null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
    }

    const requestMutation = existingRequest
      ? supabaseAdmin
          .from('access_requests')
          .update(payload)
          .eq('id', existingRequest.id)
      : supabaseAdmin.from('access_requests').insert(payload)

    const { data, error } = await requestMutation
      .select(
        `
        *,
        category:category_id(id, name, icon, color),
        user:user_id(id, name, email, role)
      `,
      )
      .single()

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('Could not find the table')) {
        return NextResponse.json(
          { error: 'Access requests feature not available. Please contact admin.' },
          { status: 503 }
        )
      }
      console.error('Error creating access request:', error)
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // Notify admins about the new request.
    try {
      const [{ data: category }, { data: requester }] = await Promise.all([
        supabaseAdmin
          .from('categories')
          .select('name')
          .eq('id', categoryId)
          .maybeSingle(),
        supabaseAdmin
          .from('profiles')
          .select('name')
          .eq('id', userId)
          .maybeSingle(),
      ])

      const { data: admins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('org_id', orgId)
        .in('role', ['SUPER_ADMIN', 'ADMIN', 'MANAGER'])
        .eq('status', 'active')

      if (admins && admins.length > 0) {
        await supabaseAdmin.from('notifications').insert(
          admins.map((admin) => ({
            user_id: admin.id,
            org_id: orgId,
            type: 'system',
            title: 'New Category Access Request',
            message: `${requester?.name || 'An employee'} requested access to "${category?.name || 'category'}".`,
            action_url: '/dashboard/access-requests',
          })),
        )
      }
    } catch (e) {
      console.log('Failed to create admin notification:', e)
    }

    // Confirmation to employee.
    try {
      const { data: category } = await supabaseAdmin
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single()

      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        org_id: orgId,
        type: 'system',
        title: 'Access Request Submitted',
        message: `You requested access to "${category?.name || 'category'}". You will be notified after admin review.`,
      })
    } catch (e) {
      console.log('Failed to create notification:', e)
    }

    return NextResponse.json({ success: true, request: data }, { status: 201 })
  } catch (e) {
    console.error('POST /api/access-requests error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
