import {Body, Controller, HttpException, Post, Req, UseGuards} from '@nestjs/common'
import {PromocodeService} from "./promocode.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"

@Controller('promocode')
export class PromocodeController {
    constructor(private promocodeService: PromocodeService) {}

    @UseGuards(JwtAuthGuard)
    @Post('use')
    async useCode(@Req() req, @Body() body) {
        try {
            const usePromocode = await this.promocodeService.usePromocode(req.user, body.code)

            return {
                sum: usePromocode.sum,
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
