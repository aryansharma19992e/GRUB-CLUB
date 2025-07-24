import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext';
import HomeNav from '@/components/ui/HomeNav';

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
            <HomeNav />
            {children}
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  )
}
