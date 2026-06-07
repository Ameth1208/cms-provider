import { Module } from '@nestjs/common'
import { ContentService } from './content.service'
import { ContentController } from './content.controller'
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

@Module({
  controllers: [ContentController],
  providers: [
    ContentService,
    FindSectionsUseCase,
    FindSectionUseCase,
    CreateSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
    CreateSlideUseCase,
    UpdateSlideUseCase,
    DeleteSlideUseCase,
    AddProductToSectionUseCase,
    RemoveProductFromSectionUseCase,
    ReorderSpotlightsUseCase,
    FindBannersUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    DeleteBannerUseCase,
    GetPublicContentUseCase,
  ],
  exports: [ContentService],
})
export class ContentModule {}
