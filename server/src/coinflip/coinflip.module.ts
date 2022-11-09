import {CacheModule, forwardRef, Logger, Module} from '@nestjs/common'
import { CoinflipService } from './coinflip.service'
import { CoinflipController } from './coinflip.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {CoinflipEntity} from "../entities/coinflip.entity"
import {InventoryModule} from "../inventory/inventory.module"
import {UserModule} from "../user/user.module"
import {ItemModule} from "../item/item.module"
import {ConfigModule} from "../config/config.module"
import {AppGateway} from "../app.gateway"

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinflipEntity]),
    CacheModule.register(),
    InventoryModule,
    forwardRef(() => UserModule),
    Logger,
    ItemModule,
    ConfigModule
  ],
  exports: [
    TypeOrmModule, CoinflipService
  ],
  providers: [CoinflipService, Logger, AppGateway],
  controllers: [CoinflipController]
})
export class CoinflipModule {}
