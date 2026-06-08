'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getMercadoPagoFeePercent } from '@/utils/payment-fees'
import { isUserMpConnected } from '@/lib/mercadopago-client'

export async function getSettingsData() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('users')
        .select('email, name, last_name, payment_alias, mp_user_id, mp_connected_at')
        .eq('id', user.id)
        .single()

    const mpConnected = await isUserMpConnected(user.id)

    return {
        profile: {
            ...profile,
            mp_connected: mpConnected,
            mp_user_id: profile?.mp_user_id ?? null,
            mp_connected_at: profile?.mp_connected_at ?? null,
        },
        mpFeePercent: getMercadoPagoFeePercent(),
    }
}

export async function updatePaymentAlias(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const payment_alias = (formData.get('payment_alias') as string)?.trim() || null

    const { error } = await supabase.from('users').update({ payment_alias }).eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/settings')
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const name = (formData.get('name') as string)?.trim()
    const lastName = (formData.get('lastName') as string)?.trim() || null
    const email = (formData.get('email') as string)?.trim()

    if (!name) return { error: 'El nombre es obligatorio' }

    // Validar email
    if (!email) return { error: 'El email es obligatorio' }

    // Actualizar en public.users
    const { error } = await supabase
        .from('users')
        .update({
            name,
            last_name: lastName,
            email,
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    // Si el email cambió, actualizar también en auth.users
    if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email })
        if (authError) return { error: authError.message }
    }

    revalidatePath('/settings')
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function disconnectMercadoPago(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'No autorizado.' }

    const admin = createAdminClient()
    const { error } = await admin
        .from('users')
        .update({
            mp_access_token_encrypted: null,
            mp_refresh_token_encrypted: null,
            mp_user_id: null,
            mp_token_expires_at: null,
            mp_connected_at: null,
        })
        .eq('id', user.id)

    if (error) {
        console.error('[Disconnect MP] Error:', error)
        return { success: false, error: 'Error al desconectar Mercado Pago.' }
    }

    revalidatePath('/settings')
    revalidatePath('/', 'layout')

    return { success: true }
}