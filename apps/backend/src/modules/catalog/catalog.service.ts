import { Injectable } from '@nestjs/common'
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

@Injectable()
export class CatalogService {
  constructor(
    private findAllUseCase: FindAllCatalogItemsUseCase,
    private findBySlugUseCase: FindCatalogItemBySlugUseCase,
    private findOneUseCase: FindOneCatalogItemUseCase,
    private createUseCase: CreateCatalogItemUseCase,
    private updateUseCase: UpdateCatalogItemUseCase,
    private removeUseCase: RemoveCatalogItemUseCase,
    private findAllTagsUseCase: FindAllTagsUseCase,
    private createTagUseCase: CreateTagUseCase,
    private removeTagUseCase: RemoveTagUseCase,
    private findAllCategoriesUseCase: FindAllCategoriesUseCase,
    private createCategoryUseCase: CreateCategoryUseCase,
    private removeCategoryUseCase: RemoveCategoryUseCase,
  ) {}

  findAll(organizationId: string, query?: { search?: string; type?: string; categoryId?: string; tagId?: string }) {
    return this.findAllUseCase.execute(organizationId, query)
  }

  findBySlug(slug: string, organizationId: string) {
    return this.findBySlugUseCase.execute(slug, organizationId)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneUseCase.execute(id, organizationId)
  }

  create(data: Parameters<CreateCatalogItemUseCase['execute']>[0], organizationId: string) {
    return this.createUseCase.execute(data, organizationId)
  }

  update(id: string, data: Parameters<UpdateCatalogItemUseCase['execute']>[1], organizationId: string) {
    return this.updateUseCase.execute(id, data, organizationId)
  }

  remove(id: string, organizationId: string) {
    return this.removeUseCase.execute(id, organizationId)
  }

  findAllTags(organizationId: string) {
    return this.findAllTagsUseCase.execute(organizationId)
  }

  createTag(data: Parameters<CreateTagUseCase['execute']>[0], organizationId: string) {
    return this.createTagUseCase.execute(data, organizationId)
  }

  removeTag(id: string, organizationId: string) {
    return this.removeTagUseCase.execute(id, organizationId)
  }

  findAllCategories(organizationId: string) {
    return this.findAllCategoriesUseCase.execute(organizationId)
  }

  createCategory(data: Parameters<CreateCategoryUseCase['execute']>[0], organizationId: string) {
    return this.createCategoryUseCase.execute(data, organizationId)
  }

  removeCategory(id: string, organizationId: string) {
    return this.removeCategoryUseCase.execute(id, organizationId)
  }
}
