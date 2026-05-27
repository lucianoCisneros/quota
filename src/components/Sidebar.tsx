'use client'

import { signOut } from '@/app/auth/actions'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, CreditCard, Users, Settings, LogOut, Menu, X, Crown } from 'lucide-react'

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const links = [
        { name: 'Inicio', href: '/', icon: LayoutDashboard },
        { name: 'Suscripciones', href: '/subscriptions', icon: Users },
        { name: 'Ajustes', href: '/settings', icon: Settings },
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-border-light flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
                        <CreditCard size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Quota
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-foreground/70 bg-surface-hover rounded-lg"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar content */}
            <aside
                className={`w-64 h-screen fixed top-0 left-0 border-r border-border-light flex flex-col p-6 transition-transform duration-300 bg-surface/95 md:bg-surface/80 backdrop-blur-xl z-50 
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div className="flex items-center justify-between mb-12 group">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                            <CreditCard size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Quota
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-2 text-foreground/50 hover:text-foreground"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 space-y-2">
                    {links.map((link) => {
                        const isDashboardTarget = link.href === '/'
                        const finalIsActive = isDashboardTarget ? pathname === '/' : pathname.startsWith(link.href)

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                    finalIsActive
                                        ? 'text-white bg-primary-600 shadow-md shadow-primary-600/20'
                                        : 'text-foreground/70 hover:bg-surface-hover hover:text-foreground'
                                }`}
                            >
                                {finalIsActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                )}
                                <link.icon
                                    size={20}
                                    className={`transition-transform duration-300 ${
                                        finalIsActive ? 'scale-110' : 'group-hover:scale-110'
                                    }`}
                                />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="mt-8 space-y-4">
                    <Link
                        href="/premium"
                        onClick={() => setIsOpen(false)}
                        className="block p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                    >
                        <h4 className="font-semibold text-yellow-400 mb-1 flex items-center gap-2">
                            <Crown size={16} /> Premium
                        </h4>
                        <p className="text-sm text-zinc-400">Grupos ilimitados y más funciones.</p>
                    </Link>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all w-full mt-4"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
