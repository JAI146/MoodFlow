#!/bin/bash

# Script to fix all API routes to use async Supabase client

echo "Fixing API routes to use await createServerSupabaseClient()..."

# Find all route.ts files and fix them
find app/api -name "route.ts" -type f -exec sed -i '' 's/const supabase = createServerSupabaseClient()/const supabase = await createServerSupabaseClient()/g' {} \;

echo "Done! All API routes have been fixed."
