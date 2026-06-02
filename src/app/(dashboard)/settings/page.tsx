import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSettingsData } from './settings.actions'
import { Card } from '@/components/ui/Card'
import { PaymentAliasForm } from './PaymentAliasForm'
import { MpConnectSection } from './MpConnectSection'

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

            <MpConnectSection
                mpConnected={profile?.mp_connected ?? false}
                mpUserId={profile?.mp_user_id ?? null}
                mpConnectedAt={profile?.mp_connected_at ?? null}
                mpFeePercent={mpFeePercent}
            />
        </div>
    )
}
