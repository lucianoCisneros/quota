'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// ─── Simple in-memory rate limiter ─────────────────────────
// Resets when the server restarts. For production with multiple
// instances, use Upstash Redis or similar.
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>()

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
    const now = Date.now()
    const record = loginAttempts.get(ip)

    if (record && record.blockedUntil > now) {
        const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000)
        return { allowed: false, message: `Demasiados intentos. Intentá de nuevo en ${remainingSeconds} segundos.` }
    }

    if (record) {
        record.count++
        if (record.count >= 5) {
            record.blockedUntil = now + 60_000 // Bloquear 1 minuto
        }
    } else {
        loginAttempts.set(ip, { count: 1, blockedUntil: 0 })
    }

    // Cleanup old entries every 100 attempts
    if (loginAttempts.size > 100) {
        const cutoff = now - 5 * 60_000
        for (const [key, val] of loginAttempts) {
            if (val.blockedUntil < cutoff && val.count > 0) {
                loginAttempts.delete(key)
            }
        }
    }

    return { allowed: true }
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Rate limiting por IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
    const { allowed, message } = checkRateLimit(ip)
    if (!allowed) {
        redirect(`/login?message=${encodeURIComponent(message!)}`)
    }

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        // Mensaje genérico para prevenir enumeración de cuentas
        redirect('/login?message=Email+o+contrase%C3%B1a+incorrectos')
    }

    // Resetear intentos en caso de login exitoso
    loginAttempts.delete(ip)

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
        // Mensaje genérico para no revelar si el email ya existe
        redirect('/login?message=No+se+pudo+completar+el+registro.+Revis%C3%A1+los+datos+e+intent%C3%A1+de+nuevo.')
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