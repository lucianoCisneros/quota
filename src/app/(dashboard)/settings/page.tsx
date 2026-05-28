import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSettingsData } from './settings.actions'
import { Card } from '@/components/ui/Card'
import { PaymentAliasForm } from './PaymentAliasForm'

export default async function SettingsPage() {
    const { profile, mpFeePercent } = await getSettingsData()

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Ajustes de cobro</h1>
                <p className="text-zinc-400">
                    Configurá cómo recibís el dinero de tus amigos: transferencia sin comisión o Mercado Pago.
                </p>
            </header>

            <Card className="p-6 sm:p-8" variant="glass">
                <PaymentAliasForm initialAlias={profile?.payment_alias ?? ''} />
            </Card>

            <Card className="p-6 mt-6 text-sm text-zinc-400 border border-white/5" variant="default">
                <h3 className="font-medium text-white mb-2">Mercado Pago (link de pago)</h3>
                <p className="leading-relaxed mb-4">
                    Para generar el link en los mensajes de WhatsApp, agregá en{' '}
                    <code className="text-zinc-300">.env.local</code>:
                </p>
                <pre className="p-3 rounded-lg bg-black/30 text-xs text-zinc-300 overflow-x-auto mb-4">
                    MERCADOPAGO_ACCESS_TOKEN=tu_access_token
                </pre>
                <p className="leading-relaxed mb-4">
                    Para marcar pagos automáticos desde Mercado Pago, agregá también{' '}
                    <code className="text-zinc-300">SUPABASE_SERVICE_ROLE_KEY</code> y configurá el webhook en MP
                    apuntando a <code className="text-zinc-300">/api/webhooks/mercadopago</code> (ver README).
                </p>
                <p className="leading-relaxed mb-4">
                    Obtenelo en{' '}
                    <a
                        href="https://www.mercadopago.com.ar/developers/panel/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                        Mercado Pago Developers
                    </a>{' '}
                    (tu aplicación → Credenciales → Access Token). Reiniciá{' '}
                    <code className="text-zinc-300">npm run dev</code> después de guardar.
                </p>
                <h3 className="font-medium text-white mb-2">Comisión de Mercado Pago</h3>
                <p className="leading-relaxed">
                    Quota estima una comisión del <span className="text-indigo-300 font-medium">{mpFeePercent}%</span> y
                    la suma al monto que paga tu amigo, para que vos recibas la cuota completa. Podés ajustar el
                    porcentaje con la variable <code className="text-zinc-300">MERCADOPAGO_FEE_PERCENT</code> en tu
                    archivo de entorno.
                </p>
            </Card>
        </div>
    )
}
