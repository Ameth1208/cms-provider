import { Injectable } from '@nestjs/common'
import { FindAllInventoryUseCase } from './use-cases/find-all-inventory.use-case'
import { FindInventoryByCatalogItemUseCase } from './use-cases/find-inventory-by-catalog-item.use-case'
import { AdjustInventoryUseCase, AdjustInventoryData } from './use-cases/adjust-inventory.use-case'
import { SetInventoryThresholdUseCase } from './use-cases/set-inventory-threshold.use-case'
import { GetLowStockInventoryUseCase } from './use-cases/get-low-stock-inventory.use-case'
import { GetInventoryMovementsUseCase } from './use-cases/get-inventory-movements.use-case'
import { FindBatchesUseCase } from './use-cases/find-batches.use-case'
import { CreateBatchUseCase, CreateBatchData } from './use-cases/create-batch.use-case'
import { FindBatchUseCase } from './use-cases/find-batch.use-case'
import { DeleteBatchUseCase } from './use-cases/delete-batch.use-case'
import { GetExpiringBatchesUseCase } from './use-cases/get-expiring-batches.use-case'

@Injectable()
export class InventoryService {
  constructor(
    private findAllUseCase: FindAllInventoryUseCase,
    private findByCatalogItemUseCase: FindInventoryByCatalogItemUseCase,
    private adjustUseCase: AdjustInventoryUseCase,
    private setThresholdUseCase: SetInventoryThresholdUseCase,
    private getLowStockUseCase: GetLowStockInventoryUseCase,
    private getMovementsUseCase: GetInventoryMovementsUseCase,
    private findBatchesUseCase: FindBatchesUseCase,
    private createBatchUseCase: CreateBatchUseCase,
    private findBatchUseCase: FindBatchUseCase,
    private deleteBatchUseCase: DeleteBatchUseCase,
    private getExpiringBatchesUseCase: GetExpiringBatchesUseCase,
  ) {}

  findAll(organizationId: string) {
    return this.findAllUseCase.execute(organizationId)
  }

  findByCatalogItem(catalogItemId: string, organizationId: string) {
    return this.findByCatalogItemUseCase.execute(catalogItemId, organizationId)
  }

  adjust(data: AdjustInventoryData, organizationId: string, createdBy?: string) {
    return this.adjustUseCase.execute(data, organizationId, createdBy)
  }

  setThreshold(catalogItemId: string, threshold: number, organizationId: string) {
    return this.setThresholdUseCase.execute(catalogItemId, threshold, organizationId)
  }

  getLowStock(organizationId: string) {
    return this.getLowStockUseCase.execute(organizationId)
  }

  getMovements(catalogItemId: string, organizationId: string) {
    return this.getMovementsUseCase.execute(catalogItemId, organizationId)
  }

  findBatches(catalogItemId: string, organizationId: string) {
    return this.findBatchesUseCase.execute(catalogItemId, organizationId)
  }

  createBatch(data: CreateBatchData, organizationId: string, createdBy?: string) {
    return this.createBatchUseCase.execute(data, organizationId, createdBy)
  }

  findBatch(batchId: string, organizationId: string) {
    return this.findBatchUseCase.execute(batchId, organizationId)
  }

  deleteBatch(batchId: string, organizationId: string) {
    return this.deleteBatchUseCase.execute(batchId, organizationId)
  }

  getExpiringBatches(organizationId: string, days?: number) {
    return this.getExpiringBatchesUseCase.execute(organizationId, days)
  }
}
