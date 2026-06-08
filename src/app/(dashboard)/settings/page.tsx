import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSettingsData } from './settings.actions'
import { Card } from '@/components/ui/Card'
import { ProfileForm } from './ProfileForm'
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
                <h1 className="text-3xl font-bold tracking-tight mb-2">Ajustes</h1>
                <p className="text-zinc-400">
                    Administrá tu perfil y configurá cómo recibís los pagos de tus amigos.
                </p>
            </header>

            {/* Profile section */}
            <Card className="p-6 sm:p-8 mb-6" variant="glass">
                <ProfileForm
                    initialName={profile?.name ?? ''}
                    initialLastName={profile?.last_name ?? ''}
                    initialEmail={profile?.email ?? ''}
                />
            </Card>

            {/* Payment alias section */}
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
