'use client'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import Link from 'next/link'
import GradientButton from './GradientButton'

export default function Navbar() {
    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
    ]

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <Brain className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold gradient-text">MoodFlow</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <button className="px-6 py-2 text-slate-300 hover:text-white transition-colors">
                                Login
                            </button>
                        </Link>
                        <Link href="/signup">
                            <GradientButton variant="primary" className="!py-2 !px-6 !text-base">
                                Sign Up
                            </GradientButton>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}
