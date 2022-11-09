import {CacheModule, Module} from '@nestjs/common'
import {ChatService} from './chat.service'
import {ChatController} from './chat.controller'
import {RedisClientModule} from "../redis-client/redis-client.module"
import {Utils} from "../utils"
import {UserModule} from "../user/user.module"
import {TypeOrmModule} from "@nestjs/typeorm"
import {BotMessageEntity} from "../entities/bot-message.entity"
import {ConfigModule} from "../config/config.module"
import {AppGateway} from "../app.gateway"

@Module({
  imports: [
    TypeOrmModule.forFeature([BotMessageEntity]),
    RedisClientModule,
    CacheModule.register(),
    UserModule,
    ConfigModule,
    Utils
  ],
  exports: [
    TypeOrmModule, ChatService
  ],
  providers: [ChatService, Utils, AppGateway],
  controllers: [ChatController]
})
export class ChatModule {

}
