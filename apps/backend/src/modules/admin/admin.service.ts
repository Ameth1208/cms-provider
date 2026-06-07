import { Injectable } from '@nestjs/common'
import {
  FindAllClientsUseCase,
  CreateClientUseCase,
  UpdateClientStatusUseCase,
  UpdateClientModulesUseCase,
} from './use-cases'

@Injectable()
export class AdminService {
  constructor(
    private findAllClientsUseCase: FindAllClientsUseCase,
    private createClientUseCase: CreateClientUseCase,
    private updateClientStatusUseCase: UpdateClientStatusUseCase,
    private updateClientModulesUseCase: UpdateClientModulesUseCase,
  ) {}

  async findAllClients() {
    return this.findAllClientsUseCase.execute()
  }

  async createClient(data: {
    organizationName: string
    adminEmail: string
    adminName?: string
    adminPassword?: string
    modulesEnabled?: string[]
    plan?: string
  }) {
    return this.createClientUseCase.execute(data)
  }

  async updateClientStatus(id: string, status: string) {
    return this.updateClientStatusUseCase.execute(id, status)
  }

  async updateClientModules(id: string, modulesEnabled: string[]) {
    return this.updateClientModulesUseCase.execute(id, modulesEnabled)
  }
}
