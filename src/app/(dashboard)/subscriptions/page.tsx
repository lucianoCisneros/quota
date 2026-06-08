import Link from 'next/link'
import { getAllSubscriptions } from './subscriptions.actions'
import { formatBillingPeriodLabel } from '@/utils/billing-period'
import { Card } from '@/components/ui/Card'
import { SendRemindersButton } from '@/components/ui/SendRemindersButton'

export default async function SubscriptionsPage() {
    const { subscriptions, billingPeriod } = await getAllSubscriptions()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            {/* ── Header ────────────────────────────────────────────── */}
            <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Suscripciones</h1>
                    <p className="text-sm sm:text-base text-zinc-400">
                        Todos tus grupos en un solo lugar • periódo de cobro:{' '}
                        <span className="text-white font-medium">{periodLabel}</span>
                    </p>
                </div>
                <div className="self-stretch sm:self-auto">
                    <SendRemindersButton />
                </div>
            </header>

            {/* ── Mobile: Card list ─────────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {subscriptions.length === 0 ? (
                    <Card className="p-6 text-center" variant="default">
                        <p className="text-zinc-500 italic">
                            No tenés suscripciones. Creá un grupo y agregá amigos.
                        </p>
                    </Card>
                ) : (
                    subscriptions.map((s) => (
                        <Link key={s.id} href={`/subscriptions/${s.id}`} className="block">
                            <Card className="p-4 hover:bg-white/[0.07] transition-colors active:scale-[0.99]">
                                <div className="flex items-start justify-between gap-3">
                                    {/* Left side: name + period */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-white truncate">
                                            {s.group.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {s.billingPeriod}
                                        </p>
                                    </div>

                                    {/* Right side: status badge */}
                                    <span
                                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg ${
                                            s.isPaid
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}
                                    >
                                        {s.isPaid ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>

                                {/* Bottom row: amount + action */}
                                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                                    <span className="text-indigo-300 font-semibold text-sm">
                                        ${Number(s.totalAmount).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                                        Ver grupo
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>

            {/* ── Desktop: Table ────────────────────────────────────── */}
            <Card className="shadow-xl overflow-hidden hidden md:block" variant="default">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-sm text-zinc-400">
                                <th className="py-4 px-6 font-medium">Grupo</th>
                                <th className="py-4 px-6 font-medium">Periódo</th>
                                <th className="py-4 px-6 font-medium">Monto</th>
                                <th className="py-4 px-6 font-medium">Estado</th>
                                <th className="py-4 px-6 font-medium text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-zinc-500 italic"
                                    >
                                        No tenés suscripciones. Creá un grupo y agregá amigos.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-6 font-medium text-white">
                                            {s.group.name}
                                        </td>
                                        <td className="py-4 px-6 text-zinc-300">
                                            {s.billingPeriod}
                                        </td>
                                        <td className="py-4 px-6 text-indigo-300 font-medium">
                                            ${Number(s.totalAmount).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`text-sm font-medium px-2.5 py-1 rounded-lg ${
                                                    s.isPaid
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                }`}
                                            >
                                                {s.isPaid ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/subscriptions/${s.id}`}
                                                className="text-sm text-indigo-400 hover:text-indigo-300"
                                            >
                                                Ver grupo →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
