/** Comisión estimada de Mercado Pago (link de pago). Ajustá con MERCADOPAGO_FEE_PERCENT en .env */
export const DEFAULT_MP_FEE_PERCENT = 3.49

export type MercadoPagoAmountBreakdown = {
    netAmount: number
    grossAmount: number
    feeAmount: number
    feePercent: number
}

export function getMercadoPagoFeePercent(): number {
    const raw = process.env.MERCADOPAGO_FEE_PERCENT ?? process.env.NEXT_PUBLIC_MERCADOPAGO_FEE_PERCENT

    if (!raw) return DEFAULT_MP_FEE_PERCENT

    const parsed = parseFloat(raw)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 100) {
        return DEFAULT_MP_FEE_PERCENT
    }
    return parsed
}

/** Monto a cobrar al pagador para que vos recibas `netAmount` después de la comisión % */
export function calculateMercadoPagoGrossAmount(
    netAmount: number,
    feePercent: number = DEFAULT_MP_FEE_PERCENT,
): MercadoPagoAmountBreakdown {
    const rate = feePercent / 100
    const grossAmount = Math.ceil((netAmount / (1 - rate)) * 100) / 100
    const feeAmount = Math.round((grossAmount - netAmount) * 100) / 100

    return {
        netAmount,
        grossAmount,
        feeAmount,
        feePercent,
    }
}

export function formatArs(amount: number): string {
    return amount.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
