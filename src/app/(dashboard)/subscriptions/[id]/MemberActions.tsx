'use client'

import { useState, useTransition } from 'react'
import { MessageCircle, Link as LinkIcon, Check, Pencil } from 'lucide-react'
import Link from 'next/link'
import { createPaymentLink, togglePaymentStatus } from './actions'
import { Button } from '@/components/ui/Button'
import { formatArs, calculateMercadoPagoGrossAmount } from '@/utils/payment-fees'
import { MemberEditDialog } from './MemberEditDialog'

type MemberActionsProps = {
    member: { id: string; user_name: string; whatsapp_number?: string | null; email?: string | null; quota_amount: number }
    group: { id: string; name: string }
    isPaid: boolean
    paymentAlias: string | null
    mpFeePercent: number
    periodLabel: string
}

function buildPaymentMessage(params: {
    memberName: string
    groupName: string
    periodLabel: string
    netAmount: number
    grossAmount: number
    feeAmount: number
    feePercent: number
    paymentAlias: string
    mpLink?: string | null
}): string {
    const {
        memberName,
        groupName,
        periodLabel,
        netAmount,
        grossAmount,
        feeAmount,
        feePercent,
        paymentAlias,
        mpLink,
    } = params

    const transferSection =
        `1) TRANSFERENCIA (sin comisión)\n` +
        `Transferí exactamente $${formatArs(netAmount)} a este alias:\n` +
        `${paymentAlias}`

    const mpSection = mpLink
        ? `2) MERCADO PAGO (tarjeta, débito, dinero en cuenta, etc.)\n` +
          `Incluye una comisión estimada del ${feePercent}% a tu cargo.\n` +
          `Cuota: $${formatArs(netAmount)}\n` +
          `Comisión: $${formatArs(feeAmount)}\n` +
          `Total a pagar: $${formatArs(grossAmount)}\n` +
          `Link: ${mpLink}`
        : `2) MERCADO PAGO\n` +
          `Por ahora no hay link de pago. Usá la transferencia o pedile al cobrador que active Mercado Pago.`

    const closing = mpLink
        ? `Con transferencia pagás solo la cuota. Con Mercado Pago el total es un poco más alto para cubrir la comisión del medio de pago.`
        : `Con transferencia pagás solo la cuota, sin comisión.`

    return (
        `Hola ${memberName}, es momento de pagar tu cuota de ${groupName} (${periodLabel}).\n\n` +
        `Tu cuota es de $${formatArs(netAmount)}.\n\n` +
        `Podés pagar de dos formas:\n\n` +
        `${transferSection}\n\n` +
        `${mpSection}\n\n` +
        closing
    )
}

function buildMessageParams(
    member: MemberActionsProps['member'],
    group: MemberActionsProps['group'],
    paymentAlias: string,
    mpFeePercent: number,
    periodLabel: string,
    response: Awaited<ReturnType<typeof createPaymentLink>> | null
) {
    const netAmount = Number(member.quota_amount)
    const breakdown = calculateMercadoPagoGrossAmount(netAmount, mpFeePercent)

    return {
        memberName: member.user_name,
        groupName: group.name,
        periodLabel,
        netAmount,
        grossAmount: breakdown.grossAmount,
        feeAmount: breakdown.feeAmount,
        feePercent: mpFeePercent,
        paymentAlias,
        mpLink: response?.success ? response.link : null,
    }
}

export function MemberActions({
    member,
    group,
    isPaid,
    paymentAlias,
    mpFeePercent,
    periodLabel,
}: MemberActionsProps) {
    const [loading, setLoading] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [showEdit, setShowEdit] = useState(false)

    const netAmount = Number(member.quota_amount)

    const openWhatsApp = (message: string) => {
        if (!member.whatsapp_number) {
            alert('Este miembro no tiene número de WhatsApp.')
            return
        }
        const whatsappUrl = `https://wa.me/${member.whatsapp_number}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleGeneratePaymentLink = async () => {
        setLoading(true)
        const response = await createPaymentLink(member, group)
        setLoading(false)
        return response
    }

    const handleWhatsApp = async () => {
        if (!paymentAlias) {
            alert('Configurá tu alias en Ajustes para incluir la opción de transferencia en el mensaje.')
            return
        }

        const response = await handleGeneratePaymentLink()
        const message = buildPaymentMessage(
            buildMessageParams(member, group, paymentAlias, mpFeePercent, periodLabel, response)
        )

        openWhatsApp(message)
    }

    const copyPaymentMessage = async () => {
        if (!paymentAlias) {
            alert('Configurá tu alias en Ajustes para copiar el mensaje de cobro completo.')
            return
        }

        const response = await handleGeneratePaymentLink()
        const message = buildPaymentMessage(
            buildMessageParams(member, group, paymentAlias, mpFeePercent, periodLabel, response)
        )

        navigator.clipboard.writeText(message)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const handleTogglePayment = () => {
        startTransition(() => {
            togglePaymentStatus(member.id, group.id, netAmount)
        })
    }

    return (
        <>
            <div className="flex flex-col items-end gap-2">
                {!isPaid && !paymentAlias && (
                    <Link
                        href="/settings"
                        className="text-xs text-amber-400/90 hover:text-amber-300 underline-offset-2 hover:underline"
                    >
                        Configurá tu alias para cobrar
                    </Link>
                )}
                <div className="flex gap-2 justify-end items-center flex-wrap">
                    <Button
                        onClick={() => setShowEdit(true)}
                        title="Editar participante"
                        variant="ghost"
                        className="text-zinc-400 hover:text-white"
                    >
                        <Pencil size={16} />
                    </Button>
                    {!isPaid && (
                        <>
                            <Button
                                onClick={handleWhatsApp}
                                title="Enviar opciones de pago por WhatsApp"
                                disabled={loading || isPending || !paymentAlias}
                                variant="ghost"
                                className="text-green-500 hover:text-green-400 disabled:opacity-40"
                            >
                                <MessageCircle size={18} />
                            </Button>
                            <Button
                                onClick={copyPaymentMessage}
                                title="Copiar mensaje de cobro"
                                disabled={loading || isPending || !paymentAlias}
                                variant="ghost"
                                className="text-indigo-400 hover:text-indigo-300 disabled:opacity-40"
                            >
                                {linkCopied ? (
                                    <Check size={18} className="text-green-400" />
                                ) : (
                                    <LinkIcon size={18} />
                                )}
                            </Button>
                        </>
                    )}
                    <Button
                        onClick={handleTogglePayment}
                        isLoading={isPending}
                        variant="secondary"
                        size="sm"
                        className={`ml-2 ${isPaid ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-white'}`}
                    >
                        {isPaid ? '✓ Pagado' : 'Marcar Pagado'}
                    </Button>
                </div>
            </div>

            {showEdit && (
                <MemberEditDialog
                    member={member}
                    groupId={group.id}
                    onClose={() => setShowEdit(false)}
                />
            )}
        </>
    )
}
