'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Preference } from 'mercadopago'
import { calculateMercadoPagoGrossAmount, getMercadoPagoFeePercent } from '@/utils/payment-fees'
import { getCurrentBillingPeriod } from '@/utils/billing-period'
import { assertGroupOwner } from '@/utils/group-auth'
import { buildExternalReference } from '@/utils/mercadopago-reference'
import { getAppUrl } from '@/utils/app-url'
import { recordMemberPayment } from '@/lib/record-payment'
import { getUserMercadoPagoClient } from '@/lib/mercadopago-client'
import type { GroupMember } from '@/types/database'

type PaymentLinkMember = Pick<GroupMember, 'id' | 'user_name' | 'quota_amount'>
type PaymentLinkGroup = { id: string; name: string }

export async function getSubscriptionDetails(id: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: group } = await supabase
        .from('groups')
        .select(
            `
            *,
            services (*),
            group_members (*),
            payments (*)
        `,
        )
        .eq('id', id)
        .eq('creator_id', user.id)
        .single()

    if (!group) redirect('/')

    const { data: profile } = await supabase.from('users').select('payment_alias').eq('id', user.id).single()

    // Check if user has MP connected
    const mpClient = await getUserMercadoPagoClient(user.id)

    return {
        ...group,
        payment_alias: profile?.payment_alias ?? null,
        mpConnected: mpClient !== null,
        billingPeriod: getCurrentBillingPeriod(),
    }
}

export async function createPaymentLink(member: PaymentLinkMember, group: PaymentLinkGroup) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, link: '', error: 'No autorizado.' }
    }

    const ownership = await assertGroupOwner(supabase, user.id, group.id)
    if (!ownership.ok) {
        return { success: false, link: '', error: ownership.error }
    }

    // Get the user's own Mercado Pago client (multi-tenant)
    const mpClient = await getUserMercadoPagoClient(user.id)
    if (!mpClient) {
        return {
            success: false,
            link: '',
            mpNotConfigured: true,
            error: 'Conectá tu cuenta de Mercado Pago en Ajustes para generar links de pago.',
        }
    }

    try {
        const billingPeriod = getCurrentBillingPeriod()
        const preference = new Preference(mpClient.client)

        const netAmount = Number(member.quota_amount)
        const breakdown = calculateMercadoPagoGrossAmount(netAmount, getMercadoPagoFeePercent())
        const title = `Cuota de ${group.name} (${billingPeriod})`
        const externalReference = buildExternalReference(group.id, member.id, billingPeriod)
        const notificationUrl = `${getAppUrl()}/api/webhooks/mercadopago`

        const items =
            breakdown.feeAmount > 0
                ? [
                      {
                          id: `${member.id}_quota`,
                          title,
                          quantity: 1,
                          unit_price: breakdown.netAmount,
                          currency_id: 'ARS' as const,
                      },
                      {
                          id: `${member.id}_fee`,
                          title: 'Comisión Mercado Pago (a cargo del pagador)',
                          quantity: 1,
                          unit_price: breakdown.feeAmount,
                          currency_id: 'ARS' as const,
                      },
                  ]
                : [
                      {
                          id: `${member.id}_total`,
                          title,
                          quantity: 1,
                          unit_price: breakdown.grossAmount,
                          currency_id: 'ARS' as const,
                      },
                  ]

        const response = await preference.create({
            body: {
                items,
                payer: { name: member.user_name },
                external_reference: externalReference,
                notification_url: notificationUrl,
            },
        })

        return {
            success: true,
            link: response.init_point!,
            billingPeriod,
            ...breakdown,
        }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al generar Link MP'
        return { success: false, link: '', error: message }
    }
}

export async function togglePaymentStatus(memberId: string, groupId: string, amount: number) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'No autorizado.' }

    const ownership = await assertGroupOwner(supabase, user.id, groupId)
    if (!ownership.ok) return { success: false, error: ownership.error }

    const billingPeriod = getCurrentBillingPeriod()

    const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('member_id', memberId)
        .eq('group_id', groupId)
        .eq('billing_period', billingPeriod)
        .eq('status', 'PAID')
        .maybeSingle()

    if (existingPayment) {
        await supabase.from('payments').delete().eq('id', existingPayment.id)
    } else {
        await recordMemberPayment(supabase, {
            groupId,
            memberId,
            billingPeriod,
            amount,
        })
    }

    revalidatePath(`/subscriptions/${groupId}`)
    revalidatePath('/')
    revalidatePath('/members')
    return { success: true }
}

export async function updateSubscriptionGroup(groupId: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const ownership = await assertGroupOwner(supabase, user.id, groupId)
    if (!ownership.ok) {
        redirect(`/subscriptions/${groupId}/edit?error=${encodeURIComponent(ownership.error)}`)
    }

    const name = (formData.get('name') as string)?.trim()
    const total_price = parseFloat(formData.get('total_price') as string)
    const billing_cycle_day = parseInt(formData.get('billing_cycle_day') as string, 10)

    if (!name || !Number.isFinite(total_price) || total_price <= 0) {
        redirect(
            `/subscriptions/${groupId}/edit?error=${encodeURIComponent('Nombre y precio válidos son obligatorios.')}`,
        )
    }
    if (!Number.isInteger(billing_cycle_day) || billing_cycle_day < 1 || billing_cycle_day > 31) {
        redirect(
            `/subscriptions/${groupId}/edit?error=${encodeURIComponent('El día de cobro debe estar entre 1 y 31.')}`,
        )
    }

    const { error } = await supabase.from('groups').update({ name, total_price, billing_cycle_day }).eq('id', groupId)

    if (error) {
        redirect(`/subscriptions/${groupId}/edit?error=${encodeURIComponent(error.message)}`)
    }

    const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)

    if (memberCount && memberCount > 0) {
        const quota_amount = total_price / (memberCount + 1)
        await supabase.from('group_members').update({ quota_amount }).eq('group_id', groupId)
    }

    revalidatePath(`/subscriptions/${groupId}`)
    revalidatePath(`/subscriptions/${groupId}/edit`)
    revalidatePath('/')
    redirect(`/subscriptions/${groupId}`)
}

export async function updateMember(memberId: string, groupId: string, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autorizado.' }

    const ownership = await assertGroupOwner(supabase, user.id, groupId)
    if (!ownership.ok) return { success: false, error: ownership.error }

    const user_name = (formData.get('user_name') as string)?.trim()
    const whatsapp_number = (formData.get('whatsapp_number') as string)?.trim() || null
    const email = (formData.get('email') as string)?.trim() || null

    if (!user_name) {
        return { success: false, error: 'El nombre es obligatorio.' }
    }

    const { error } = await supabase
        .from('group_members')
        .update({ user_name, whatsapp_number, email })
        .eq('id', memberId)
        .eq('group_id', groupId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath(`/subscriptions/${groupId}`)
    revalidatePath('/')
    revalidatePath('/members')
    return { success: true }
}

export async function deleteSubscriptionGroup(groupId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const ownership = await assertGroupOwner(supabase, user.id, groupId)
    if (!ownership.ok) return { error: ownership.error }

    const { error } = await supabase.from('groups').delete().eq('id', groupId)
    if (error) return { error: error.message }

    revalidatePath('/')
    redirect('/')
}