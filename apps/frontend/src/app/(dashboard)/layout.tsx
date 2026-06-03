'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from './components/app-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-light tracking-wide">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto min-w-0 h-dvh">
        <div className="max-w-8xl mx-auto px-6 py-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
