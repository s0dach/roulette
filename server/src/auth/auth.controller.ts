import {Controller, Get, UseGuards, Req, Res} from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from "./auth.service"
import { Constants } from '../constants'

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @UseGuards(AuthGuard('steam'))
    @Get('steam')
    async login(): Promise<void> {
        return
    }

    @UseGuards(AuthGuard('steam'))
    @Get('steam/return')
    async handler(@Req() req: Request, @Res() res: Response): Promise<string> {
        const accessToken = await this.authService.logIn(req.user)

        res.redirect(`${Constants.frontend_url}/auth/steam?token=${accessToken}`)

        return accessToken
    }
}
