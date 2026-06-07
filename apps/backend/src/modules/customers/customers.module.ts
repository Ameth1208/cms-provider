import { Module } from '@nestjs/common'
import { CustomersController } from './customers.controller'
import { CustomersService } from './customers.service'
import { FindAllCustomersUseCase } from './use-cases/find-all-customers.use-case'
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case'
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case'
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case'
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case'
import { AddCustomerAddressUseCase } from './use-cases/add-customer-address.use-case'
import { RemoveCustomerAddressUseCase } from './use-cases/remove-customer-address.use-case'

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    FindAllCustomersUseCase,
    FindOneCustomerUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    RemoveCustomerUseCase,
    AddCustomerAddressUseCase,
    RemoveCustomerAddressUseCase,
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
