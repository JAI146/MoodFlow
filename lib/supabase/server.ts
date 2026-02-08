import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
// import type { Database } from './database.types' // Uncomment after generating types

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createServerClient(supabaseUrl, supabaseKey, {
  // return createServerClient<Database>(supabaseUrl, supabaseKey, { // Use this after generating types
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from Server Component; ignore.
        }
      },
    },
  })
}

// Alias for compatibility with newer routes
export const createServerSupabaseClient = createClient
