import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSubscriptionDetails, updateSubscriptionGroup } from '../actions'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default async function EditSubscriptionPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ error?: string }>
}) {
    const { id } = await params
    const { error } = await searchParams
    const group = await getSubscriptionDetails(id)
    const updateGroup = updateSubscriptionGroup.bind(null, id)

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            <Link
                href={`/subscriptions/${id}`}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al grupo</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Editar grupo</h1>
                <p className="text-zinc-400">
                    Los cambios en el precio recalculan la cuota de cada amigo automáticamente.
                </p>
            </header>

            <Card className="p-6 sm:p-8" variant="glass">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {decodeURIComponent(error)}
                    </div>
                )}
                <form action={updateGroup} className="space-y-6">
                    <Input label="Nombre del grupo" name="name" defaultValue={group.name} required />
                    <Input
                        label="Costo total mensual ($)"
                        name="total_price"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={String(group.total_price)}
                        required
                    />
                    <Input
                        label="Día de cobro (1-31)"
                        name="billing_cycle_day"
                        type="number"
                        min={1}
                        max={31}
                        defaultValue={String(group.billing_cycle_day)}
                        required
                    />
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" className="flex-1">
                            Guardar cambios
                        </Button>
                        <Link href={`/subscriptions/${id}`} className="flex-1">
                            <Button type="button" variant="secondary" className="w-full">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    )
}
