import { getSubscriptionDetails } from './subscription-detail.actions'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MemberActions } from './MemberActions'
import { GroupHeaderActions } from './GroupHeaderActions'
import { AddMemberButton } from './AddMemberButton'
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
        <div className="page-enter max-w-5xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-[15px] text-text-secondary hover:text-text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            {/* Group Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-[12px] font-bold text-lg sm:text-xl text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: group.services?.color_hex || '#3a3a3c' }}
                        >
                            {group.services?.name ? group.services.name.charAt(0) : group.name.charAt(0)}
                        </div>
                        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-text-primary truncate">{group.name}</h1>
                    </div>
                    <p className="text-[15px] text-text-secondary flex flex-wrap items-center gap-x-2 gap-y-1">
                        Cobra el día <span className="font-medium text-text-primary">{group.billing_cycle_day}</span>
                        <span className="text-text-tertiary">&middot;</span>
                        Período actual: <span className="font-medium text-text-primary">{periodLabel}</span>
                    </p>
                </div>
                <GroupHeaderActions groupId={group.id} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <Card variant="elevated" className="p-6 md:col-span-2">
                    <p className="text-[13px] font-medium text-text-secondary mb-2">Costo total de tu suscripción</p>
                    <div className="flex items-end gap-2">
                        <p className="text-[34px] font-bold tabular-nums text-accent">
                            ${Number(group.total_price).toFixed(2)}
                        </p>
                        <p className="text-[15px] text-text-tertiary mb-1">/ mes</p>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6 flex flex-col justify-center">
                    <p className="text-[13px] font-medium text-text-secondary mb-1">Los participantes te deben</p>
                    <p className="text-[28px] font-bold tabular-nums text-warning">${pendingAmount.toFixed(2)}</p>
                    <p className="text-[13px] text-text-tertiary mt-1">
                        {paidCount}/{members.length} pagaron este mes
                    </p>
                </Card>
            </div>

            {/* Alerts */}
            {!group.payment_alias && (
                <div className="mb-5 p-4 rounded-[12px] bg-surface-2 text-text-secondary text-[13px]">
                    <Link href="/settings" className="font-medium text-accent hover:text-accent-hover">
                        Configurá tu alias
                    </Link>{' '}
                    para ofrecer transferencia sin comisión además de Mercado Pago.
                </div>
            )}

            {!mpConfigured && (
                <div className="mb-5 p-4 rounded-[12px] bg-surface-2 text-text-secondary text-[13px]">
                    <Link href="/settings" className="font-medium text-accent hover:text-accent-hover">
                        Conectá tu cuenta de Mercado Pago
                    </Link>{' '}
                    en Ajustes para incluir el link de pago en WhatsApp.
                </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-[22px] font-semibold tracking-tight text-text-primary mb-1.5">Integrantes</h2>
                    <p className="text-[15px] text-text-secondary">
                        El botón de WhatsApp envía tus datos para la transferencia y el link de Mercado Pago en un solo mensaje.
                    </p>
                </div>
                <div className="shrink-0 pt-1">
                    <AddMemberButton groupId={group.id} />
                </div>
            </div>

            {/* Mobile: member cards */}
            <div className="md:hidden space-y-3">
                {members.length === 0 ? (
                    <Card variant="inset" className="p-6 text-center">
                        <p className="text-[15px] text-text-tertiary">
                            No hay amigos en este grupo. ¡Pagas todo tú!
                        </p>
                    </Card>
                ) : (
                    members.map((member) => {
                        const isPaid = isPaidForPeriod(payments, member.id, billingPeriod)
                        return (
                            <Card key={member.id} variant="flat" className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[15px] font-semibold text-text-primary truncate">
                                            {member.user_name}
                                        </h3>
                                        <span className="text-[15px] font-semibold tabular-nums text-accent">
                                            ${Number(member.quota_amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <span
                                        className={`shrink-0 text-[12px] font-medium px-2.5 py-1 rounded-[8px] ${
                                            isPaid
                                                ? 'bg-surface-2 text-success'
                                                : 'bg-surface-2 text-warning'
                                        }`}
                                    >
                                        {isPaid ? 'Pagado' : 'Pendiente'}
                                    </span>
                                </div>

                                {/* Contact info */}
                                <div className="mt-3 space-y-1.5">
                                    {member.whatsapp_number && (
                                        <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            <span className="truncate">{member.whatsapp_number}</span>
                                        </div>
                                    )}
                                    {member.email ? (
                                        <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="italic">Sin email</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-3 pt-3 hairline-top">
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

            {/* Desktop: member table */}
            <Card variant="elevated" className="overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="hairline-bottom text-[13px] text-text-tertiary">
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
                                    <td colSpan={5} className="py-8 text-center text-[15px] text-text-tertiary">
                                        No hay amigos en este grupo. ¡Pagas todo tú!
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => {
                                    const isPaid = isPaidForPeriod(payments, member.id, billingPeriod)
                                    return (
                                        <tr key={member.id} className="hairline-bottom hover:bg-surface-2 transition-colors">
                                            <td className="py-4 px-6 text-[15px] font-medium text-text-primary">{member.user_name}</td>
                                            <td className="py-4 px-6 text-[15px] font-medium tabular-nums text-accent">
                                                ${Number(member.quota_amount).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-[15px] text-text-secondary">
                                                {member.whatsapp_number || <span className="text-text-tertiary italic">—</span>}
                                            </td>
                                            <td className="py-4 px-6 text-[15px] text-text-secondary">
                                                {member.email || <span className="text-text-tertiary italic">—</span>}
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
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
