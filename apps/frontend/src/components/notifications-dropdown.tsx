'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/app/(dashboard)/hooks/use-notifications'
import { useTranslation } from '@/i18n/use-translation'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationsDropdown() {
  const { t } = useTranslation()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const router = useRouter()

  const handleClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.type === 'order') {
      router.push('/orders')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Icon icon="lucide:bell" className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/40 shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <p className="text-sm font-medium">{t('notifications_title')}</p>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} {t('notifications_unread')}</span>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Icon icon="lucide:bell-off" className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('notifications_empty')}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start px-3 py-2.5 cursor-pointer ${
                  !notification.read ? 'bg-muted/50' : ''
                }`}
                onClick={() => handleClick(notification)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`h-2 w-2 rounded-full ${
                    notification.type === 'order' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <p className="text-sm font-medium flex-1">{notification.title}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 pl-4">{notification.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
