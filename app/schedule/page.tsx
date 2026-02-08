'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Calendar, LogOut, Settings, ArrowLeft, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

interface Session {
    id: string
    created_at: string
    started_at?: string
    ended_at?: string | null
    planned_minutes?: number
    mood_at_start?: string
    task_type?: string
    notes?: string | null
}

export default function SchedulePage() {
    const router = useRouter()
    const [user, setUser] = useState<unknown>(null)
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) {
            router.push('/login')
            return
        }
        setUser(u)
        fetchSessions()
    }

    const fetchSessions = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/sessions')
            if (res.ok) {
                const data = await res.json()
                setSessions(data.sessions ?? [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const formatDate = (s: string) => {
        const d = new Date(s)
        return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' at ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
    }

    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <InteractiveParticleField />
            <nav className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <Brain className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold gradient-text">MoodFlow</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5" />
                        </Link>
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

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold flex items-center gap-2">
                        <Calendar className="w-10 h-10 text-primary" />
                        My Schedule
                    </h1>
                    <p className="text-slate-400 mt-2">Recent study sessions</p>
                </motion.div>

                {loading ? (
                    <p className="text-slate-400">Loading sessions…</p>
                ) : sessions.length === 0 ? (
                    <div className="glass-card p-8 text-center text-slate-400">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No sessions yet. Start a session from your dashboard.</p>
                        <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline">Go to Dashboard</Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {sessions.map((s, i) => (
                            <motion.li
                                key={s.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-4"
                            >
                                <p className="font-semibold capitalize">{s.task_type?.replace('_', ' ') ?? 'Study session'}</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {formatDate(s.started_at ?? s.created_at)}
                                    {s.planned_minutes != null && ` · ${s.planned_minutes} min planned`}
                                </p>
                                {s.mood_at_start && (
                                    <p className="text-sm text-slate-500 mt-1">Mood: {s.mood_at_start}</p>
                                )}
                                {s.notes && <p className="text-sm text-slate-500 mt-1">{s.notes}</p>}
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    )
}
