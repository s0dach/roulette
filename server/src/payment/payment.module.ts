import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {PaymentEntity} from "../entities/payment.entity"
import {ConfigModule} from "../config/config.module"
import {UserModule} from "../user/user.module"
import {Utils} from "../utils"

@Module({
  imports: [
      TypeOrmModule.forFeature([PaymentEntity]),
      UserModule,
      ConfigModule
  ],
  exports: [TypeOrmModule, PaymentService],
  providers: [PaymentService, Utils],
  controllers: [PaymentController]
})
export class PaymentModule {}
