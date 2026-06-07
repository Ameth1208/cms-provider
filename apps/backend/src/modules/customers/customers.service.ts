import { Injectable } from '@nestjs/common'
import { FindAllCustomersUseCase } from './use-cases/find-all-customers.use-case'
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case'
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case'
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case'
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case'
import { AddCustomerAddressUseCase } from './use-cases/add-customer-address.use-case'
import { RemoveCustomerAddressUseCase } from './use-cases/remove-customer-address.use-case'

@Injectable()
export class CustomersService {
  constructor(
    private findAllUseCase: FindAllCustomersUseCase,
    private findOneUseCase: FindOneCustomerUseCase,
    private createUseCase: CreateCustomerUseCase,
    private updateUseCase: UpdateCustomerUseCase,
    private removeUseCase: RemoveCustomerUseCase,
    private addAddressUseCase: AddCustomerAddressUseCase,
    private removeAddressUseCase: RemoveCustomerAddressUseCase,
  ) {}

  findAll(organizationId: string, query?: { search?: string }) {
    return this.findAllUseCase.execute(organizationId, query)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneUseCase.execute(id, organizationId)
  }

  create(data: {
    name: string
    email: string
    phone?: string
    document?: string
    documentType?: string
    notes?: string
    addresses?: {
      label: string
      street: string
      city: string
      state?: string
      zip?: string
      country?: string
      isDefault?: boolean
    }[]
  }, organizationId: string) {
    return this.createUseCase.execute(data, organizationId)
  }

  update(id: string, data: {
    name?: string
    email?: string
    phone?: string
    document?: string
    documentType?: string
    notes?: string
    active?: boolean
  }, organizationId: string) {
    return this.updateUseCase.execute(id, data, organizationId)
  }

  remove(id: string, organizationId: string) {
    return this.removeUseCase.execute(id, organizationId)
  }

  addAddress(customerId: string, data: {
    label: string
    street: string
    city: string
    state?: string
    zip?: string
    country?: string
    isDefault?: boolean
  }, organizationId: string) {
    return this.addAddressUseCase.execute(customerId, data, organizationId)
  }

  removeAddress(customerId: string, addressId: string, organizationId: string) {
    return this.removeAddressUseCase.execute(customerId, addressId, organizationId)
  }
}
