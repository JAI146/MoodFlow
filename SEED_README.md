# Quick Seed Guide

## Run Seed Script

```bash
npm run db:seed
```

## Prerequisites

Add to your `.env` file:

```bash
# Required
DATABASE_URL=postgresql://postgres:password@host:5432/postgres?schema=public
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Optional (for automatic user creation)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OR if you already have a user:
DUMMY_USER_ID=your-user-uuid
```

## What You Get

- **User:** `demo@moodflow.app` / `demo123456`
- **3 Courses** with assignments and exams
- **10 Study Sessions** with mood logs
- **8 Coding Practice Sessions**
- **4 Code Snippets**
- All data properly connected!

## Full Documentation

See [docs/SEEDING.md](./docs/SEEDING.md) for detailed instructions.
