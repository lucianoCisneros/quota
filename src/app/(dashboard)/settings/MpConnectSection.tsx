'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { disconnectMercadoPago } from './settings.actions'
import { ArrowRight, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

type MpConnectSectionProps = {
    mpConnected: boolean
    mpUserId: string | null
    mpConnectedAt: string | null
    mpFeePercent: number
}

export function MpConnectSection({ mpConnected, mpUserId, mpConnectedAt, mpFeePercent }: MpConnectSectionProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [disconnecting, setDisconnecting] = useState(false)
    const [disconnectError, setDisconnectError] = useState<string | null>(null)

    const errorCode = searchParams.get('mp_error')
    const success = searchParams.get('mp_success')

    const handleConnect = () => {
        router.replace('/settings')
        window.location.href = '/api/mercadopago/connect'
    }

    const handleDisconnect = async () => {
        setDisconnecting(true)
        setDisconnectError(null)

        const result = await disconnectMercadoPago()

        if (!result.success) {
            setDisconnectError(result.error ?? 'Error al desconectar.')
            setDisconnecting(false)
            return
        }

        setDisconnecting(false)
        router.refresh()
    }

    const formatDate = (iso: string | null) => {
        if (!iso) return ''
        return new Date(iso).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const errorMessages: Record<string, string> = {
        mp_denied: 'No autorizaste la conexión con Mercado Pago.',
        missing_params: 'Error en la respuesta de Mercado Pago. Intentá de nuevo.',
        csrf: 'Error de seguridad en la conexión. Intentá de nuevo.',
        token_exchange_failed: 'No se pudieron obtener los tokens de Mercado Pago. Intentá de nuevo.',
        save_failed: 'No se pudieron guardar los datos de conexión. Intentá de nuevo.',
    }

    return (
        <div className="p-6 mt-6 rounded-[18px] border border-border-hairline bg-surface-1">
            {errorCode && errorMessages[errorCode] && (
                <div className="mb-4 p-3 rounded-[10px] bg-surface-2 text-danger text-[13px] flex items-center gap-2">
                    <XCircle size={15} strokeWidth={1.75} className="shrink-0" />
                    <span>{errorMessages[errorCode]}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 rounded-[10px] bg-surface-2 text-success text-[13px] flex items-center gap-2">
                    <CheckCircle size={15} strokeWidth={1.75} className="shrink-0" />
                    <span>¡Cuenta de Mercado Pago conectada exitosamente!</span>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[17px] font-semibold text-text-primary">Cobrar con Mercado Pago</h3>
                        <p className="text-[13px] text-text-secondary mt-1">
                            {mpConnected
                                ? 'Tu cuenta de Mercado Pago está conectada. Los links de pago usan tu cuenta para recibir el dinero.'
                                : 'Conectá tu cuenta de Mercado Pago para que los pagos vayan directo a vos.'}
                        </p>
                    </div>
                </div>

                {mpConnected ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 p-4 rounded-[12px] bg-surface-2">
                        <div className="flex items-center gap-2 text-[13px] text-success">
                            <CheckCircle size={18} strokeWidth={1.75} className="shrink-0" />
                            <div>
                                <span className="font-medium">Conectado</span>
                                {mpConnectedAt && (
                                    <span className="text-text-tertiary ml-1">
                                        desde {formatDate(mpConnectedAt)}
                                    </span>
                                )}
                                {mpUserId && (
                                    <span className="text-text-tertiary block text-[12px] mt-0.5">
                                        ID de cuenta MP: {mpUserId}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleDisconnect}
                            isLoading={disconnecting}
                            variant="danger"
                            size="sm"
                            className="self-start sm:self-center"
                        >
                            Desconectar
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mt-2">
                        <Button
                            onClick={handleConnect}
                            variant="primary"
                            className="w-full sm:w-auto inline-flex items-center gap-2"
                        >
                            Conectar Mercado Pago
                            <ExternalLink size={16} strokeWidth={1.75} />
                        </Button>
                        <p className="text-[13px] text-text-tertiary leading-relaxed">
                            Vas a ser redirigido a Mercado Pago para autorizar la conexión.
                            Solo necesitás iniciar sesión con tu cuenta de Mercado Pago y aceptar los permisos.
                        </p>
                    </div>
                )}

                {disconnectError && (
                    <p className="text-[13px] text-danger mt-1">{disconnectError}</p>
                )}
            </div>

            <div className="hairline-top my-5" />

            <div className="text-[13px] text-text-tertiary space-y-1.5">
                <h4 className="font-medium text-text-secondary">Comisión de Mercado Pago</h4>
                <p>
                    Quota estima una comisión del <span className="text-accent font-medium">{mpFeePercent}%</span> de MercadoPago y la
                    suma al monto que paga tu amigo, para que vos recibas la cuota completa.
                </p>
            </div>
        </div>
    )
}