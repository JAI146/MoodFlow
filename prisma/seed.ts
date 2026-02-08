import { PrismaClient, MoodLevel, TaskType, MistakeSource, Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const { Decimal } = Prisma

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

// Dummy user credentials
const DUMMY_USER = {
  email: 'demo@moodflow.app',
  password: 'demo123456',
  name: 'Demo User',
}

async function createDummyUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  // Check if DUMMY_USER_ID is set (manual user creation)
  const existingUserId = process.env.DUMMY_USER_ID
  if (existingUserId) {
    console.log(`✅ Using existing user ID from DUMMY_USER_ID: ${existingUserId}`)
    return existingUserId
  }

  // Try to find existing user using anon key (can read but not create)
  if (supabaseAnonKey) {
    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      // Try to sign in to see if user exists
      const { data: signInData } = await supabaseClient.auth.signInWithPassword({
        email: DUMMY_USER.email,
        password: DUMMY_USER.password,
      })
      
      if (signInData?.user) {
        console.log(`✅ Found existing user: ${DUMMY_USER.email} (${signInData.user.id})`)
        return signInData.user.id
      }
    } catch (error) {
      // User doesn't exist or wrong password, continue to creation
    }
  }

  // Try to use service role key if available and different from anon key
  if (supabaseServiceKey && supabaseServiceKey !== supabaseAnonKey) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.warn(`⚠️  Could not list users: ${listError.message}`)
        console.warn('   This might mean the service role key is incorrect.')
        throw listError
      }

      const existingUser = existingUsers?.users?.find((u) => u.email === DUMMY_USER.email)

      if (existingUser) {
        console.log(`✅ Dummy user already exists: ${DUMMY_USER.email} (${existingUser.id})`)
        return existingUser.id
      }

      // Create new user
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: DUMMY_USER.email,
        password: DUMMY_USER.password,
        email_confirm: true,
        user_metadata: {
          full_name: DUMMY_USER.name,
        },
      })

      if (error) {
        throw error
      }

      console.log(`✅ Created dummy user: ${DUMMY_USER.email} (${newUser.user.id})`)
      return newUser.user.id
    } catch (error: any) {
      console.error(`❌ Failed to create user with service role key: ${error.message}`)
      console.warn('\n📝 To fix this:')
      console.warn('   1. Get your service_role key from:')
      console.warn('      https://supabase.com/dashboard/project/_/settings/api')
      console.warn('   2. Update SUPABASE_SERVICE_ROLE_KEY in .env')
      console.warn('   3. OR create user manually and set DUMMY_USER_ID in .env')
      console.warn(`\n   Manual user creation:`)
      console.warn(`   - Email: ${DUMMY_USER.email}`)
      console.warn(`   - Password: ${DUMMY_USER.password}`)
      console.warn(`   - Then set DUMMY_USER_ID=<user-id> in .env`)
      throw error
    }
  } else {
    // If no service key or it's the same as anon key, prompt user to create manually
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set or is the same as anon key.')
    console.warn('   Service role key is required for automatic user creation.')
    console.warn('\n📝 Options:')
    console.warn('   1. Get service_role key from Supabase Dashboard → Settings → API')
    console.warn('      Then update SUPABASE_SERVICE_ROLE_KEY in .env')
    console.warn('   2. Create user through your app:')
    console.warn(`      - Go to http://localhost:3000/signup`)
    console.warn(`      - Email: ${DUMMY_USER.email}`)
    console.warn(`      - Password: ${DUMMY_USER.password}`)
    console.warn(`      - Then run seed again (it will find the existing user)`)
    console.warn('   3. OR get user ID from Supabase Dashboard → Auth → Users')
    console.warn(`      Then set DUMMY_USER_ID=<user-id> in .env`)
    
    throw new Error(
      'Please set a valid SUPABASE_SERVICE_ROLE_KEY in .env, create user through app, or set DUMMY_USER_ID'
    )
  }
}

