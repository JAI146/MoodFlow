# MoodFlow Backend Setup Guide

## 🚀 Quick Start

### 1. Supabase Setup

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project named "moodflow"
3. Wait ~2 minutes for database provisioning
4. Copy your credentials from: **Settings → API**
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### 2. Environment Variables

1. Open `.env.local` in the root directory
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
```

3. Get Anthropic API key from: [https://console.anthropic.com/](https://console.anthropic.com/)

### 3. Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Create new query
3. Copy entire contents of `supabase-schema.sql`
4. Paste and click **Run**
5. Verify all tables created in **Table Editor**

### 4. Test Your Setup

Start the dev server:
```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Onboarding
- `GET/PUT /api/onboarding/profile` - User profile
- `GET/POST /api/onboarding/courses` - Courses
- `GET/POST /api/onboarding/assignments` - Assignments
- `GET/PUT /api/onboarding/preferences` -  User preferences

### AI Recommendations
- `POST /api/recommend` - Get AI study recommendation
  ```json
  {
    "mood": "high",
    "timeAvailable": 45
  }
  ```

### Study Sessions
- `POST /api/sessions` - Start study session
- `GET /api/sessions` - Get session history
- `PUT /api/sessions/[id]/complete` - Complete session

### Statistics
- `GET /api/stats` - Get user statistics

## 🧪 Testing Flow

### 1. Sign Up New User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### 2. Check Profile Auto-Created
Go to Supabase → Table Editor → `profiles`
Should see new user with auto-created `user_stats` and `user_preferences`

### 3. Add Courses
```bash
curl -X POST http://localhost:3000/api/onboarding/courses \
  -H "Content-Type: application/json" \
  -d '{
    "courses": [
      {
        "course_name": "Data Structures",
        "course_code": "CS 201",
        "credits": 3
      }
    ]
  }'
```

### 4. Request AI Recommendation
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "high",
    "timeAvailable": 60
  }'
```

### 5. Start Study Session
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "high",
    "energy_level": 8,
    "time_allocated": 60,
    "task_type": "coding",
    "task_description": "Practice typing Python code"
  }'
```

### 6. Complete Session
```bash
curl -X PUT http://localhost:3000/api/sessions/[SESSION_ID]/complete \
  -H "Content-Type: application/json" \
  -d '{
    "durationActual": 55,
    "completed": true,
    "notes": "Great session!"
  }'
```

### 7. Check Stats Updated
```bash
curl http://localhost:3000/api/stats
```

## 🎯 Database Tables

- ✅ `profiles` - User profiles (auto-created on signup)
- ✅ `courses` - User courses
- ✅ `assignments` - Assignments with progress tracking
- ✅ `exams` - Upcoming exams
- ✅ `schedule_blocks` - Calendar/schedule
- ✅ `study_sessions` - Study session tracking
- ✅ `typing_sessions` - Code typing practice
- ✅ `user_preferences` - AI & study preferences
- ✅ `recommendations` - AI recommendation history
- ✅ `user_stats` - User statistics & streaks

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Auto-profile creation on signup
- ✅ Secure authentication with Supabase Auth
- ✅ JWT-based session management

## 🤖 AI Features

- Claude Sonnet 4 for study recommendations
- Context-aware task suggestions
- Mood & energy level matching
- Deadline prioritization
- Study history analysis
- Preference-based recommendations

## 📊 Stats Tracking

- Total study time
- Session count
- Current & longest streaks
- Languages practiced
- Average WPM & accuracy
- Common mistakes tracking

## 🔧 Troubleshooting

### "Unauthorized" errors
- Check if user is logged in
- Verify Supabase credentials in `.env.local`
- Restart dev server after changing env vars

### Database errors
- Verify schema was run successfully
- Check RLS policies are enabled
- Confirm tables exist in Supabase dashboard

### AI recommendation not working
- Verify `ANTHROPIC_API_KEY` in `.env.local`
- Check API key is active
- Review server logs for errors

## 🎉 Ready to Build!

Your backend is now fully functional! 

Next steps:
1. Build onboarding flow UI
2. Create mood check-in component
3. Implement session timer
4. Build typing game
5. Create dashboard with stats

Happy coding! 🚀
