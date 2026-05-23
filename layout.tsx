import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Express Tow Service - Fast & Reliable Towing',
  description: 'Professional towing service with instant pricing. Available 24/7 for emergency and scheduled towing in Sacramento and surrounding areas.',
  keywords: 'towing, roadside assistance, emergency towing, Sacramento towing, vehicle recovery',
  openGraph: {
    title: 'Express Tow Service',
    description: 'Fast & Reliable Towing - Get Instant Price',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
