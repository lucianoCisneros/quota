'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password || password.length < 8) {
        return { error: 'La contraseña debe tener al menos 8 caracteres' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    redirect('/login?message=Contrase%C3%B1a+actualizada+correctamente')
}