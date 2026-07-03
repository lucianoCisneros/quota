'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { AddMemberDialog } from './AddMemberDialog'
import { Button } from '@/components/ui/Button'

export function AddMemberButton({ groupId }: { groupId: string }) {
    const [showDialog, setShowDialog] = useState(false)

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                variant="secondary"
                size="sm"
                className="gap-1.5"
            >
                <UserPlus size={15} strokeWidth={1.75} />
                Agregar
            </Button>
            {showDialog && <AddMemberDialog groupId={groupId} onClose={() => setShowDialog(false)} />}
        </>
    )
}