-- MoodFlow initial schema
-- Enums, tables, FKs, indexes, profile trigger, RLS

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Create enums only if they don't exist
DO $$ BEGIN
  CREATE TYPE mood_level AS ENUM ('low', 'moderate', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_type AS ENUM ('assignment', 'exam_prep', 'general_study', 'typing_game');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mistake_source AS ENUM ('typing_game', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- TABLES (order respects foreign keys)
-- =============================================================================

-- profiles: 1:1 with auth.users, created by trigger on sign-up
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  default_session_minutes integer DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- courses
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  title text NOT NULL,
  due_at timestamptz NOT NULL,
  estimated_minutes integer,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON public.assignments(due_at);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);

-- exams
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  title text NOT NULL,
  exam_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON public.exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_exam_at ON public.exams(exam_at);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);

-- study_sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  planned_minutes integer NOT NULL,
  mood_at_start mood_level NOT NULL,
  task_type task_type NOT NULL,
  task_id uuid REFERENCES public.assignments(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at);

-- mood_logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL,
  mood mood_level NOT NULL,
  available_minutes integer NOT NULL,
  session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON public.mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_logged_at ON public.mood_logs(logged_at);

-- coding_practice_sessions
CREATE TABLE IF NOT EXISTS public.coding_practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL,
  snippet_id text,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  duration_seconds integer NOT NULL,
  characters_typed integer NOT NULL,
  characters_correct integer NOT NULL,
  wpm numeric,
  accuracy_percent numeric NOT NULL,
  session_id uuid REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coding_practice_sessions_user_id ON public.coding_practice_sessions(user_id);

-- mistake_records
CREATE TABLE IF NOT EXISTS public.mistake_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source mistake_source NOT NULL,
  mistake_type text NOT NULL,
  context text,
  language text,
  occurred_at timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mistake_records_user_id ON public.mistake_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_records_occurred_at ON public.mistake_records(occurred_at);

-- snippets: global reference data, no user_id
CREATE TABLE IF NOT EXISTS public.snippets (
  id text PRIMARY KEY,
  language text NOT NULL,
  code text NOT NULL,
  difficulty text
);

-- =============================================================================
-- PROFILE TRIGGER: create profile on sign-up
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, default_session_minutes)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    30
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- UPDATED_AT TRIGGERS (for tables that have updated_at)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS set_courses_updated_at ON public.courses;
CREATE TRIGGER set_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS set_assignments_updated_at ON public.assignments;
CREATE TRIGGER set_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS set_exams_updated_at ON public.exams;
CREATE TRIGGER set_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS set_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER set_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS set_mistake_records_updated_at ON public.mistake_records;
CREATE TRIGGER set_mistake_records_updated_at
  BEFORE UPDATE ON public.mistake_records
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update own row only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- courses: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own courses" ON public.courses;
CREATE POLICY "Users can manage own courses"
  ON public.courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- assignments: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own assignments" ON public.assignments;
CREATE POLICY "Users can manage own assignments"
  ON public.assignments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- exams: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own exams" ON public.exams;
CREATE POLICY "Users can manage own exams"
  ON public.exams FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- study_sessions: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own study_sessions" ON public.study_sessions;
CREATE POLICY "Users can manage own study_sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- mood_logs: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own mood_logs" ON public.mood_logs;
CREATE POLICY "Users can manage own mood_logs"
  ON public.mood_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- coding_practice_sessions: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own coding_practice_sessions" ON public.coding_practice_sessions;
CREATE POLICY "Users can manage own coding_practice_sessions"
  ON public.coding_practice_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- mistake_records: full CRUD for own rows
DROP POLICY IF EXISTS "Users can manage own mistake_records" ON public.mistake_records;
CREATE POLICY "Users can manage own mistake_records"
  ON public.mistake_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- snippets: read-only for authenticated users (no user_id; global data)
DROP POLICY IF EXISTS "Authenticated users can read snippets" ON public.snippets;
CREATE POLICY "Authenticated users can read snippets"
  ON public.snippets FOR SELECT
  TO authenticated
  USING (true);
