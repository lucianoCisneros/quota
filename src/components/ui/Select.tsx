import { SelectHTMLAttributes, ReactNode } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    className?: string
    children: ReactNode
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-sm font-medium text-zinc-300" htmlFor={props.id || props.name}>
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all duration-300 ${error ? 'border-red-500/50' : ''} ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
