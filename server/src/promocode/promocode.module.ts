import {CacheModule, Module} from '@nestjs/common'
import { PromocodeService } from './promocode.service'
import { PromocodeController } from './promocode.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {PromocodeEntity} from "../entities/promocode.entity"
import {PromocodeUseEntity} from "../entities/promocode-use.entity"
import {UserModule} from "../user/user.module"
import {PaymentModule} from "../payment/payment.module"
import {ConfigModule} from "../config/config.module"

@Module({
  imports: [
      TypeOrmModule.forFeature([PromocodeEntity, PromocodeUseEntity]),
      CacheModule.register(),
      UserModule,
      PaymentModule,
      ConfigModule
  ],
  exports: [TypeOrmModule, PromocodeService],
  providers: [PromocodeService],
  controllers: [PromocodeController]
})
export class PromocodeModule {}
