import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex min-h-screen bg-bg-base">
            <Sidebar />
            <main className="flex-1 md:ml-64 overflow-y-auto p-4 pt-16 md:p-8 lg:p-10">
                <div className="max-w-6xl mx-auto w-full page-enter">{children}</div>
            </main>
        </div>
    )
}
