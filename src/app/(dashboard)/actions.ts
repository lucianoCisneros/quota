'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getDashboardData() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Get User Profile (Tier info)
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // 2. Get Groups created by this user
    const { data: groups } = await supabase
        .from('groups')
        .select(`
            *,
            services (*),
            group_members (*)
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

    // 3. Get total pending payments by calculating members quota minus PAID records.
    const { data: allUserGroups } = await supabase
        .from('groups')
        .select(`
            id,
            group_members (
                id,
                quota_amount
            ),
            payments (
                member_id,
                status
            )
        `)
        .eq('creator_id', user.id)

    let totalPendingAmount = 0;
    if (allUserGroups) {
        allUserGroups.forEach(group => {
            group.group_members.forEach((member: any) => {
                const isPaid = group.payments?.some((p: any) => p.member_id === member.id && p.status === 'PAID')
                if (!isPaid) {
                    totalPendingAmount += Number(member.quota_amount);
                }
            })
        })
    }

    return {
        profile,
        groups: groups || [],
        pendingAmountFromOthers: totalPendingAmount,
    }
}

export async function getServices() {
    const supabase = await createClient()
    const { data: services } = await supabase.from('services').select('*')
    return services || []
}

// Group Creation
export async function createSubscriptionGroup(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    // 1. Enforce Freemium Logic
    const { data: profile } = await supabase.from('users').select('tier').eq('id', user.id).single()
    const { count } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('creator_id', user.id)

    if (profile?.tier === 'free' && (count ?? 0) >= 1) {
        return { error: "Límite Freemium alcanzado. Actualiza a Premium para crear grupos ilimitados." }
    }

    const name = formData.get('name') as string
    const service_id = formData.get('service_id') as string
    const total_price = parseFloat(formData.get('total_price') as string)
    const billing_cycle_day = parseInt(formData.get('billing_cycle_day') as string)

    // Parse members from special input format or hardcoded array for now
    const membersDataString = formData.get('membersData') as string
    const members = membersDataString ? JSON.parse(membersDataString) : []

    // 2. Insert Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            service_id: service_id || null,
            total_price,
            billing_cycle_day,
            creator_id: user.id
        })
        .select()
        .single()

    if (groupError) return { error: groupError.message }

    // 3. Insert Members (Automatically calculate quota)
    if (members.length > 0) {
        // Members array already include the creator if they pay their share too.
        // Actually, the members list from the UI is just who is paying.
        const quota_amount = total_price / (members.length + 1) // +1 assuming creator always pays a part too

        const membersToInsert = members.map((m: any) => ({
            group_id: group.id,
            user_name: m.name,
            whatsapp_number: m.whatsapp,
            quota_amount: quota_amount
        }))

        await supabase.from('group_members').insert(membersToInsert)
    }

    revalidatePath('/')
    redirect(`/subscriptions/${group.id}`)
}
