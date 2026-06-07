import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import {
  FindAllClientsUseCase,
  CreateClientUseCase,
  UpdateClientStatusUseCase,
  UpdateClientModulesUseCase,
} from './use-cases'

@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    FindAllClientsUseCase,
    CreateClientUseCase,
    UpdateClientStatusUseCase,
    UpdateClientModulesUseCase,
  ],
})
export class AdminModule {}
