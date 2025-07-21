import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Grub Club',
  description: 'Food delivery platform for students',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AuthProvider>
            <div className="w-full flex items-center p-4 bg-white/80 sticky top-0 z-50 shadow-sm">
              <Link href="/" className="text-orange-600 font-bold text-lg hover:underline">
                Home
              </Link>
            </div>
            {children}
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  )
}
