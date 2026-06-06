'use client'

import { ApiKeyCreateDialog } from './api-key-create-dialog'
import { ApiKeyEditDialog } from './api-key-edit-dialog'
import { ApiKeyNewKeyDialog } from './api-key-new-key-dialog'
import { ApiKeyDeleteDialog } from './api-key-delete-dialog'
import { ApiKeyRegenerateDialog } from './api-key-regenerate-dialog'

export function ApiKeysDialogs() {
  return (
    <>
      <ApiKeyCreateDialog />
      <ApiKeyEditDialog />
      <ApiKeyNewKeyDialog />
      <ApiKeyDeleteDialog />
      <ApiKeyRegenerateDialog />
    </>
  )
}
