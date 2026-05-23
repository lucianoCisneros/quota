import { Plus, TrendingUp, CreditCard, Users, ArrowUpRight, Crown } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "./actions";
import { Card } from "@/components/ui/Card";

export default async function Home() {
  const { profile, groups, pendingAmountFromOthers } = await getDashboardData();

  const totalMonthlyCost = groups.reduce((acc: number, group: any) => acc + (Number(group.total_price) || 0), 0);

  const canCreateGroup = profile?.tier === 'premium' || groups.length === 0;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row md:items-center items-start justify-between gap-6 md:gap-0 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Bienvenido, {profile?.name || profile?.email?.split('@')[0]}
          </h1>
          <p className="text-zinc-400">Resumen de tus suscripciones compartidas y cobros pendientes.</p>
        </div>

        {/* Freemium Limit Warning / Create Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {profile?.tier === 'free' && (
            <div className="text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl flex items-center justify-center gap-2">
              <Crown size={16} /> Plan Gratis ({groups.length}/1 Grupos)
            </div>
          )}

          <Link
            href={canCreateGroup ? "/subscriptions/new" : "/premium"}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-md  ${canCreateGroup ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5" : "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-yellow-500/20"}`}
          >
            {canCreateGroup ? <Plus size={20} /> : <Crown size={20} />}
            <span>{canCreateGroup ? "Nuevo Grupo" : "Mejorar a Premium"}</span>
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 relative group" variant="default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-1">Costo Total Mensual</p>
          <h3 className="text-3xl font-bold">${totalMonthlyCost.toFixed(2)}</h3>
        </Card>

        <Card className="p-6 relative group" variant="default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-1">Grupos Activos</p>
          <h3 className="text-3xl font-bold">{groups.length}</h3>
        </Card>

        <Card className="p-6 relative group" variant="default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-zinc-400 mb-1">Falta Cobrar (Amigos)</p>
          <h3 className="text-3xl font-bold text-orange-400">${pendingAmountFromOthers.toFixed(2)}</h3>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Tus Grupos de Suscripciones</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groups.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
            <h3 className="text-lg font-medium text-zinc-300">No tienes grupos creados</h3>
            <p className="text-zinc-500 mt-2">Crea tu primer grupo para empezar a dividir gastos.</p>
          </div>
        ) : (
          groups.map((group: any) => (
            <Link key={group.id} href={`/subscriptions/${group.id}`} className="group block">
              <Card className="p-4 sm:p-6 hover:bg-white/10 transition-colors flex items-center justify-between shadow-lg" variant="default">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-inner font-bold text-lg sm:text-xl text-white"
                    style={{ backgroundColor: group.services?.color_hex || '#3f3f46' }}
                  >
                    {group.services?.name ? group.services.name.charAt(0) : group.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg group-hover:text-indigo-400 transition-colors">{group.name}</h3>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      {group.group_members?.length || 0} amigos • Cobra el día {group.billing_cycle_day}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base sm:text-lg text-indigo-400">${Number(group.total_price).toFixed(2)}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-500">Total Mensual</p>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
