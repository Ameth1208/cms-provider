import { Media } from './media'

export type CatalogItemType = 'PRODUCT' | 'SERVICE'

export interface CatalogItemVariant {
  id: string
  catalogItemId: string
  name: string
  sku: string | null
  color: string | null
  colorHex: string | null
  size: string | null
  price: number | null
  stock: number
  active: boolean
  createdAt: string
}

export interface CatalogItem {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  discountType: 'PERCENTAGE' | 'FIXED' | null
  discountValue: number
  type: CatalogItemType
  sku: string | null
  barcode: string | null
  active: boolean
  visibility: string
  featured: boolean
  label: string | null
  organizationId: string
  categoryId: string | null
  createdAt: string
  updatedAt: string

  // Detalles
  brand: string | null
  material: string | null
  gender: string | null
  season: string | null
  fit: string | null
  weight: number | null
  dimensions: string | null
  country: string | null
  careInstructions: string | null

  // SEO
  metaTitle: string | null
  metaDescription: string | null

  tags: Tag[]
  media: Media[]
  category: Category | null
  variants: CatalogItemVariant[]
  seo: SeoMetadata
}

export interface CreateCatalogItem {
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  discountType?: 'PERCENTAGE' | 'FIXED'
  discountValue?: number
  type: CatalogItemType
  sku?: string
  barcode?: string
  active?: boolean
  visibility?: string
  featured?: boolean
  label?: string
  categoryId?: string
  tagIds?: string[]
  brand?: string
  material?: string
  gender?: string
  season?: string
  fit?: string
  weight?: number
  dimensions?: string
  country?: string
  careInstructions?: string
  metaTitle?: string
  metaDescription?: string
  variants?: Omit<CatalogItemVariant, 'id' | 'catalogItemId' | 'createdAt'>[]
}

export interface UpdateCatalogItem extends Partial<CreateCatalogItem> {}

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
