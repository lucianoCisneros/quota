import { getSubscriptionDetails } from './subscription-detail.actions'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MemberActions } from './MemberActions'
import { GroupHeaderActions } from './GroupHeaderActions'
import { Card } from '@/components/ui/Card'
import { getMercadoPagoFeePercent } from '@/utils/payment-fees'
import { formatBillingPeriodLabel, isPaidForPeriod } from '@/utils/billing-period'
import type { GroupMember, Payment } from '@/types/database'

export default async function SubscriptionDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const group = await getSubscriptionDetails(id)

    if (!group) {
        notFound()
    }

    const billingPeriod = group.billingPeriod
    const periodLabel = formatBillingPeriodLabel(billingPeriod)
    const payments = (group.payments ?? []) as Payment[]
    const members = (group.group_members ?? []) as GroupMember[]

    const pendingAmount = members
        .filter((member) => !isPaidForPeriod(payments, member.id, billingPeriod))
        .reduce((sum, member) => sum + Number(member.quota_amount), 0)

    const paidCount = members.filter((m) => isPaidForPeriod(payments, m.id, billingPeriod)).length

    const mpFeePercent = getMercadoPagoFeePercent()
    const mpConfigured = group.mpConnected ?? false

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl shadow-inner font-bold text-lg sm:text-xl text-white shrink-0"
                            style={{ backgroundColor: group.services?.color_hex || '#3f3f46' }}
                        >
                            {group.services?.name ? group.services.name.charAt(0) : group.name.charAt(0)}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{group.name}</h1>
                    </div>
                    <p className="text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
                        Cobra el día <span className="font-medium text-white">{group.billing_cycle_day}</span>
                        <span className="text-zinc-600">·</span>
                        Período actual: <span className="font-medium text-white">{periodLabel}</span>
                    </p>
                </div>
                <GroupHeaderActions groupId={group.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="p-4 sm:p-6 md:col-span-2 shadow-xl" variant="default">
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Costo total de tu suscripción</h3>
                    <div className="flex items-end gap-2 mt-3">
                        <p className="text-3xl sm:text-4xl font-bold text-indigo-400">
                            ${Number(group.total_price).toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-zinc-500 mb-1">/ mes</p>
                    </div>
                </Card>

                <Card className="p-4 sm:p-6 flex flex-col justify-center shadow-xl" variant="default">
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Los participantes te deben</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-400">${pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                        {paidCount}/{members.length} pagaron este mes
                    </p>
                </Card>
            </div>

            {!group.payment_alias && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
                    <Link href="/settings" className="font-medium underline hover:text-amber-100">
                        Configurá tu alias
                    </Link>{' '}
                    para ofrecer transferencia sin comisión además de Mercado Pago.
                </div>
            )}

            {!mpConfigured && (
                <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-100 text-sm">
                    <Link href="/settings" className="font-medium underline hover:text-sky-50">
                        Conectá tu cuenta de Mercado Pago
                    </Link>{' '}
                    en Ajustes para incluir el link de pago en WhatsApp.
                </div>
            )}

            <h2 className="text-xl font-semibold mb-2">Integrantes</h2>
            <p className="text-sm text-zinc-500 mb-6">
                El botón de WhatsApp envía tus datos para la transferencia y el link de Mercado Pago en un solo mensaje.
            </p>

            {/* ── Mobile: member cards ─────────────────────────────── */}
            <div className="md:hidden space-y-3">
                {members.length === 0 ? (
                    <Card className="p-6 text-center" variant="default">
                        <p className="text-zinc-500 italic">
                            No hay amigos en este grupo. ¡Pagas todo tú!
                        </p>
                    </Card>
                ) : (
                    members.map((member) => {
                        const isPaid = isPaidForPeriod(payments, member.id, billingPeriod)
                        return (
                            <Card key={member.id} className="p-4" variant="default">
                                {/* Top row: name + status */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-white truncate">
                                            {member.user_name}
                                        </h3>
                                        <span className="text-indigo-300 font-medium text-sm">
                                            ${Number(member.quota_amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <span
                                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg ${
                                            isPaid
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}
                                    >
                                        {isPaid ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>

                                {/* Contact info */}
                                <div className="mt-3 space-y-1 text-sm">
                                    {member.whatsapp_number && (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <svg
                                                className="w-3.5 h-3.5 shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            <span className="truncate">{member.whatsapp_number}</span>
                                        </div>
                                    )}
                                    {member.email ? (
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <svg
                                                className="w-3.5 h-3.5 shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-zinc-600 italic">
                                            <svg
                                                className="w-3.5 h-3.5 shrink-0"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>Sin email</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <MemberActions
                                        member={member}
                                        group={group}
                                        isPaid={isPaid}
                                        paymentAlias={group.payment_alias}
                                        mpFeePercent={mpFeePercent}
                                        periodLabel={periodLabel}
                                    />
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* ── Desktop: member table ─────────────────────────────── */}
            <Card className="shadow-xl hidden md:block" variant="default">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-sm text-zinc-400">
                                <th className="py-4 px-6 font-medium">Nombre</th>
                                <th className="py-4 px-6 font-medium">Cuota</th>
                                <th className="py-4 px-6 font-medium">WhatsApp</th>
                                <th className="py-4 px-6 font-medium">Email</th>
                                <th className="py-4 px-6 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                                        No hay amigos en este grupo. ¡Pagas todo tú!
                                    </td>
                                </tr>
                            ) : null}

                            {members.map((member) => {
                                const isPaid = isPaidForPeriod(payments, member.id, billingPeriod)
                                return (
                                    <tr
                                        key={member.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="py-4 px-6 font-medium text-white">{member.user_name}</td>
                                        <td className="py-4 px-6 text-indigo-300 font-medium">
                                            ${Number(member.quota_amount).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-zinc-400 text-sm">
                                            {member.whatsapp_number}
                                        </td>
                                        <td className="py-4 px-6 text-zinc-400 text-sm">
                                            {member.email || <span className="text-zinc-600 italic">—</span>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <MemberActions
                                                member={member}
                                                group={group}
                                                isPaid={isPaid}
                                                paymentAlias={group.payment_alias}
                                                mpFeePercent={mpFeePercent}
                                                periodLabel={periodLabel}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
