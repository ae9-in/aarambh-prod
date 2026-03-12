import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function freshAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: "No data provided." },
        { status: 400 },
      )
    }

    const allowedFields = [
      "name",
      "department",
      "avatar_url",
      "preferences",
      "phone",
    ]
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

    const { data: profile, error } = await admin
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("*, organizations(id, name, logo_url, primary_color, plan)")
      .single()

    if (error) {
      console.error("profile update error:", error)
      return NextResponse.json(
        { error: "Failed to update profile." },
        { status: 500 },
      )
    }

    return NextResponse.json({ profile })
  } catch (e) {
    console.error("auth/profile error:", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}
