import {Body, Controller, Get, HttpException, Post, Query, Req, UseGuards} from '@nestjs/common'
import {PaymentService} from "./payment.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"

@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) {}
    
    @UseGuards(JwtAuthGuard)
    @Post('pay')
    async pay(@Req() req, @Body() body) {
        const { sum, method } = body

        if (method === 'skinsback' && req.user.trade_url === null) {
            throw new HttpException('Введите ссылку на обмен', 400)
        }

        try {
            const response = await this.paymentService.createPayment(req.user, sum, method)

            return {
                url: response.url
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @Get('callback')
    async callback(@Query() query) {
        try {
            return await this.paymentService.callbackPayment(query)
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @Post('skinsback/callback')
    async skinsbackCallback(@Body() body) {
        try {
            return await this.paymentService.callbackSkinsbackPayment(body)
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
