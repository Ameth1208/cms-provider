'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'

const SIDEBAR_COOKIE_NAME = 'sidebar:state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContextType = {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider')
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ defaultOpen = true, open: openProp, onOpenChange, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const newState = typeof value === 'function' ? value(open) : value
      if (onOpenChange) {
        onOpenChange(newState)
      } else {
        _setOpen(newState)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [onOpenChange, open],
  )

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  const state = open ? 'expanded' : 'collapsed'

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar }}>
      <div
        style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
        className={cn('group/sidebar-wrapper flex min-h-dvh w-full', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { side?: 'left' | 'right' }>(
  ({ side = 'left', className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (isMobile) {
      return (
        <>
          {/* Mobile overlay */}
          <div
            className={cn(
              'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
              openMobile ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            onClick={() => setOpenMobile(false)}
          />
          <div
            ref={ref}
            className={cn(
              'fixed inset-y-0 z-50 flex w-[--sidebar-width] flex-col bg-background border-r shadow-lg transition-transform duration-300',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              openMobile ? 'translate-x-0' : '-translate-x-full',
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-background border-r transition-all duration-300',
          state === 'collapsed' ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Sidebar.displayName = 'Sidebar'

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center border-b px-4 py-3', className)} {...props} />
  ),
)
SidebarHeader.displayName = 'SidebarHeader'

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <ScrollArea ref={ref} className={cn('flex-1 overflow-hidden', className)} {...props as any} />
  ),
)
SidebarContent.displayName = 'SidebarContent'

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-t p-3', className)} {...props} />
  ),
)
SidebarFooter.displayName = 'SidebarFooter'

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-2 py-2', className)} {...props} />
  ),
)
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-3 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase', className)}
      {...props}
    />
  ),
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-0.5', className)} {...props} />
  ),
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn('space-y-0.5', className)} {...props} />
  ),
)
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  ),
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { isActive?: boolean; tooltip?: string; asChild?: boolean }
>(({ className, isActive, tooltip, asChild = false, children, ...props }, ref) => {
  const { state } = useSidebar()
  const Comp = asChild ? Slot : 'button'
  const button = (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(
        'inline-flex items-center gap-3 whitespace-nowrap rounded-xl text-sm font-normal ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9',
        state === 'expanded' ? 'w-full px-3' : 'w-9 justify-center mx-auto',
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...(props as any)}
    >
      {children}
    </Comp>
  )

  if (tooltip && state === 'collapsed') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="font-light">{tooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return button
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('ml-8 space-y-0.5', className)} {...props} />
  ),
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  ),
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn('h-7 w-7', className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <Icon icon="lucide:panel-left" className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  },
)
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    return (
      <button
        ref={ref}
        onClick={toggleSidebar}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 -mr-2 flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity',
          className,
        )}
        {...props}
      >
        <Icon icon="lucide:chevron-left" className="h-3 w-3 text-muted-foreground" />
      </button>
    )
  },
)
SidebarRail.displayName = 'SidebarRail'

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-1 flex-col overflow-hidden', className)} {...props} />
  ),
)
SidebarInset.displayName = 'SidebarInset'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
