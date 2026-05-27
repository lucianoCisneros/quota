export type PaymentEmailParams = {
    memberName: string
    groupName: string
    periodLabel: string
    netAmount: number
    grossAmount: number
    feeAmount: number
    feePercent: number
    paymentAlias: string
    mpLink?: string | null
}

export function buildPaymentEmail(params: PaymentEmailParams): string {
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

    const formattedNet = netAmount.toFixed(2)
    const formattedGross = grossAmount.toFixed(2)
    const formattedFee = feeAmount.toFixed(2)

    const mpSection = mpLink
        ? `
            <div style="margin-top: 24px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
                    💳 Opción 2: Mercado Pago (tarjeta, débito, dinero en cuenta)
                </h3>
                <p style="margin: 0 0 4px 0; color: #4b5563;">
                    Incluye una comisión estimada del ${feePercent}% a tu cargo.
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 12px 0; background-color: #f9fafb; border-radius: 8px;">
                    <tr>
                        <td style="padding: 8px 16px; color: #6b7280;">Cuota</td>
                        <td style="padding: 8px 16px; text-align: right; color: #111827; font-weight: 600;">$${formattedNet}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 16px; color: #6b7280;">Comisión</td>
                        <td style="padding: 8px 16px; text-align: right; color: #111827; font-weight: 600;">$${formattedFee}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e5e7eb;">
                        <td style="padding: 8px 16px; font-weight: 700; color: #111827;">Total a pagar</td>
                        <td style="padding: 8px 16px; text-align: right; font-weight: 700; color: #059669; font-size: 18px;">$${formattedGross}</td>
                    </tr>
                </table>
                <a href="${mpLink}"
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Pagar con Mercado Pago
                </a>
            </div>
        `
        : `
            <div style="margin-top: 24px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
                    💳 Opción 2: Mercado Pago
                </h3>
                <p style="margin: 0; color: #6b7280;">
                    Por ahora no hay link de pago. Usá la transferencia o pedile al cobrador que active Mercado Pago.
                </p>
            </div>
        `

    const closing = mpLink
        ? `Con <strong>transferencia</strong> pagás solo la cuota. Con <strong>Mercado Pago</strong> el total es un poco más alto para cubrir la comisión del medio de pago.`
        : `Con <strong>transferencia</strong> pagás solo la cuota, sin comisión.`

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cuota de ${groupName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #6366f1; padding: 32px 32px 24px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                                ⏰ Recordatorio de cuota
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 16px;">
                                ${groupName} — ${periodLabel}
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 16px; color: #111827; font-size: 16px;">
                                Hola <strong>${memberName}</strong>,
                            </p>
                            <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Es momento de pagar tu cuota de <strong>${groupName}</strong> (${periodLabel}).
                            </p>
                            <p style="margin: 0 0 24px; font-size: 20px; color: #111827; font-weight: 700;">
                                Tu cuota es de <span style="color: #6366f1;">$${formattedNet}</span>
                            </p>

                            <p style="margin: 0 0 16px; color: #4b5563; font-weight: 600;">
                                Podés pagar de dos formas:
                            </p>

                            <!-- Option 1: Transfer -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">
                                    🏦 Opción 1: Transferencia bancaria (sin comisión)
                                </h3>
                                <p style="margin: 0 0 8px; color: #4b5563;">
                                    Transferí exactamente <strong>$${formattedNet}</strong> a este alias:
                                </p>
                                <div style="display: inline-block; padding: 12px 20px; background-color: #f3f4f6; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: #111827; letter-spacing: 1px;">
                                    ${paymentAlias}
                                </div>
                            </div>

                            ${mpSection}

                            <!-- Closing -->
                            <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                ${closing}
                            </p>

                            <p style="margin-top: 24px; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                                Este es un mensaje automático de <strong>Quota</strong>. Si ya pagaste, ignorá este mensaje.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Quota — Gestión de pagos compartidos
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}