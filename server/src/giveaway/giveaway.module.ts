import {Logger, Module} from '@nestjs/common'
import { GiveawayService } from './giveaway.service'
import { GiveawayController } from './giveaway.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {GiveawayEntity} from "../entities/giveaway.entity"
import {GiveawayBetEntity} from "../entities/giveaway-bet.entity"
import {InventoryModule} from "../inventory/inventory.module"

@Module({
  imports: [TypeOrmModule.forFeature([GiveawayEntity, GiveawayBetEntity]), InventoryModule, Logger],
  exports: [TypeOrmModule, GiveawayService],
  providers: [GiveawayService, Logger],
  controllers: [GiveawayController]
})
export class GiveawayModule {}
