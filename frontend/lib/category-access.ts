import { supabaseAdmin } from '@/lib/supabase'

export const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'MANAGER'])

export function isAdminRole(role?: string | null) {
  return Boolean(role && ADMIN_ROLES.has(role))
}

export async function getAccessibleCategoryIdsForUser(
  orgId: string,
  userId: string,
  userRole: string,
): Promise<string[]> {
  if (!orgId || !userId) return []
  if (isAdminRole(userRole)) {
    const { data: allRows } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('org_id', orgId)
    return (allRows || []).map((r: any) => String(r.id))
  }

  const [{ data: accessRules }, { data: approvedRequests }] = await Promise.all([
    supabaseAdmin
      .from('category_access')
      .select('category_id, allowed_roles, allowed_user_ids')
      .eq('org_id', orgId),
    supabaseAdmin
      .from('access_requests')
      .select('category_id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'approved'),
  ])

  const ids = new Set<string>()

  for (const row of accessRules || []) {
    const byRole =
      Array.isArray(row.allowed_roles) &&
      row.allowed_roles.length > 0 &&
      row.allowed_roles.includes(userRole)
    const byUser =
      Array.isArray(row.allowed_user_ids) &&
      row.allowed_user_ids.length > 0 &&
      row.allowed_user_ids.includes(userId)
    if ((byRole || byUser) && row.category_id) {
      ids.add(String(row.category_id))
    }
  }

  for (const row of approvedRequests || []) {
    if (row.category_id) ids.add(String(row.category_id))
  }

  return Array.from(ids)
}
