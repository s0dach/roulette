import {CacheModule, forwardRef, Logger, Module} from '@nestjs/common'
import { WheelService } from './wheel.service'
import { WheelController } from './wheel.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {WheelEntity} from "../entities/wheel.entity"
import {WheelBetsEntity} from "../entities/wheel-bets.entity"
import {AppGateway} from "../app.gateway"
import {ConfigModule} from "../config/config.module"
import {InventoryModule} from "../inventory/inventory.module"
import {ItemModule} from "../item/item.module"
import {UserModule} from "../user/user.module"

@Module({
  imports: [
      TypeOrmModule.forFeature([WheelEntity, WheelBetsEntity]),
      Logger,
      CacheModule.register(),
      forwardRef(() => InventoryModule),
      ConfigModule,
      ItemModule,
      forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule, WheelService],
  providers: [WheelService, Logger, AppGateway],
  controllers: [WheelController]
})
export class WheelModule {}
