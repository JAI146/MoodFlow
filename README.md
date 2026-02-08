# MoodFlow 🧠

> Smart AI-powered study assistant that helps students decide what to work on based on their mood, energy, and available time.

## 🧩 The Problem

Students often struggle with studying not because they lack motivation, but because they don't know:
- **What** to work on
- **When** to work on it  
- **How** to study effectively

Most existing tools fall into two categories:
1. **Scheduling apps** that ignore a student's mood, energy, and mental state
2. **Learning platforms** that provide content but don't consider real schedules, deadlines, or available time

Result: Students feel overwhelmed, procrastinate, or waste free time because they don't know what task fits their current situation.

## 💡 Our Solution

MoodFlow is a smart, mood-aware study assistant that helps students decide **what to study right now** by combining:

- 🎭 **Mood & Energy Level** (low, moderate, high)
- 📅 **Schedule** (assignments, exams, deadlines)
- ⏱️ **Available Time** (15, 30, or 60 minutes)

Based on these inputs, MoodFlow recommends the most suitable task:
- Assignment work
- Exam preparation  
- Code typing practice (inspired by Monkeytype but with real code)

## ✨ Key Features

- **AI-Powered Recommendations** (Claude Sonnet 4)
- **Mood-Based Task Matching**
- **Code Typing Practice** (Python, JavaScript, etc.)
- **Streak Tracking & Gamification**
- **Progress Analytics**
- **Interactive 3D UI** (Three.js particle backgrounds)

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (React, TypeScript)
- **Tailwind CSS** v4
- **Framer Motion** (animations)
- **React Three Fiber** (3D graphics)
- **Lucide React** (icons)

### Backend
- **Supabase** (PostgreSQL, Authentication, Real-time)
- **Anthropic Claude API** (AI recommendations)
- **Next.js API Routes** (serverless functions)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/JAI146/MoodFlow.git
cd MoodFlow
npm install
```

### 2. Set Up Backend

**Full guide**: See [`BACKEND_SETUP.md`](./BACKEND_SETUP.md) or [`BACKEND_COMPLETE.md`](./BACKEND_COMPLETE.md)

**Quick version**:
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in Supabase SQL Editor
3. Get Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
4. Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📐 Project Structure

```
MoodFlow/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── auth/         # Authentication (signup, login, logout)
│   │   ├── onboarding/   # Profile, courses, preferences
│   │   ├── recommend/    # AI recommendation engine
│   │   ├── sessions/     # Study session tracking
│   │   └── stats/        # User statistics
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
│   ├── Navbar.tsx
│   ├── InteractiveParticleField.tsx
│   └── ...
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── ai/              # AI recommendation engine
│   └── types/           # TypeScript definitions
├── supabase-schema.sql  # Database schema
└── .env.local           # Environment variables (create this!)
```

## 🎯 Roadmap

- [x] Landing page with 3D animations
- [x] Authentication (signup/login)
- [x] Backend API infrastructure
- [x] AI recommendation system
- [x] Study session tracking
- [ ] Onboarding flow UI
- [ ] Mood check-in component
- [ ] Code typing game
- [ ] Dashboard with analytics
- [ ] Calendar integration
- [ ] Mobile responsive design

## 📊 Database Schema

10 tables tracking:
- User profiles
- Courses & assignments
- Exams & schedules
- Study sessions & typing practice
- User preferences & AI recommendations
- Statistics & streaks

See `supabase-schema.sql` for full schema.

## 🤖 AI Features

- **Context-aware recommendations** based on user data
- **Mood & energy matching** (low → easy tasks, high → complex work)
- **Deadline prioritization** (urgent tasks first)
- **Study history analysis** (avoid repetition)
- **Preference learning** (study style, times)

## 🔒 Security

- Row Level Security (RLS) enabled
- Users can only access their own data
- JWT-based authentication
- Service role keys kept server-side only

## 🧪 Testing

See full testing guide in `BACKEND_SETUP.md`.

Quick API test:
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","fullName":"Test User"}'
```

## 📝 License

MIT License - see [LICENSE](./LICENSE)

## 👥 Team

Built for a hackathon by Team JAI146

## 🙏 Acknowledgments

- **Anthropic** for Claude API
- **Supabase** for backend infrastructure
- **Vercel** for Next.js framework
- **Three.js** for 3D graphics

---

**Goal**: Reduce decision fatigue and help students make consistent progress by turning every study session — even short ones — into meaningful learning.

Happy studying! 🚀📚
