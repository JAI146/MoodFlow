import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
    children: ReactNode
    className?: string
}

export default function GlassCard({ children, className }: GlassCardProps) {
    return (
        <div className={cn('glass-card p-8', className)}>
            {children}
        </div>
    )
}
