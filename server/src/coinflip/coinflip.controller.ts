import {Body, CACHE_MANAGER, Controller, Get, HttpException, Inject, Post, Req, UseGuards} from '@nestjs/common'
import {CoinflipService} from "./coinflip.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {CreateGameDto} from "./dto/create-game.dto"
import {InventoryService} from "../inventory/inventory.service"
import {Coinflip} from "../constants/coinflip"
import {JoinGameDto} from "./dto/join-game.dto"
import {ConfigService} from "../config/config.service"

@Controller('coinflip')
export class CoinflipController {
    constructor(
        private coinflipService: CoinflipService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        private inventoryService: InventoryService,
        private configService: ConfigService
    ) {
    }

    @Get('/games')
    async getGames(): Promise<any> {
        return {
            games: this.coinflipService.games.map((game) => {
                const bank = game.blue_sum === null ? game.green_sum : game.blue_sum
                const min = bank - (bank * (this.configService.config.coinflip_difference_price / 100))

                return {
                    id: game.id,
                    blue_user: game.blue_user !== null ? {
                        username: game.blue_user.username,
                        avatar: game.blue_user.avatar,
                        steamid: game.blue_user.steamId
                    } : null,
                    green_user: game.green_user !== null ? {
                        username: game.green_user.username,
                        avatar: game.green_user.avatar,
                        steamid: game.green_user.steamId
                    } : null,
                    blue_items: game.blue_items,
                    green_items: game.green_items,
                    blue_sum: game.blue_sum,
                    green_sum: game.green_sum,
                    signature: game.signature,
                    winner: game.winner !== null ? {
                        username: game.winner.username,
                        avatar: game.winner.avatar,
                        steamid: game.winner.steamId
                    } : null,
                    status: game.status,
                    win_side: game.status >= Coinflip.START ? game.win_side : null,
                    random: game.status >= Coinflip.START ? game.random : null,
                    win: game.win,
                    timeToStart: game.timeToStart ?? null,
                    rouletteTime: game.rouletteTime ?? null,
                    min
                }
            }),
            allActiveGames: this.coinflipService.games.length,
            allGames: this.coinflipService.allGames
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async createGame(@Body() data: CreateGameDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`create_game_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`create_game_${req.user.id}`, 1, 5)

        const { ids, side, games } = data

        if (ids.length === 0) {
            throw new HttpException('Вы не выбрали предметы', 400)
        }

        if (side !== 'blue' && side !== 'green') {
            throw new HttpException('Вы не выбрали сторону', 400)
        }

        if (games < 1 || games > 5) {
            throw new HttpException('Вы не выбрали кол-во игр', 400)
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
            await this.coinflipService.createGame(req.user, myItems, myPrice, side, games)

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
    @Post('/join')
    async joinGame(@Body() data: JoinGameDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`join_game_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`join_game_${req.user.id}`, 1, 5)

        const { ids, game_id } = data

        if (ids.length === 0) {
            throw new HttpException('Вы не выбрали предметы', 400)
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
            await this.coinflipService.joinGame(req.user, myItems, myPrice, game_id)

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
}
