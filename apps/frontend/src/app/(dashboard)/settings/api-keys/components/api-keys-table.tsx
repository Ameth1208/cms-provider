'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { TableSkeleton } from '@/components/skeletons'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'
import { PermissionsList } from './permission-badge'

export function ApiKeysTable() {
  const { t } = useTranslation()
  const keys = useApiKeysStore((s) => s.keys)
  const loading = useApiKeysStore((s) => s.loading)
  const setSelected = useApiKeysStore((s) => s.setSelected)
  const setRegenerateOpen = useApiKeysStore((s) => s.setRegenerateOpen)
  const { toggleActive, openEdit, openDelete } = useApiKeys()

  const formatDate = (d?: string | null) => {
    if (!d) return t('api_keys_never_used')
    return new Date(d).toLocaleDateString()
  }

  const handleOpenRegenerate = (key: typeof keys[0]) => {
    setSelected(key)
    setRegenerateOpen(true)
  }

  return (
    <Card className="border border-border rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">{t('api_keys_title')}</CardTitle>
        <CardDescription className="font-light">{t('api_keys_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : keys.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-light">{t('api_keys_no_results')}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('api_keys_name')}</TableHead>
                <TableHead>{t('api_keys_prefix')}</TableHead>
                <TableHead>{t('api_keys_permissions')}</TableHead>
                <TableHead>{t('api_keys_status')}</TableHead>
                <TableHead>{t('api_keys_last_used')}</TableHead>
                <TableHead className="text-right">{t('api_keys_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-light">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{key.keyPrefix}...</TableCell>
                  <TableCell>
                    <PermissionsList permissions={key.permissions} maxVisible={2} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={key.active} onCheckedChange={() => toggleActive(key)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground font-light text-xs">{formatDate(key.lastUsedAt)}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(key)}>
                              <Icon icon="lucide:pencil" className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('api_keys_edit')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenRegenerate(key)}>
                              <Icon icon="lucide:refresh-cw" className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('api_keys_regenerate')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => openDelete(key)}>
                              <Icon icon="lucide:trash-2" className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('delete')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
