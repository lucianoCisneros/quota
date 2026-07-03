import Link from 'next/link'
import { getAllSubscriptions } from './subscriptions.actions'
import { formatBillingPeriodLabel } from '@/utils/billing-period'
import { Card } from '@/components/ui/Card'
import { SendRemindersButton } from '@/components/ui/SendRemindersButton'

export default async function SubscriptionsPage() {
    const { subscriptions, billingPeriod } = await getAllSubscriptions()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)

    return (
        <div className="page-enter max-w-5xl mx-auto">
            {/* Header */}
            <header className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-[34px] font-bold tracking-tight text-text-primary mb-1.5">Suscripciones</h1>
                    <p className="text-[15px] text-text-secondary">
                        Todos tus grupos en un solo lugar &middot; período de cobro:{' '}
                        <span className="text-text-primary font-medium">{periodLabel}</span>
                    </p>
                </div>
                <div className="self-stretch sm:self-auto flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/subscriptions/new"
                        className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out select-none bg-accent text-white hover:bg-accent-hover active:opacity-90 px-4 py-2 text-[15px] rounded-[12px]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Grupo
                    </Link>
                    <SendRemindersButton />
                </div>
            </header>

            {/* Mobile: Card list */}
            <div className="md:hidden space-y-3">
                {subscriptions.length === 0 ? (
                    <Card variant="inset" className="p-6 text-center">
                        <p className="text-[15px] text-text-tertiary">No tenés suscripciones. Creá un grupo y agregá amigos.</p>
                    </Card>
                ) : (
                    subscriptions.map((s) => (
                        <Link key={s.id} href={`/subscriptions/${s.id}`} className="block">
                            <Card variant="flat" className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[15px] font-semibold text-text-primary truncate">
                                            {s.group.name}
                                        </h3>
                                        <p className="text-[13px] text-text-tertiary mt-0.5">
                                            {s.billingPeriod}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 text-[12px] font-medium px-2.5 py-1 rounded-[8px] ${
                                            s.isPaid
                                                ? 'bg-surface-2 text-success'
                                                : 'bg-surface-2 text-warning'
                                        }`}
                                    >
                                        {s.isPaid ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between pt-3 hairline-top">
                                    <span className="text-[15px] font-semibold tabular-nums text-accent">
                                        ${Number(s.totalAmount).toFixed(2)}
                                    </span>
                                    <span className="text-[13px] text-accent flex items-center gap-1">
                                        Ver grupo
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>

            {/* Desktop: Table */}
            <Card variant="elevated" className="overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="hairline-bottom text-[13px] text-text-tertiary">
                                <th className="py-4 px-6 font-medium">Grupo</th>
                                <th className="py-4 px-6 font-medium">Período</th>
                                <th className="py-4 px-6 font-medium">Monto</th>
                                <th className="py-4 px-6 font-medium">Estado</th>
                                <th className="py-4 px-6 font-medium text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-[15px] text-text-tertiary">
                                        No tenés suscripciones. Creá un grupo y agregá amigos.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="hairline-bottom hover:bg-surface-2 transition-colors"
                                    >
                                        <td className="py-4 px-6 text-[15px] font-medium text-text-primary">
                                            {s.group.name}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] text-text-secondary">
                                            {s.billingPeriod}
                                        </td>
                                        <td className="py-4 px-6 text-[15px] font-medium tabular-nums text-accent">
                                            ${Number(s.totalAmount).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`text-[12px] font-medium px-2.5 py-1 rounded-[8px] ${
                                                    s.isPaid
                                                        ? 'bg-surface-2 text-success'
                                                        : 'bg-surface-2 text-warning'
                                                }`}
                                            >
                                                {s.isPaid ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/subscriptions/${s.id}`}
                                                className="text-[15px] text-accent hover:text-accent-hover"
                                            >
                                                Ver grupo &rarr;
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
