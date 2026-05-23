'use client';

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createSubscriptionGroup, getServices } from "../../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            isLoading={pending}
            className="w-full mt-8"
            size="lg"
        >
            Crear Grupo
        </Button>
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
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Nuevo Grupo de Suscripción</h1>
                <p className="text-zinc-400">Configura el servicio y añade a los amigos que van a pagar contigo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                    <Card className="p-4 sm:p-8" variant="glass">
                        <form action={handleSubmit}>
                            {error && (
                                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-8">
                                {/* Service Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Servicio"
                                        name="service_id"
                                        required
                                    >
                                        <option value="">Selecciona un servicio</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </Select>
                                    <Input
                                        label="Nombre Opcional"
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Netflix de la Familia"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Costo Total Mensual ($)"
                                        type="number"
                                        step="0.01"
                                        name="total_price"
                                        required
                                        value={totalPrice}
                                        onChange={(e) => setTotalPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <Input
                                        label="Día de Cobro (1-31)"
                                        type="number"
                                        name="billing_cycle_day"
                                        min="1"
                                        max="31"
                                        required
                                        placeholder="Día del mes"
                                    />
                                </div>

                                <hr className="border-white/5" />

                                {/* Participants */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Amigos (Participantes)</h3>
                                    <div className="space-y-4">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start p-4 sm:p-0 rounded-xl bg-white/5 sm:bg-transparent border border-white/5 sm:border-none">
                                                <Input
                                                    placeholder="Nombre del amigo"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                    className="text-sm"
                                                />
                                                <Input
                                                    placeholder="WhatsApp (Ej: 54911...)"
                                                    type="tel"
                                                    value={member.whatsapp}
                                                    onChange={(e) => updateMember(member.id, 'whatsapp', e.target.value)}
                                                    className="text-sm"
                                                />
                                                {members.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => removeMember(member.id)}
                                                        className="self-end sm:self-auto sm:mt-1"
                                                        title="Quitar"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addMember}
                                        className="mt-4 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        <Plus size={16} /> Añadir otro amigo
                                    </button>
                                </div>
                            </div>

                            <SubmitButton />
                        </form>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <Card className="p-6 lg:sticky lg:top-10" variant="gradient">
                        <h3 className="font-bold text-lg mb-6">Resumen del Grupo</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total Mensual</span>
                                <span className="font-medium text-white">${totalPrice || "0.00"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total de Personas</span>
                                <span className="font-medium text-white">
                                    {numberOfPeople} <span className="text-xs text-zinc-500 font-normal">(Incluyéndote)</span>
                                </span>
                            </div>

                            <hr className="border-white/10 my-4" />

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-white">Cuota por Persona</span>
                                <span className="font-bold text-2xl text-indigo-400">
                                    ${quotaPerPerson.toFixed(2)}
                                </span>
                            </div>

                            <div className="mt-6 p-4 bg-black/20 rounded-xl text-xs text-zinc-400 border border-white/5 leading-relaxed">
                                La cuota se divide en partes iguales entre todos los amigos listados y tú como creador automáticamente.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
