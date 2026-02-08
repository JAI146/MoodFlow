'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Flame,
  Book,
  Code,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  statsFetcher,
  profileFetcher,
  recommendMutationFetcher,
  startSessionMutationFetcher,
  completeSessionMutationFetcher,
} from '@/lib/swr';

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), {
  ssr: false,
});
const CodeType = dynamic(() => import('@/components/CodeType'), { ssr: false });

type Mood = 'low' | 'moderate' | 'high';

interface UserStats {
  total_study_time: number;
  total_sessions: number;
  current_streak: number;
  longest_streak: number;
}

interface Recommendation {
  task_name: string;
  description: string;
  reasoning: string;
  sub_steps: string[];
  estimated_completion: number;
  task_type: string;
}

function formatStudyTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface ProfileData {
  display_name?: string | null;
  default_session_minutes?: number | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [timeAvailable, setTimeAvailable] = useState<number>(30);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const { data: stats, mutate: mutateStats } = useSWR<UserStats | null>(
    user ? '/api/stats' : null,
    statsFetcher,
  );

  const { data: profile } = useSWR<ProfileData | null>(
    user ? '/api/onboarding/profile' : null,
    profileFetcher,
  );

  const { trigger: triggerRecommend, isMutating: loadingRecommend } = useSWRMutation(
    'recommend',
    recommendMutationFetcher,
  );
  const { trigger: triggerStartSession } = useSWRMutation(
    'start-session',
    startSessionMutationFetcher,
  );
  const { trigger: triggerCompleteSession } = useSWRMutation(
    'complete-session',
    completeSessionMutationFetcher,
  );

  const firstName =
    (profile?.display_name && profile.display_name.trim().split(/\s+/)[0]) ||
    (user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string'
      ? user.user_metadata.full_name.trim().split(/\s+/)[0]
      : '') ||
    '';

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
    }
  };

  const loading = loadingRecommend;

  const getRecommendation = async () => {
    if (!mood) {
      alert('Please select your mood first!');
      return;
    }
    try {
      const data = await triggerRecommend({ mood, timeAvailable });
      if (data?.recommendation) setRecommendation(data.recommendation);
    } catch {
      alert('Failed to get recommendation');
    }
  };

  const startSession = async () => {
    if (!recommendation) {
      alert('Please get a recommendation first!');
      return;
    }
    try {
      const data = await triggerStartSession({
        mood,
        energy_level: mood === 'high' ? 8 : mood === 'moderate' ? 5 : 3,
        time_allocated: timeAvailable,
        task_type: recommendation.task_type,
        task_description: recommendation.task_name,
      });
      if (data?.session?.id) {
        setCurrentSessionId(data.session.id);
        setSessionActive(true);
        setSessionStartTime(new Date());
      }
    } catch {
      console.error('Error starting session');
    }
  };

  const completeSession = async () => {
    if (!currentSessionId || !sessionStartTime) return;
    const actualDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000);
    try {
      await triggerCompleteSession({
        id: currentSessionId,
        durationActual: actualDuration,
        completed: true,
        notes: 'Session completed from dashboard',
      });
      setSessionActive(false);
      setCurrentSessionId(null);
      setSessionStartTime(null);
      setRecommendation(null);
      setMood(null);
      mutateStats();
      alert('Session completed! Great job! 🎉');
    } catch {
      console.error('Error completing session');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const moods: { value: Mood; label: string; emoji: string; color: string }[] = [
    { value: 'low', label: 'Low Energy', emoji: '😴', color: 'from-blue-500 to-cyan-500' },
    { value: 'moderate', label: 'Moderate', emoji: '😊', color: 'from-purple-500 to-pink-500' },
    { value: 'high', label: 'High Energy', emoji: '🚀', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <InteractiveParticleField />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MoodFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{firstName ? `, ${firstName}` : ''}! 👋
          </h1>
          <p className="text-slate-400">Let's make today productive</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            label="Current Streak"
            value={`${stats?.current_streak || 0} days`}
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            label="Longest Streak"
            value={`${stats?.longest_streak || 0} days`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-blue-500" />}
            label="Total Study Time"
            value={formatStudyTime(stats?.total_study_time ?? 0)}
            color="blue"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-purple-500" />}
            label="Sessions"
            value={stats?.total_sessions || 0}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Mood & Recommendation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Selection */}
            {!sessionActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  How are you feeling?
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        mood === m.value
                          ? 'border-primary bg-primary/20 scale-105'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-4xl mb-2">{m.emoji}</div>
                      <div className="font-semibold">{m.label}</div>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    How much time do you have? ({timeAvailable} min)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>15min</span>
                    <span>120min</span>
                  </div>
                </div>

                <button
                  onClick={getRecommendation}
                  disabled={!mood || loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Brain className="w-5 h-5" />
                  {loading ? 'Getting AI Recommendation...' : 'Get AI Recommendation'}
                </button>
              </motion.div>
            )}

            {/* AI Recommendation */}
            <AnimatePresence>
              {recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Target className="w-6 h-6 text-primary" />
                      Recommended Task
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                      {recommendation.estimated_completion} min
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">{recommendation.task_name}</h3>
                    <p className="text-slate-400">{recommendation.description}</p>
                  </div>

                  <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300">
                      <strong>Why this task?</strong> {recommendation.reasoning}
                    </p>
                  </div>

                  {recommendation.sub_steps && recommendation.sub_steps.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Steps to complete:</h4>
                      <ul className="space-y-2">
                        {recommendation.sub_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!sessionActive ? (
                    <button
                      onClick={startSession}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                      <Play className="w-5 h-5" />
                      Start Session
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-green-400 font-semibold">Session In Progress</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Started {sessionStartTime?.toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={completeSession}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        <TrendingUp className="w-5 h-5" />
                        Complete Session
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickAction
                  icon={<Book className="w-5 h-5" />}
                  label="View Assignments"
                  onClick={() => router.push('/assignments')}
                />
                <QuickAction
                  icon={<Code className="w-5 h-5" />}
                  label="Code Practice"
                  onClick={() => router.push('/practice')}
                />
                <QuickAction
                  icon={<Calendar className="w-5 h-5" />}
                  label="My Schedule"
                  onClick={() => router.push('/schedule')}
                />
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
            >
              <h3 className="font-bold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-slate-300">
                Study in focused blocks and take short breaks. Your brain retains information better
                with spaced repetition!
              </p>
            </motion.div>
          </div>
        </div>

        {/* CodeType Game Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <CodeType mood={mood} timeAvailable={timeAvailable} />
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg bg-${color}-500/20`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:border-primary hover:bg-primary/10 transition-all"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Play icon component
function Play({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}
