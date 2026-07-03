import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    className?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
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
            <input
                className={`w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed ${
                    error ? 'border-danger ring-1 ring-danger/40' : ''
                } ${className}`}
                {...props}
            />
            {error && <p className="text-[13px] text-danger mt-1">{error}</p>}
        </div>
    )
}
