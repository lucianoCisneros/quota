'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentBillingPeriod, isPaidForPeriod } from '@/utils/billing-period'
import type { GroupMember, Payment } from '@/types/database'

export async function getDashboardData() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const billingPeriod = getCurrentBillingPeriod()

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

    const { data: groups } = await supabase
        .from('groups')
        .select(
            `
            *,
            services (*),
            group_members (*),
            payments (*)
        `,
        )
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

    let totalPendingAmount = 0
    const groupsWithStats = (groups ?? []).map((group) => {
        const members = (group.group_members ?? []) as GroupMember[]
        const payments = (group.payments ?? []) as Payment[]
        const paidCount = members.filter((m) => isPaidForPeriod(payments, m.id, billingPeriod)).length
        const pendingMembers = members.filter((m) => !isPaidForPeriod(payments, m.id, billingPeriod))
        const pendingForGroup = pendingMembers.reduce((sum, m) => sum + Number(m.quota_amount), 0)
        totalPendingAmount += pendingForGroup

        return {
            ...group,
            paidCount,
            memberCount: members.length,
            pendingForGroup,
        }
    })

    return {
        profile,
        groups: groupsWithStats,
        pendingAmountFromOthers: totalPendingAmount,
        billingPeriod,
    }
}

export async function getServices() {
    const supabase = await createClient()
    const { data: services } = await supabase.from('services').select('*')
    return services || []
}

export async function createSubscriptionGroup(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const { data: profile } = await supabase.from('users').select('tier').eq('id', user.id).single()
    const { count } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)

    if (profile?.tier === 'free' && (count ?? 0) >= 1) {
        return { error: 'Límite Freemium alcanzado. Actualiza a Premium para crear grupos ilimitados.' }
    }

    const name = (formData.get('name') as string)?.trim()
    const service_id = formData.get('service_id') as string
    const total_price = parseFloat(formData.get('total_price') as string)
    const billing_cycle_day = parseInt(formData.get('billing_cycle_day') as string, 10)

    if (!name || !Number.isFinite(total_price) || total_price <= 0) {
        return { error: 'Completá nombre y precio válidos.' }
    }

    let members: { name: string; whatsapp: string; email: string }[] = []
    try {
        const membersDataString = formData.get('membersData') as string
        members = membersDataString ? JSON.parse(membersDataString) : []
    } catch {
        return { error: 'Datos de participantes inválidos.' }
    }

    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name,
            service_id: service_id || null,
            total_price,
            billing_cycle_day,
            creator_id: user.id,
        })
        .select()
        .single()

    if (groupError) return { error: groupError.message }

    if (members.length > 0) {
        const quota_amount = total_price / (members.length + 1)

        const membersToInsert = members.map((m) => ({
            group_id: group.id,
            user_name: m.name,
            whatsapp_number: m.whatsapp,
            email: m.email || null,
            quota_amount,
        }))

        await supabase.from('group_members').insert(membersToInsert)
    }

    revalidatePath('/')
    redirect(`/subscriptions/${group.id}`)
}