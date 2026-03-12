import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const FIXED_USERS = [
  {
    email: "admin@arambh.com",
    password: "Admin@123",
    name: "Super Admin",
    role: "SUPER_ADMIN",
  },
  {
    email: "manager@arambh.com",
    password: "Manager@123",
    name: "Manager",
    role: "MANAGER",
  },
  {
    email: "hr@arambh.com",
    password: "HrAdmin@123",
    name: "HR Admin",
    role: "ADMIN",
  },
]

export async function POST() {
  const logs: string[] = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Create a fresh admin client for this request
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // --- Ensure org exists ---
    let orgId: string

    const { data: existingOrg } = await admin
      .from("organizations")
      .select("id")
      .eq("name", "Arambh")
      .maybeSingle()

    if (existingOrg) {
      orgId = existingOrg.id as string
      logs.push(`Org found: ${orgId}`)
    } else {
      const { data: newOrg, error: orgError } = await admin
        .from("organizations")
        .insert({ name: "Arambh", plan: "enterprise", max_users: 100, max_storage_gb: 50 })
        .select("id")
        .single()

      if (orgError || !newOrg) {
        return NextResponse.json({ error: "Failed to create org", detail: orgError?.message, logs }, { status: 500 })
      }
      orgId = newOrg.id as string
      logs.push(`Org created: ${orgId}`)
    }

    // --- First, try to drop and recreate trigger as a no-op to bypass the issue ---
    // Use the admin client's rpc or direct query if available
    // Since we can't run DDL from REST API, we'll try signup approach

    const results: { email: string; status: string; error?: string; id?: string }[] = []

    for (const user of FIXED_USERS) {
      // Check if profile already exists
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .maybeSingle()

      if (existingProfile) {
        await admin
          .from("profiles")
          .update({ role: user.role, status: "active", org_id: orgId, name: user.name })
          .eq("id", existingProfile.id)
        results.push({ email: user.email, status: "updated_existing", id: existingProfile.id as string })
        continue
      }

      // Check if auth user exists (trigger failed but user might be in auth.users)
      const { data: authUsersList } = await admin.auth.admin.listUsers({ perPage: 100 })
      const existingAuthUser = authUsersList?.users?.find((u: any) => u.email === user.email)

      if (existingAuthUser) {
        logs.push(`${user.email}: auth user exists (${existingAuthUser.id}), creating profile manually`)
        const { error: profileError } = await admin
          .from("profiles")
          .upsert({
            id: existingAuthUser.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: "active",
            org_id: orgId,
          })
        if (profileError) {
          logs.push(`${user.email}: profile upsert error: ${profileError.message}`)
        }
        results.push({ email: user.email, status: "profile_created_for_existing_auth", id: existingAuthUser.id })
        continue
      }

      // Method 1: Try admin.createUser with metadata
      logs.push(`${user.email}: Trying admin.createUser...`)
      const { data: d1, error: e1 } = await admin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role, org_id: orgId },
      })

      if (!e1 && d1?.user) {
        logs.push(`${user.email}: admin.createUser succeeded`)
        await admin.from("profiles").update({ role: user.role, status: "active", org_id: orgId, name: user.name }).eq("id", d1.user.id)
        results.push({ email: user.email, status: "created", id: d1.user.id })
        continue
      }
      logs.push(`${user.email}: admin.createUser failed: ${e1?.message}`)

      // Method 2: Try signUp with a separate client (uses anon key, different code path)
      logs.push(`${user.email}: Trying signUp with anon key...`)
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: d2, error: e2 } = await anonClient.auth.signUp({
        email: user.email,
        password: user.password,
        options: { data: { name: user.name, role: user.role, org_id: orgId } },
      })

      if (!e2 && d2?.user) {
        logs.push(`${user.email}: signUp succeeded`)
        await admin.from("profiles").update({ role: user.role, status: "active", org_id: orgId, name: user.name }).eq("id", d2.user.id)

        // Confirm email via admin
        await admin.auth.admin.updateUserById(d2.user.id, { email_confirm: true })

        results.push({ email: user.email, status: "created_via_signup", id: d2.user.id })
        continue
      }
      logs.push(`${user.email}: signUp failed: ${e2?.message}`)

      // Method 3: Try signUp without any metadata
      logs.push(`${user.email}: Trying bare signUp...`)
      const { data: d3, error: e3 } = await anonClient.auth.signUp({
        email: user.email,
        password: user.password,
      })

      if (!e3 && d3?.user) {
        logs.push(`${user.email}: bare signUp succeeded`)
        await admin.from("profiles").upsert({
          id: d3.user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: "active",
          org_id: orgId,
        })
        await admin.auth.admin.updateUserById(d3.user.id, { email_confirm: true })
        results.push({ email: user.email, status: "created_bare_signup", id: d3.user.id })
        continue
      }
      logs.push(`${user.email}: bare signUp failed: ${e3?.message}`)

      results.push({ email: user.email, status: "all_methods_failed", error: e3?.message || e2?.message || e1?.message })
    }

    return NextResponse.json({
      success: true,
      organization: { id: orgId, name: "Arambh" },
      users: results,
      logs,
      credentials: FIXED_USERS.map((u) => ({ email: u.email, password: u.password, role: u.role })),
    })
  } catch (e: any) {
    console.error("seed error:", e)
    return NextResponse.json({ error: e?.message, logs }, { status: 500 })
  }
}
