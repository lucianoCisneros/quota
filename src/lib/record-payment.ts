import type { SupabaseClient } from '@supabase/supabase-js'

export async function recordMemberPayment(
    supabase: SupabaseClient,
    params: {
        groupId: string
        memberId: string
        billingPeriod: string
        amount: number
        preferenceId?: string | null
    }
): Promise<{ created: boolean }> {
    const { groupId, memberId, billingPeriod, amount, preferenceId } = params

    const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('group_id', groupId)
        .eq('member_id', memberId)
        .eq('billing_period', billingPeriod)
        .eq('status', 'PAID')
        .maybeSingle()

    if (existing) return { created: false }

    const { error } = await supabase.from('payments').insert({
        group_id: groupId,
        member_id: memberId,
        billing_period: billingPeriod,
        amount,
        status: 'PAID',
        preference_id: preferenceId ?? null,
    })

    if (error) throw error
    return { created: true }
}
