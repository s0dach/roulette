import {
    Body,
    CACHE_MANAGER,
    Controller,
    forwardRef,
    Get,
    HttpException,
    Inject,
    Param,
    Post,
    Req,
    UseGuards
} from '@nestjs/common'
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {AddBetDto} from "./dto/add-bet.dto"
import {CrashService} from "./crash.service"
import {Crash} from "../constants/crash"
import {InventoryService} from "../inventory/inventory.service"

@Controller('crash')
export class CrashController {
    constructor(
        private readonly crashService: CrashService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        @Inject(forwardRef(() => InventoryService))
        private readonly inventoryService: InventoryService
    ) {
    }

    @Get()
    async getGame() {
        return {
            game: {
                id: this.crashService.game.id,
                status: this.crashService.status,
                time: this.crashService.time,
                multiplier: this.crashService.now,
                skins: this.crashService.game.skins,
                members: this.crashService.game.users,
                i: this.crashService.i,
                now: this.crashService.now
            },
            graph: this.crashService.graph,
            bets: Object.keys(this.crashService.bets).map((i) => {
                const bet = this.crashService.bets[i]

                return {
                    id: bet.id,
                    user: {
                        id: bet.user.id,
                        username: bet.user.username,
                        steamid: bet.user.steamId,
                        avatar: bet.user.avatar
                    },
                    sum: bet.sum,
                    multiplier: bet.multiplier,
                    win: bet.win,
                    status: bet.status,
                    items: JSON.parse(bet.items),
                    winItem: typeof bet.win_item === 'undefined' ? null : JSON.parse(bet.win_item),
                    created_at: bet.created_at
                }
            })
        }
    }

    @Get('history')
    async getHistory() {
        return this.crashService.history.map((history) => {
            return {
                id: history.id,
                multiplier: history.multiplier
            }
        })
    }

    @Get('byId/:id')
    async getGameById(@Param('id') id) {
        try {
            return await this.crashService.getHistoryGameById(id)
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/bet')
    async addBet(@Body() data: AddBetDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`add_bet_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`add_bet_${req.user.id}`, 1, 5)

        const { ids, multiplier } = data

        if (this.crashService.game.status !== Crash.START_TIMER || this.crashService.disableBets) {
            throw new HttpException(`Игра уже началась`, 400)
        }

        if (ids.length === 0) {
            throw new HttpException(`Вы не выбрали предметы`, 400)
        }

        if (multiplier <= 1.00) {
            throw new HttpException(`Вы не выбрали коэффициент авто-вывода`, 400)
        }

        const myItems = []
        let myPrice = 0.00

        for (const id of ids) {
            const inventory = await this.inventoryService.findById(id)

            if (!inventory || inventory.user_id !== req.user.id) {
                throw new HttpException(`Одного из предметов нет в инвентаре`, 400)
            }

            myItems.push(inventory)
            myPrice += inventory.item.price
        }

        try {
            await this.crashService.addBet(req.user, myItems, myPrice, multiplier)

            for (const id of ids) {
                await this.inventoryService.delete(id)
            }

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/withdraw')
    async withdrawBet(@Req() req): Promise<any> {
        try {
            await this.crashService.withdrawBet(req.user.steamId, this.crashService.now)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
