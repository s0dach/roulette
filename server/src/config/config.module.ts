import { Module } from '@nestjs/common'
import { ConfigService } from './config.service'
import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigEntity} from "../entities/config.entity"
import { ConfigController } from './config.controller'

@Module({
  imports: [TypeOrmModule.forFeature([ConfigEntity])],
  exports: [TypeOrmModule, ConfigService],
  providers: [ConfigService],
  controllers: [ConfigController]
})
export class ConfigModule {}
