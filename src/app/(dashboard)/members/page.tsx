import Link from 'next/link'
import { getAllMembers } from './members.actions'
import { formatBillingPeriodLabel } from '@/utils/billing-period'
import { Card } from '@/components/ui/Card'

export default async function MembersPage() {
    const { members, billingPeriod } = await getAllMembers()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Miembros</h1>
                <p className="text-zinc-400">
                    Todos tus amigos en un solo lugar · período de cobro:{' '}
                    <span className="text-white font-medium">{periodLabel}</span>
                </p>
            </header>

            <Card className="shadow-xl overflow-hidden" variant="default">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-sm text-zinc-400">
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
                                    <td colSpan={5} className="py-10 text-center text-zinc-500 italic">
                                        No tenés miembros. Creá un grupo y agregá amigos.
                                    </td>
                                </tr>
                            ) : (
                                members.map((m) => (
                                    <tr
                                        key={m.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-6 font-medium text-white">{m.user_name}</td>
                                        <td className="py-4 px-6 text-zinc-300">{m.group.name}</td>
                                        <td className="py-4 px-6 text-indigo-300 font-medium">
                                            ${Number(m.quota_amount).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`text-sm font-medium px-2.5 py-1 rounded-lg ${
                                                    m.isPaid
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                }`}
                                            >
                                                {m.isPaid ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/subscriptions/${m.group.id}`}
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