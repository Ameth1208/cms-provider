import { Module } from '@nestjs/common'
import { DriversController } from './drivers.controller'
import { DriversService } from './drivers.service'
import { FindAllDriversUseCase } from './use-cases/find-all-drivers.use-case'
import { FindOneDriverUseCase } from './use-cases/find-one-driver.use-case'
import { GetDriverStatsUseCase } from './use-cases/get-driver-stats.use-case'
import { GetDriverOrdersUseCase } from './use-cases/get-driver-orders.use-case'
import { CreateDriverUseCase } from './use-cases/create-driver.use-case'
import { UpdateDriverUseCase } from './use-cases/update-driver.use-case'
import { RemoveDriverUseCase } from './use-cases/remove-driver.use-case'
import { UpdateDriverLocationUseCase } from './use-cases/update-driver-location.use-case'

@Module({
  controllers: [DriversController],
  providers: [
    DriversService,
    FindAllDriversUseCase,
    FindOneDriverUseCase,
    GetDriverStatsUseCase,
    GetDriverOrdersUseCase,
    CreateDriverUseCase,
    UpdateDriverUseCase,
    RemoveDriverUseCase,
    UpdateDriverLocationUseCase,
  ],
  exports: [DriversService],
})
export class DriversModule {}
