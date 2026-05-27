'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentBillingPeriod, isPaidForPeriod } from '@/utils/billing-period'
import type { Group, GroupMember, Payment } from '@/types/database'

export type SubscriptionRow = {
    id: string
    group: Pick<Group, 'id' | 'name' | 'billing_cycle_day'>
    billingPeriod: string
    totalAmount: number
    isPaid: boolean
}

export async function getAllSubscriptions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const billingPeriod = getCurrentBillingPeriod()

    const { data: groups } = await supabase
        .from('groups')
        .select(`
            id,
            name,
            billing_cycle_day,
            total_price,
            group_members (*),
            payments (*)
        `)
        .eq('creator_id', user.id)
        .order('name')

    const subscriptions: SubscriptionRow[] = []

    for (const group of groups ?? []) {
        // Determine if the whole group is paid for the period (any unpaid member makes it pending)
        const isGroupPaid = (group.group_members ?? []).every((member: GroupMember) =>
            isPaidForPeriod(group.payments as Payment[], member.id, billingPeriod)
        )
        const totalAmount = Number(group.total_price ?? 0)
        subscriptions.push({
            id: group.id,
            group: {
                id: group.id,
                name: group.name,
                billing_cycle_day: group.billing_cycle_day,
            },
            billingPeriod,
            totalAmount,
            isPaid: isGroupPaid,
        })
    }

    return { subscriptions, billingPeriod }
}
