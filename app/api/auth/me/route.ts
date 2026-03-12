import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function freshAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function GET(req: NextRequest) {
  const admin = freshAdmin()
  try {
    const cookie = req.cookies.get("arambh_user")?.value
    if (!cookie) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      )
    }

    let userId: string | null = null
    try {
      const parsed = JSON.parse(cookie)
      userId = parsed.id
    } catch {
      userId = cookie
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 },
      )
    }

    const { data: profile, error } = await admin
      .from("profiles")
      .select("*, organizations(id, name, logo_url, primary_color, plan)")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      console.error("[auth/me] profile query error:", error?.message)
      const res = NextResponse.json(
        { error: "Profile not found." },
        { status: 404 },
      )
      res.cookies.set("arambh_user", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      })
      return res
    }

    // Auto-heal users missing org_id (older registrations / approvals).
    if (!profile.org_id) {
      let fallbackOrgId: string | null = null

      const { data: adminWithOrg } = await admin
        .from("profiles")
        .select("org_id")
        .in("role", ["SUPER_ADMIN", "ADMIN", "MANAGER"])
        .not("org_id", "is", null)
        .limit(1)
        .maybeSingle()

      if (adminWithOrg?.org_id) {
        fallbackOrgId = adminWithOrg.org_id as string
      } else {
        const { data: anyOrg } = await admin
          .from("organizations")
          .select("id")
          .limit(1)
          .maybeSingle()
        fallbackOrgId = (anyOrg?.id as string) ?? null
      }

      if (fallbackOrgId) {
        await admin
          .from("profiles")
          .update({ org_id: fallbackOrgId, updated_at: new Date().toISOString() })
          .eq("id", profile.id)

        profile.org_id = fallbackOrgId
      }
    }

    return NextResponse.json({ profile })
  } catch (e) {
    console.error("auth/me error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
