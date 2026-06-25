'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import { resetPassword } from './reset-password.actions'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMessage(null)
        setIsLoading(true)

        if (!email.trim()) {
            setMessage('Ingresá tu email')
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.set('email', email.trim())

        await resetPassword(formData)
        setSent(true)
        setIsLoading(false)
    }

    if (sent) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-zinc-100">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)] border border-green-500/20">
                            <Activity className="h-6 w-6 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight">Email enviado</h1>
                        <p className="text-sm text-zinc-400">
                            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
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
                    <h1 className="text-3xl font-semibold tracking-tight">Restablecer contraseña</h1>
                    <p className="text-sm text-zinc-400">
                        Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña
                    </p>
                </div>

                <div className="grid mx-4 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
                    {message && (
                        <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm font-medium text-red-400 border border-red-500/20">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reset-email">
                                Correo Electrónico <span className="text-indigo-400">*</span>
                            </label>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                placeholder="nombre@ejemplo.com"
                                required
                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                            />
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
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar enlace'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <a href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                            Volver a iniciar sesión
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}