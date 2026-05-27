import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    className?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-2 w-full">
            {label && (
                <label className="text-sm font-medium text-zinc-300" htmlFor={props.id || props.name}>
                    {label}
                </label>
            )}
            <input
                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${error ? 'border-red-500/50' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
