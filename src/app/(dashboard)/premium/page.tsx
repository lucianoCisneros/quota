import Link from 'next/link'
import { Crown, ArrowLeft, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PremiumPage() {
    return (
        <div className="page-enter max-w-2xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-[15px] text-text-secondary hover:text-text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <div className="text-center mb-10">
                <div className="inline-flex p-4 rounded-[18px] bg-surface-2 mb-6">
                    <Crown size={40} strokeWidth={1.5} className="text-warning" />
                </div>
                <h1 className="text-[34px] font-bold tracking-tight text-text-primary mb-2">Quota Premium</h1>
                <p className="text-[15px] text-text-secondary">
                    Desbloqueá grupos ilimitados y gestioná todas tus suscripciones compartidas sin límites.
                </p>
            </div>

            <Card variant="elevated" className="p-8">
                <ul className="space-y-4 mb-8">
                    {[
                        'Grupos ilimitados (Netflix, Spotify, etc.)',
                        'Cobros por WhatsApp con transferencia y Mercado Pago',
                        'Historial de pagos por mes',
                        'Participantes en vista global',
                    ].map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-[15px] text-text-primary">
                            <Check size={20} strokeWidth={1.75} className="text-success shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <p className="text-[13px] text-text-tertiary mb-6 text-center">
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
