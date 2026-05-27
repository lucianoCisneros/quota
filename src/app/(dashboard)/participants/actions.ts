'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentBillingPeriod, isPaidForPeriod } from '@/utils/billing-period'
import type { GroupMember, Group, Payment } from '@/types/database'

export type ParticipantRow = GroupMember & {
    group: Pick<Group, 'id' | 'name' | 'billing_cycle_day'>
    isPaid: boolean
    billingPeriod: string
}

export async function getAllParticipants() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const billingPeriod = getCurrentBillingPeriod()

    const { data: groups } = await supabase
        .from('groups')
        .select(
            `
            id,
            name,
            billing_cycle_day,
            group_members (*),
            payments (*)
        `,
        )
        .eq('creator_id', user.id)
        .order('name')

    const participants: ParticipantRow[] = []

    for (const group of groups ?? []) {
        for (const member of group.group_members ?? []) {
            participants.push({
                ...(member as GroupMember),
                group: {
                    id: group.id,
                    name: group.name,
                    billing_cycle_day: group.billing_cycle_day,
                },
                isPaid: isPaidForPeriod(group.payments as Payment[], member.id, billingPeriod),
                billingPeriod,
            })
        }
    }

    return { participants, billingPeriod }
}
