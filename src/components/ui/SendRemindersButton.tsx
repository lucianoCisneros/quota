'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { triggerRemindersManually } from '@/app/(dashboard)/subscriptions/reminder-actions'

type SendResult = {
    sent: number
    skippedNoEmail: number
    skippedPaid: number
    skippedNoAlias: number
    errors: number
} | null

export function SendRemindersButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SendResult>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSend = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const response = await triggerRemindersManually()
            if (response.success && response.data) {
                setResult(response.data)
            } else {
                setError(response.error ?? 'Error al enviar recordatorios')
            }
        } catch {
            setError('Error inesperado al enviar recordatorios.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <Button
                onClick={handleSend}
                disabled={loading}
                variant="secondary"
                className="text-sm gap-2"
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Mail size={16} />
                )}
                {loading ? 'Enviando...' : 'Enviar recordatorios ahora'}
            </Button>

            {result && (
                <div className="text-xs text-zinc-400 bg-white/5 rounded-lg p-3 space-y-1 border border-white/10">
                    <p className="flex items-center gap-1.5 text-green-400">
                        <CheckCircle size={12} />
                        <span>{result.sent} recordatorios enviados</span>
                    </p>
                    {result.skippedPaid > 0 && (
                        <p className="text-zinc-500">
                            {result.skippedPaid} ya habían pagado
                        </p>
                    )}
                    {result.skippedNoEmail > 0 && (
                        <p className="text-zinc-500">
                            {result.skippedNoEmail} sin email registrado
                        </p>
                    )}
                    {result.skippedNoAlias > 0 && (
                        <p className="text-zinc-500">
                            {result.skippedNoAlias} grupos sin alias configurado
                        </p>
                    )}
                    {result.errors > 0 && (
                        <p className="flex items-center gap-1.5 text-red-400">
                            <XCircle size={12} />
                            <span>{result.errors} errores al enviar</span>
                        </p>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    {error}
                </p>
            )}
        </div>
    )
}