'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createSubscriptionGroup, getServices } from "../../actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md mt-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
            {pending ? "Creando..." : "Crear Grupo"}
        </button>
    );
}

export default function NewSubscription() {
    const [services, setServices] = useState<any[]>([]);
    const [members, setMembers] = useState([{ id: 1, name: "", whatsapp: "" }]);
    const [totalPrice, setTotalPrice] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        getServices().then(setServices);
    }, []);

    const addMember = () => {
        setMembers([...members, { id: Date.now(), name: "", whatsapp: "" }]);
    };

    const removeMember = (id: number) => {
        setMembers(members.filter((m) => m.id !== id));
    };

    const updateMember = (id: number, field: string, value: string) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    // Calculate dynamic quota including the creator
    const numberOfPeople = members.filter(m => m.name.trim() !== "").length + 1;
    const quotaPerPerson = parseFloat(totalPrice || "0") / numberOfPeople;

    const handleSubmit = async (formData: FormData) => {
        setError("");
        const validMembers = members.filter(m => m.name.trim() !== "" && m.whatsapp.trim() !== "");
        formData.append("membersData", JSON.stringify(validMembers));

        const result = await createSubscriptionGroup(formData);
        if (result?.error) {
            setError(result.error);
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
                <ArrowLeft size={16} />
                <span>Volver al Dashboard</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Nuevo Grupo de Suscripción</h1>
                <p className="text-zinc-400">Configura el servicio y añade a los amigos que van a pagar contigo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <form action={handleSubmit} className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">

                        {error && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Service Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Servicio</label>
                                    <select
                                        name="service_id"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                        required
                                    >
                                        <option value="">Selecciona un servicio</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Nombre Opcional</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Netflix de la Familia"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Costo Total Mensual ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="total_price"
                                        required
                                        value={totalPrice}
                                        onChange={(e) => setTotalPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Día de Cobro (1-31)</label>
                                    <input
                                        type="number"
                                        name="billing_cycle_day"
                                        min="1"
                                        max="31"
                                        required
                                        placeholder="Día del mes"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/5 my-8" />

                            {/* Participants */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">Amigos (Participantes)</h3>
                                </div>

                                <div className="space-y-4">
                                    {members.map((member, index) => (
                                        <div key={member.id} className="flex gap-4 items-start">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                    placeholder="Nombre del amigo"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="tel"
                                                    value={member.whatsapp}
                                                    onChange={(e) => updateMember(member.id, 'whatsapp', e.target.value)}
                                                    placeholder="WhatsApp (Ej: 54911...)"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                                                />
                                            </div>
                                            {members.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(member.id)}
                                                    className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-0.5"
                                                    title="Quitar"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={addMember}
                                    className="mt-4 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                    <Plus size={16} /> Añadir otro amigo
                                </button>
                            </div>
                        </div>

                        <SubmitButton />
                    </form>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 sticky top-10 shadow-xl">
                        <h3 className="font-bold text-lg mb-6">Resumen del Grupo</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total Mensual</span>
                                <span className="font-medium">${totalPrice || "0.00"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total de Personas</span>
                                <span className="font-medium">{numberOfPeople} <span className="text-xs text-zinc-500">(Incluyéndote)</span></span>
                            </div>

                            <hr className="border-white/10 my-4" />

                            <div className="flex justify-between items-center">
                                <span className="font-medium">Cuota por Persona</span>
                                <span className="font-bold text-2xl text-indigo-400">
                                    ${quotaPerPerson.toFixed(2)}
                                </span>
                            </div>

                            <div className="mt-6 p-4 bg-black/20 rounded-xl text-xs text-zinc-400 border border-white/5">
                                La cuota se divide en partes iguales entre todos los amigos listados y tú como creador automáticamente.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
