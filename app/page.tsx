'use client'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Brain, Sparkles, Code, TrendingUp, Clock, Globe } from 'lucide-react'
import GradientButton from '@/components/GradientButton'
import GlassCard from '@/components/GlassCard'
import ScrollIndicator from '@/components/ScrollIndicator'
import Navbar from '@/components/Navbar'
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations'

// Lazy load 3D components
const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false })
const MoodSpheres3D = dynamic(() => import('@/components/MoodSpheres3D'), { ssr: false })
const FloatingCodeSymbols = dynamic(() => import('@/components/FloatingCodeSymbols'), { ssr: false })
const InfinityParticles = dynamic(() => import('@/components/InfinityParticles'), { ssr: false })
const PulsingSphere = dynamic(() => import('@/components/PulsingSphere'), { ssr: false })
const InteractiveParticleField = dynamic(() => import('@/components/InteractiveParticleField'), { ssr: false })

export default function Home() {
    const [selectedMood, setSelectedMood] = useState<'low' | 'moderate' | 'high'>('moderate')
    const [email, setEmail] = useState('')

    const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 })
    const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 })

    return (
        <main className="overflow-x-hidden">
            <InteractiveParticleField />
            <Navbar />

            {/* SECTION 1: HERO */}
            <section className="relative h-screen flex items-center justify-between px-12 lg:px-24">{/* Adjust for navbar height if needed */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 -z-20" />

                {/* Left: Content */}
                <motion.div
                    className="w-full lg:w-3/5 z-10"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.h1
                        className="text-6xl lg:text-7xl font-bold mb-6 gradient-text"
                        variants={fadeInUp}
                    >
                        Study Smarter,<br />Not Harder.
                    </motion.h1>

                    <motion.p
                        className="text-xl text-slate-400 mb-8 max-w-xl"
                        variants={fadeInUp}
                    >
                        AI-powered study assistant that adapts to your mood
                    </motion.p>

                    <motion.div
                        className="flex gap-4"
                        variants={fadeInUp}
                    >
                        <GradientButton variant="primary">Get Started</GradientButton>
                        <GradientButton variant="secondary">Watch Demo</GradientButton>
                    </motion.div>
                </motion.div>

                {/* Right: 3D Brain */}
                <div className="hidden lg:block w-2/5 h-full">
                    <Hero3D />
                </div>

                <ScrollIndicator />
            </section>

            {/* SECTION 2: MOOD CHECK-IN DEMO */}
            <section className="relative min-h-[80vh] flex items-center px-12 lg:px-24 py-20">
                <div className="absolute inset-0 bg-slate-800/50 -z-10" />

                <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: 3D Spheres */}
                    <div className="h-[500px]">
                        <MoodSpheres3D onMoodSelect={setSelectedMood} />
                    </div>

                    {/* Right: UI Preview */}
                    <GlassCard>
                        <h2 className="text-4xl font-bold mb-6">Check Your Mood</h2>
                        <p className="text-slate-400 mb-8">
                            Select your energy level and we&apos;ll customize your study session
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-3">Energy Level</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="w-full accent-primary"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium mb-3">Study Duration</label>
                            <div className="flex gap-3">
                                {[15, 30, 60].map((mins) => (
                                    <button
                                        key={mins}
                                        className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-primary transition-all"
                                    >
                                        {mins} min
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-primary/20 rounded-lg border border-primary/30">
                            <p className="text-sm">
                                <strong>Recommended:</strong> {selectedMood === 'low' ? 'Light reading session' : selectedMood === 'moderate' ? 'Balanced study with breaks' : 'Intensive practice session'}
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* SECTION 3: CODE TYPING GAME PREVIEW */}
            <section className="relative min-h-screen flex items-center justify-center px-12 lg:px-24 py-20">
                <FloatingCodeSymbols />

                <div className="max-w-4xl w-full z-10">
                    <motion.h2
                        className="text-5xl font-bold text-center mb-12 gradient-text"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Practice Makes Perfect
                    </motion.h2>

                    <GlassCard className="mb-8">
                        <div className="bg-[#1e1e1e] rounded-lg p-6 font-mono text-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-4 text-slate-400">main.py</span>
                            </div>
                            <pre className="text-green-400">
                                {`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`}
                            </pre>
                        </div>
                    </GlassCard>

                    <div className="flex justify-center gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary">45</div>
                            <div className="text-slate-400">WPM</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-secondary">98%</div>
                            <div className="text-slate-400">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8 flex-wrap">
                        {['Real Syntax', '10+ Languages', 'Track Progress'].map((feature, i) => (
                            <div
                                key={i}
                                className="px-6 py-3 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700"
                            >
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: FEATURES GRID */}
            <section
                ref={featuresRef}
                className="relative py-20 px-12 lg:px-24 bg-slate-800"
            >
                <motion.h2
                    className="text-5xl font-bold text-center mb-16"
                    initial={{ opacity: 0 }}
                    animate={featuresInView ? { opacity: 1 } : {}}
                >
                    Everything You Need
                </motion.h2>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate={featuresInView ? "visible" : "hidden"}
                >
                    {[
                        { icon: Brain, title: 'AI Recommendations', desc: 'Smart suggestions based on your mood and goals' },
                        { icon: Sparkles, title: 'Mood-Aware', desc: 'Adapts content difficulty to your energy level' },
                        { icon: Code, title: 'Code Practice', desc: 'Real syntax highlighting in 10+ languages' },
                        { icon: TrendingUp, title: 'Progress Tracking', desc: 'Visualize your improvement over time' },
                        { icon: Clock, title: '15-Min Sessions', desc: 'Micro-learning designed for busy schedules' },
                        { icon: Globe, title: 'Multi-Language', desc: 'Support for Python, JavaScript, Java, and more' },
                    ].map((feature, i) => (
                        <motion.div key={i} variants={scaleIn}>
                            <GlassCard className="text-center">
                                <feature.icon className="w-16 h-16 mx-auto mb-4 text-primary" />
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.desc}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* SECTION 5: SOCIAL PROOF / STATS */}
            <section
                ref={statsRef}
                className="relative h-[60vh] flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600"
            >
                <div className="h-64 w-full mb-12">
                    <InfinityParticles />
                </div>

                <motion.div
                    className="flex gap-16 text-center"
                    initial="hidden"
                    animate={statsInView ? "visible" : "hidden"}
                    variants={staggerContainer}
                >
                    {[
                        { value: '10,000+', label: 'Students' },
                        { value: '50+', label: 'Universities' },
                        { value: '95%', label: 'Less Stress' },
                    ].map((stat, i) => (
                        <motion.div key={i} variants={fadeInUp}>
                            <div className="text-6xl font-bold text-white mb-2">{stat.value}</div>
                            <div className="text-xl text-purple-100">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* SECTION 6: FINAL CTA */}
            <section className="relative h-[80vh] flex items-center justify-center px-12">
                <div className="absolute inset-0 bg-slate-900 -z-20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.3)_0%,transparent_70%)] -z-10" />

                {/* Background sphere */}
                <div className="absolute inset-0 opacity-30 -z-10">
                    <PulsingSphere />
                </div>

                {/* Form */}
                <motion.div
                    className="text-center z-10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-6xl font-bold mb-6 gradient-text">Ready to Transform Your Study Habits?</h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                        Join thousands of students who are learning smarter with MoodFlow
                    </p>

                    <div className="flex gap-4 justify-center mb-6">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="px-6 py-4 rounded-lg bg-slate-800 border-2 border-slate-700 focus:border-primary w-80 outline-none text-lg"
                        />
                        <GradientButton variant="primary">Start Learning</GradientButton>
                    </div>

                    <p className="text-sm text-slate-500">
                        100% Free • No signup required • Start in seconds
                    </p>
                </motion.div>
            </section>
        </main>
    )
}
