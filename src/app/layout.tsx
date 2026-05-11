import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import Navbar from '@/components/Navbar'

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-cairo'
})

export const metadata: Metadata = {
  title: 'تحدي العشر الأوائل من ذي الحجة',
  description: 'تحدٍ يومي لاستغلال أفضل أيام الدنيا',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen pt-20">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}