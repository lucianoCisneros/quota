import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 md:ml-64 overflow-y-auto p-4 pt-20 md:p-10 bg-gradient-to-br from-background to-surface-hover/30">
                <div className="max-w-6xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
