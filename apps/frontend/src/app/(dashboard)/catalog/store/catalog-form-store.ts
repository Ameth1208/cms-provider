import { create } from 'zustand'
import type { Category, Tag, Media, CatalogItemVariant } from '@cms/shared'

export interface CatalogVariant {
  id?: string
  name: string
  sku?: string | null
  color?: string | null
  colorHex?: string | null
  size?: string | null
  price?: number | null
  stock: number
  active: boolean
}

interface FormState {
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number
  discountType: 'PERCENTAGE' | 'FIXED' | ''
  discountValue: number
  type: 'PRODUCT' | 'SERVICE'
  sku: string
  barcode: string
  active: boolean
  visibility: string
  featured: boolean
  label: string
  categoryId: string
  tagIds: string[]

  // Detalles
  brand: string
  material: string
  gender: string
  season: string
  fit: string
  weight: number
  dimensions: string
  country: string
  careInstructions: string

  // SEO
  metaTitle: string
  metaDescription: string
}

interface PendingPreview {
  preview: string
  file: File
}

interface CatalogFormStore {
  form: FormState
  categories: Category[]
  tags: Tag[]
  media: Media[]
  pendingFiles: File[]
  pendingPreviews: PendingPreview[]
  variants: CatalogVariant[]
  activeTab: string
  newTagName: string
  newCatName: string
  creatingTag: boolean
  creatingCat: boolean
  dragOver: boolean
  setForm: (partial: Partial<FormState>) => void
  setFormName: (name: string, autoSlug: boolean) => void
  setCategories: (cats: Category[]) => void
  setTags: (tags: Tag[]) => void
  setMedia: (media: Media[]) => void
  setPendingFiles: (files: File[]) => void
  setPendingPreviews: (previews: PendingPreview[]) => void
  setVariants: (variants: CatalogVariant[]) => void
  setActiveTab: (tab: string) => void
  setNewTagName: (name: string) => void
  setNewCatName: (name: string) => void
  setCreatingTag: (v: boolean) => void
  setCreatingCat: (v: boolean) => void
  setDragOver: (v: boolean) => void
  addPendingFiles: (files: FileList | null) => void
  removePendingFile: (index: number) => void
  toggleTag: (tagId: string) => void
  moveMedia: (index: number, direction: 'up' | 'down') => void
  removeMedia: (index: number) => void
  removeMediaById: (id: string) => void
  resetForm: () => void
}

const defaultForm: FormState = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  comparePrice: 0,
  discountType: '',
  discountValue: 0,
  type: 'PRODUCT',
  sku: '',
  barcode: '',
  active: true,
  visibility: 'visible',
  featured: false,
  label: '',
  categoryId: '',
  tagIds: [],
  brand: '',
  material: '',
  gender: '',
  season: '',
  fit: '',
  weight: 0,
  dimensions: '',
  country: '',
  careInstructions: '',
  metaTitle: '',
  metaDescription: '',
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const useCatalogFormStore = create<CatalogFormStore>((set) => ({
  form: { ...defaultForm },
  categories: [],
  tags: [],
  media: [],
  pendingFiles: [],
  pendingPreviews: [],
  variants: [],
  activeTab: 'info',
  newTagName: '',
  newCatName: '',
  creatingTag: false,
  creatingCat: false,
  dragOver: false,

  setForm: (partial) =>
    set((s) => ({ form: { ...s.form, ...partial } })),

  setFormName: (name, autoSlug) =>
    set((s) => ({
      form: {
        ...s.form,
        name,
        slug: autoSlug && name ? slugify(name) : s.form.slug,
      },
    })),

  setCategories: (cats) => set({ categories: cats }),
  setTags: (tags) => set({ tags }),
  setMedia: (media) => set({ media }),
  setPendingFiles: (files) => set({ pendingFiles: files }),
  setPendingPreviews: (previews) => set({ pendingPreviews: previews }),
  setVariants: (variants) => set({ variants }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setNewTagName: (name) => set({ newTagName: name }),
  setNewCatName: (name) => set({ newCatName: name }),
  setCreatingTag: (v) => set({ creatingTag: v }),
  setCreatingCat: (v) => set({ creatingCat: v }),
  setDragOver: (v) => set({ dragOver: v }),

  addPendingFiles: (fileList) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const previews = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
    }))
    set((s) => ({
      pendingFiles: [...s.pendingFiles, ...files],
      pendingPreviews: [...s.pendingPreviews, ...previews],
    }))
  },

  removePendingFile: (index) => {
    set((s) => {
      const newPreviews = [...s.pendingPreviews]
      const newFiles = [...s.pendingFiles]
      const removed = newPreviews.splice(index, 1)[0]
      if (removed) URL.revokeObjectURL(removed.preview)
      newFiles.splice(index, 1)
      return { pendingPreviews: newPreviews, pendingFiles: newFiles }
    })
  },

  toggleTag: (tagId) =>
    set((s) => {
      const has = s.form.tagIds.includes(tagId)
      return {
        form: {
          ...s.form,
          tagIds: has
            ? s.form.tagIds.filter((id) => id !== tagId)
            : [...s.form.tagIds, tagId],
        },
      }
    }),

  moveMedia: (index, direction) =>
    set((s) => {
      const newMedia = [...s.media]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= newMedia.length) return s
      ;[newMedia[index], newMedia[swapIndex]] = [newMedia[swapIndex], newMedia[index]]
      return { media: newMedia }
    }),

  removeMedia: (index) =>
    set((s) => ({ media: s.media.filter((_, i) => i !== index) })),

  removeMediaById: (id) =>
    set((s) => ({ media: s.media.filter((m) => m.id !== id) })),

  resetForm: () =>
    set({
      form: { ...defaultForm },
      media: [],
      pendingFiles: [],
      pendingPreviews: [],
      variants: [],
    }),
}))
