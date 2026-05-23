'use client'

import { useState } from 'react'
import { updatePaymentAlias } from './actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function PaymentAliasForm({ initialAlias }: { initialAlias: string }) {
    const [alias, setAlias] = useState(initialAlias)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.set('payment_alias', alias)

        const result = await updatePaymentAlias(formData)
        setLoading(false)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'ok', text: 'Alias guardado correctamente.' })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-white mb-1">Alias o CBU</h2>
                <p className="text-sm text-zinc-400 mb-4">
                    Tus amigos podrán transferirte la cuota exacta sin pagar comisión de Mercado Pago.
                </p>
                <Input
                    label="Alias / CBU / CVU"
                    name="payment_alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Ej: mi.alias.mp o 0000003100000000000000"
                />
            </div>

            {message && (
                <div
                    className={`p-4 rounded-xl text-sm font-medium border ${
                        message.type === 'ok'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
                Guardar alias
            </Button>
        </form>
    )
}
