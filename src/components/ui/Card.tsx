import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    variant?: 'elevated' | 'flat' | 'inset'
}

export function Card({ children, className = '', variant = 'flat' }: CardProps) {
    const styles = {
        elevated: 'card-elevated',
        flat: 'card-flat',
        inset: 'card-inset',
    }

    return <div className={`${styles[variant]} ${className}`}>{children}</div>
}
