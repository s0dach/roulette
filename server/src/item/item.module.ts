import {CacheModule, HttpModule, Logger, Module} from '@nestjs/common'
import { ItemService } from './item.service'
import {MarketCsgoModule} from "../market-csgo/market-csgo.module"
import {TypeOrmModule} from "@nestjs/typeorm"
import {ItemEntity} from "../entities/item.entity"
import { ItemController } from './item.controller'
import {ConfigModule} from "../config/config.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemEntity]),
    MarketCsgoModule,
    Logger,
    CacheModule.register({
      ttl: 900
    }),
    ConfigModule,
    HttpModule
  ],
  exports: [TypeOrmModule, ItemService],
  providers: [ItemService, Logger],
  controllers: [ItemController]
})
export class ItemModule {}
