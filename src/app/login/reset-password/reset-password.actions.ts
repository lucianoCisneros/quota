'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/login/reset-password?message=Ingres%C3%A1+tu+email')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/login/update-password`,
    })

    if (error) {
        // Mensaje genérico para no revelar si el email existe
        redirect('/login/reset-password?message=No+se+pudo+enviar+el+email')
    }

    // Siempre redirigir a pantalla de éxito (no revelar si el email existe o no)
    redirect('/login/reset-password?sent=1')
}