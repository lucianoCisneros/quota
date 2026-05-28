'use server'

import { Resend } from 'resend'
import { buildPaymentEmail } from '@/utils/payment-email'
import { calculateMercadoPagoGrossAmount, getMercadoPagoFeePercent } from '@/utils/payment-fees'
import { createPaymentLink } from './subscription-detail.actions'
import type { GroupMember } from '@/types/database'

type EmailMember = Pick<GroupMember, 'id' | 'user_name' | 'quota_amount'> & { email?: string | null }
type EmailGroup = { id: string; name: string }

export async function sendPaymentEmail(
    member: EmailMember,
    group: EmailGroup,
    paymentAlias: string,
    periodLabel: string,
) {
    if (!member.email) {
        return { success: false, error: 'El miembro no tiene email registrado.' }
    }

    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: 'Resend no está configurado. Agregá RESEND_API_KEY en .env.local' }
    }

    try {
        // Create MP payment link
        const paymentLinkResponse = await createPaymentLink(
            { id: member.id, user_name: member.user_name, quota_amount: member.quota_amount },
            { id: group.id, name: group.name },
        )

        const netAmount = Number(member.quota_amount)
        const mpFeePercent = getMercadoPagoFeePercent()
        const breakdown = calculateMercadoPagoGrossAmount(netAmount, mpFeePercent)

        const html = buildPaymentEmail({
            memberName: member.user_name,
            groupName: group.name,
            periodLabel,
            netAmount,
            grossAmount: breakdown.grossAmount,
            feeAmount: breakdown.feeAmount,
            feePercent: mpFeePercent,
            paymentAlias,
            mpLink: paymentLinkResponse?.success ? paymentLinkResponse.link : null,
        })

        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: `Quota · ${group.name} <pagos@resend.dev>`,
            to: [member.email],
            subject: `💰 Cuota de ${group.name} (${periodLabel}) — Quota`,
            html,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, id: data?.id }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al enviar email'
        console.error('sendPaymentEmail error:', message)
        return { success: false, error: message }
    }
}
