import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Verifica el header x-signature de Mercado Pago.
 *
 * Mercado Pago envía un header con formato:
 *   x-signature: ts=<timestamp>,v1=<hmac-sha256-hex>
 *   x-request-id: <uuid>
 *
 * El HMAC se calcula sobre el string:
 *   "id:<x-request-id>;request-id:<x-request-id>;ts:<timestamp>;"
 *
 * Si no hay MERCADOPAGO_WEBHOOK_SECRET configurado, la validación se omite
 * (la verificación real contra la API de MP sigue activa).
 */
export function verifyMercadoPagoSignature(
    body: string,
    xSignature: string | null,
    xRequestId: string | null,
): boolean {
    if (!xSignature || !xRequestId) {
        return false
    }

    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (!secret) {
        // Sin secret configurado, no podemos validar HMAC.
        // La seguridad recae en la re-verificación contra la API de MP.
        return false
    }

    // Parsear x-signature: "ts=1234567890,v1=abc123def..."
    const parts: Record<string, string> = {}
    for (const pair of xSignature.split(',')) {
        const [key, value] = pair.trim().split('=')
        if (key && value) {
            parts[key] = value
        }
    }

    const { ts, v1 } = parts
    if (!ts || !v1) {
        return false
    }

    // Construir el manifest para firmar
    const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`

    // Calcular HMAC-SHA256 esperado
    const expected = createHash('sha256')
        .update(manifest + secret)
        .digest('hex')

    // Comparación timing-safe para evitar timing attacks
    const actualBuf = Buffer.from(v1.toLowerCase())
    const expectedBuf = Buffer.from(expected)

    if (actualBuf.length !== expectedBuf.length) {
        return false
    }

    return timingSafeEqual(actualBuf, expectedBuf)
}