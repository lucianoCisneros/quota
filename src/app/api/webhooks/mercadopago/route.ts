import { NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { createAdminClient } from '@/utils/supabase/admin'
import { parseExternalReference } from '@/utils/mercadopago-reference'
import { recordMemberPayment } from '@/lib/record-payment'
import { verifyMercadoPagoSignature } from '@/utils/verify-mp-signature'
import { getMpAppClient, getUserMercadoPagoClient, refreshUserToken } from '@/lib/mercadopago-client'

export async function POST(request: Request) {
    try {
        // ─── 1. Extraer body y validar x-signature (HMAC) ───────────────
        const rawBody = await request.clone().text()
        const xSignature = request.headers.get('x-signature')
        const xRequestId = request.headers.get('x-request-id')

        const isValidSignature = verifyMercadoPagoSignature(rawBody, xSignature, xRequestId)

        if (!isValidSignature) {
            console.error('[MP Webhook] x-signature inválida — solicitud rechazada')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // ─── 2. Extraer payment ID ─────────────────────────────────────
        const body = JSON.parse(rawBody)
        const paymentId = body?.data?.id

        if (!paymentId) {
            return NextResponse.json({ received: true })
        }

        // ─── 3. Obtener app-level token para leer el pago ──────────────
        // Usamos client_credentials (app token) para leer el pago y obtener
        // el external_reference, que nos dice a qué grupo pertenece.
        // Esto rompe el ciclo: necesitamos external_reference → creator_id → token del creador.
        const appClient = await getMpAppClient()
        if (!appClient) {
            console.error('[MP Webhook] App-level MP client no disponible')
            return NextResponse.json({ error: 'MP app client unavailable' }, { status: 500 })
        }

        // ─── 4. Obtener pago de MP ────────────────────────────────────
        const paymentClient = new Payment(appClient)
        const mpPayment = await paymentClient.get({ id: String(paymentId) })

        if (mpPayment.status !== 'approved') {
            return NextResponse.json({ received: true, status: mpPayment.status })
        }

        // ─── 5. Parsear external_reference ─────────────────────────────
        const reference = parseExternalReference(mpPayment.external_reference)
        if (!reference) {
            console.warn('[MP Webhook] external_reference no reconocida:', mpPayment.external_reference)
            return NextResponse.json({ received: true })
        }

        // ─── 6. Obtener creator_id del grupo ──────────────────────────
        const admin = createAdminClient()

        const { data: group } = await admin
            .from('groups')
            .select('creator_id')
            .eq('id', reference.groupId)
            .single()

        if (!group) {
            console.warn('[MP Webhook] grupo no encontrado:', reference.groupId)
            return NextResponse.json({ received: true })
        }

        // ─── 7. Verificar que el miembro existe en el grupo ────────────
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

        // ─── 8. Obtener token del creador para re-verificar el pago ────
        // Esto es la validación más fuerte: confirmamos con el token del
        // creador que el pago es legítimo.
        const creatorClient = await getUserMercadoPagoClient(group.creator_id)

        if (!creatorClient) {
            console.error(
                '[MP Webhook] El creador del grupo no tiene MP conectado. ' +
                    'groupId=' + reference.groupId + ', creatorId=' + group.creator_id,
            )
            return NextResponse.json({ error: 'Creator MP not connected' }, { status: 500 })
        }

        // Re-verificar el pago con el token del creador
        try {
            const ownerPaymentClient = new Payment(creatorClient.client)
            const verifiedPayment = await ownerPaymentClient.get({ id: String(paymentId) })

            if (verifiedPayment.status !== 'approved') {
                return NextResponse.json({ received: true, status: verifiedPayment.status })
            }
        } catch {
            // Si falla con el token del creador, intentamos refrescarlo
            console.warn('[MP Webhook] Falló verificación con token del creador, intentando refresh...')
            const refreshed = await refreshUserToken(group.creator_id)
            if (refreshed) {
                const refreshedClient = await getUserMercadoPagoClient(group.creator_id)
                if (refreshedClient) {
                    const ownerPaymentClient = new Payment(refreshedClient.client)
                    const verifiedPayment = await ownerPaymentClient.get({ id: String(paymentId) })

                    if (verifiedPayment.status !== 'approved') {
                        return NextResponse.json({ received: true, status: verifiedPayment.status })
                    }
                }
            } else {
                console.error('[MP Webhook] No se pudo refrescar el token del creador:', group.creator_id)
                return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
            }
        }

        // ─── 9. Registrar el pago ───────────────────────────────────────
        await recordMemberPayment(admin, {
            groupId: reference.groupId,
            memberId: reference.memberId,
            billingPeriod: reference.billingPeriod,
            amount: Number(member.quota_amount),
            preferenceId: mpPayment.id?.toString(),
        })

        console.log(
            '[MP Webhook] Pago registrado exitosamente:',
            'paymentId=' + paymentId,
            'groupId=' + reference.groupId,
            'memberId=' + reference.memberId,
        )

        return NextResponse.json({ received: true, recorded: true })
    } catch (error) {
        console.error('[MP Webhook]', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
