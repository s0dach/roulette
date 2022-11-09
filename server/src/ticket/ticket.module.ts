import {CacheModule, Module} from '@nestjs/common'
import { TicketService } from './ticket.service'
import { TicketController } from './ticket.controller'
import {TypeOrmModule} from "@nestjs/typeorm"
import {TicketEntity} from "../entities/ticket.entity"
import {ConfigModule} from "../config/config.module"

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]), CacheModule.register(), ConfigModule],
  exports: [TypeOrmModule, TicketService],
  providers: [TicketService],
  controllers: [TicketController]
})
export class TicketModule {}
