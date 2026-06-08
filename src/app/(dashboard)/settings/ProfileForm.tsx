'use client'

import { useState } from 'react'
import { updateProfile } from './settings.actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ProfileFormProps = {
    initialName: string
    initialLastName: string
    initialEmail: string
}

export function ProfileForm({ initialName, initialLastName, initialEmail }: ProfileFormProps) {
    const [name, setName] = useState(initialName)
    const [lastName, setLastName] = useState(initialLastName)
    const [email, setEmail] = useState(initialEmail)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.set('name', name)
        formData.set('lastName', lastName)
        formData.set('email', email)

        const result = await updateProfile(formData)
        setLoading(false)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'ok', text: 'Perfil actualizado correctamente.' })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-white mb-1">Tu Perfil</h2>
                <p className="text-sm text-zinc-400 mb-4">
                    Actualizá tus datos personales. El nombre se muestra en tu dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input
                        label="Nombre"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                    />
                    <Input
                        label="Apellido"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Tu apellido"
                    />
                </div>

                <Input
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    required
                />
            </div>

            {message && (
                <div
                    className={`p-4 rounded-xl text-sm font-medium border ${
                        message.type === 'ok'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
                Guardar cambios
            </Button>
        </form>
    )
}
