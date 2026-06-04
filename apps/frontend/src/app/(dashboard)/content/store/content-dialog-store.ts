import { create } from 'zustand'

interface ContentDialogState {
  // Section dialog
  createSectionOpen: boolean
  setCreateSectionOpen: (open: boolean) => void

  // Slide dialog
  createSlideOpen: boolean
  setCreateSlideOpen: (open: boolean) => void

  // Spotlight dialog
  createSpotlightOpen: boolean
  setCreateSpotlightOpen: (open: boolean) => void

  // Banner dialog
  createBannerOpen: boolean
  setCreateBannerOpen: (open: boolean) => void

  // Active section for adding slides/spotlights
  activeSectionId: string
  setActiveSectionId: (id: string) => void

  // Helpers
  openSlideDialog: (sectionId: string) => void
  openSpotlightDialog: (sectionId: string) => void
}

export const useContentDialogStore = create<ContentDialogState>((set) => ({
  createSectionOpen: false,
  setCreateSectionOpen: (open) => set({ createSectionOpen: open }),

  createSlideOpen: false,
  setCreateSlideOpen: (open) => set({ createSlideOpen: open }),

  createSpotlightOpen: false,
  setCreateSpotlightOpen: (open) => set({ createSpotlightOpen: open }),

  createBannerOpen: false,
  setCreateBannerOpen: (open) => set({ createBannerOpen: open }),

  activeSectionId: '',
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  openSlideDialog: (sectionId) => set({ activeSectionId: sectionId, createSlideOpen: true }),
  openSpotlightDialog: (sectionId) => set({ activeSectionId: sectionId, createSpotlightOpen: true }),
}))
