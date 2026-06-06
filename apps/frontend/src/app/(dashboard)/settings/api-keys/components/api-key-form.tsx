'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/i18n/use-translation'
import { useApiKeysStore } from '../store/api-keys-store'
import { MODULES, ModulePermissions } from './module-permissions'

export function ApiKeyForm() {
  const { t } = useTranslation()
  const formName = useApiKeysStore((s) => s.formName)
  const formPerms = useApiKeysStore((s) => s.formPerms)
  const setFormName = useApiKeysStore((s) => s.setFormName)
  const setFormPerms = useApiKeysStore((s) => s.setFormPerms)

  const togglePerm = (perm: string) => {
    if (formPerms.includes(perm)) {
      setFormPerms(formPerms.filter((p) => p !== perm))
    } else {
      setFormPerms([...formPerms, perm])
    }
  }

  const setPerms = (perms: string[]) => {
    setFormPerms(perms)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t('api_keys_name')}</Label>
        <Input
          placeholder={t('api_keys_name_placeholder')}
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('module_permissions')}</Label>
        <div className="space-y-2">
          {MODULES.map((mod) => (
            <ModulePermissions
              key={mod.key}
              moduleKey={mod.key}
              moduleIcon={mod.icon}
              formPerms={formPerms}
              onToggle={togglePerm}
              onSetPerms={setPerms}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
