'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                toast.error(error.message ?? 'Sign in failed')
                setLoading(false)
                return
            }
            toast.success('Welcome back!')
            router.push('/dashboard')
            router.refresh()
        } catch {
            toast.error('Something went wrong')
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <InteractiveParticleField />

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 -z-10" />

            <motion.div
                className="w-full max-w-md px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Brain className="w-10 h-10 text-primary" />
                    <span className="text-3xl font-bold gradient-text">MoodFlow</span>
                </Link>

                {/* Login Card */}
                <motion.div
                    className="glass-card p-8"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Continue your learning journey
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            whileHover={loading ? undefined : { scale: 1.02 }}
                            whileTap={loading ? undefined : { scale: 0.98 }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-slate-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </motion.div>

                {/* Bottom text */}
                <p className="text-center mt-6 text-sm text-slate-500">
                    100% Free • No credit card required
                </p>
            </motion.div>
        </main>
    )
}
