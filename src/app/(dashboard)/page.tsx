import { Plus, TrendingUp, CreditCard, Users, Crown } from 'lucide-react'
import Link from 'next/link'
import { getDashboardData } from './dashboard.actions'
import { Card } from '@/components/ui/Card'
import { formatBillingPeriodLabel } from '@/utils/billing-period'

export default async function Home() {
    const { profile, groups, pendingAmountFromOthers, billingPeriod } = await getDashboardData()
    const periodLabel = formatBillingPeriodLabel(billingPeriod)

    const totalMonthlyCost = groups.reduce((acc: number, group: any) => acc + (Number(group.total_price) || 0), 0)

    const canCreateGroup = profile?.tier === 'premium' || groups.length === 0

    return (
        <div className="page-enter">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center items-start justify-between gap-6 md:gap-0 mb-12">
                <div>
                    <h1 className="text-[34px] font-bold tracking-tight text-text-primary mb-1.5">
                        Bienvenido, {profile?.name || profile?.email?.split('@')[0]}
                    </h1>
                    <p className="text-[15px] text-text-secondary">
                        Resumen de cobros &middot; período: <span className="text-text-primary font-medium">{periodLabel}</span>
                    </p>
                </div>

                {/* Freemium Limit Warning / Create Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                    {profile?.tier === 'free' && (
                        <div className="text-[13px] bg-surface-2 text-text-secondary px-4 py-2.5 rounded-[12px] flex items-center justify-center gap-2">
                            <Crown size={15} strokeWidth={1.75} className="text-warning" />
                            Plan Gratis ({groups.length}/1 Grupos)
                        </div>
                    )}

                    <Link
                        href={canCreateGroup ? '/subscriptions/new' : '/premium'}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] font-medium text-[15px] transition-all duration-200 ${
                            canCreateGroup
                                ? 'bg-accent text-white hover:bg-accent-hover active:opacity-90'
                                : 'bg-warning/10 text-warning hover:bg-warning/15 active:opacity-90'
                        }`}
                    >
                        {canCreateGroup ? <Plus size={18} strokeWidth={1.75} /> : <Crown size={18} strokeWidth={1.75} />}
                        <span>{canCreateGroup ? 'Nuevo Grupo' : 'Mejorar a Premium'}</span>
                    </Link>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-[10px] bg-accent-subtle flex items-center justify-center text-accent">
                            <TrendingUp size={20} strokeWidth={1.75} />
                        </div>
                        <p className="text-[13px] text-text-secondary font-medium">Costo Total Mensual</p>
                    </div>
                    <p className="text-[28px] font-bold tabular-nums text-text-primary">${totalMonthlyCost.toFixed(2)}</p>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-[10px] bg-accent-subtle flex items-center justify-center text-accent">
                            <CreditCard size={20} strokeWidth={1.75} />
                        </div>
                        <p className="text-[13px] text-text-secondary font-medium">Grupos Activos</p>
                    </div>
                    <p className="text-[28px] font-bold tabular-nums text-text-primary">{groups.length}</p>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-[10px] bg-surface-2 flex items-center justify-center text-warning">
                            <Users size={20} strokeWidth={1.75} />
                        </div>
                        <p className="text-[13px] text-text-secondary font-medium">Falta Cobrar (Amigos)</p>
                    </div>
                    <p className="text-[28px] font-bold tabular-nums text-warning">${pendingAmountFromOthers.toFixed(2)}</p>
                </Card>
            </div>

            {/* Group List */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-semibold tracking-tight text-text-primary">Tus Grupos de Suscripciones</h2>
            </div>

            {groups.length === 0 ? (
                <div className="p-12 text-center rounded-[18px] border border-dashed border-border-hairline bg-surface-1">
                    <h3 className="text-[17px] font-medium text-text-secondary">No tienes grupos creados</h3>
                    <p className="text-[15px] text-text-tertiary mt-2">Crea tu primer grupo para empezar a dividir gastos.</p>
                </div>
            ) : (
                <div className="rounded-[18px] border border-border-hairline bg-surface-1 overflow-hidden">
                    {groups.map((group: any, index: number) => (
                        <Link
                            key={group.id}
                            href={`/subscriptions/${group.id}`}
                            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-2"
                            style={index > 0 ? { borderTop: '1px solid var(--border-hairline)' } : undefined}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div
                                    className="w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-white shrink-0"
                                    style={{ backgroundColor: group.services?.color_hex || '#3a3a3c' }}
                                >
                                    {group.services?.name ? group.services.name.charAt(0) : group.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[15px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className="text-[13px] text-text-tertiary mt-0.5">
                                        {group.memberCount} amigos &middot; {group.paidCount}/{group.memberCount} pagaron &middot; día {group.billing_cycle_day}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <p className="text-[17px] font-semibold tabular-nums text-accent">
                                    ${Number(group.total_price).toFixed(2)}
                                </p>
                                <p className="text-[12px] text-text-tertiary">Total Mensual</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
