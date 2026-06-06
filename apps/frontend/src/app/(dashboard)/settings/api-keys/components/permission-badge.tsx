'use client'

import { useTranslation } from '@/i18n/use-translation'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PermissionBadgeProps {
  permission: string
}

export function PermissionBadge({ permission }: PermissionBadgeProps) {
  const { t } = useTranslation()

  // Parse permission format: "module:action"
  const [module, action] = permission.split(':')

  const moduleLabel = module ? t(`module_${module}`) : module
  const actionLabel = action ? t(`api_keys_action_${action}`) : action

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="text-xs font-light cursor-help">
            {moduleLabel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {moduleLabel} - {actionLabel}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface PermissionsListProps {
  permissions: string[]
  maxVisible?: number
}

export function PermissionsList({ permissions, maxVisible = 3 }: PermissionsListProps) {
  const { t } = useTranslation()
  const visible = permissions.slice(0, maxVisible)
  const remaining = permissions.length - maxVisible

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((p) => (
        <PermissionBadge key={p} permission={p} />
      ))}
      {remaining > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs font-light cursor-help">
                +{remaining}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {permissions.slice(maxVisible).map((p) => (
                  <PermissionBadge key={p} permission={p} />
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
