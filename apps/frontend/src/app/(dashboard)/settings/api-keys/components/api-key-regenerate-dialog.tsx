'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'

export function ApiKeyRegenerateDialog() {
  const { t } = useTranslation()
  const selected = useApiKeysStore((s) => s.selected)
  const regenerateOpen = useApiKeysStore((s) => s.regenerateOpen)
  const setRegenerateOpen = useApiKeysStore((s) => s.setRegenerateOpen)
  const setSelected = useApiKeysStore((s) => s.setSelected)
  const { regenerateKey } = useApiKeys()

  const handleRegenerate = () => {
    if (!selected) return
    regenerateKey(selected)
    setRegenerateOpen(false)
    setSelected(null)
  }

  return (
    <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('api_keys_regenerate')}</DialogTitle>
          <DialogDescription className="font-light">
            {t('api_keys_regenerate_confirm')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
            {t('api_keys_cancel')}
          </Button>
          <Button variant="destructive" onClick={handleRegenerate}>
            <Icon icon="lucide:refresh-cw" className="h-4 w-4 mr-2" />
            {t('api_keys_regenerate')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
