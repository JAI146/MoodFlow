-- MoodFlow Database Schema
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  university TEXT,
  major TEXT,
  year_of_study TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  course_code TEXT,
  instructor TEXT,
  credits INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments
CREATE TABLE public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  estimated_hours DECIMAL,
  progress_percentage INTEGER DEFAULT 0,
  progress_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams
CREATE TABLE public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  exam_name TEXT NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('midterm', 'final', 'quiz', 'other')) DEFAULT 'other',
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  topics TEXT[],
  study_status TEXT CHECK (study_status IN ('not_started', 'in_progress', 'ready')) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Schedule (imported from calendar or manually added)
CREATE TABLE public.schedule_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
  is_free_time BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions (mood check-in + task tracking)
CREATE TABLE public.study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mood TEXT CHECK (mood IN ('low', 'moderate', 'high')) NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  time_allocated INTEGER NOT NULL, -- minutes
  task_type TEXT CHECK (task_type IN ('assignment', 'exam', 'coding', 'reading', 'other')) NOT NULL,
  task_id UUID,
  task_description TEXT,
  duration_actual INTEGER, -- actual minutes spent
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Typing Practice Sessions
CREATE TABLE public.typing_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL, -- 'python', 'javascript', etc.
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  code_snippet TEXT NOT NULL,
  user_input TEXT,
  wpm INTEGER,
  accuracy DECIMAL,
  mistakes JSONB DEFAULT '[]'::jsonb,
  duration INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences & AI Context
CREATE TABLE public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  study_style TEXT[], -- ['visual', 'auditory', 'kinesthetic', 'reading']
  preferred_study_times TEXT[], -- ['morning', 'afternoon', 'evening', 'night']
  avg_focus_duration INTEGER, -- minutes
  break_preference INTEGER, -- minutes
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  ai_personality TEXT DEFAULT 'balanced', -- 'encouraging', 'strict', 'balanced'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- AI Recommendation History (for learning)
CREATE TABLE public.recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  time_available INTEGER NOT NULL,
  recommended_task JSONB NOT NULL,
  was_accepted BOOLEAN,
  reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics (aggregated data for fast access)
CREATE TABLE public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_study_time INTEGER DEFAULT 0, -- minutes
  total_sessions INTEGER DEFAULT 0,
  languages_practiced TEXT[] DEFAULT ARRAY[]::TEXT[],
  average_wpm INTEGER DEFAULT 0,
  average_accuracy DECIMAL DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  last_session_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own assignments" ON public.assignments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exams" ON public.exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own schedule" ON public.schedule_blocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own typing sessions" ON public.typing_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
