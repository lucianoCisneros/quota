import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-text-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-accent" strokeWidth={1.75} />
                <p className="text-[15px] font-medium">Cargando...</p>
            </div>
        </div>
    )
}