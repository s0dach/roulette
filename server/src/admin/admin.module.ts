import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import {InventoryModule} from "../inventory/inventory.module"
import {UserModule} from "../user/user.module"
import {CrashModule} from "../crash/crash.module"
import {ItemModule} from "../item/item.module"
import {CoinflipModule} from "../coinflip/coinflip.module"
import {GiveawayModule} from "../giveaway/giveaway.module"
import {TicketModule} from "../ticket/ticket.module"
import {Utils} from "../utils"
import {AdminGiveawaysController} from "./admin-giveaways.controller"
import {AdminTicketsController} from "./admin-tickets.controller"
import {AdminItemsController} from "./admin-items.controller"
import {AdminWithdrawsController} from "./admin-withdraws.controller"
import {ConfigModule} from "../config/config.module"
import {AdminConfigController} from "./admin-config.controller"
import {ChatModule} from "../chat/chat.module"
import {PaymentModule} from "../payment/payment.module"
import {PromocodeModule} from "../promocode/promocode.module"
import {WheelModule} from "../wheel/wheel.module"

@Module({
  imports: [InventoryModule, UserModule, CrashModule, ItemModule, CoinflipModule, GiveawayModule, TicketModule, Utils, ConfigModule, ChatModule, PaymentModule, PromocodeModule, WheelModule],
  providers: [Utils],
  controllers: [AdminController, AdminGiveawaysController, AdminTicketsController, AdminItemsController, AdminWithdrawsController, AdminConfigController]
})
export class AdminModule {}
