'use client'

import { useState, useTransition } from 'react'
import { X, UserPlus } from 'lucide-react'
import { addGroupMember } from './subscription-detail.actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type AddMemberDialogProps = {
    groupId: string
    onClose: () => void
}

export function AddMemberDialog({ groupId, onClose }: AddMemberDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            const result = await addGroupMember(groupId, formData)
            if (result.success) {
                onClose()
            } else {
                setError(result.error ?? 'Error al agregar.')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-[18px] bg-surface-1 border border-border-hairline shadow-[0_12px_32px_rgba(0,0,0,0.5)] p-6 sm:p-8 page-enter">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[10px] bg-accent/10 flex items-center justify-center">
                            <UserPlus size={16} className="text-accent" strokeWidth={1.75} />
                        </div>
                        <h3 className="text-[17px] font-semibold text-text-primary">Agregar integrante</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={18} strokeWidth={1.75} />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-[12px] bg-surface-2 text-danger text-[13px]">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nombre"
                        name="user_name"
                        required
                        placeholder="Nombre del amigo"
                    />

                    <Input
                        label="WhatsApp"
                        name="whatsapp_number"
                        type="tel"
                        placeholder="Ej: 5491123456789"
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="amigo@email.com (opcional)"
                    />

                    <p className="text-[13px] text-text-tertiary leading-relaxed">
                        Al agregar un integrante, la cuota se recalcula automáticamente en partes iguales entre todos.
                    </p>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" isLoading={isPending} className="flex-1">
                            Agregar
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isPending}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}