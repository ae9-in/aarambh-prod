import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  const results: Record<string, unknown> = {}

  try {
    // 1. Check auth users
    const { data: authUsers, error: authListError } =
      await supabaseAdmin.auth.admin.listUsers({ perPage: 50 })

    results.authUsers = authListError
      ? { error: authListError.message }
      : (authUsers?.users ?? []).map((u: any) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          email_confirmed: !!u.email_confirmed_at,
        }))

    // 2. Check profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, role, status, org_id")
      .limit(20)

    results.profiles = profilesError
      ? { error: profilesError.message }
      : profiles

    // 3. Check organizations
    const { data: orgs, error: orgsError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, plan")
      .limit(10)

    results.organizations = orgsError
      ? { error: orgsError.message }
      : orgs

    // 4. Check trigger exists
    const { data: triggerCheck, error: triggerError } = await supabaseAdmin
      .rpc("check_trigger_exists", {})
      .maybeSingle()

    if (triggerError) {
      // RPC doesn't exist, try raw query via profiles check
      results.triggerCheck = "Could not check (RPC not available)"
    } else {
      results.triggerCheck = triggerCheck
    }

    // 5. Try a simple profile insert to test
    const testId = "00000000-0000-0000-0000-000000000099"
    const { error: testInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: testId,
        email: "test_diagnostic@test.com",
        name: "Test",
        role: "EMPLOYEE",
        status: "pending",
      })

    if (testInsertError) {
      results.profileInsertTest = {
        success: false,
        error: testInsertError.message,
        code: testInsertError.code,
        details: testInsertError.details,
      }
    } else {
      results.profileInsertTest = { success: true }
      // Clean up
      await supabaseAdmin.from("profiles").delete().eq("id", testId)
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message, results },
      { status: 500 },
    )
  }
}
