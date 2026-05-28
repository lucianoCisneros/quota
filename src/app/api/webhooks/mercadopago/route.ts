import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'
import { parseExternalReference } from '@/utils/mercadopago-reference'
import { recordMemberPayment } from '@/lib/record-payment'
import { verifyMercadoPagoSignature } from '@/utils/verify-mp-signature'

export async function POST(request: Request) {
    try {
        // ─── 1. Validar x-signature (HMAC) ───────────────────────────────
        const rawBody = await request.clone().text()
        const xSignature = request.headers.get('x-signature')
        const xRequestId = request.headers.get('x-request-id')

        const isValidSignature = verifyMercadoPagoSignature(rawBody, xSignature, xRequestId)

        if (!isValidSignature) {
            console.warn('[MP Webhook] x-signature inválida o ausente — se omite validación HMAC')
            // NOTA: No bloqueamos el request si no hay webhook_secret configurado.
            // La validación fuerte está abajo: re-verificamos con la API de MP.
        }

        // ─── 2. Extraer payment ID ──────────────────────────────────────
        const body = JSON.parse(rawBody)
        const paymentId = body?.data?.id

        if (!paymentId) {
            return NextResponse.json({ received: true })
        }

        // ─── 3. Verificar token configurado ──────────────────────────────
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
        if (!accessToken || accessToken === 'TU_TOKEN_AQUI') {
            console.error('[MP Webhook] MERCADOPAGO_ACCESS_TOKEN no configurado')
            return NextResponse.json({ error: 'MP not configured' }, { status: 500 })
        }

        // ─── 4. Re-verificar pago con la API de MP ──────────────────────
        // Esto es la validación más fuerte: aunque falsifiquen el webhook,
        // la respuesta real viene de MP directamente.
        const client = new MercadoPagoConfig({ accessToken })
        const paymentClient = new Payment(client)
        const mpPayment = await paymentClient.get({ id: String(paymentId) })

        if (mpPayment.status !== 'approved') {
            return NextResponse.json({ received: true, status: mpPayment.status })
        }

        // ─── 5. Parsear external_reference ──────────────────────────────
        const reference = parseExternalReference(mpPayment.external_reference)
        if (!reference) {
            console.warn('[MP Webhook] external_reference no reconocida:', mpPayment.external_reference)
            return NextResponse.json({ received: true })
        }

        // ─── 6. Verificar que el miembro existe en la DB ─────────────────
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

        // ─── 7. Registrar el pago ────────────────────────────────────────
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
