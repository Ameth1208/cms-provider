import { Injectable } from '@nestjs/common'
import { FindSectionsUseCase } from './use-cases/find-sections.use-case'
import { FindSectionUseCase } from './use-cases/find-section.use-case'
import { CreateSectionUseCase } from './use-cases/create-section.use-case'
import { UpdateSectionUseCase } from './use-cases/update-section.use-case'
import { DeleteSectionUseCase } from './use-cases/delete-section.use-case'
import { CreateSlideUseCase } from './use-cases/create-slide.use-case'
import { UpdateSlideUseCase } from './use-cases/update-slide.use-case'
import { DeleteSlideUseCase } from './use-cases/delete-slide.use-case'
import { AddProductToSectionUseCase } from './use-cases/add-product-to-section.use-case'
import { RemoveProductFromSectionUseCase } from './use-cases/remove-product-from-section.use-case'
import { ReorderSpotlightsUseCase } from './use-cases/reorder-spotlights.use-case'
import { FindBannersUseCase } from './use-cases/find-banners.use-case'
import { CreateBannerUseCase } from './use-cases/create-banner.use-case'
import { UpdateBannerUseCase } from './use-cases/update-banner.use-case'
import { DeleteBannerUseCase } from './use-cases/delete-banner.use-case'
import { GetPublicContentUseCase } from './use-cases/get-public-content.use-case'

@Injectable()
export class ContentService {
  constructor(
    private findSectionsUseCase: FindSectionsUseCase,
    private findSectionUseCase: FindSectionUseCase,
    private createSectionUseCase: CreateSectionUseCase,
    private updateSectionUseCase: UpdateSectionUseCase,
    private deleteSectionUseCase: DeleteSectionUseCase,
    private createSlideUseCase: CreateSlideUseCase,
    private updateSlideUseCase: UpdateSlideUseCase,
    private deleteSlideUseCase: DeleteSlideUseCase,
    private addProductToSectionUseCase: AddProductToSectionUseCase,
    private removeProductFromSectionUseCase: RemoveProductFromSectionUseCase,
    private reorderSpotlightsUseCase: ReorderSpotlightsUseCase,
    private findBannersUseCase: FindBannersUseCase,
    private createBannerUseCase: CreateBannerUseCase,
    private updateBannerUseCase: UpdateBannerUseCase,
    private deleteBannerUseCase: DeleteBannerUseCase,
    private getPublicContentUseCase: GetPublicContentUseCase,
  ) {}

  // ─── Sections ───

  findSections(organizationId: string, type?: string) {
    return this.findSectionsUseCase.execute(organizationId, type)
  }

  findSection(id: string, organizationId: string) {
    return this.findSectionUseCase.execute(id, organizationId)
  }

  createSection(data: {
    type: string
    title?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    return this.createSectionUseCase.execute(data, organizationId)
  }

  updateSection(id: string, data: {
    title?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    return this.updateSectionUseCase.execute(id, data, organizationId)
  }

  deleteSection(id: string, organizationId: string) {
    return this.deleteSectionUseCase.execute(id, organizationId)
  }

  // ─── Slides ───

  createSlide(data: {
    sectionId: string
    imageUrl: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    bgColor?: string
    buttonColor?: string
    buttonTextColor?: string
    textColor?: string
    order?: number
  }, organizationId: string) {
    return this.createSlideUseCase.execute(data, organizationId)
  }

  updateSlide(id: string, data: {
    imageUrl?: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    bgColor?: string
    buttonColor?: string
    buttonTextColor?: string
    textColor?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    return this.updateSlideUseCase.execute(id, data, organizationId)
  }

  deleteSlide(id: string, organizationId: string) {
    return this.deleteSlideUseCase.execute(id, organizationId)
  }

  // ─── Product Spotlights ───

  addProductToSection(data: {
    sectionId: string
    catalogItemId: string
    order?: number
  }, organizationId: string) {
    return this.addProductToSectionUseCase.execute(data, organizationId)
  }

  removeProductFromSection(id: string, organizationId: string) {
    return this.removeProductFromSectionUseCase.execute(id, organizationId)
  }

  reorderSpotlights(sectionId: string, orders: { id: string; order: number }[], organizationId: string) {
    return this.reorderSpotlightsUseCase.execute(sectionId, orders, organizationId)
  }

  // ─── Banners ───

  findBanners(organizationId: string, position?: string) {
    return this.findBannersUseCase.execute(organizationId, position)
  }

  createBanner(data: {
    sectionId?: string
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
  }, organizationId: string) {
    return this.createBannerUseCase.execute(data, organizationId)
  }

  updateBanner(id: string, data: {
    sectionId?: string | null
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    return this.updateBannerUseCase.execute(id, data, organizationId)
  }

  deleteBanner(id: string, organizationId: string) {
    return this.deleteBannerUseCase.execute(id, organizationId)
  }

  // ─── Public API (for storefront) ───

  getPublicContent(organizationId: string) {
    return this.getPublicContentUseCase.execute(organizationId)
  }
}
