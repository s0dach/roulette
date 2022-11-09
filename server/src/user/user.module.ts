import {Module, forwardRef, CacheModule} from '@nestjs/common'
import { UserService } from './user.service'
import {TypeOrmModule} from "@nestjs/typeorm"
import {UserEntity} from "../entities/user.entity"
import { UserController } from './user.controller'
import {RedisClientModule} from "../redis-client/redis-client.module"
import {CrashModule} from "../crash/crash.module"
import {InventoryModule} from "../inventory/inventory.module"
import {CoinflipModule} from "../coinflip/coinflip.module"
import {WheelModule} from "../wheel/wheel.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    RedisClientModule,
    CacheModule.register(),
    forwardRef(() => InventoryModule),
    forwardRef(() => CrashModule),
    forwardRef(() => CoinflipModule),
    forwardRef(() => WheelModule)
  ],
  exports: [TypeOrmModule, UserService],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
