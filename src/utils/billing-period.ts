const TIMEZONE = 'America/Argentina/Buenos_Aires'

/** Período de cobro mensual en formato YYYY-MM */
export function getCurrentBillingPeriod(date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
    }).format(date)
}

export function formatBillingPeriodLabel(period: string): string {
    const [year, month] = period.split('-').map(Number)
    if (!year || !month) return period

    const label = new Date(year, month - 1, 1).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
    })
    return label.charAt(0).toUpperCase() + label.slice(1)
}

export function isPaidForPeriod(
    payments: { member_id: string; status: string; billing_period: string }[] | undefined,
    memberId: string,
    period: string
): boolean {
    return (
        payments?.some(
            (p) => p.member_id === memberId && p.status === 'PAID' && p.billing_period === period
        ) ?? false
    )
}
