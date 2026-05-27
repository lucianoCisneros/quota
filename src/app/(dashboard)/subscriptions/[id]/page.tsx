import { getSubscriptionDetails } from "./actions"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MemberActions } from "./MemberActions"
import { GroupHeaderActions } from "./GroupHeaderActions"
import { Card } from "@/components/ui/Card"
import { getMercadoPagoFeePercent, isMercadoPagoConfigured } from "@/utils/payment-fees"
import { formatBillingPeriodLabel, isPaidForPeriod } from "@/utils/billing-period"
import type { GroupMember, Payment } from "@/types/database"

export default async function SubscriptionDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {
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
    const mpConfigured = isMercadoPagoConfigured()

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group">
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
                        <p className="text-3xl sm:text-4xl font-bold text-indigo-400">${Number(group.total_price).toFixed(2)}</p>
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
                        Configurá Mercado Pago
                    </Link>{' '}
                    en Ajustes (variable <code className="text-sky-200">MERCADOPAGO_ACCESS_TOKEN</code> en{' '}
                    <code className="text-sky-200">.env.local</code>) para incluir el link de pago en WhatsApp.
                </div>
            )}

            <h2 className="text-xl font-semibold mb-2">Amigos (Participantes)</h2>
            <p className="text-sm text-zinc-500 mb-6">
                El botón de WhatsApp envía transferencia y Mercado Pago en un solo mensaje.
            </p>
            <Card className="shadow-xl" variant="default">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-sm text-zinc-400">
                                <th className="py-4 px-4 sm:px-6 font-medium">Nombre</th>
                                <th className="py-4 px-4 sm:px-6 font-medium">Cuota</th>
                                <th className="py-4 px-4 sm:px-6 font-medium">WhatsApp</th>
                                <th className="py-4 px-4 sm:px-6 font-medium">Email</th>
                                <th className="py-4 px-4 sm:px-6 font-medium text-right">Acciones</th>
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
                                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-4 sm:px-6 font-medium text-white">{member.user_name}</td>
                                        <td className="py-4 px-4 sm:px-6 text-indigo-300 font-medium">${Number(member.quota_amount).toFixed(2)}</td>
                                        <td className="py-4 px-4 sm:px-6 text-zinc-400 text-sm">{member.whatsapp_number}</td>
                                        <td className="py-4 px-4 sm:px-6 text-zinc-400 text-sm">{member.email || <span className="text-zinc-600 italic">—</span>}</td>
                                        <td className="py-4 px-4 sm:px-6">
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
