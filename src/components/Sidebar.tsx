'use client'

import { signOut } from '@/app/auth/auth.actions'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, CreditCard, Users, Settings, LogOut, Menu, X, Crown, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState<string | null>(null)

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', user.id)
                    .single()
                setUserName(profile?.name || user.email?.split('@')[0] || null)
            }
        }
        getUser()
    }, [])

    const links = [
        { name: 'Inicio', href: '/', icon: LayoutDashboard },
        { name: 'Suscripciones', href: '/subscriptions', icon: Users },
        { name: 'Ajustes', href: '/settings', icon: Settings },
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-bg-base/90 backdrop-blur-md border-b border-border-hairline flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[10px] bg-accent flex items-center justify-center text-white">
                        <CreditCard size={16} strokeWidth={2} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-text-primary">Quota</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded-[8px] transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`w-64 h-screen fixed top-0 left-0 border-r border-border-hairline flex flex-col p-5 transition-transform duration-300 bg-surface-1 z-50 
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center text-white">
                            <CreditCard size={18} strokeWidth={2} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-text-primary">Quota</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-2 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5">
                    {links.map((link) => {
                        const isDashboardTarget = link.href === '/'
                        const finalIsActive = isDashboardTarget ? pathname === '/' : pathname.startsWith(link.href)

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] transition-colors duration-150 ${
                                    finalIsActive
                                        ? 'bg-accent-subtle text-accent font-medium'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                                }`}
                            >
                                <link.icon
                                    size={18}
                                    strokeWidth={1.75}
                                    className={finalIsActive ? 'text-accent' : 'text-text-tertiary'}
                                />
                                <span className="text-[15px]">{link.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User section */}
                {userName && (
                    <div className="px-3.5 py-2.5 mb-2 rounded-[10px] bg-surface-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center text-accent shrink-0">
                                <User size={15} strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-medium text-text-primary truncate">{userName}</p>
                                <p className="text-[12px] text-text-tertiary">Dashboard</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom section */}
                <div className="space-y-3 mt-3 pt-3 border-t border-border-hairline">
                    <Link
                        href="/premium"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] bg-surface-2 hover:bg-surface-3 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-[8px] bg-warning/10 flex items-center justify-center text-warning shrink-0">
                            <Crown size={14} strokeWidth={1.75} />
                        </div>
                        <div>
                            <p className="text-[14px] font-medium text-text-primary">Premium</p>
                            <p className="text-[12px] text-text-tertiary">Grupos ilimitados</p>
                        </div>
                    </Link>

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors w-full text-[15px]"
                        >
                            <LogOut size={18} strokeWidth={1.75} />
                            <span className="font-medium">Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
