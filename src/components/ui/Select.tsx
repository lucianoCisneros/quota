import { SelectHTMLAttributes, ReactNode } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    className?: string
    children: ReactNode
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label
                    className="block text-[13px] font-medium text-text-secondary"
                    htmlFor={props.id || props.name}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`w-full bg-surface-2 text-text-primary border border-border-hairline rounded-[12px] px-4 py-2.5 pr-10 text-[15px] appearance-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed ${
                        error ? 'border-danger ring-1 ring-danger/40' : ''
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-text-tertiary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-[13px] text-danger mt-1">{error}</p>}
        </div>
    )
}
