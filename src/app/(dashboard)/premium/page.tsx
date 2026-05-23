import Link from 'next/link'
import { Crown, ArrowLeft, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PremiumPage() {
    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <div className="text-center mb-10">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 mb-6">
                    <Crown size={40} className="text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3">Quota Premium</h1>
                <p className="text-zinc-400">
                    Desbloqueá grupos ilimitados y gestioná todas tus suscripciones compartidas sin límites.
                </p>
            </div>

            <Card className="p-8" variant="gradient">
                <ul className="space-y-4 mb-8">
                    {[
                        'Grupos ilimitados (Netflix, Spotify, etc.)',
                        'Cobros por WhatsApp con transferencia y Mercado Pago',
                        'Historial de pagos por mes',
                        'Participantes en vista global',
                    ].map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-zinc-200">
                            <Check size={20} className="text-green-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <p className="text-sm text-zinc-500 mb-6 text-center">
                    El plan Premium estará disponible próximamente. Por ahora el plan gratuito incluye 1 grupo.
                </p>

                <Link href="/" className="block">
                    <Button className="w-full" variant="secondary">
                        Volver al inicio
                    </Button>
                </Link>
            </Card>
        </div>
    )
}
