import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/store'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Arambh | India\'s Premium Training & Knowledge Management System',
  description: 'Arambh centralizes every SOP, training video, and company process — so every employee knows exactly what to do, from day one. Trusted by 500+ teams across India.',
  keywords: ['training management', 'knowledge management', 'employee onboarding', 'SOP management', 'AI knowledge assistant', 'India'],
  authors: [{ name: 'Arambh' }],
  openGraph: {
    title: 'Arambh | Your Team\'s Brain. Always On.',
    description: 'India\'s #1 Training & Knowledge Management System. Centralize SOPs, training videos, and company processes.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1C1917',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
