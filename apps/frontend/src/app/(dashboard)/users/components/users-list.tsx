'use client'

import { useState } from 'react'
import {
  Search,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Check,
  Minus,
  Package,
  ShoppingCart,
  Warehouse,
  Tag,
  Users,
  LayoutTemplate,
  Settings,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'
import { UserBlockDialog } from './user-block-dialog'
import type { UserRecord } from '../store/users-store'

const ALL_MODULES = [
  { key: 'catalog', label: 'Catálogo', Icon: Package },
  { key: 'orders', label: 'Pedidos', Icon: ShoppingCart },
  { key: 'inventory', label: 'Inventario', Icon: Warehouse },
  { key: 'campaigns', label: 'Campañas', Icon: Tag },
  { key: 'users', label: 'Usuarios', Icon: Users },
  { key: 'content', label: 'Contenido', Icon: LayoutTemplate },
  { key: 'settings', label: 'Ajustes', Icon: Settings },
]

function ModulesSummary({ modules }: { modules: string[] }) {
  const { t } = useTranslation()
  const enabled = modules ?? []
  const total = ALL_MODULES.length
  const count = enabled.length

  if (count === 0) {
    return (
      <span className="text-[10px] text-muted-foreground/60 font-light">
        {t('users_no_modules')}
      </span>
    )
  }

  if (count === total) {
    return (
      <Badge variant="outline" className="text-[10px] font-light border-primary/30 text-primary">
        {t('users_all_modules')}
      </Badge>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted transition-colors">
          <span className="text-[10px] font-medium">{t('users_enabled_modules', { count })}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="flex flex-col gap-1 py-1">
          {ALL_MODULES.map((mod) => {
            const isEnabled = enabled.includes(mod.key)
            const IconComponent = isEnabled ? Check : Minus
            return (
              <div key={mod.key} className="flex items-center gap-2">
                <IconComponent
                  className={`h-3 w-3 ${isEnabled ? 'text-primary' : 'text-muted-foreground/40'}`}
                />
                <span className={`text-xs ${isEnabled ? '' : 'text-muted-foreground/60'}`}>{mod.label}</span>
              </div>
            )
          })}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export function UsersList() {
  const { t } = useTranslation()
  const { users, loading, toggleActive, openEdit, openDelete } = useUsers()
  const [blockTarget, setBlockTarget] = useState<UserRecord | null>(null)
  const [query, setQuery] = useState('')

  const filtered = users.filter((u) => {
    const q = query.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some((r) => r.role.name.toLowerCase().includes(q))
    )
  })

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('loading')}
        </CardContent>
      </Card>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('users_no_users')}
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl bg-card p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('users_search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-xs tracking-wider uppercase">{t('users_name')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">{t('users_roles')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase">{t('users_modules')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase w-24">{t('users_status')}</TableHead>
                <TableHead className="text-xs tracking-wider uppercase text-right w-28">{t('users_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <Badge
                          key={r.role.id}
                          variant="secondary"
                          className="text-[10px] font-light border-0"
                          title={t(`role_description_${r.role.name}`) || ''}
                        >
                          {t(`role_${r.role.name}`) || r.role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <ModulesSummary modules={user.modulesEnabled ?? []} />
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.active ? 'default' : 'secondary'}
                      className="text-[10px] font-light"
                    >
                      {user.active ? t('users_active') : t('users_inactive')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t('edit')}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => setBlockTarget(user)}
                            className="gap-2 cursor-pointer"
                          >
                            {user.active ? (
                              <>
                                <UserX className="h-4 w-4 text-orange-500" />
                                <span>{t('users_block')}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 text-green-500" />
                                <span>{t('users_activate')}</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDelete(user)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>{t('users_delete')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('users_no_results')}
        </div>
      )}

      <UserBlockDialog
        user={blockTarget}
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null)
        }}
        onConfirm={() => {
          if (blockTarget) {
            toggleActive(blockTarget)
            setBlockTarget(null)
          }
        }}
      />
    </TooltipProvider>
  )
}
