'use server'

import { sendPendingReminders } from '@/utils/reminder-sender'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function triggerRemindersManually() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'No autorizado.' }
    }

    // Verify the user is an admin (has at least one group)
    const { count } = await supabase
        .from('groups')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .limit(1)

    if (!count || count === 0) {
        return { success: false, error: 'No tenés grupos creados.' }
    }

    try {
        const result = await sendPendingReminders()

        revalidatePath('/')
        revalidatePath('/subscriptions')

        return {
            success: true,
            data: {
                sent: result.sent,
                skippedNoEmail: result.skippedNoEmail,
                skippedPaid: result.skippedPaid,
                skippedNoAlias: result.skippedNoAlias,
                errors: result.errors.length,
            },
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error al enviar recordatorios'
        return { success: false, error: message }
    }
}
