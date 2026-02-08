import { createClient } from '@supabase/supabase-js'

// Admin client for server-side operations ONLY (API routes)
// DO NOT import this in client components
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
