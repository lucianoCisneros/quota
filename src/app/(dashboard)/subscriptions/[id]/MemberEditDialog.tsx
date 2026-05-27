'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { updateMember } from './actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type MemberEditDialogProps = {
    member: {
        id: string
        user_name: string
        whatsapp_number?: string | null
        email?: string | null
    }
    groupId: string
    onClose: () => void
}

export function MemberEditDialog({ member, groupId, onClose }: MemberEditDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            const result = await updateMember(member.id, groupId, formData)
            if (result.success) {
                onClose()
            } else {
                setError(result.error ?? 'Error al actualizar.')
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Editar participante</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nombre"
                        name="user_name"
                        defaultValue={member.user_name}
                        required
                        placeholder="Nombre del amigo"
                    />

                    <Input
                        label="WhatsApp"
                        name="whatsapp_number"
                        type="tel"
                        defaultValue={member.whatsapp_number ?? ''}
                        placeholder="Ej: 5491123456789"
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={member.email ?? ''}
                        placeholder="amigo@email.com (opcional)"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            isLoading={isPending}
                            className="flex-1"
                        >
                            Guardar cambios
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