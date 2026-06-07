'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from '@/components/app-sidebar'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebar } from '@/hooks/use-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar collapsed={collapsed} onToggle={toggle} />
      <main className="flex-1 overflow-y-auto min-w-0 h-dvh">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 lg:px-10 flex items-center justify-end">
          <NotificationsDropdown />
        </div>
        <div className="max-w-8xl mx-auto px-6 py-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
