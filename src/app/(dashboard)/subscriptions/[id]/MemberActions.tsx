'use client'

import { useState, useTransition } from 'react'
import { MessageCircle, Link as LinkIcon, Check } from 'lucide-react'
import { createPaymentLink, togglePaymentStatus } from './actions'
import { Button } from '@/components/ui/Button'

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
                    <Button
                        onClick={handleWhatsApp}
                        title="Cobrar por WhatsApp"
                        disabled={loading || isPending}
                        variant="ghost"
                        className="text-green-500 hover:text-green-400"
                    >
                        <MessageCircle size={18} />
                    </Button>
                    <Button
                        onClick={copyLink}
                        title="Copiar link de pago"
                        disabled={loading || isPending}
                        variant="ghost"
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        {linkCopied ? <Check size={18} className="text-green-400" /> : <LinkIcon size={18} />}
                    </Button>
                </>
            )}
            <Button
                onClick={handleTogglePayment}
                isLoading={isPending}
                variant={isPaid ? "secondary" : "secondary"}
                size="sm"
                className={`ml-2 ${isPaid ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-white'}`}
            >
                {isPaid ? "✓ Pagado" : "Marcar Pagado"}
            </Button>
        </div>
    )
}
