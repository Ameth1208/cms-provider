'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from '@/components/app-sidebar'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useSidebar } from '@/hooks/use-sidebar'
import { useSettingsStore } from '@/store'
import { Icon } from '@iconify/react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const { collapsed, toggle } = useSidebar()
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!settings.companyName) {
      fetchSettings()
    }
  }, [settings.companyName, fetchSettings])

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
      <AppSidebar collapsed={collapsed} />
      <main className="flex-1 overflow-y-auto min-w-0 h-dvh">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 lg:px-10 flex items-center justify-between">
          <button
            onClick={toggle}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity duration-200"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.companyName || 'Logo'} 
                className="h-7 w-7 object-contain rounded-md shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center shrink-0">
                <Icon icon="lucide:hexagon" className="h-4 w-4 text-background" />
              </div>
            )}
            <span className="text-[14px] font-medium tracking-tight text-foreground truncate">
              {settings.companyName || user?.organizationName || 'CMS'}
            </span>
          </button>
          <NotificationsDropdown />
        </div>
        <div className="max-w-8xl mx-auto px-6 py-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
