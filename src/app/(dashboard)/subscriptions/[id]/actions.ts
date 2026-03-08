'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function getSubscriptionDetails(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: group } = await supabase
        .from('groups')
        .select(`
            *,
            services (*),
            group_members (*),
            payments (*)
        `)
        .eq('id', id)
        .eq('creator_id', user.id)
        .single()

    if (!group) {
        redirect('/')
    }

    return group
}

import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function createPaymentLink(member: any, group: any) {
    const supabase = await createClient()

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN === 'TU_TOKEN_AQUI') {
        return { success: false, link: "", error: "Falta configurar el Token de Mercado Pago." }
    }

    try {
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
        const preference = new Preference(client)

        const title = `Cuota de ${group.name}`
        const amount = Number(member.quota_amount)

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: `group_${group.id}_member_${member.id}`,
                        title: title,
                        quantity: 1,
                        unit_price: amount,
                        currency_id: 'ARS', // Default to ARS, adjust later if needed
                    }
                ],
                payer: {
                    name: member.user_name,
                },
                // Optional: For now, we use external_reference to identify this specific debt
                external_reference: `group_${group.id}_member_${member.id}`,
            }
        })

        return { success: true, link: response.init_point }
    } catch (e: any) {
        return { success: false, link: "", error: e.message || "Error al generar Link MP" }
    }
}

export async function togglePaymentStatus(memberId: string, groupId: string, amount: number) {
    const supabase = await createClient()

    // Comprobar si ya existe un registro de "PAID"
    const { data: existingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .eq('group_id', groupId)
        .eq('status', 'PAID')
        .single()

    if (existingPayment) {
        // Desmarcar (borrar el pago histórico para dejarlo pendiente)
        await supabase.from('payments').delete().eq('id', existingPayment.id)
    } else {
        // Marcar Pagado
        await supabase.from('payments').insert({
            member_id: memberId,
            group_id: groupId,
            amount: amount,
            status: 'PAID'
        })
    }

    revalidatePath(`/subscriptions/${groupId}`)
    return { success: true }
}

