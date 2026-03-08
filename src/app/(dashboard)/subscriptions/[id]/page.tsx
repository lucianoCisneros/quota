import { ArrowLeft, Check, Copy, CreditCard, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import { getSubscriptionDetails } from "./actions";
import { MemberActions } from "./MemberActions";

export default async function SubscriptionDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const group = await getSubscriptionDetails(id);

    const pendingMembers = group.group_members.filter((member: any) => {
        const isPaid = group.payments?.some((p: any) => p.member_id === member.id && p.status === 'PAID')
        return !isPaid
    })

    const pendingAmount = pendingMembers.reduce((a: number, b: any) => a + Number(b.quota_amount), 0);

    // We treat the creator's share implicitely. Currently only friends who pay are in group_members.

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} />
                <span>Volver al Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-12 h-12 flex items-center justify-center rounded-xl shadow-inner font-bold text-xl text-white"
                            style={{ backgroundColor: group.services?.color_hex || '#3f3f46' }}
                        >
                            {group.services?.name ? group.services.name.charAt(0) : group.name.charAt(0)}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                    </div>
                    <p className="text-zinc-400 flex items-center gap-2">
                        Cobra todos los meses el día <span className="font-medium text-white">{group.billing_cycle_day}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors text-sm">
                        Editar
                    </button>
                    <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-medium transition-colors text-sm border border-red-500/20">
                        Eliminar Grupo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 md:col-span-2 shadow-xl">
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Costo de tu {group.services?.name || group.name}</h3>
                    <div className="flex items-end gap-2 mt-3">
                        <p className="text-4xl font-bold text-indigo-400">${Number(group.total_price).toFixed(2)}</p>
                        <p className="text-sm text-zinc-500 mb-1">/ mes</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center shadow-xl">
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">Tus amigos te deben</h3>
                    <p className="text-3xl font-bold text-orange-400">${pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">por cobrar</p>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-6">Amigos (Participantes)</h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-black/20 text-sm text-zinc-400">
                            <th className="py-4 px-6 font-medium">Nombre</th>
                            <th className="py-4 px-6 font-medium">Cuota</th>
                            <th className="py-4 px-6 font-medium">WhatsApp</th>
                            <th className="py-4 px-6 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {group.group_members.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-zinc-500">
                                    No hay amigos en este grupo. ¡Pagas todo tú!
                                </td>
                            </tr>
                        ) : null}

                        {group.group_members.map((member: any) => {
                            const isPaid = group.payments?.some((p: any) => p.member_id === member.id && p.status === 'PAID') || false

                            return (
                                <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-6 font-medium text-white">{member.user_name}</td>
                                    <td className="py-4 px-6 text-indigo-300 font-medium">${Number(member.quota_amount).toFixed(2)}</td>
                                    <td className="py-4 px-6 text-zinc-400 text-sm">{member.whatsapp_number}</td>
                                    <td className="py-4 px-6">
                                        <MemberActions member={member} group={group} isPaid={isPaid} />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
