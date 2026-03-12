import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — uses anon key, respects RLS
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server admin client — bypasses RLS, server-side only
let _supabaseAdmin: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }
    _supabaseAdmin = createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// For backward-compat: modules that import supabaseAdmin get the lazy client
// This uses a getter on the module export so each property access goes through the real client
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

