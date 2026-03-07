"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CreditCard,
    Users,
    Settings,
    LogOut,
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
        { name: "Participants", href: "/participants", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="w-64 h-screen fixed top-0 left-0 border-r border-border-light flex flex-col p-6 transition-all bg-surface/80 backdrop-blur-xl z-50">
            <div className="flex items-center gap-3 mb-12 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                    <CreditCard size={20} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Quota
                </span>
            </div>

            <div className="flex-1 space-y-2">
                {links.map((link) => {
                    const isDashboardTarget = link.href === "/";
                    const finalIsActive = isDashboardTarget ? pathname === "/" : pathname.startsWith(link.href);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${finalIsActive
                                    ? "text-white bg-primary-600 shadow-md shadow-primary-600/20"
                                    : "text-foreground/70 hover:bg-surface-hover hover:text-foreground"
                                }`}
                        >
                            {finalIsActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                            )}
                            <link.icon
                                size={20}
                                className={`transition-transform duration-300 ${finalIsActive ? "scale-110" : "group-hover:scale-110"
                                    }`}
                            />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-100 dark:border-primary-800/30 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-500/10 rounded-full blur-xl animate-pulse-slow"></div>
                    <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-1">New payment!</h4>
                    <p className="text-sm text-primary-600/80 dark:text-primary-400/80 mb-3">Netflix is due in 3 days.</p>
                    <button className="w-full py-2 bg-white dark:bg-surface/50 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium shadow-sm hover:shadow hover:bg-primary-50 transition-all">
                        Review
                    </button>
                </div>

                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all w-full mt-4">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
