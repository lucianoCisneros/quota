import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
    isLoading?: boolean
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

    const variants = {
        primary: 'bg-accent text-white hover:bg-accent-hover active:opacity-90',
        secondary: 'bg-surface-2 text-text-primary hover:bg-surface-3 active:opacity-90',
        danger: 'bg-surface-2 text-danger hover:bg-danger/10 active:opacity-90',
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-2 active:opacity-90',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-[13px] rounded-[8px] gap-1.5',
        md: 'px-4 py-2 text-[15px] rounded-[12px] gap-2',
        lg: 'px-5 py-2.5 text-[17px] rounded-[12px] gap-2.5',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-4 w-4 text-current shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    )
}
