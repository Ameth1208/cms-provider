'use client'

import { useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  options: ConfirmOptions
}

export function ConfirmDialog({ open, onOpenChange, onConfirm, options }: ConfirmDialogProps) {
  const { title = 'Confirmar', message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'default' } = options

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'
            }`}>
              <Icon
                icon={variant === 'destructive' ? 'lucide:alert-triangle' : 'lucide:help-circle'}
                className={`h-5 w-5 ${variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}
              />
            </div>
            <div>
              <DialogTitle className="text-base">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook para usar el confirm dialog fácilmente
export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setOpen(true)

    return new Promise((resolve) => {
      setOnConfirmCallback(() => () => {
        resolve(true)
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirmCallback?.()
    setOnConfirmCallback(null)
  }, [onConfirmCallback])

  const dialog = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleConfirm}
      options={options}
    />
  )

  return { confirm, dialog }
}
