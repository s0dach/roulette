import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisClientService } from './redis-client/redis-client.service';
import { RedisClientModule } from './redis-client/redis-client.module';
import { ItemModule } from './item/item.module';
import { MarketCsgoModule } from './market-csgo/market-csgo.module';
import { InventoryModule } from './inventory/inventory.module';
import { CrashModule } from './crash/crash.module';
import { CoinflipModule } from './coinflip/coinflip.module';
import { ChatModule } from './chat/chat.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpInterceptor } from './interceptors/http.interceptor';
import { ApiLogEntity } from './entities/api-log.entity';
import { TicketModule } from './ticket/ticket.module';
import { GiveawayModule } from './giveaway/giveaway.module';
import { AdminModule } from './admin/admin.module';
import { SiteBlockGuard } from './guards/site-block.guard';
import { ShowAuthTokenGuard } from './guards/show-auth-token.guard';
import { AppGateway } from './app.gateway';
import { PromocodeModule } from './promocode/promocode.module';
import { PaymentModule } from './payment/payment.module';
import { WheelModule } from './wheel/wheel.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      entities: ['entities/**/*.js'],
    }),
    TypeOrmModule.forFeature([ApiLogEntity]),
    RedisModule.register({
      name: 'app',
      url: 'redis://redis-server:6379',
    }),
    ConfigModule,
    AuthModule,
    UserModule,
    RedisClientModule,
    ItemModule,
    MarketCsgoModule,
    ScheduleModule.forRoot(),
    InventoryModule,
    CrashModule,
    CoinflipModule,
    ChatModule,
    TicketModule,
    GiveawayModule,
    AdminModule,
    PromocodeModule,
    PaymentModule,
    WheelModule,
  ],
  controllers: [],
  providers: [
    RedisClientService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: SiteBlockGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ShowAuthTokenGuard,
    },
    AppGateway,
  ],
})
export class AppModule {}
