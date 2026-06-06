'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useApiKeysStore } from '../store/api-keys-store'

export function ApiKeyNewKeyDialog() {
  const { t } = useTranslation()
  const newKeyValue = useApiKeysStore((s) => s.newKeyValue)
  const newKeyOpen = useApiKeysStore((s) => s.newKeyOpen)
  const setNewKeyOpen = useApiKeysStore((s) => s.setNewKeyOpen)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('api_keys_new_key_title')}</DialogTitle>
          <DialogDescription className="font-light text-destructive">{t('api_keys_new_key_warning')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono break-all border border-border">
              {newKeyValue}
            </code>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => copyToClipboard(newKeyValue)}>
              <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="h-4 w-4 mr-1" />
              {copied ? t('api_keys_copied') : t('api_keys_copy')}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setNewKeyOpen(false)}>
              {t('api_keys_close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
