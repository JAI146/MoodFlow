'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React from "react";
import YouTube from "react-youtube";


const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

    const opts = {
      height: '190',
      width: '350',
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
      },
    };

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle login logic here
        console.log('Login:', { email, password })
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

                {/* Demo Card */}
                <motion.div
                    className="glass-card p-8"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1.1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-3xl font-bold mb-2 text-center">How it works</h1>
                   <YouTube videoId="dQw4w9WgXcQ" opts={opts}></YouTube>
                    

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-slate-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </main>
    )
}
