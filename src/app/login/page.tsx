import { login, signup } from './actions'
import { Activity } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-zinc-100">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                {/* Header */}
                <div className="flex flex-col space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-indigo-500/20">
                        <Activity className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">Bienvenido a Quota</h1>
                    <p className="text-sm text-zinc-400">
                        Ingresa tus datos para gestionar tus suscripciones grupales
                    </p>
                </div>

                {/* Form Container (Glassmorphism) */}
                <div className="grid mx-6 gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg">
                    <form className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="email">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
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
                            <label className="text-sm font-medium leading-none text-zinc-300" htmlFor="password">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                            />
                        </div>

                        {/* Error / Success Messages from URL */}
                        {message && (
                            <div className="rounded-lg bg-indigo-500/10 p-3 text-center text-sm font-medium text-indigo-400 border border-indigo-500/20">
                                {message}
                            </div>
                        )}

                        <div className="mt-4 flex flex-col gap-3">
                            <button
                                formAction={login}
                                className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            >
                                Iniciar Sesión
                            </button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#18181A] px-2 text-zinc-500">O nuevo usuario</span>
                                </div>
                            </div>

                            <button
                                formAction={signup}
                                className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            >
                                Crear una Cuenta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
