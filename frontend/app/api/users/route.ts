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

    const { searchParams } = req.nextUrl
    const status = searchParams.get("status")
    const countOnly = searchParams.get("count") === "true"

    let query = admin
      .from("profiles")
      .select("*, organizations(id, name)", { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error("users GET error:", error)
      return NextResponse.json(
        { error: "Failed to fetch users." },
        { status: 500 },
      )
    }

    if (countOnly) {
      return NextResponse.json({ count: count ?? 0 })
    }

    return NextResponse.json({ users: data ?? [], count: count ?? 0 })
  } catch (e) {
    console.error("users route error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
