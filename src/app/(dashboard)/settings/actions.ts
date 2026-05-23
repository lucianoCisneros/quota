'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getMercadoPagoFeePercent } from '@/utils/payment-fees'

export async function getSettingsData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('email, name, payment_alias')
        .eq('id', user.id)
        .single()

    return {
        profile,
        mpFeePercent: getMercadoPagoFeePercent(),
    }
}

export async function updatePaymentAlias(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const payment_alias = (formData.get('payment_alias') as string)?.trim() || null

    const { error } = await supabase
        .from('users')
        .update({ payment_alias })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/', 'layout')
    return { success: true }
}
