# Quick Setup: Prisma with Supabase

Follow these steps to set up Prisma following the [official Supabase guide](https://supabase.com/docs/guides/database/prisma).

## Step 1: Create Prisma User

1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/qaavfjtdqzezqqqstyal/sql/new
   ```

2. Copy and run the SQL from `supabase/migrations/20260208000000_create_prisma_user.sql`

3. **Important:** Change the password `'change_this_password'` to a secure password

4. **Save the password** - you'll need it for Step 2

## Step 2: Update .env File

Update your `.env` file with the Prisma user credentials:

```bash
# Replace YOUR_PRISMA_PASSWORD with the password you set in Step 1

# Use port 5432 (Session mode). If you use port 6543, "prisma migrate dev" will hang.
DATABASE_URL="postgresql://prisma.qaavfjtdqzezqqqstyal:YOUR_PRISMA_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Optional: same as above; used by some scripts
DIRECT_URL="postgresql://prisma.qaavfjtdqzezqqqstyal:YOUR_PRISMA_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Format:**
```
postgresql://prisma.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:[PORT]/postgres
```

## Step 3: Run Migrations

**If you use Prisma migrations** (`prisma migrate dev`):

```bash
npm run db:migrate
```

**Important:** `prisma migrate dev` often **hangs** when `DATABASE_URL` uses the **transaction pooler (port 6543)**. Use **port 5432** (Session mode) in `DATABASE_URL` when running migrations. Your Next.js app can still use the same URL.

**Alternative (Supabase SQL migrations):**

```bash
npm run db:migrate:run
```

This runs the custom script and creates tables from Supabase migrations.

## Step 4: Seed Database

```bash
npm run db:seed
```

## Benefits

✅ Better access control with dedicated Prisma user  
✅ Easier monitoring in Supabase Dashboard  
✅ Query Performance Dashboard visibility  
✅ Log Explorer visibility  

## Full Documentation

See `docs/PRISMA_SUPABASE_SETUP.md` for detailed instructions.
