'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useCustomers } from '../hooks/use-customers'

export function CustomerCreateDialog() {
  const { t } = useTranslation()
  const {
    createOpen,
    formName,
    formEmail,
    formPhone,
    formDocument,
    formDocumentType,
    formNotes,
    setCreateOpen,
    setFormName,
    setFormEmail,
    setFormPhone,
    setFormDocument,
    setFormDocumentType,
    setFormNotes,
    resetForm,
    createCustomer,
  } = useCustomers()

  const handleClose = (open: boolean) => {
    if (!open) resetForm()
    setCreateOpen(open)
  }

  return (
    <Dialog open={createOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('customers_create')}</DialogTitle>
          <DialogDescription className="font-light">{t('customers_create_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('customers_name')} *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('customers_name')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('customers_email')} *</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('customers_phone')}</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('customers_document')}</Label>
              <Input
                value={formDocument}
                onChange={(e) => setFormDocument(e.target.value)}
                placeholder="30-12345678-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('customers_notes')}</Label>
            <Input
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder={t('customers_notes_placeholder')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={createCustomer} 
              disabled={!formName.trim() || !formEmail.trim()}
            >
              {t('customers_create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
