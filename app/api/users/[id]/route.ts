import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function freshAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

function toRoleKey(value?: string | null) {
  if (!value) return null
  return value.trim().toUpperCase().replace(/\s+/g, "_")
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = freshAdmin()
  try {
    const cookie = req.cookies.get("arambh_user")?.value
    if (!cookie) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
    }

    let callerRole: string | null = null
    try {
      const parsed = JSON.parse(cookie)
      callerRole = parsed.role
    } catch {
      // ignore
    }

    if (!callerRole || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(callerRole)) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Missing user id." }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "No data provided." }, { status: 400 })
    }

    const allowedFields = ["status", "role", "org_id", "department"]
    const updatePayload: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updatePayload[field] = body[field]
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 },
      )
    }

    updatePayload.updated_at = new Date().toISOString()

    const { data: profile, error } = await admin
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("user update error:", error)
      return NextResponse.json(
        { error: "Failed to update user." },
        { status: 500 },
      )
    }

    if (body.status === "active" && profile) {
      try {
        await admin.from("notifications").insert({
          user_id: id,
          org_id: profile.org_id,
          type: "system",
          title: "✅ Account Approved",
          message: "Your account has been approved! You can now log in and start learning.",
          action_url: "/learn",
        })
      } catch {
        // best-effort
      }
    }

    // Apply default category access mappings when role/department/status changes.
    try {
      if (profile?.org_id) {
        const roleKey = toRoleKey(profile.role) || "EMPLOYEE"
        const departmentKey = toRoleKey(profile.department)
        const lookupKeys = Array.from(new Set([roleKey, departmentKey].filter(Boolean) as string[]))

        const { data: defaults } = await admin
          .from("role_category_defaults")
          .select("category_id")
          .eq("org_id", profile.org_id)
          .in("role_key", lookupKeys.length > 0 ? lookupKeys : [roleKey])

        for (const row of defaults || []) {
          const categoryId = String((row as any).category_id)
          const { data: access } = await admin
            .from("category_access")
            .select("id, allowed_user_ids")
            .eq("org_id", profile.org_id)
            .eq("category_id", categoryId)
            .maybeSingle()

          if (access) {
            const allowedIds = Array.isArray(access.allowed_user_ids) ? access.allowed_user_ids : []
            if (!allowedIds.includes(id)) {
              await admin
                .from("category_access")
                .update({
                  allowed_user_ids: [...allowedIds, id],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", access.id)
            }
          } else {
            await admin.from("category_access").insert({
              org_id: profile.org_id,
              category_id: categoryId,
              allowed_roles: [],
              allowed_user_ids: [id],
              updated_at: new Date().toISOString(),
            })
          }
        }
      }
    } catch (e) {
      console.error("user PATCH default mapping error:", e)
    }

    return NextResponse.json({ success: true, profile })
  } catch (e) {
    console.error("user PATCH error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
