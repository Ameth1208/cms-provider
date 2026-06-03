'use client'

import { useParams } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useCatalogForm } from '../hooks/use-catalog-form'
import { useCatalogFormStore } from '../store/catalog-form-store'
import { FormTabs } from '../components/catalog-form/form-tabs'
import { BasicInfoSection } from '../components/catalog-form/basic-info-section'
import { DetailsSection } from '../components/catalog-form/details-section'
import { VariantsSection } from '../components/catalog-form/variants-section'
import { MediaSection } from '../components/catalog-form/media-section'
import { SeoVisibilitySection } from '../components/catalog-form/seo-visibility-section'
import { OrganizationSection } from '../components/catalog-form/organization-section'
import { ProductPreview } from '../components/catalog-form/product-preview'
import { useSeo } from '@/hooks/use-seo'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n/use-translation'

export default function CatalogDetailPage() {
  const { id } = useParams()
  const itemId = id as string
  const isNew = itemId === 'create'

  const { pageLoaded, saving, submit } = useCatalogForm(itemId)
  const activeTab = useCatalogFormStore((s) => s.activeTab)
  const { toast } = useToast()
  const { t } = useTranslation()

  useSeo(null)

  async function handleSubmit() {
    try {
      await submit()
      toast({
        title: isNew ? t('product_created') : t('changes_saved'),
        variant: 'default',
      })
      if (isNew) {
        window.location.href = '/catalog'
      }
    } catch {
      toast({ title: t('save_error'), variant: 'destructive' })
    }
  }

  if (!pageLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="space-y-4">
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-48 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 -mx-6 -mt-6 lg:-mx-10 lg:-mt-8">
      {/* Sticky Header — full width */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="px-6 py-4 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">
                  {isNew ? t('new_product') : t('edit_product')}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border">
                  {isNew ? t('creating') : t('editing')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('form_subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                disabled={saving}
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={saving}
                className="min-w-[110px] gap-1.5"
              >
                {saving ? (
                  <>
                    <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:save" className="h-4 w-4" />
                    {t('save')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content — 100% width */}
      <div className="px-6 lg:px-10 pt-6">
        <div className="space-y-6">
          <FormTabs />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              {activeTab === 'info' && <BasicInfoSection isNew={isNew} />}
              {activeTab === 'details' && <DetailsSection />}
              {activeTab === 'variants' && <VariantsSection />}
              {activeTab === 'media' && <MediaSection />}
              {activeTab === 'seo' && <SeoVisibilitySection />}
              {activeTab === 'org' && <OrganizationSection />}
            </div>
            <div className="hidden xl:block">
              <div className="sticky top-[88px]">
                <ProductPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
