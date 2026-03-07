"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, MoreVertical, CreditCard, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SubscriptionDetails() {
    const params = useParams();
    const [copied, setCopied] = useState(false);

    // Mock data for the view
    const sub = {
        name: "Netflix Premium",
        cost: 15.99,
        link: "https://link.mercadopago.com.ar/quota_netflix",
        dueDate: "2026-03-25",
        participants: [
            { id: 1, name: "Me", amount: 4.00, status: "paid" },
            { id: 2, name: "Alex (alex@example.com)", amount: 4.00, status: "pending" },
            { id: 3, name: "Sam (sam@example.com)", amount: 4.00, status: "paid" },
            { id: 4, name: "Jordan (jordan@example.com)", amount: 3.99, status: "pending" },
        ]
    };

    const pendingAmount = sub.participants.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0);

    const handleCopy = () => {
        navigator.clipboard.writeText(sub.link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl">
                            <CreditCard size={24} />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{sub.name}</h1>
                    </div>
                    <p className="text-foreground/60 flex items-center gap-2">
                        Due on <span className="font-medium text-foreground">{sub.dueDate}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border-light rounded-xl font-medium transition-colors text-sm">
                        Edit
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl font-medium transition-colors text-sm border border-red-100 dark:border-red-500/20">
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass p-6 rounded-2xl md:col-span-2">
                    <h3 className="text-sm font-medium text-foreground/60 mb-1">Your Payment Link</h3>
                    <div className="flex items-center gap-2 mt-3">
                        <input
                            type="text"
                            readOnly
                            value={sub.link}
                            className="flex-1 bg-surface-hover px-4 py-3 rounded-xl border border-border-light text-sm outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-xl transition-colors shrink-0 border border-primary-100"
                        >
                            {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-foreground/60 mb-1">Pending Collection</h3>
                    <p className="text-3xl font-bold text-orange-500">${pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-foreground/50 mt-1">out of ${sub.cost}</p>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-6">Participants Status</h2>
            <div className="glass rounded-2xl border border-border-light overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border-light bg-surface/50 text-sm text-foreground/60">
                            <th className="py-4 px-6 font-medium">Name</th>
                            <th className="py-4 px-6 font-medium">Amount</th>
                            <th className="py-4 px-6 font-medium">Status</th>
                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sub.participants.map((p) => (
                            <tr key={p.id} className="border-b border-border-light last:border-0 hover:bg-surface-hover/50 transition-colors">
                                <td className="py-4 px-6 font-medium">{p.name}</td>
                                <td className="py-4 px-6">${p.amount.toFixed(2)}</td>
                                <td className="py-4 px-6">
                                    {p.status === 'paid' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-full text-xs font-semibold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Paid
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 rounded-full text-xs font-semibold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        {p.status === 'pending' && p.name !== "Me" && (
                                            <>
                                                <button title="Send WhatsApp Reminder" className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors">
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button title="Send Email Reminder" className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Mail size={18} />
                                                </button>
                                                <button className="px-3 py-1.5 bg-surface border border-border-light hover:bg-surface-hover rounded-lg text-xs font-medium transition-colors ml-2">
                                                    Mark Paid
                                                </button>
                                            </>
                                        )}
                                        {p.status === 'paid' && p.name !== "Me" && (
                                            <button className="px-3 py-1.5 bg-surface border border-border-light hover:bg-surface-hover rounded-lg text-xs font-medium transition-colors ml-2">
                                                Mark Pending
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
