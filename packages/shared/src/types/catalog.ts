import { Media } from './media'

export type CatalogItemType = 'PRODUCT' | 'SERVICE'

export interface CatalogItem {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  type: CatalogItemType
  sku: string | null
  active: boolean
  organizationId: string
  categoryId: string | null
  createdAt: string
  updatedAt: string
  tags: Tag[]
  media: Media[]
  category: Category | null
  seo: SeoMetadata
}

export interface CreateCatalogItem {
  name: string
  slug: string
  description?: string
  price: number
  type: CatalogItemType
  sku?: string
  categoryId?: string
  tagIds?: string[]
}

export interface UpdateCatalogItem extends Partial<CreateCatalogItem> {
  active?: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
  organizationId: string
}

export interface SeoMetadata {
  title: string
  description: string
  keywords: string[]
  ogImage: string | null
  ogType: 'website' | 'article'
  canonical: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  organizationId: string
  children: Category[]
}
