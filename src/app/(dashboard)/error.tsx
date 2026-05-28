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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Algo salió mal</h2>
                <p className="text-sm text-zinc-400">
                    Ocurrió un error inesperado. Por favor, intentá de nuevo.
                </p>
                <Button onClick={reset} variant="primary" className="mt-2">
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    )
}