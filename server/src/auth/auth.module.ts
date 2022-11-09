import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import {UserModule} from "../user/user.module"
import {JwtModule} from "@nestjs/jwt"
import {Constants} from "../constants"
import {JwtStrategy} from "./jwt.strategy"
import {SteamStrategy} from "./steam.strategy"
import { AuthController } from './auth.controller'

@Module({
  imports: [
      UserModule,
      JwtModule.register({
        secret: Constants.jwt.secret,
        signOptions: { expiresIn: '7d' },
      }),
  ],
  providers: [AuthService, JwtStrategy, SteamStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
