/**
 * sendPendingReminders — Fase 3: Recordatorios automáticos vía email.
 *
 * Lógica:
 * 1. Obtener todos los grupos activos del usuario creador.
 * 2. Para cada grupo, verificar si `billing_cycle_day` coincide con el día de hoy (AR).
 * 3. Para los grupos que sí corresponden, obtener miembros + payments del período actual.
 * 4. Enviar email vía Resend a los miembros PENDING que tengan email.
 *
 * Esta función se invoca desde un cron job (Vercel Cron) o manualmente desde la UI.
 */

import { createAdminClient } from '@/utils/supabase/admin'
import { buildPaymentEmail } from '@/utils/payment-email'
import { Resend } from 'resend'
import { calculateMercadoPagoGrossAmount, getMercadoPagoFeePercent } from '@/utils/payment-fees'
import { getCurrentBillingPeriod, formatBillingPeriodLabel } from '@/utils/billing-period'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

export type ReminderResult = {
    totalGroups: number
    totalMembers: number
    sent: number
    skippedNoEmail: number
    skippedPaid: number
    skippedNoAlias: number
    errors: { memberName: string; error: string }[]
}

export async function sendPendingReminders(): Promise<ReminderResult> {
    const result: ReminderResult = {
        totalGroups: 0,
        totalMembers: 0,
        sent: 0,
        skippedNoEmail: 0,
        skippedPaid: 0,
        skippedNoAlias: 0,
        errors: [],
    }

    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY no está configurada. No se pueden enviar recordatorios.')
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createAdminClient()

    // 1. Determinar el día de hoy en Argentina
    const today = new Date()
    const todayDay = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        day: 'numeric',
    }).format(today)
    const todayDayNumber = parseInt(todayDay, 10)

    // 2. Obtener grupos cuyo billing_cycle_day es hoy
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, billing_cycle_day, creator_id')
        .eq('billing_cycle_day', todayDayNumber)

    if (groupsError) {
        throw new Error(`Error al obtener grupos: ${groupsError.message}`)
    }

    result.totalGroups = groups?.length ?? 0

    if (!groups || groups.length === 0) {
        return result // No hay grupos que cobren hoy
    }

    const billingPeriod = getCurrentBillingPeriod()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)
    const mpFeePercent = getMercadoPagoFeePercent()

    // 3. Para cada grupo, obtener el alias y los miembros con su estado de pago
    for (const group of groups) {
        // Obtener alias del creador
        const { data: creatorProfile } = await supabase
            .from('users')
            .select('payment_alias')
            .eq('id', group.creator_id)
            .single()

        const paymentAlias = creatorProfile?.payment_alias ?? null
        if (!paymentAlias) {
            result.skippedNoAlias += 1
            continue // Sin alias no podemos construir el mensaje
        }

        // Obtener miembros del grupo
        const { data: members } = await supabase
            .from('group_members')
            .select('id, user_name, email, quota_amount')
            .eq('group_id', group.id)
            .order('user_name')

        if (!members || members.length === 0) continue

        // Obtener payments del período actual para este grupo
        const { data: payments } = await supabase
            .from('payments')
            .select('member_id, status')
            .eq('group_id', group.id)
            .eq('billing_period', billingPeriod)

        // Construir set de member_id que ya pagaron
        const paidMemberIds = new Set<string>(
            (payments ?? [])
                .filter((p) => p.status === 'PAID')
                .map((p) => p.member_id),
        )

        // 4. Enviar email a miembros PENDING con email
        for (const member of members) {
            if (paidMemberIds.has(member.id)) {
                result.skippedPaid += 1
                continue
            }

            if (!member.email?.trim()) {
                result.skippedNoEmail += 1
                continue
            }

            // Construir breakdown de fees (sin crear link MP en batch,
            // sólo mostrar la opción de transferencia)
            const netAmount = Number(member.quota_amount)
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
                mpLink: null, // No generamos link MP en batch automático
            })

            try {
                const { error: sendError } = await resend.emails.send({
                    from: `Quota · ${group.name} <pagos@resend.dev>`,
                    to: [member.email],
                    subject: `⏰ Recordatorio: Cuota de ${group.name} (${periodLabel}) — Quota`,
                    html,
                })

                if (sendError) {
                    result.errors.push({ memberName: member.user_name, error: sendError.message })
                } else {
                    result.sent += 1
                }
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : 'Error desconocido al enviar email'
                result.errors.push({ memberName: member.user_name, error: message })
            }
        }

        result.totalMembers += members.length
    }

    return result
}
