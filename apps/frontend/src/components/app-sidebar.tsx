'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import { useLocaleStore, useSettingsStore, useNotificationsStore } from '@/store'
import { useTranslation } from '@/i18n/use-translation'
import { useState, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/* ─── Types ─── */

interface NavChild {
  href: string
  labelKey: string
}

interface NavItem {
  href?: string
  labelKey: string
  icon: string
  badge?: number
  children?: NavChild[]
  module?: string
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

/* ─── Persisted collapse state ─── */

function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar:collapsed')
    if (saved) setCollapsed(saved === 'true')
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar:collapsed', String(!prev))
      return !prev
    })
  }

  return { collapsed, toggle }
}

/* ─── Tooltip for collapsed mode ─── */

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={14}
        className="bg-popover text-foreground text-[12px] font-normal px-3 py-1.5 rounded-lg border border-border/40 shadow-lg"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/* ─── Main ─── */

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, token } = useAuth()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocaleStore()
  const { t } = useTranslation()
  const { collapsed, toggle } = useSidebarCollapse()
  const { settings, fetchSettings } = useSettingsStore()
  const { unreadCount } = useNotificationsStore()

  useEffect(() => {
    if (token && !settings.companyName) {
      fetchSettings(token)
    }
  }, [token, settings.companyName, fetchSettings])

  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['catalog']))

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const initials = user?.email?.charAt(0).toUpperCase() || 'U'

  const isDriver = user?.roles?.includes('DRIVER')

  const navGroups: NavGroup[] = isDriver
    ? [
        {
          items: [
            { href: '/driver-dashboard', labelKey: 'driver_dashboard', icon: 'lucide:truck', module: 'drivers' },
          ],
        },
      ]
    : [
        {
          items: [
            { href: '/', labelKey: 'home', icon: 'lucide:layout-dashboard', module: 'dashboard' },
          ],
        },
        {
          label: t('nav_business'),
          items: [
            {
              labelKey: 'catalog',
              icon: 'lucide:package',
              module: 'catalog',
              children: [
                { href: '/catalog', labelKey: 'catalog_items' },
                { href: '/catalog/categories', labelKey: 'catalog_categories' },
                { href: '/catalog/tags', labelKey: 'catalog_tags' },
              ],
            },
            { href: '/customers', labelKey: 'customers', icon: 'lucide:users', module: 'customers' },
            { href: '/orders', labelKey: 'orders', icon: 'lucide:shopping-cart', badge: unreadCount, module: 'orders' },
            { href: '/payments', labelKey: 'payments', icon: 'lucide:credit-card', module: 'orders' },
            { href: '/inventory', labelKey: 'inventory', icon: 'lucide:warehouse', module: 'inventory' },
            { href: '/campaigns', labelKey: 'campaigns', icon: 'lucide:tag', module: 'campaigns' },
            { href: '/content', labelKey: 'content', icon: 'lucide:layout-template', module: 'content' },
            { href: '/locations', labelKey: 'locations', icon: 'lucide:map-pin', module: 'locations' },
          ],
        },
        {
          label: t('nav_logistics'),
          items: [
            { href: '/drivers', labelKey: 'drivers', icon: 'lucide:truck', module: 'drivers' },
            { href: '/zones', labelKey: 'zones_title', icon: 'lucide:map', module: 'drivers' },
            { href: '/routes', labelKey: 'routes_title', icon: 'lucide:route', module: 'drivers' },
            { href: '/returns', labelKey: 'returns', icon: 'lucide:refresh-ccw', module: 'drivers' },
            { href: '/reports', labelKey: 'reports', icon: 'lucide:bar-chart-3', module: 'drivers' },
          ],
        },
        {
          label: t('nav_team'),
          items: [
            { href: '/users', labelKey: 'users', icon: 'lucide:users', module: 'users' },
          ],
        },
        {
          label: t('nav_settings'),
          items: [
            {
              labelKey: 'settings',
              icon: 'lucide:settings',
              module: 'settings',
              children: [
                { href: '/settings', labelKey: 'general' },
                { href: '/settings/api-keys', labelKey: 'api_keys' },
              ],
            },
          ],
        },
      ]

  /* Módulos que existen en código pero aún no están listos para producción. */
  const DISABLED_MODULES: string[] = []

  const modulesEnabled = user?.modulesEnabled ?? []
  const isOwner = user?.roles?.includes('OWNER')

  const isActive = (href?: string) =>
    href ? pathname === href || pathname.startsWith(href + '/') : false

  const renderNavItem = (item: NavItem) => {
    const label = t(item.labelKey)
    const active = isActive(item.href)
    const hasActiveChild = item.children?.some((c) => pathname === c.href) ?? false

    /* ── Collapsible parent ── */
    if (item.children) {
      const parentActive = hasActiveChild || active
      const body = (
        <button
          onClick={() => toggleItem(item.labelKey)}
          className={`w-full flex items-center gap-2.5 rounded-md transition-colors duration-200 ${
            parentActive
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
          } ${collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'}`}
        >
          <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-[13px] font-normal">{label}</span>
              <Icon
                icon="lucide:chevron-down"
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openItems.has(item.labelKey) ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
      )

      return (
        <div key={item.labelKey}>
          {collapsed ? (
            <SidebarTooltip label={label}>
              <div>{body}</div>
            </SidebarTooltip>
          ) : (
            body
          )}

          {!collapsed && (
            <div
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: openItems.has(item.labelKey) ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="mt-0.5 mb-0.5 space-y-0.5 pl-[26px]">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center px-2.5 py-[6px] rounded-md text-[12px] font-normal transition-colors duration-200 ${
                          childActive
                            ? 'text-foreground bg-secondary'
                            : 'text-muted-foreground/80 hover:text-foreground hover:bg-accent/50'
                        }`}
                      >
                        {t(child.labelKey)}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    /* ── Simple item ── */
    const link = (
      <Link
        href={item.href!}
        className={`flex items-center gap-2.5 rounded-md transition-colors duration-200 ${
          active
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        } ${collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'}`}
      >
        <Icon icon={item.icon} className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-[13px] font-normal">{label}</span>
            {!!item.badge && item.badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )

    return collapsed ? (
      <SidebarTooltip key={item.href} label={label}>
        <div>{link}</div>
      </SidebarTooltip>
    ) : (
      <div key={item.href}>{link}</div>
    )
  }

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (item.module === 'dashboard') return true
      if (DISABLED_MODULES.includes(item.module!)) return false
      if (modulesEnabled.length === 0) return true
      return item.module ? modulesEnabled.includes(item.module) : true
    })

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-card border-r border-border transition-[width] duration-300 ease-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {/* ─── Header ─── */}
        <div className="shrink-0 flex items-center h-14 px-3.5">
          <Link
            href="/"
            className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}
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
            {!collapsed && (
              <span className="text-[14px] font-medium tracking-tight text-foreground truncate">
                {settings.companyName || user?.organizationName || 'CMS'}
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={toggle}
              className="ml-auto h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors duration-200 shrink-0"
            >
              <Icon icon="lucide:panel-left-close" className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* ─── Nav ─── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1 space-y-4 scrollbar-none">
          {navGroups.map((group, groupIndex) => {
            const filteredItems = filterItems(group.items)
            if (filteredItems.length === 0) return null

            return (
              <div key={groupIndex} className="space-y-0.5">
                {!collapsed && group.label && (
                  <p className="px-2.5 py-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                {filteredItems.map(renderNavItem)}
              </div>
            )
          })}
        </nav>

        {/* ─── Admin Section ─── */}
        {isOwner && (
          <div className="shrink-0 px-2.5 pb-2">
            {!collapsed && (
              <p className="px-2.5 py-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                {t('nav_admin')}
              </p>
            )}
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 rounded-md transition-colors duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/60 ${
                collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'
              }`}
            >
              <Icon icon="lucide:shield" className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-[13px] font-normal">Panel Admin</span>}
            </Link>
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className="shrink-0 px-2.5 pb-3 pt-2">
          {collapsed && (
            <button
              onClick={toggle}
              className="w-full flex items-center justify-center py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors duration-200 mb-1"
            >
              <Icon icon="lucide:panel-right-open" className="h-4 w-4" />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`w-full flex items-center gap-2.5 rounded-md transition-colors duration-200 hover:bg-accent/60 ${
                  collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-[7px]'
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-muted-foreground">{initials}</span>
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-normal text-foreground truncate leading-tight">
                        {user?.name || user?.email || 'Usuario'}
                      </p>
                    </div>
                    <Icon icon="lucide:more-horizontal" className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={collapsed ? 'end' : 'start'}
              side={collapsed ? 'right' : 'top'}
              sideOffset={8}
              className="w-52 rounded-xl border-border/40 shadow-xl"
            >
              <div className="px-2 py-1.5">
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg text-[13px] font-normal cursor-pointer">
                <Link href="/settings">
                  <Icon icon="lucide:settings" className="mr-2 h-4 w-4 opacity-60" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg text-[13px] font-normal cursor-pointer"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Icon icon={theme === 'dark' ? 'lucide:sun' : 'lucide:moon'} className="mr-2 h-4 w-4 opacity-60" />
                {theme === 'dark' ? t('theme_light') : t('theme_dark')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg text-[13px] font-normal cursor-pointer"
                onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              >
                <Icon icon="lucide:languages" className="mr-2 h-4 w-4 opacity-60" />
                {locale === 'es' ? 'English' : 'Español'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg text-[13px] font-normal text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/5"
                onClick={() => logout()}
              >
                <Icon icon="lucide:log-out" className="mr-2 h-4 w-4 opacity-60" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Spacer */}
      <div
        className={`shrink-0 transition-[width] duration-300 ease-out ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      />
    </TooltipProvider>
  )
}
