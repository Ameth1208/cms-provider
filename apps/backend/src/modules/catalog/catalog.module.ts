import { Module } from '@nestjs/common'
import { CatalogController } from './catalog.controller'
import { CatalogService } from './catalog.service'
import { FindAllCatalogItemsUseCase } from './use-cases/find-all-catalog-items.use-case'
import { FindCatalogItemBySlugUseCase } from './use-cases/find-catalog-item-by-slug.use-case'
import { FindOneCatalogItemUseCase } from './use-cases/find-one-catalog-item.use-case'
import { CreateCatalogItemUseCase } from './use-cases/create-catalog-item.use-case'
import { UpdateCatalogItemUseCase } from './use-cases/update-catalog-item.use-case'
import { RemoveCatalogItemUseCase } from './use-cases/remove-catalog-item.use-case'
import { FindAllTagsUseCase } from './use-cases/find-all-tags.use-case'
import { CreateTagUseCase } from './use-cases/create-tag.use-case'
import { RemoveTagUseCase } from './use-cases/remove-tag.use-case'
import { FindAllCategoriesUseCase } from './use-cases/find-all-categories.use-case'
import { CreateCategoryUseCase } from './use-cases/create-category.use-case'
import { RemoveCategoryUseCase } from './use-cases/remove-category.use-case'

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    FindAllCatalogItemsUseCase,
    FindCatalogItemBySlugUseCase,
    FindOneCatalogItemUseCase,
    CreateCatalogItemUseCase,
    UpdateCatalogItemUseCase,
    RemoveCatalogItemUseCase,
    FindAllTagsUseCase,
    CreateTagUseCase,
    RemoveTagUseCase,
    FindAllCategoriesUseCase,
    CreateCategoryUseCase,
    RemoveCategoryUseCase,
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
