import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'StadiaPulse AI — FIFA World Cup 2026 Smart Stadium Platform',
  description: 'GenAI-powered smart stadium operations and fan experience platform for FIFA World Cup 2026. Real-time crowd intelligence, multilingual AI concierge, and operational command center.',
  keywords: ['FIFA World Cup 2026', 'smart stadium', 'AI', 'crowd management', 'fan experience'],
  openGraph: {
    title: 'StadiaPulse AI — FIFA World Cup 2026',
    description: 'Smart Stadium Platform powered by Generative AI',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#06060f] text-slate-100 min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
