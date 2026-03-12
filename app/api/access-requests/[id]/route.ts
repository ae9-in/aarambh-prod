import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params
    const body = await req.json()
    const {
      status,
      adminReason,
      reviewedBy,
    }: {
      status: 'approved' | 'rejected'
      adminReason?: string
      reviewedBy: string
    } = body

    if (!status || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing status or reviewedBy' },
        { status: 400 }
      )
    }

    const { data: requestData } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('access_requests')
      .update({
        status,
        reason: requestData.reason || null,
        review_note: adminReason?.trim() || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
      .eq('id', requestId)
      .select(`
        *,
        category:category_id(id, name, icon, color),
        user:user_id(id, name, email, role)
      `)
      .single()

    if (error) {
      console.error('Error updating access request:', error)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // If approved, add user to category/content access tables.
    if (status === 'approved' && requestData.category_id && requestData.user_id) {
      const { data: accessData } = await supabaseAdmin
        .from('category_access')
        .select('*')
        .eq('category_id', requestData.category_id)
        .eq('org_id', requestData.org_id)
        .maybeSingle()

      if (accessData) {
        // Update existing access record
        const currentUserIds = accessData.allowed_user_ids || []
        if (!currentUserIds.includes(requestData.user_id)) {
          await supabaseAdmin
            .from('category_access')
            .update({
              allowed_user_ids: [...currentUserIds, requestData.user_id],
              updated_at: new Date().toISOString(),
            })
            .eq('id', accessData.id)
        }
      } else {
        // Create new access record
        await supabaseAdmin
          .from('category_access')
          .insert({
            category_id: requestData.category_id,
            org_id: requestData.org_id,
            allowed_roles: [],
            allowed_user_ids: [requestData.user_id],
            updated_at: new Date().toISOString(),
          })
      }

      // Ensure all lessons in this category grant this user in content_access.
      const { data: categoryContent } = await supabaseAdmin
        .from('content')
        .select('id')
        .eq('org_id', requestData.org_id)
        .eq('category_id', requestData.category_id)

      const contentIds = (categoryContent || []).map((row: any) => row.id as string)
      if (contentIds.length > 0) {
        const { data: contentAccessRows } = await supabaseAdmin
          .from('content_access')
          .select('id, content_id, allowed_user_ids')
          .in('content_id', contentIds)

        const existingByContent = new Map<string, any>()
        for (const row of contentAccessRows || []) {
          existingByContent.set(row.content_id, row)
        }

        for (const contentId of contentIds) {
          const existing = existingByContent.get(contentId)
          if (existing) {
            const allowedIds = Array.isArray(existing.allowed_user_ids) ? existing.allowed_user_ids : []
            if (!allowedIds.includes(requestData.user_id)) {
              await supabaseAdmin
                .from('content_access')
                .update({
                  allowed_user_ids: [...allowedIds, requestData.user_id],
                  category_id: requestData.category_id,
                })
                .eq('id', existing.id)
            }
          } else {
            await supabaseAdmin
              .from('content_access')
              .insert({
                content_id: contentId,
                category_id: requestData.category_id,
                allowed_roles: [],
                allowed_user_ids: [requestData.user_id],
                blocked_user_ids: [],
              })
          }
        }
      }
    }

    // Notify employee.
    await supabaseAdmin.from('notifications').insert({
      user_id: requestData.user_id,
      org_id: requestData.org_id,
      type: 'system',
      title: `Access Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved'
        ? `Your request for category access has been approved. You can now view the lessons.`
        : `Your request for category access was rejected.${adminReason ? ` Reason: ${adminReason}` : ''}`,
    })

    return NextResponse.json(
      {
        success: true,
        request: data,
        adminReason: adminReason || null,
      },
      { status: 200 },
    )
  } catch (e) {
    console.error('PATCH /api/access-requests/[id] error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
