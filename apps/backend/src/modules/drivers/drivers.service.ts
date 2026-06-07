import { Injectable } from '@nestjs/common'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { FindAllDriversUseCase } from './use-cases/find-all-drivers.use-case'
import { FindOneDriverUseCase } from './use-cases/find-one-driver.use-case'
import { GetDriverStatsUseCase } from './use-cases/get-driver-stats.use-case'
import { GetDriverOrdersUseCase } from './use-cases/get-driver-orders.use-case'
import { CreateDriverUseCase } from './use-cases/create-driver.use-case'
import { UpdateDriverUseCase } from './use-cases/update-driver.use-case'
import { RemoveDriverUseCase } from './use-cases/remove-driver.use-case'
import { UpdateDriverLocationUseCase } from './use-cases/update-driver-location.use-case'

@Injectable()
export class DriversService {
  constructor(
    private findAllDrivers: FindAllDriversUseCase,
    private findOneDriver: FindOneDriverUseCase,
    private getDriverStats: GetDriverStatsUseCase,
    private getDriverOrdersUseCase: GetDriverOrdersUseCase,
    private createDriver: CreateDriverUseCase,
    private updateDriver: UpdateDriverUseCase,
    private removeDriver: RemoveDriverUseCase,
    private updateDriverLocation: UpdateDriverLocationUseCase,
  ) {}

  findAll(organizationId: string, active?: boolean) {
    return this.findAllDrivers.execute(organizationId, active)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneDriver.execute(id, organizationId)
  }

  getStats(organizationId: string) {
    return this.getDriverStats.execute(organizationId)
  }

  getDriverOrders(id: string, organizationId: string) {
    return this.getDriverOrdersUseCase.execute(id, organizationId)
  }

  create(dto: CreateDriverDto, organizationId: string) {
    return this.createDriver.execute(dto, organizationId)
  }

  update(id: string, dto: UpdateDriverDto, organizationId: string) {
    return this.updateDriver.execute(id, dto, organizationId)
  }

  remove(id: string, organizationId: string) {
    return this.removeDriver.execute(id, organizationId)
  }

  updateLocation(id: string, lat: number, lng: number, organizationId: string) {
    return this.updateDriverLocation.execute(id, lat, lng, organizationId)
  }
}
