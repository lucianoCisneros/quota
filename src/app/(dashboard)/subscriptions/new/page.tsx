'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import type { Service } from '@/types/database'
import { createSubscriptionGroup, getServices } from '../../dashboard.actions'
import { Card, Button, Input, Select } from '@/components/ui'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" isLoading={pending} className="w-full mt-8" size="lg">
            Crear Grupo
        </Button>
    )
}

export default function NewSubscription() {
    const [services, setServices] = useState<Service[]>([])
    const [members, setMembers] = useState([{ id: 1, name: '', whatsapp: '', email: '' }])
    const [totalPrice, setTotalPrice] = useState<string>('')
    const [error, setError] = useState<string>('')

    useEffect(() => {
        getServices().then(setServices)
    }, [])

    const addMember = () => {
        setMembers([...members, { id: Date.now(), name: '', whatsapp: '', email: '' }])
    }

    const removeMember = (id: number) => {
        setMembers(members.filter((m) => m.id !== id))
    }

    const updateMember = (id: number, field: 'name' | 'whatsapp' | 'email', value: string) => {
        setMembers(members.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
    }

    const numberOfPeople = members.filter((m) => m.name.trim() !== '').length + 1
    const quotaPerPerson = parseFloat(totalPrice || '0') / numberOfPeople

    const handleSubmit = async (formData: FormData) => {
        setError('')
        const validMembers = members.filter((m) => m.name.trim() !== '' && m.whatsapp.trim() !== '')
        formData.append('membersData', JSON.stringify(validMembers))

        const result = await createSubscriptionGroup(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="page-enter max-w-5xl mx-auto">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-[15px] text-text-secondary hover:text-text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Volver al Dashboard</span>
            </Link>

            <header className="mb-10">
                <h1 className="text-[34px] font-bold tracking-tight text-text-primary mb-1.5">Nuevo Grupo de Suscripción</h1>
                <p className="text-[15px] text-text-secondary">Configura el servicio y añade a los amigos que van a pagar contigo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                    <Card variant="flat" className="p-6 sm:p-8 hover:!bg-surface-1">
                        <form action={handleSubmit}>
                            {error && (
                                <div className="mb-6 p-4 rounded-[12px] bg-surface-2 text-danger text-[13px] font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-8">
                                {/* Service Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Select label="Servicio" name="service_id" required>
                                        <option value="">Selecciona un servicio</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                                <div className="hairline-top" />

                                {/* Participants */}
                                <div>
                                    <h3 className="text-[17px] font-semibold text-text-primary mb-4">Integrantes</h3>
                                    <div className="space-y-3">
                                        {members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start p-4 rounded-[12px] bg-surface-2"
                                            >
                                                <Input
                                                    placeholder="Nombre del amigo"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="WhatsApp (Ej: 54911...)"
                                                    type="tel"
                                                    value={member.whatsapp}
                                                    onChange={(e) =>
                                                        updateMember(member.id, 'whatsapp', e.target.value)
                                                    }
                                                />
                                                <Input
                                                    placeholder="Email (opcional)"
                                                    type="email"
                                                    value={member.email}
                                                    onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                                                />
                                                {members.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => removeMember(member.id)}
                                                        className="self-end sm:self-center shrink-0"
                                                    >
                                                        <Trash2 size={18} strokeWidth={1.75} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addMember}
                                        className="mt-4 flex items-center gap-2 text-[13px] text-accent hover:text-accent-hover font-medium transition-colors"
                                    >
                                        <Plus size={15} strokeWidth={1.75} /> Añadir otro amigo
                                    </button>
                                </div>
                            </div>

                            <SubmitButton />
                        </form>
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <Card variant="elevated" className="p-6 lg:sticky lg:top-10">
                        <h3 className="text-[17px] font-semibold text-text-primary mb-6">Resumen del Grupo</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[15px]">
                                <span className="text-text-secondary">Total Mensual</span>
                                <span className="font-medium text-text-primary tabular-nums">${totalPrice || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[15px]">
                                <span className="text-text-secondary">Total de Personas</span>
                                <span className="font-medium text-text-primary">
                                    {numberOfPeople} <span className="text-[13px] text-text-tertiary font-normal">(Incluyéndote)</span>
                                </span>
                            </div>

                            <div className="hairline-top" />

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-text-primary">Cuota por Persona</span>
                                <span className="font-bold text-[22px] tabular-nums text-accent">${quotaPerPerson.toFixed(2)}</span>
                            </div>

                            <div className="mt-6 p-4 rounded-[12px] bg-surface-2 text-[13px] text-text-tertiary leading-relaxed">
                                La cuota se divide en partes iguales entre todos los amigos listados y tú como creador automáticamente.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
