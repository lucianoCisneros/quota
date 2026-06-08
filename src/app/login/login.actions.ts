'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (password.length > 64) return 'La contraseña debe tener máximo 64 caracteres'
    if (!/\d/.test(password)) return 'La contraseña debe contener al menos un número'
    if (!/[A-Z]/.test(password)) return 'La contraseña debe contener al menos una mayúscula'
    if (!/[a-z]/.test(password)) return 'La contraseña debe contener al menos una minúscula'
    return null
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name?.trim()) {
        redirect('/login?message=El nombre es obligatorio')
    }

    // Server-side password validation
    const passwordError = validatePassword(password)
    if (passwordError) {
        redirect(`/login?message=${encodeURIComponent(passwordError)}`)
    }

    // Create user in Auth
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    // Update profile in public.users with name and last_name
    if (data.user) {
        await supabase
            .from('users')
            .update({
                name: name.trim(),
                last_name: lastName?.trim() || null,
                email,
            })
            .eq('id', data.user.id)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Revisá tu email para confirmar la cuenta')
}