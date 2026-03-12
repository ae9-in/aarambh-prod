import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

function freshAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = freshAdmin()
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    const status = body?.status?.toString().trim()
    const notes = body?.notes?.toString().trim()

    if (!status && typeof notes === "undefined") {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 },
      )
    }

    const updatePayload: Record<string, unknown> = {}
    if (status) {
      updatePayload.status = status
    }
    if (typeof notes !== "undefined") {
      updatePayload.notes = notes
    }
    updatePayload.updated_at = new Date().toISOString()

    const { error } = await admin
      .from("enquiries")
      .update(updatePayload)
      .eq("id", id)

    if (error) {
      console.error("enquiries PATCH error", error)
      return NextResponse.json(
        { error: "Failed to update enquiry." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("enquiries PATCH route error", e)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    )
  }
}

