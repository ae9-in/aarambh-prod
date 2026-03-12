import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const email = body?.email?.toString().trim()
    const password = body?.password?.toString()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const opts = { auth: { autoRefreshToken: false, persistSession: false } }

    // Use one client for auth (it stores session internally after signIn)
    const authClient = createClient(url, serviceKey, opts)
    const { data: authData, error: authError } =
      await authClient.auth.signInWithPassword({ email, password })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Invalid email or password." },
        { status: 401 },
      )
    }

    // Use a FRESH client for DB queries so it uses the service role key, not the user session
    const dbClient = createClient(url, serviceKey, opts)
    const { data: profile, error: profileError } = await dbClient
      .from("profiles")
      .select("*, organizations(id, name, logo_url, primary_color, plan)")
      .eq("id", authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error("[login] profile query error:", profileError?.message)
      return NextResponse.json(
        { error: "Profile not found. Please contact support." },
        { status: 404 },
      )
    }

    // Auto-heal org_id for old users missing organization assignment.
    if (!profile.org_id) {
      let fallbackOrgId: string | null = null

      const { data: adminWithOrg } = await dbClient
        .from("profiles")
        .select("org_id")
        .in("role", ["SUPER_ADMIN", "ADMIN", "MANAGER"])
        .not("org_id", "is", null)
        .limit(1)
        .maybeSingle()

      if (adminWithOrg?.org_id) {
        fallbackOrgId = adminWithOrg.org_id as string
      } else {
        const { data: anyOrg } = await dbClient
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle()
        fallbackOrgId = (anyOrg?.id as string) ?? null
      }

      if (fallbackOrgId) {
        await dbClient
          .from("profiles")
          .update({ org_id: fallbackOrgId, updated_at: new Date().toISOString() })
          .eq("id", profile.id)
        profile.org_id = fallbackOrgId
      }
    }

    if (profile.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your account is pending approval. Please wait for an administrator to approve your registration.",
        },
        { status: 403 },
      )
    }

    if (profile.status === "inactive") {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact your administrator." },
        { status: 403 },
      )
    }

    const cookiePayload = JSON.stringify({
      id: profile.id,
      role: profile.role,
    })

    const res = NextResponse.json({ profile })
    res.cookies.set("arambh_user", cookiePayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (e) {
    console.error("login route error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
