import { getCurrentBillingPeriod } from '@/utils/billing-period'

export function buildExternalReference(groupId: string, memberId: string, billingPeriod: string): string {
    return `${groupId}|${memberId}|${billingPeriod}`
}

export function parseExternalReference(ref: string | null | undefined): {
    groupId: string
    memberId: string
    billingPeriod: string
} | null {
    if (!ref) return null

    const pipeParts = ref.split('|')
    if (pipeParts.length === 3) {
        const [groupId, memberId, billingPeriod] = pipeParts
        if (groupId && memberId && /^\d{4}-\d{2}$/.test(billingPeriod)) {
            return { groupId, memberId, billingPeriod }
        }
    }

    const legacy = ref.match(/^group_([0-9a-f-]+)_member_([0-9a-f-]+)$/i)
    if (legacy) {
        return {
            groupId: legacy[1],
            memberId: legacy[2],
            billingPeriod: getCurrentBillingPeriod(),
        }
    }

    return null
}
