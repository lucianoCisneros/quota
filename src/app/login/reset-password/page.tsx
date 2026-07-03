'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                    <div className="flex flex-col space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-success/10">
                            <CreditCard className="h-6 w-6 text-success" strokeWidth={2} />
                        </div>
                        <h1 className="text-[28px] font-bold tracking-tight text-text-primary">Email enviado</h1>
                        <p className="text-[15px] text-text-secondary">
                            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                <div className="flex flex-col space-y-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent">
                        <CreditCard className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-[28px] font-bold tracking-tight text-text-primary">Restablecer contraseña</h1>
                    <p className="text-[15px] text-text-secondary">
                        Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña
                    </p>
                </div>

                <div className="rounded-[18px] border border-border-hairline bg-surface-1 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                    {message && (
                        <div className="mb-5 p-3 rounded-[10px] bg-surface-2 text-danger text-[13px] text-center">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reset-email">
                                Correo Electrónico <span className="text-accent">*</span>
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
                                className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                            />
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full">
                            Enviar enlace
                        </Button>
                    </form>

                    <div className="text-center mt-5">
                        <a href="/login" className="text-[13px] text-accent hover:text-accent-hover transition-colors">
                            Volver a iniciar sesión
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}