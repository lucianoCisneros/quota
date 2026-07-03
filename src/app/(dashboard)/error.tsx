'use client'

import { Button } from '@/components/ui'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-surface-2">
                    <AlertTriangle className="h-6 w-6 text-danger" strokeWidth={1.75} />
                </div>
                <h2 className="text-[17px] font-semibold text-text-primary">Algo salió mal</h2>
                <p className="text-[15px] text-text-secondary">
                    Ocurrió un error inesperado. Por favor, intentá de nuevo.
                </p>
                <Button onClick={reset} variant="primary" className="mt-2">
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    )
}