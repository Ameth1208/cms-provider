import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './common/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RolesPermissionsModule } from './modules/roles-permissions/roles-permissions.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { MediaModule } from './modules/media/media.module'
import { OrdersModule } from './modules/orders/orders.module'
import { CustomersModule } from './modules/customers/customers.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { ShippingModule } from './modules/shipping/shipping.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { CampaignsModule } from './modules/campaigns/campaigns.module'
import { CompanySettingsModule } from './modules/company-settings/company-settings.module'
import { ApiKeysModule } from './modules/api-keys/api-keys.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { ContentModule } from './modules/content/content.module'
import { AdminModule } from './modules/admin/admin.module'
import { StorageModule } from './common/storage/storage.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RolesPermissionsModule,
    CatalogModule,
    MediaModule,
    OrdersModule,
    CustomersModule,
    PaymentsModule,
    ShippingModule,
    InventoryModule,
    CampaignsModule,
    CompanySettingsModule,
    ApiKeysModule,
    ReviewsModule,
    ContentModule,
    AdminModule,
  ],
})
export class AppModule {}
