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
                className="text-[13px] gap-2"
            >
                {loading ? (
                    <Loader2 size={15} strokeWidth={1.75} className="animate-spin" />
                ) : (
                    <Mail size={15} strokeWidth={1.75} />
                )}
                {loading ? 'Enviando...' : 'Enviar recordatorios ahora'}
            </Button>

            {result && (
                <div className="text-[13px] text-text-secondary bg-surface-2 rounded-[12px] p-3 space-y-1 border border-border-hairline">
                    <p className="flex items-center gap-1.5 text-success">
                        <CheckCircle size={12} strokeWidth={2} />
                        <span>{result.sent} recordatorios enviados</span>
                    </p>
                    {result.skippedPaid > 0 && (
                        <p className="text-text-tertiary">
                            {result.skippedPaid} ya habían pagado
                        </p>
                    )}
                    {result.skippedNoEmail > 0 && (
                        <p className="text-text-tertiary">
                            {result.skippedNoEmail} sin email registrado
                        </p>
                    )}
                    {result.skippedNoAlias > 0 && (
                        <p className="text-text-tertiary">
                            {result.skippedNoAlias} grupos sin alias configurado
                        </p>
                    )}
                    {result.errors > 0 && (
                        <p className="flex items-center gap-1.5 text-danger">
                            <XCircle size={12} strokeWidth={2} />
                            <span>{result.errors} errores al enviar</span>
                        </p>
                    )}
                </div>
            )}

            {error && (
                <p className="text-[13px] text-danger bg-surface-2 rounded-[12px] p-3 border border-border-hairline">
                    {error}
                </p>
            )}
        </div>
    )
}