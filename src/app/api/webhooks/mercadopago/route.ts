import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'
import { parseExternalReference } from '@/utils/mercadopago-reference'
import { recordMemberPayment } from '@/lib/record-payment'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const paymentId = body?.data?.id

        if (!paymentId) {
            return NextResponse.json({ received: true })
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
        if (!accessToken || accessToken === 'TU_TOKEN_AQUI') {
            console.error('[MP Webhook] MERCADOPAGO_ACCESS_TOKEN no configurado')
            return NextResponse.json({ error: 'MP not configured' }, { status: 500 })
        }

        const client = new MercadoPagoConfig({ accessToken })
        const paymentClient = new Payment(client)
        const mpPayment = await paymentClient.get({ id: String(paymentId) })

        if (mpPayment.status !== 'approved') {
            return NextResponse.json({ received: true, status: mpPayment.status })
        }

        const reference = parseExternalReference(mpPayment.external_reference)
        if (!reference) {
            console.warn('[MP Webhook] external_reference no reconocida:', mpPayment.external_reference)
            return NextResponse.json({ received: true })
        }

        const admin = createAdminClient()

        const { data: member } = await admin
            .from('group_members')
            .select('id, quota_amount, group_id')
            .eq('id', reference.memberId)
            .eq('group_id', reference.groupId)
            .maybeSingle()

        if (!member) {
            console.warn('[MP Webhook] miembro no encontrado:', reference)
            return NextResponse.json({ received: true })
        }

        await recordMemberPayment(admin, {
            groupId: reference.groupId,
            memberId: reference.memberId,
            billingPeriod: reference.billingPeriod,
            amount: Number(member.quota_amount),
            preferenceId: mpPayment.id?.toString(),
        })

        return NextResponse.json({ received: true, recorded: true })
    } catch (error) {
        console.error('[MP Webhook]', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
