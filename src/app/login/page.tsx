'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './login.actions'
import { CreditCard, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Mínimo 8 caracteres'
    if (password.length > 64) return 'Máximo 64 caracteres'
    if (!/\d/.test(password)) return 'Debe contener al menos un número'
    if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula'
    if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula'
    return null
}

type FormErrors = {
    name?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-bg-base text-text-primary">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>}>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const [tab, setTab] = useState<'login' | 'register'>('login')

    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isLoading, setIsLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})
        setIsLoading(true)

        const fieldErrors: FormErrors = {}

        if (!name.trim()) {
            fieldErrors.name = 'El nombre es obligatorio'
        }

        if (!email.trim()) {
            fieldErrors.email = 'El email es obligatorio'
        }

        const pwError = validatePassword(password)
        if (pwError) {
            fieldErrors.password = pwError
        }

        if (password !== confirmPassword) {
            fieldErrors.confirmPassword = 'Las contraseñas no coinciden'
        }

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.set('name', name.trim())
        formData.set('lastName', lastName.trim())
        formData.set('email', email.trim())
        formData.set('password', password)

        await signup(formData)
        setIsLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
                {/* Header */}
                <div className="flex flex-col space-y-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent">
                        <CreditCard className="h-6 w-6 text-white" strokeWidth={2} />
                    </div>
                    <h1 className="text-[28px] font-bold tracking-tight text-text-primary">Bienvenido a Quota</h1>
                    <p className="text-[15px] text-text-secondary">
                        {tab === 'login'
                            ? 'Ingresá tus datos para gestionar tus suscripciones grupales'
                            : 'Creá tu cuenta para empezar a gestionar tus suscripciones'}
                    </p>
                </div>

                {/* Form Container */}
                <div className="rounded-[18px] border border-border-hairline bg-surface-1 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                    {/* Segmented Tabs */}
                    <div className="segmented-control w-full mb-6">
                        <button
                            type="button"
                            onClick={() => setTab('login')}
                            className={`flex-1 ${tab === 'login' ? 'active' : ''}`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('register')}
                            className={`flex-1 ${tab === 'register' ? 'active' : ''}`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Message from URL */}
                    {message && (
                        <div className="mb-5 p-3 rounded-[10px] bg-accent-subtle text-[13px] text-accent text-center">
                            {message}
                        </div>
                    )}

                    {/* Forgot password link */}
                    {tab === 'login' && (
                        <div className="text-center mb-5">
                            <a
                                href="/login/reset-password"
                                className="text-[13px] text-text-tertiary hover:text-accent transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    )}

                    {/* Login Form */}
                    {tab === 'login' && (
                        <form className="flex flex-col gap-5">
                            <div>
                                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="login-email">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    placeholder="nombre@ejemplo.com"
                                    required
                                    className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                                />
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="login-password">
                                    Contraseña
                                </label>
                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                                />
                            </div>

                            <Button formAction={login} className="w-full mt-1">
                                Iniciar Sesión
                            </Button>
                        </form>
                    )}

                    {/* Register Form */}
                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reg-name">
                                        Nombre <span className="text-accent">*</span>
                                    </label>
                                    <input
                                        id="reg-name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre"
                                        autoComplete="given-name"
                                        className={`w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
                                            errors.name ? 'border-danger ring-1 ring-danger/40' : 'border-border-hairline'
                                        }`}
                                    />
                                    {errors.name && <p className="text-[13px] text-danger mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reg-lastname">
                                        Apellido
                                    </label>
                                    <input
                                        id="reg-lastname"
                                        name="lastName"
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Tu apellido"
                                        autoComplete="family-name"
                                        className="w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border border-border-hairline rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reg-email">
                                    Correo Electrónico <span className="text-accent">*</span>
                                </label>
                                <input
                                    id="reg-email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    placeholder="nombre@ejemplo.com"
                                    required
                                    className={`w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border rounded-[12px] px-4 py-2.5 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
                                        errors.email ? 'border-danger ring-1 ring-danger/40' : 'border-border-hairline'
                                    }`}
                                />
                                {errors.email && <p className="text-[13px] text-danger mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reg-password">
                                    Contraseña <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="reg-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        placeholder="Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                                        required
                                        className={`w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border rounded-[12px] px-4 py-2.5 pr-10 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
                                            errors.password ? 'border-danger ring-1 ring-danger/40' : 'border-border-hairline'
                                        }`}
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
                                {errors.password && <p className="text-[13px] text-danger mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reg-confirm-password">
                                    Repetir Contraseña <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="reg-confirm-password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        placeholder="Repetí la contraseña"
                                        required
                                        className={`w-full bg-surface-2 text-text-primary placeholder:text-text-tertiary border rounded-[12px] px-4 py-2.5 pr-10 text-[15px] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${
                                            errors.confirmPassword ? 'border-danger ring-1 ring-danger/40' : 'border-border-hairline'
                                        }`}
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
                                {errors.confirmPassword && <p className="text-[13px] text-danger mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <Button type="submit" isLoading={isLoading} className="w-full mt-1">
                                Crear Cuenta
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
