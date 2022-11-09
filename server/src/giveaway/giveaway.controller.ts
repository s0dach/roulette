import {Controller, Get, HttpException, Post, Req, UseGuards} from '@nestjs/common'
import {GiveawayService} from "./giveaway.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"

@Controller('giveaway')
export class GiveawayController {
    constructor(
        private giveawayService: GiveawayService
    ) {
    }

    @Get('/')
    async getGiveaway(): Promise<any> {
        return {
            giveaway: this.giveawayService.giveaway,
            lastGiveaways: this.giveawayService.lastGiveaways.map((giveaway) => {
                return {
                    id: giveaway.id,
                    users: giveaway.users,
                    end_time: giveaway.end_time,
                    item: giveaway.item,
                    winner: {
                        id: giveaway.winner.id,
                        username: giveaway.winner.username,
                        steamId: giveaway.winner.steamId,
                        avatar: giveaway.winner.avatar
                    }
                }
            })
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/join')
    async joinGiveaway(@Req() req): Promise<any> {
        if (this.giveawayService.giveaway === null
            || new Date(this.giveawayService.giveaway.end_time) < new Date()
            || this.giveawayService.giveaway.winner_id !== null) {
            throw new HttpException('Активного розыгрыша нет', 400)
        }

        try {
            await this.giveawayService.joinGiveaway(req.user)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
