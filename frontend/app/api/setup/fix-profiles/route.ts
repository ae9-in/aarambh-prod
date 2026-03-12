import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    // Get org
    const { data: org } = await admin
      .from("organizations")
      .select("id")
      .eq("name", "Arambh")
      .single()

    if (!org) {
      return NextResponse.json({ error: "No org found" }, { status: 500 })
    }

    // Get all auth users
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 100 })
    const users = authData?.users ?? []

    const roleMap: Record<string, string> = {
      "admin@arambh.com": "SUPER_ADMIN",
      "manager@arambh.com": "MANAGER",
      "hr@arambh.com": "ADMIN",
    }

    const nameMap: Record<string, string> = {
      "admin@arambh.com": "Super Admin",
      "manager@arambh.com": "Manager",
      "hr@arambh.com": "HR Admin",
    }

    const results: { email: string; status: string; error?: string }[] = []

    for (const user of users) {
      const email = user.email ?? ""
      const role = roleMap[email] || "EMPLOYEE"
      const name = nameMap[email] || user.user_metadata?.name || email.split("@")[0]
      const status = role === "EMPLOYEE" ? "pending" : "active"

      const { error } = await admin.from("profiles").upsert({
        id: user.id,
        email,
        name,
        role,
        status,
        org_id: org.id,
      })

      if (error) {
        results.push({ email, status: "error", error: error.message })
      } else {
        results.push({ email, status: "profile_created" })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
