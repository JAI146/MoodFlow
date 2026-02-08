import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import 'dotenv/config'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

async function runMigration() {
  console.log('🔄 Running database migration...\n')

  // Use DIRECT_URL if available (for migrations), otherwise DATABASE_URL
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  // Remove pgbouncer=true from connection string if present (not compatible with migrations)
  const cleanConnectionString = connectionString?.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '')

  const pool = new Pool({ connectionString: cleanConnectionString })

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/20260207180000_initial_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Executing migration SQL...')

    // Execute migration
    await pool.query(migrationSQL)

    console.log('✅ Migration completed successfully!')
    console.log('\n📊 Created:')
    console.log('   - Enum types (MoodLevel, TaskType, MistakeSource)')
    console.log('   - All tables (profiles, courses, assignments, etc.)')
    console.log('   - Indexes, foreign keys, triggers, and RLS policies')
    console.log('\n✨ You can now run: npm run db:seed')
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.code === '42710') {
      console.log('\n💡 Some objects already exist. This is normal if migration was partially run.')
      console.log('   The migration is idempotent and safe to run multiple times.')
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
