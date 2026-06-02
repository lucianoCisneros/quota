/**
 * CRON endpoint for automated payment reminders (Phase 3).
 *
 * Triggered daily by Vercel Cron Jobs. Checks which groups have
 * billing_cycle_day === today, and sends email reminders to
 * members with PENDING payments who have an email registered.
 *
 * Security: Protected by CRON_SECRET. The caller must pass
 * `?secret=<CRON_SECRET>` to authenticate.
 *
 * GET /api/cron/send-reminders?secret=<CRON_SECRET>
 */

import { NextResponse } from 'next/server'
import { sendPendingReminders } from '@/utils/reminder-sender'

export async function GET(request: Request) {
    // 1. Verificar el CRON_SECRET
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (!process.env.CRON_SECRET) {
        console.error('❌ CRON_SECRET no está configurado. Agregalo en .env.local o Vercel Env.')
        return NextResponse.json(
            { error: 'CRON_SECRET no configurado en el servidor.' },
            { status: 500 },
        )
    }

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json(
            { error: 'No autorizado. Se requiere ?secret=<CRON_SECRET> válido.' },
            { status: 401 },
        )
    }

    // 2. Ejecutar los recordatorios
    try {
        const result = await sendPendingReminders()

        console.log('✅ Recordatorios procesados:', {
            groups: result.totalGroups,
            members: result.totalMembers,
            sent: result.sent,
            skippedNoEmail: result.skippedNoEmail,
            skippedPaid: result.skippedPaid,
            skippedNoAlias: result.skippedNoAlias,
            errors: result.errors.length,
        })

        if (result.errors.length > 0) {
            console.error('❌ Errores individuales:', result.errors)
        }

        return NextResponse.json({
            ok: true,
            ...result,
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido'
        console.error('❌ Error en cron send-reminders:', message)
        return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
}