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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const name = body?.name?.toString().trim()
    const email = body?.email?.toString().trim()
    const password = body?.password?.toString()
    const department = body?.department?.toString().trim() || null
    const phone = body?.phone?.toString().trim() || null

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      )
    }

    const admin = freshAdmin()

    // Check if email already exists
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      )
    }

    // Try creating auth user — trigger may or may not work
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: "EMPLOYEE" },
      })

    let userId: string | null = authData?.user?.id ?? null

    if (authError) {
      console.error("register: createUser with metadata failed:", authError.message)

      // Try without metadata (trigger might fail on metadata parsing)
      const admin2 = freshAdmin()
      const { data: d2, error: e2 } = await admin2.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (e2) {
        console.error("register: bare createUser also failed:", e2.message)

        // Last resort: try signUp with anon key
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        )
        const { data: d3, error: e3 } = await anonClient.auth.signUp({
          email,
          password,
        })

        if (e3 || !d3?.user) {
          console.error("register: signUp also failed:", e3?.message)
          return NextResponse.json(
            { error: "Failed to create account. Please try again later." },
            { status: 500 },
          )
        }

        userId = d3.user.id
        // Confirm email
        const admin3 = freshAdmin()
        await admin3.auth.admin.updateUserById(userId, { email_confirm: true })
      } else {
        userId = d2?.user?.id ?? null
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Failed to create account." },
        { status: 500 },
      )
    }

    // Ensure profile exists (trigger may have created it or not)
    const dbClient = freshAdmin()
    const { data: existingNewProfile } = await dbClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (!existingNewProfile) {
      // Trigger didn't create it — insert manually
      await dbClient.from("profiles").insert({
        id: userId,
        email,
        name,
        role: "EMPLOYEE",
        status: "pending",
        department,
        phone,
      })
    } else {
      // Trigger created it — update with our fields
      await dbClient
        .from("profiles")
        .update({ status: "pending", department, phone, name })
        .eq("id", userId)
    }

    // Notify admins (best-effort)
    try {
      const { data: admins } = await dbClient
        .from("profiles")
        .select("id, org_id")
        .in("role", ["SUPER_ADMIN", "ADMIN", "MANAGER"])
        .eq("status", "active")
        .limit(5)

      if (admins && admins.length > 0) {
        const notifications = admins.map((a: any) => ({
          user_id: a.id,
          org_id: a.org_id,
          type: "system",
          title: `New Registration: ${name}`,
          message: `${email} has registered and is waiting for approval.`,
          action_url: "/dashboard/users/approval",
        }))
        await dbClient.from("notifications").insert(notifications)
      }
    } catch {
      // best-effort
    }

    // Auto-approve default category access based on role mapping.
    try {
      const { data: profile } = await dbClient
        .from("profiles")
        .select("org_id, role, department")
        .eq("id", userId)
        .maybeSingle()

      const orgId = profile?.org_id as string | null
      const roleKey = toRoleKey(profile?.role) || "EMPLOYEE"
      const departmentKey = toRoleKey(department || profile?.department)

      if (orgId) {
        const lookupKeys = Array.from(new Set([roleKey, departmentKey].filter(Boolean) as string[]))
        const { data: defaults } = await dbClient
          .from("role_category_defaults")
          .select("category_id")
          .eq("org_id", orgId)
          .in("role_key", lookupKeys.length > 0 ? lookupKeys : [roleKey])

        const categoryIds = Array.from(
          new Set((defaults || []).map((row: any) => String(row.category_id))),
        )

        for (const categoryId of categoryIds) {
          const { data: access } = await dbClient
            .from("category_access")
            .select("id, allowed_user_ids")
            .eq("org_id", orgId)
            .eq("category_id", categoryId)
            .maybeSingle()

          if (access) {
            const allowed = Array.isArray(access.allowed_user_ids) ? access.allowed_user_ids : []
            if (!allowed.includes(userId)) {
              await dbClient
                .from("category_access")
                .update({
                  allowed_user_ids: [...allowed, userId],
                  updated_at: new Date().toISOString(),
                })
                .eq("id", access.id)
            }
          } else {
            await dbClient.from("category_access").insert({
              org_id: orgId,
              category_id: categoryId,
              allowed_roles: [],
              allowed_user_ids: [userId],
              updated_at: new Date().toISOString(),
            })
          }
        }
      }
    } catch (e) {
      console.error("register: role default access mapping failed:", e)
    }

    return NextResponse.json({
      success: true,
      pending: true,
      message:
        "Registration successful! Your account is pending approval by an administrator.",
    })
  } catch (e) {
    console.error("register route error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
