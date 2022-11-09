import {CacheModule, Logger, Module, forwardRef} from '@nestjs/common'
import {CrashService} from './crash.service'
import {CrashController} from './crash.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {CrashEntity} from "../entities/crash.entity"
import {CrashBetEntity} from "../entities/crash-bet.entity"
import {InventoryModule} from "../inventory/inventory.module"
import {ItemModule} from "../item/item.module"
import {UserModule} from "../user/user.module"
import {ConfigModule} from "../config/config.module"
import {AppGateway} from "../app.gateway"

@Module({
    imports: [
        TypeOrmModule.forFeature([CrashEntity]),
        TypeOrmModule.forFeature([CrashBetEntity]),
        Logger,
        CacheModule.register(),
        forwardRef(() => InventoryModule),
        ItemModule,
        forwardRef(() => UserModule),
        ConfigModule
    ],
    exports: [TypeOrmModule, CrashService],
    providers: [CrashService, Logger, AppGateway],
    controllers: [CrashController]
})
export class CrashModule {
}
