'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'

export function ApiKeysTable() {
  const { t } = useTranslation()
  const { keys, loading } = useApiKeysStore()
  const { toggleActive, openEdit, openDelete, regenerateKey } = useApiKeys()

  const formatDate = (d?: string | null) => {
    if (!d) return t('api_keys_never_used')
    return new Date(d).toLocaleDateString()
  }

  const handleRegenerate = (key: typeof keys[0]) => {
    if (!confirm('¿Regenerar esta API key? La anterior dejará de funcionar.')) return
    regenerateKey(key)
  }

  return (
    <Card className="border border-border rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">{t('api_keys_title')}</CardTitle>
        <CardDescription className="font-light">{t('api_keys_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground font-light">{t('loading')}</div>
        ) : keys.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-light">{t('api_keys_no_results')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('api_keys_name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('api_keys_prefix')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('api_keys_permissions')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('api_keys_status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('api_keys_last_used')}</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t('api_keys_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors">
                    <td className="py-3 px-4 font-light">{key.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{key.keyPrefix}...</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.slice(0, 3).map((p) => (
                          <Badge key={p} variant="secondary" className="text-xs font-light">
                            {p}
                          </Badge>
                        ))}
                        {key.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs font-light">+{key.permissions.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Switch checked={key.active} onCheckedChange={() => toggleActive(key)} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-light text-xs">{formatDate(key.lastUsedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(key)}>
                          <Icon icon="lucide:pencil" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleRegenerate(key)}>
                          <Icon icon="lucide:refresh-cw" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => openDelete(key)}>
                          <Icon icon="lucide:trash-2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
