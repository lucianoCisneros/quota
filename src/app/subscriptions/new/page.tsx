"use client";

import { useState } from "react";
import { ArrowLeft, Check, CreditCard, Users, Link as LinkIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewSubscription() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [participants, setParticipants] = useState([
        { id: 1, name: "Me", amount: "", isFixed: false }
    ]);

    const addParticipant = () => {
        setParticipants([...participants, { id: Date.now(), name: "", amount: "", isFixed: false }]);
    };

    const removeParticipant = (id: number) => {
        if (participants.length <= 1) return;
        setParticipants(participants.filter(p => p.id !== id));
    };

    const calculateSplit = () => {
        const total = parseFloat(cost) || 0;
        if (total === 0 || participants.length === 0) return 0;
        return (total / participants.length).toFixed(2);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-20">
            <Link href="/" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">New Subscription</h1>
                <p className="text-foreground/60">Set up a new shared payment and invite your friends.</p>
            </div>

            <div className="glass rounded-3xl p-8 border border-border-light shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                {/* Basic Details */}
                <section className="mb-10 relative z-10">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-light">
                        <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Subscription Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">Service Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Netflix, Spotify"
                                className="w-full px-4 py-3 rounded-xl bg-surface hover:bg-surface-hover focus:bg-surface border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">Total Monthly Cost ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl bg-surface hover:bg-surface-hover focus:bg-surface border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-foreground/80 mb-2">Payment Link</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground/40">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://link.mercadopago.com.ar/..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface hover:bg-surface-hover focus:bg-surface border border-border-light focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-foreground/50 mt-2">Participants will use this link to pay you.</p>
                        </div>
                    </div>
                </section>

                {/* Participants */}
                <section className="mb-10 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-light">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-semibold">Participants</h2>
                        </div>
                        <div className="text-sm px-3 py-1 bg-surface-hover rounded-lg border border-border-light">
                            Suggested split: <span className="font-bold text-primary-600 dark:text-primary-400">${calculateSplit()}</span> / person
                        </div>
                    </div>

                    <div className="space-y-4">
                        {participants.map((p, index) => (
                            <div key={p.id} className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-300">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Name or Email"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border-light focus:border-primary-500 outline-none transition-all"
                                        value={p.name}
                                        onChange={(e) => {
                                            const newP = [...participants];
                                            newP[index].name = e.target.value;
                                            setParticipants(newP);
                                        }}
                                        disabled={index === 0}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users size={16} className="text-foreground/40" />
                                    </div>
                                </div>
                                {index > 0 && (
                                    <button
                                        onClick={() => removeParticipant(p.id)}
                                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addParticipant}
                        className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 px-4 py-2.5 rounded-xl transition-colors w-full justify-center border border-primary-100 dark:border-primary-800/30 shadow-sm"
                    >
                        <Plus size={18} /> Add Participant
                    </button>
                </section>

                {/* Submit */}
                <div className="pt-6 border-t border-border-light flex justify-end gap-4 relative z-10">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl font-medium text-foreground/70 hover:bg-surface-hover transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Check size={18} />
                        Create Subscription
                    </button>
                </div>
            </div>
        </div>
    );
}
