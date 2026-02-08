'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Book, Plus, LogOut, Settings, Calendar, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

interface Course {
    id: string
    name: string
    description?: string
    color?: string
}

interface Assignment {
    id: string
    title: string
    due_at: string
    estimated_minutes?: number
    completed_at?: string | null
    course_id?: string | null
    courses?: Course | null
}

export default function AssignmentsPage() {
    const router = useRouter()
    const [user, setUser] = useState<unknown>(null)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        title: '',
        due_at: '',
        estimated_minutes: 30,
        course_id: ''
    })

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
        fetchAssignments()
        fetchCourses()
    }

    const fetchAssignments = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/onboarding/assignments')
            if (res.ok) {
                const data = await res.json()
                setAssignments(data.assignments ?? [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/onboarding/courses')
            if (res.ok) {
                const data = await res.json()
                setCourses(data.courses ?? [])
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/onboarding/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    due_at: form.due_at || new Date().toISOString(),
                    estimated_minutes: form.estimated_minutes || 30,
                    course_id: form.course_id || null
                })
            })
            if (res.ok) {
                setForm({ title: '', due_at: '', estimated_minutes: 30, course_id: '' })
                setShowForm(false)
                fetchAssignments()
            } else {
                const err = await res.json()
                alert(err.error || 'Failed to create assignment')
            }
        } catch (e) {
            console.error(e)
            alert('Failed to create assignment')
        } finally {
            setSubmitting(false)
        }
    }

    const formatDue = (s: string) => {
        const d = new Date(s)
        return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' })
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
                    className="mb-8 flex items-center justify-between"
                >
                    <h1 className="text-4xl font-bold flex items-center gap-2">
                        <Book className="w-10 h-10 text-primary" />
                        Assignments
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add assignment
                    </button>
                </motion.div>

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="glass-card p-6 mb-6"
                    >
                        <h2 className="text-xl font-bold mb-4">New assignment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Due date & time</label>
                                <input
                                    type="datetime-local"
                                    value={form.due_at}
                                    onChange={e => setForm(f => ({ ...f, due_at: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Estimated minutes</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={form.estimated_minutes}
                                    onChange={e => setForm(f => ({ ...f, estimated_minutes: Number(e.target.value) || 30 }))}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                                />
                            </div>
                            {courses.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Course</label>
                                    <select
                                        value={form.course_id}
                                        onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                                    >
                                        <option value="">None</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
                                >
                                    {submitting ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {loading ? (
                    <p className="text-slate-400">Loading assignments…</p>
                ) : assignments.length === 0 ? (
                    <div className="glass-card p-8 text-center text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No assignments yet. Add one above to get started.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {assignments.map(a => (
                            <motion.li
                                key={a.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-semibold">{a.title}</p>
                                    <p className="text-sm text-slate-400">
                                        Due {formatDue(a.due_at)}
                                        {a.estimated_minutes && ` · ${a.estimated_minutes} min`}
                                        {a.courses?.name && ` · ${a.courses.name}`}
                                    </p>
                                </div>
                                {a.completed_at && (
                                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Done</span>
                                )}
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    )
}