async function main() {
  console.log('🌱 Starting seed...\n')

  // Create or get dummy user
  const userId = await createDummyUser()

  // Ensure profile exists
  const profile = await prisma.profile.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      displayName: DUMMY_USER.name,
      defaultSessionMinutes: 30,
    },
  })
  console.log(`✅ Profile ready: ${profile.displayName}`)

  // Clear existing data for this user (optional - comment out if you want to keep existing data)
  console.log('\n🧹 Cleaning up existing data...')
  await prisma.mistakeRecord.deleteMany({ where: { userId } })
  await prisma.codingPracticeSession.deleteMany({ where: { userId } })
  await prisma.moodLog.deleteMany({ where: { userId } })
  await prisma.studySession.deleteMany({ where: { userId } })
  await prisma.assignment.deleteMany({ where: { userId } })
  await prisma.exam.deleteMany({ where: { userId } })
  await prisma.course.deleteMany({ where: { userId } })

  // Create courses
  console.log('\n📚 Creating courses...')
  const course1 = await prisma.course.create({
    data: {
      userId,
      name: 'CS101',
      description: 'Introduction to Computer Science',
      color: '#3B82F6',
    },
  })
  const course2 = await prisma.course.create({
    data: {
      userId,
      name: 'Algorithms',
      description: 'Data Structures and Algorithms',
      color: '#10B981',
    },
  })
  const course3 = await prisma.course.create({
    data: {
      userId,
      name: 'Web Development',
      description: 'Full-stack web development',
      color: '#F59E0B',
    },
  })
  console.log(`✅ Created 3 courses`)

  // Create assignments
  console.log('\n📝 Creating assignments...')
  const now = new Date()
  const assignments = [
    {
      userId,
      courseId: course1.id,
      title: 'Homework 1: Variables and Functions',
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      estimatedMinutes: 120,
    },
    {
      userId,
      courseId: course1.id,
      title: 'Project: Calculator App',
      dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedMinutes: 300,
    },
    {
      userId,
      courseId: course2.id,
      title: 'Assignment 2: Binary Trees',
      dueAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      estimatedMinutes: 180,
      completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Completed yesterday
    },
    {
      userId,
      courseId: course3.id,
      title: 'Build a Todo App',
      dueAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      estimatedMinutes: 240,
    },
  ]

  const createdAssignments = await Promise.all(
    assignments.map((assignment) => prisma.assignment.create({ data: assignment }))
  )
  console.log(`✅ Created ${createdAssignments.length} assignments`)

  // Create exams
  console.log('\n📋 Creating exams...')
  const exams = [
    {
      userId,
      courseId: course1.id,
      title: 'Midterm Exam',
      examAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
    {
      userId,
      courseId: course2.id,
      title: 'Final Exam',
      examAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  ]

  const createdExams = await Promise.all(exams.map((exam) => prisma.exam.create({ data: exam })))
  console.log(`✅ Created ${createdExams.length} exams`)

  // Create study sessions
  console.log('\n📖 Creating study sessions...')
  const studySessions = []
  for (let i = 0; i < 10; i++) {
    const sessionStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000) // Past 10 days
    const sessionEnd = new Date(sessionStart.getTime() + 30 * 60 * 1000) // 30 minutes later

    const moods: MoodLevel[] = ['low', 'moderate', 'high']
    const taskTypes: TaskType[] = ['assignment', 'exam_prep', 'general_study', 'typing_game']

    studySessions.push({
      userId,
      startedAt: sessionStart,
      endedAt: sessionEnd,
      plannedMinutes: [15, 30, 45, 60][i % 4],
      moodAtStart: moods[i % moods.length] as MoodLevel,
      taskType: taskTypes[i % taskTypes.length] as TaskType,
      taskId: i < 3 ? createdAssignments[0].id : undefined,
      notes: i % 2 === 0 ? `Session ${i + 1} notes` : undefined,
    })
  }

  const createdSessions = await Promise.all(
    studySessions.map((session) => prisma.studySession.create({ data: session }))
  )
  console.log(`✅ Created ${createdSessions.length} study sessions`)

  // Create mood logs
  console.log('\n😊 Creating mood logs...')
  const moodLogs = []
  for (let i = 0; i < 15; i++) {
    const loggedAt = new Date(now.getTime() - i * 12 * 60 * 60 * 1000) // Past 15 entries, every 12 hours
    const moods: MoodLevel[] = ['low', 'moderate', 'high']

    moodLogs.push({
      userId,
      loggedAt,
      mood: moods[i % moods.length] as MoodLevel,
      availableMinutes: [15, 30, 60][i % 3],
      sessionId: i < createdSessions.length ? createdSessions[i].id : undefined,
    })
  }

  await Promise.all(moodLogs.map((log) => prisma.moodLog.create({ data: log })))
  console.log(`✅ Created ${moodLogs.length} mood logs`)

  // Create coding practice sessions
  console.log('\n⌨️  Creating coding practice sessions...')
  const codingSessions = []
  for (let i = 0; i < 8; i++) {
    const startedAt = new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000)
    const endedAt = new Date(startedAt.getTime() + (120 + i * 10) * 1000) // 2-3 minutes
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
    const charactersTyped = 500 + i * 50
    const charactersCorrect = Math.floor(charactersTyped * (0.85 + (i % 3) * 0.05))

    codingSessions.push({
      userId,
      language: ['javascript', 'python', 'typescript'][i % 3],
      snippetId: `snippet-${i + 1}`,
      startedAt,
      endedAt,
      durationSeconds,
      charactersTyped,
      charactersCorrect,
      wpm: new Decimal(40 + i * 2),
      accuracyPercent: new Decimal((charactersCorrect / charactersTyped) * 100),
      sessionId: i < createdSessions.length ? createdSessions[i].id : undefined,
    })
  }

  await Promise.all(
    codingSessions.map((session) => prisma.codingPracticeSession.create({ data: session }))
  )
  console.log(`✅ Created ${codingSessions.length} coding practice sessions`)

  // Create mistake records
  console.log('\n❌ Creating mistake records...')
  const mistakes = [
    {
      userId,
      source: 'typing_game' as MistakeSource,
      mistakeType: 'wrong_char',
      context: 'const vs cost',
      language: 'javascript',
      occurredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      count: 5,
    },
    {
      userId,
      source: 'typing_game' as MistakeSource,
      mistakeType: 'wrong_keyword',
      context: 'function vs func',
      language: 'javascript',
      occurredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      count: 3,
    },
    {
      userId,
      source: 'manual' as MistakeSource,
      mistakeType: 'syntax_error',
      context: 'Missing semicolon',
      language: 'typescript',
      occurredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      count: 8,
    },
  ]

  await Promise.all(mistakes.map((mistake) => prisma.mistakeRecord.create({ data: mistake })))
  console.log(`✅ Created ${mistakes.length} mistake records`)

  // Create snippets (global, no user_id)
  console.log('\n💻 Creating code snippets...')
  const snippets = [
    {
      id: 'js-001',
      language: 'javascript',
      code: `function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`,
      difficulty: 'easy',
    },
    {
      id: 'js-002',
      language: 'javascript',
      code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = doubled.reduce((acc, n) => acc + n, 0);
console.log(sum);`,
      difficulty: 'medium',
    },
    {
      id: 'py-001',
      language: 'python',
      code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(result)`,
      difficulty: 'medium',
    },
    {
      id: 'ts-001',
      language: 'typescript',
      code: `interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(user: User): User {
  return { ...user, id: crypto.randomUUID() };
}

const newUser = createUser({
  name: 'John',
  email: 'john@example.com'
});`,
      difficulty: 'hard',
    },
  ]

  await Promise.all(
    snippets.map((snippet) =>
      prisma.snippet.upsert({
        where: { id: snippet.id },
        update: {},
        create: snippet,
      })
    )
  )
  console.log(`✅ Created/updated ${snippets.length} code snippets`)

  console.log('\n✨ Seed completed successfully!')
  console.log(`\n📧 Login credentials:`)
  console.log(`   Email: ${DUMMY_USER.email}`)
  console.log(`   Password: ${DUMMY_USER.password}`)
  console.log(`\n📊 Summary:`)
  console.log(`   - Courses: 3`)
  console.log(`   - Assignments: ${createdAssignments.length}`)
  console.log(`   - Exams: ${createdExams.length}`)
  console.log(`   - Study Sessions: ${createdSessions.length}`)
  console.log(`   - Mood Logs: ${moodLogs.length}`)
  console.log(`   - Coding Practice Sessions: ${codingSessions.length}`)
  console.log(`   - Mistake Records: ${mistakes.length}`)
  console.log(`   - Code Snippets: ${snippets.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
