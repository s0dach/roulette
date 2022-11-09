import {Controller, UseGuards, Get, Post, Req, Body, HttpException, Param} from '@nestjs/common'
import {UserService} from "./user.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {SetTradeUrlDto} from "./dto/set-trade-url.dto"
import {CrashService} from "../crash/crash.service"
import {InventoryService} from "../inventory/inventory.service"
import {CoinflipService} from "../coinflip/coinflip.service"
import {WheelService} from "../wheel/wheel.service"

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private crashService: CrashService,
        private inventoryService: InventoryService,
        private coinflipService: CoinflipService,
        private wheelService: WheelService
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async profile(@Req() req): Promise<any> {
        const user = await this.userService.findBySteamId(req.user.steamId)

        if (typeof req.headers.ref !== 'undefined') {
            await this.userService.updateReferral(user, req.headers.ref)
        }

        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            balance: user.balance,
            role: user.role,
            steamid: user.steamId
        }
    }

    @Get('byId/:id')
    async getUserById(@Param('id') id): Promise<any> {
        const user = await this.userService.findBySteamId(id)

        if (!user) {
            throw new HttpException('Пользователь не найден', 400)
        }

        const bets = await this.crashService.getAllBetsByUserId(user.id)

        return {
            user: {
                username: user.username,
                avatar: user.avatar
            },
            allBets: await this.crashService.getCountBetsByUserId(user.id),
            winBets: await this.crashService.getCountWinBetsByUserId(user.id),
            bets: Object.keys(bets).map((i) => {
                const bet = bets[i]

                return {
                    id: bet.id,
                    game_id: bet.crash_id,
                    sum: bet.sum,
                    multiplier: bet.multiplier,
                    win: bet.win,
                    status: bet.status,
                    items: JSON.parse(bet.items),
                    winItem: typeof bet.win_item === 'undefined' ? null : JSON.parse(bet.win_item),
                    created_at: bet.created_at
                }
            }),
            coinflip_bets: await this.coinflipService.getHistoryByUserId(user.id),
            wheel_bets: await this.wheelService.getHistoryByUserId(user.id)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('myProfile')
    async getMyProfile(@Req() req): Promise<any> {
        const bets = await this.crashService.getAllBetsByUserId(req.user.id)

        return {
            user: {
                username: req.user.username,
                avatar: req.user.avatar,
                steamid: req.user.steamId,
                trade_url: req.user.trade_url,
                referral_code: req.user.referral_code,
                referral_sum: req.user.referral_sum
            },
            allBets: await this.crashService.getCountBetsByUserId(req.user.id),
            winBets: await this.crashService.getCountWinBetsByUserId(req.user.id),
            bets: Object.keys(bets).map((i) => {
                const bet = bets[i]

                return {
                    id: bet.id,
                    game_id: bet.crash_id,
                    sum: bet.sum,
                    multiplier: bet.multiplier,
                    win: bet.win,
                    status: bet.status,
                    items: JSON.parse(bet.items),
                    winItem: typeof bet.win_item === 'undefined' ? null : JSON.parse(bet.win_item),
                    created_at: bet.created_at
                }
            }),
            coinflip_bets: await this.coinflipService.getHistoryByUserId(req.user.id),
            wheel_bets: await this.wheelService.getHistoryByUserId(req.user.id),
            referrals: await this.userService.getCountReferralsByCode(req.user.referral_code),
            withdraws: await this.inventoryService.getWithdrawsByUserId(req.user.id)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('setTradeUrl')
    async setTradeUrl(@Body() data: SetTradeUrlDto, @Req() req): Promise<any> {
        try {
            await this.userService.setTradeUrl(req.user, data.trade_url)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
