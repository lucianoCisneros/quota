'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { updatePassword } from './update-password.actions'

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Mínimo 8 caracteres'
    if (password.length > 64) return 'Máximo 64 caracteres'
    if (!/\d/.test(password)) return 'Debe contener al menos un número'
    if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula'
    if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula'
    return null
}

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const pwError = validatePassword(password)
        if (pwError) {
            setError(pwError)
            setIsLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.set('password', password)

        const result = await updatePassword(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
            return
        }

        setSuccess(true)
        setIsLoading(false)

        setTimeout(() => {
            router.push('/login')
        }, 3000)
    }

    if (success) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-zinc-100">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-green-500/20">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">Contraseña actualizada</h1>
                        <p className="text-sm text-zinc-400">
                            Tu contraseña se actualizó correctamente. Serás redirigido al inicio de sesión...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-zinc-100">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex flex-col space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/20">
                        <Activity className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Nueva contraseña</h1>
                    <p className="text-sm text-zinc-400">Ingresá tu nueva contraseña para restablecer el acceso</p>
                </div>

                <div className="grid mx-4 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="new-password">
                                Nueva Contraseña <span className="text-indigo-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                                    required
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="confirm-password">
                                Repetir Contraseña <span className="text-indigo-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    placeholder="Repetí la contraseña"
                                    required
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Actualizando...
                                    </span>
                                ) : (
                                    'Actualizar Contraseña'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
