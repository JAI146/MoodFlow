'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GradientButtonProps {
    children: ReactNode
    onClick?: () => void
    className?: string
    variant?: 'primary' | 'secondary'
}

export default function GradientButton({
    children,
    onClick,
    className,
    variant = 'primary'
}: GradientButtonProps) {
    const isPrimary = variant === 'primary'

    return (
        <motion.button
            onClick={onClick}
            className={cn(
                'px-8 py-4 rounded-lg font-semibold text-lg transition-all',
                isPrimary
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'border-2 border-primary text-primary hover:bg-primary/10',
                className
            )}
            whileHover={{
                scale: 1.05,
                boxShadow: isPrimary ? '0 0 40px rgba(99,102,241,0.6)' : '0 0 20px rgba(99,102,241,0.4)'
            }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    )
}
