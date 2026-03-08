'use client'

import { useState, useTransition } from 'react'
import { MessageCircle, CreditCard, Link as LinkIcon, Check } from 'lucide-react'
import { createPaymentLink, togglePaymentStatus } from './actions'

export function MemberActions({ member, group, isPaid }: { member: any, group: any, isPaid: boolean }) {
    const [loading, setLoading] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleGeneratePayment = async () => {
        setLoading(true)
        const response = await createPaymentLink(member, group)
        setLoading(false)
        if (response.error) {
            alert(response.error)
            return null
        }
        return response.link
    }

    const handleWhatsApp = async () => {
        const link = await handleGeneratePayment()
        if (!link) return

        const message = `Hola ${member.user_name}, es momento de pagar la cuota de ${group.name}. El monto es $${member.quota_amount.toFixed(2)}.\nPuedes pagarlo aquí: ${link}`

        const whatsappUrl = `https://wa.me/${member.whatsapp_number}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const copyLink = async () => {
        const link = await handleGeneratePayment()
        if (!link) return

        navigator.clipboard.writeText(link)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const handleTogglePayment = () => {
        startTransition(() => {
            togglePaymentStatus(member.id, group.id, Number(member.quota_amount))
        })
    }

    return (
        <div className="flex gap-2 justify-end items-center">
            {!isPaid && (
                <>
                    <button
                        onClick={handleWhatsApp}
                        title="Cobrar por WhatsApp"
                        disabled={loading || isPending}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <MessageCircle size={18} />
                    </button>
                    <button
                        onClick={copyLink}
                        title="Copiar link de pago"
                        disabled={loading || isPending}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {linkCopied ? <Check size={18} className="text-green-400" /> : <LinkIcon size={18} />}
                    </button>
                </>
            )}
            <button
                onClick={handleTogglePayment}
                disabled={isPending}
                className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ml-2 disabled:opacity-50
                    ${isPaid
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
            >
                {isPending ? 'Guardando...' : isPaid ? "✓ Pagado" : "Marcar Pagado"}
            </button>
        </div>
    )
}
