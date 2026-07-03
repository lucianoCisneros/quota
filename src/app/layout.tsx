import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Quota - Shared Subscription Manager',
    description: 'Organize and remember shared subscription payments effortlessly.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="es" className="antialiased">
            <body className={`${inter.variable} min-h-screen`}>
                {children}
            </body>
        </html>
    )
}
