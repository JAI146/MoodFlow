'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { motion } from 'framer-motion';
import { Brain, Settings as SettingsIcon, LogOut, ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { profileFetcher, updateProfileMutationFetcher } from '@/lib/swr';

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), {
  ssr: false,
});

interface Profile {
  id?: string;
  display_name?: string | null;
  default_session_minutes?: number | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null);
  const [form, setForm] = useState({ displayName: '', defaultSessionMinutes: 30 });

  const {
    data: profile,
    isLoading: loading,
    mutate: mutateProfile,
  } = useSWR<Profile | null>(user ? '/api/onboarding/profile' : null, profileFetcher);

  const { trigger: updateProfile, isMutating: saving } = useSWRMutation(
    'update-profile',
    updateProfileMutationFetcher,
  );

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.display_name ?? '',
        defaultSessionMinutes: profile.default_session_minutes ?? 30,
      });
    }
  }, [profile]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName: form.displayName || null,
        defaultSessionMinutes: form.defaultSessionMinutes,
      });
      await mutateProfile();
    } catch (e: unknown) {
      const err = e as { data?: { error?: string } };
      alert(err?.data?.error || 'Failed to save');
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <InteractiveParticleField />
      <nav className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">MoodFlow</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-10 h-10 text-primary" />
            Settings
          </h1>
          <p className="text-slate-400 mt-2">Manage your profile and preferences.</p>
        </motion.div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Display name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Default session length (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                step={5}
                value={form.defaultSessionMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defaultSessionMinutes: Number(e.target.value) || 30 }))
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </motion.form>
        )}
      </div>
    </main>
  );
}
