import Link from 'next/link'
import { getAllMembers } from './members.actions'
import { formatBillingPeriodLabel } from '@/utils/billing-period'
import { Card } from '@/components/ui/Card'

export default async function MembersPage() {
    const { members, billingPeriod } = await getAllMembers()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)

    return (
        <div className="page-enter max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-[34px] font-bold tracking-tight text-text-primary mb-1.5">Miembros</h1>
                <p className="text-[15px] text-text-secondary">
                    Todos tus amigos en un solo lugar &middot; período de cobro:{' '}
                    <span className="text-text-primary font-medium">{periodLabel}</span>
                </p>
            </header>

            <Card variant="elevated" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="hairline-bottom text-[13px] text-text-tertiary">
                                <th className="py-4 px-6 font-medium">Nombre</th>
                                <th className="py-4 px-6 font-medium">Grupo</th>
                                <th className="py-4 px-6 font-medium">Cuota</th>
                                <th className="py-4 px-6 font-medium">Estado</th>
                                <th className="py-4 px-6 font-medium text-right">Grupo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-[15px] text-text-tertiary">
                                        No tenés miembros. Creá un grupo y agregá amigos.
                                    </td>
                                </tr>
                            ) : (
                                members.map((m) => (
                                    <tr key={m.id} className="hairline-bottom hover:bg-surface-2 transition-colors">
                                        <td className="py-4 px-6 text-[15px] font-medium text-text-primary">{m.user_name}</td>
                                        <td className="py-4 px-6 text-[15px] text-text-secondary">{m.group.name}</td>
                                        <td className="py-4 px-6 text-[15px] font-medium tabular-nums text-accent">
                                            ${Number(m.quota_amount).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`text-[12px] font-medium px-2.5 py-1 rounded-[8px] ${
                                                    m.isPaid
                                                        ? 'bg-surface-2 text-success'
                                                        : 'bg-surface-2 text-warning'
                                                }`}
                                            >
                                                {m.isPaid ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/subscriptions/${m.group.id}`}
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