'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup } from './login.actions'
import { Activity, Eye, EyeOff } from 'lucide-react'

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
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-zinc-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>}>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const [tab, setTab] = useState<'login' | 'register'>('login')

    // Register form state
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

        // Client-side validations
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

        // Submit via FormData to the server action
        const formData = new FormData()
        formData.set('name', name.trim())
        formData.set('lastName', lastName.trim())
        formData.set('email', email.trim())
        formData.set('password', password)

        await signup(formData)
        setIsLoading(false)
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-zinc-100">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                {/* Header */}
                <div className="flex flex-col space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/20">
                        <Activity className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Bienvenido a Quota</h1>
                    <p className="text-sm text-zinc-400">
                        {tab === 'login'
                            ? 'Ingresá tus datos para gestionar tus suscripciones grupales'
                            : 'Creá tu cuenta para empezar a gestionar tus suscripciones'}
                    </p>
                </div>

                {/* Form Container */}
                <div className="grid mx-4 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
                    {/* Tabs */}
                    <div className="flex rounded-xl bg-black/40 p-1 border border-white/5">
                        <button
                            type="button"
                            onClick={() => setTab('login')}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                tab === 'login'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('register')}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                tab === 'register'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {/* Message from URL */}
                    {message && (
                        <div className="rounded-lg bg-indigo-500/10 p-3 text-center text-sm font-medium text-indigo-400 border border-indigo-500/20">
                            {message}
                        </div>
                    )}

                    {/* Forgot password link */}
                    {tab === 'login' && (
                        <div className="text-center -mb-2">
                            <a
                                href="/login/reset-password"
                                className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    )}

                    {/* Login Form */}
                    {tab === 'login' && (
                        <form className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="login-email">
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
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            <div className="grid gap-2 mt-2">
                                <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="login-password">
                                    Contraseña
                                </label>
                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    required
                                    className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                                />
                            </div>

                            <div className="mt-4">
                                <button
                                    formAction={login}
                                    className="w-full inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                                >
                                    Iniciar Sesión
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Register Form */}
                    {tab === 'register' && (
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reg-name">
                                        Nombre <span className="text-indigo-400">*</span>
                                    </label>
                                    <input
                                        id="reg-name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre"
                                        autoComplete="given-name"
                                        className={`flex h-10 w-full rounded-md border bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 ${
                                            errors.name ? 'border-red-500/50' : 'border-white/10'
                                        }`}
                                    />
                                    {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reg-lastname">
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
                                        className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reg-email">
                                    Correo Electrónico <span className="text-indigo-400">*</span>
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
                                    className={`flex h-10 w-full rounded-md border bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 ${
                                        errors.email ? 'border-red-500/50' : 'border-white/10'
                                    }`}
                                />
                                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reg-password">
                                    Contraseña <span className="text-indigo-400">*</span>
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
                                        className={`flex h-10 w-full rounded-md border bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 pr-10 ${
                                            errors.password ? 'border-red-500/50' : 'border-white/10'
                                        }`}
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
                                {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="reg-confirm-password">
                                    Repetir Contraseña <span className="text-indigo-400">*</span>
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
                                        className={`flex h-10 w-full rounded-md border bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 pr-10 ${
                                            errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                                        }`}
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
                                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
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
                                            Creando cuenta...
                                        </span>
                                    ) : (
                                        'Crear Cuenta'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
