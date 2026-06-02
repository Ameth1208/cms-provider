import { Global, Module } from '@nestjs/common'
import { STORAGE_PROVIDER_TOKEN } from './storage.interface'
import { S3Provider } from './s3-provider'

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER_TOKEN,
      useClass: S3Provider,
    },
  ],
  exports: [STORAGE_PROVIDER_TOKEN],
})
export class StorageModule {}
