'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle signup logic here
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!')
            return
        }
        console.log('Signup:', formData)
    }

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
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

                {/* Signup Card */}
                <motion.div
                    className="glass-card p-8"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Start learning smarter today
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Create Account
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>

                {/* Bottom text */}
                <p className="text-center mt-6 text-sm text-slate-500">
                    By signing up, you agree to our Terms of Service
                </p>
            </motion.div>
        </main>
    )
}
