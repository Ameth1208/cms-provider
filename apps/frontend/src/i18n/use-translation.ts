'use client'

import { useLocaleStore } from '@/store'
import es_common from './es/common.json'
import es_auth from './es/auth.json'
import es_nav from './es/nav.json'
import es_settings from './es/settings.json'
import es_catalog from './es/catalog.json'
import es_categories from './es/categories.json'
import es_tags from './es/tags.json'
import es_dashboard from './es/dashboard.json'
import es_api_keys from './es/api-keys.json'
import es_users from './es/users.json'
import es_orders from './es/orders.json'
import es_content from './es/content.json'
import en_common from './en/common.json'
import en_auth from './en/auth.json'
import en_nav from './en/nav.json'
import en_settings from './en/settings.json'
import en_catalog from './en/catalog.json'
import en_categories from './en/categories.json'
import en_tags from './en/tags.json'
import en_dashboard from './en/dashboard.json'
import en_api_keys from './en/api-keys.json'
import en_users from './en/users.json'
import en_orders from './en/orders.json'
import en_content from './en/content.json'

type Messages = Record<string, string>

const messages: Record<string, Messages> = {
  es: {
    ...es_common, ...es_auth, ...es_nav, ...es_settings,
    ...es_catalog, ...es_categories, ...es_tags, ...es_dashboard,
    ...es_api_keys, ...es_users, ...es_orders, ...es_content,
  },
  en: {
    ...en_common, ...en_auth, ...en_nav, ...en_settings,
    ...en_catalog, ...en_categories, ...en_tags, ...en_dashboard,
    ...en_api_keys, ...en_users, ...en_orders, ...en_content,
  },
}

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)

  function t(key: string, vars?: Record<string, string | number>): string {
    const msg = messages[locale]?.[key] ?? messages['es']?.[key] ?? key
    if (!vars) return msg
    return msg.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
  }

  return { t, locale }
}
