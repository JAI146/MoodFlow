'use client'
import { useState, useEffect } from 'react'
import { Brain, Code, LogOut, Settings, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })
const CodeType = dynamic(() => import('@/components/CodeType'), { ssr: false })

export default function PracticePage() {
    const router = useRouter()
    const [user, setUser] = useState<unknown>(null)

    useEffect(() => {
        const check = async () => {
            const { data: { user: u } } = await supabase.auth.getUser()
            if (!u) {
                router.push('/login')
                return
            }
            setUser(u)
        }
        check()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    if (user === null) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-slate-400">Loading…</p>
            </main>
        )
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
                <div className="mb-6">
                    <h1 className="text-4xl font-bold flex items-center gap-2">
                        <Code className="w-10 h-10 text-primary" />
                        Code Practice
                    </h1>
                    <p className="text-slate-400 mt-2">Type the snippets to improve your speed and accuracy.</p>
                </div>
                <CodeType />
            </div>
        </main>
    )
}
