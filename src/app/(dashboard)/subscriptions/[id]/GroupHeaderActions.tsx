'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { deleteSubscriptionGroup } from './actions'
import { Button } from '@/components/ui/Button'

export function GroupHeaderActions({ groupId }: { groupId: string }) {
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteSubscriptionGroup(groupId)
            if (result?.error) alert(result.error)
        })
    }

    return (
        <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
            <Link href={`/subscriptions/${groupId}/edit`} className="flex-1 md:flex-none">
                <Button variant="secondary" className="w-full">
                    Editar
                </Button>
            </Link>
            {!showConfirm ? (
                <Button variant="danger" className="flex-1 md:flex-none" onClick={() => setShowConfirm(true)}>
                    Eliminar
                </Button>
            ) : (
                <div className="flex gap-2 flex-1 md:flex-none">
                    <Button variant="danger" className="flex-1" isLoading={isPending} onClick={handleDelete}>
                        Confirmar
                    </Button>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                </div>
            )}
        </div>
    )
}
