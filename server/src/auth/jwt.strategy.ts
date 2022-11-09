import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import {UserService} from "../user/user.service"
import {Constants} from "../constants"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: Constants.jwt.secret,
        })
    }

    async validate(payload: any) {
        return this.userService.findBySteamId(payload.steamId)
    }
}
