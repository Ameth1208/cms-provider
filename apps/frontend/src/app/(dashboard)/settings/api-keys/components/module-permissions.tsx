'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Badge } from '@/components/ui/badge'

export const MODULES = [
  { key: 'catalog', icon: 'lucide:package' },
  { key: 'orders', icon: 'lucide:shopping-cart' },
  { key: 'inventory', icon: 'lucide:warehouse' },
  { key: 'batches', icon: 'lucide:layers' },
  { key: 'campaigns', icon: 'lucide:tag' },
  { key: 'content', icon: 'lucide:layout-template' },
  { key: 'reviews', icon: 'lucide:star' },
  { key: 'users', icon: 'lucide:users' },
  { key: 'settings', icon: 'lucide:settings' },
  { key: 'media', icon: 'lucide:image' },
]

export const ACTIONS = ['read', 'create', 'update', 'delete'] as const

interface ModulePermissionsProps {
  moduleKey: string
  moduleIcon: string
  formPerms: string[]
  onToggle: (perm: string) => void
  onSetPerms: (perms: string[]) => void
  prefix?: string
}

export function ModulePermissions({
  moduleKey,
  moduleIcon,
  formPerms,
  onToggle,
  onSetPerms,
  prefix = '',
}: ModulePermissionsProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const modulePermKeys = ACTIONS.map((a) => `${moduleKey}:${a}`)
  const selectedCount = modulePermKeys.filter((p) => formPerms.includes(p)).length
  const allSelected = selectedCount === ACTIONS.length

  const toggleAll = () => {
    if (allSelected) {
      const newPerms = formPerms.filter((p) => !modulePermKeys.includes(p))
      onSetPerms(newPerms)
    } else {
      const permsToAdd = modulePermKeys.filter((p) => !formPerms.includes(p))
      onSetPerms([...formPerms, ...permsToAdd])
    }
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon icon={moduleIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t(`module_${moduleKey}`)}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {selectedCount}
            </Badge>
          )}
        </div>
        <Icon
          icon={isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'}
          className="h-4 w-4 text-muted-foreground"
        />
      </button>

      {isOpen && (
        <div className="px-4 py-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span className="text-xs text-muted-foreground">{t('select_all')}</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => {
              const perm = `${moduleKey}:${action}`
              const checked = formPerms.includes(perm)
              return (
                <label
                  key={`${prefix}${perm}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border shrink-0"
                    checked={checked}
                    onChange={() => onToggle(perm)}
                  />
                  <span className="text-xs">{t(`api_keys_action_${action}`)}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
