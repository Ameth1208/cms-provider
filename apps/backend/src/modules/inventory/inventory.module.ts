import { Module } from '@nestjs/common'
import { InventoryController } from './inventory.controller'
import { InventoryService } from './inventory.service'
import { FindAllInventoryUseCase } from './use-cases/find-all-inventory.use-case'
import { FindInventoryByCatalogItemUseCase } from './use-cases/find-inventory-by-catalog-item.use-case'
import { AdjustInventoryUseCase } from './use-cases/adjust-inventory.use-case'
import { SetInventoryThresholdUseCase } from './use-cases/set-inventory-threshold.use-case'
import { GetLowStockInventoryUseCase } from './use-cases/get-low-stock-inventory.use-case'
import { GetInventoryMovementsUseCase } from './use-cases/get-inventory-movements.use-case'
import { FindBatchesUseCase } from './use-cases/find-batches.use-case'
import { CreateBatchUseCase } from './use-cases/create-batch.use-case'
import { FindBatchUseCase } from './use-cases/find-batch.use-case'
import { DeleteBatchUseCase } from './use-cases/delete-batch.use-case'
import { GetExpiringBatchesUseCase } from './use-cases/get-expiring-batches.use-case'

@Module({
  controllers: [InventoryController],
  providers: [
    InventoryService,
    FindAllInventoryUseCase,
    FindInventoryByCatalogItemUseCase,
    AdjustInventoryUseCase,
    SetInventoryThresholdUseCase,
    GetLowStockInventoryUseCase,
    GetInventoryMovementsUseCase,
    FindBatchesUseCase,
    CreateBatchUseCase,
    FindBatchUseCase,
    DeleteBatchUseCase,
    GetExpiringBatchesUseCase,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
