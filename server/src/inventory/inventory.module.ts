import {CacheModule, forwardRef, Module} from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {InventoryEntity} from "../entities/inventory.entity"
import {ItemModule} from "../item/item.module"
import {UserModule} from "../user/user.module"
import {RedisClientModule} from "../redis-client/redis-client.module"
import {MarketCsgoModule} from "../market-csgo/market-csgo.module"
import {WithdrawEntity} from "../entities/withdraw.entity"
import {ConfigModule} from "../config/config.module"
import {CrashModule} from "../crash/crash.module"

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([InventoryEntity, WithdrawEntity]),
    ItemModule,
    forwardRef(() => UserModule),
    forwardRef(() => CrashModule),
    RedisClientModule,
    MarketCsgoModule,
    ConfigModule
  ],
  exports: [
    TypeOrmModule, InventoryService
  ],
  providers: [InventoryService],
  controllers: [InventoryController]
})
export class InventoryModule {}
