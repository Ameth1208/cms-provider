'use client'

import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useTranslation } from '@/i18n/use-translation'

export function FormTabs() {
  const activeTab = useCatalogFormStore((s) => s.activeTab)
  const setActiveTab = useCatalogFormStore((s) => s.setActiveTab)
  const { t } = useTranslation()

  const tabs = [
    { key: 'info', label: t('tab_basic') },
    { key: 'details', label: t('tab_details') },
    { key: 'variants', label: t('tab_variants') },
    { key: 'media', label: t('tab_media') },
    { key: 'seo', label: t('tab_seo') },
    { key: 'org', label: t('tab_org') },
  ]

  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 text-sm py-2 px-3 rounded-md transition-colors whitespace-nowrap ${
            activeTab === tab.key
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
