import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentOrchestra — AI Agent Orchestration Platform',
  description: 'Deploy, configure, and monitor AI agents across multiple frameworks with enterprise-grade reliability and Cerebras ultra-fast inference.',
  keywords: ['AI agents', 'orchestration', 'Cerebras', 'LangGraph', 'CrewAI', 'AutoGen'],
  openGraph: {
    title: 'AgentOrchestra',
    description: 'Ultra-fast AI agent orchestration platform',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
