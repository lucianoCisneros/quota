'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                    <div className="flex flex-col space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-success/10">
                            <CreditCard className="h-6 w-6 text-success" strokeWidth={2} />
                        </div>
                        <h1 className="text-[28px] font-bold tracking-tight text-text-primary">Contraseña actualizada</h1>
                        <p className="text-[15px] text-text-secondary">
                            Tu contraseña se actualizó correctamente. Serás redirigido al inicio de sesión...
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
                    <h1 className="text-[28px] font-bold tracking-tight text-text-primary">Nueva contraseña</h1>
                    <p className="text-[15px] text-text-secondary">Ingresá tu nueva contraseña para restablecer el acceso</p>
                </div>

                <div className="rounded-[18px] border border-border-hairline bg-surface-1 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                    {error && (
                        <div className="mb-5 p-3 rounded-[10px] bg-surface-2 text-danger text-[13px] text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="new-password">
                                Nueva Contraseña <span className="text-accent">*</span>
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
                                    className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 pr-10 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="confirm-password">
                                Repetir Contraseña <span className="text-accent">*</span>
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
                                    className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 pr-10 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                            Actualizar Contraseña
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
