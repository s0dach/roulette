import {Injectable, Logger} from '@nestjs/common'
import RandomOrg from 'random-org'
import {Constants} from "../constants"
import {InjectRepository} from "@nestjs/typeorm"
import {CoinflipEntity} from "../entities/coinflip.entity"
import {Not, Repository} from "typeorm"
import {UserEntity} from "../entities/user.entity"
import {InventoryEntity} from "../entities/inventory.entity"
import {Coinflip} from "../constants/coinflip"
import {InventoryService} from "../inventory/inventory.service"
import {ItemService} from "../item/item.service"
import {UserService} from "../user/user.service"
import {ConfigService} from "../config/config.service"
import {AppGateway} from "../app.gateway"

@Injectable()
export class CoinflipService {
    private randomOrg: any
    public games: any
    public allGames: number

    constructor(
        @InjectRepository(CoinflipEntity)
        private coinflipRepository: Repository<CoinflipEntity>,
        private inventoryService: InventoryService,
        private logger: Logger,
        private itemService: ItemService,
        private userService: UserService,
        private configService: ConfigService,
        private appGateway: AppGateway
    ) {
        this.logger.setContext('CoinFlip')

        this.randomOrg = new RandomOrg({apiKey: Constants.random_org.api})
        this.games = []
        this.allGames = 0
    }

    async onApplicationBootstrap() {
        this.games = await this.getGames()
        this.allGames = await this.getAllCountGames()

        this.startTimers()
    }

    async createGame(user: UserEntity, items: InventoryEntity[], sum: number, side: string, games: number) {
        if (games > items.length) {
            throw 'Вы выбрали меньше предметов чем игр которые хотите создать'
        }

        const createItems = await this.parseItemsInCreateGames(items, games)

        for (let items of createItems) {
            let gameSum = 0

            items = items.map((item) => {
                gameSum += item.item.price

                return item.item
            })

            const random = await this.randomOrg.generateSignedIntegers({min: 1, max: 2, n: 1})
            let win_side = 'blue'

            if (random.random.data[0] === 2) {
                win_side = 'green'
            }

            let game = null

            if (side === 'blue') {
                game = await this.coinflipRepository.create({
                    blue_id: user.id,
                    blue_items: JSON.stringify(items),
                    blue_sum: gameSum,
                    win_side,
                    signature: random.signature,
                    random: JSON.stringify(random)
                })
            } else {
                game = await this.coinflipRepository.create({
                    green_id: user.id,
                    green_items: JSON.stringify(items),
                    green_sum: gameSum,
                    win_side,
                    signature: random.signature,
                    random: JSON.stringify(random)
                })
            }

            await this.coinflipRepository.save(game)

            this.games = await this.getGames()

            this.updateSocketGames()
        }

        this.logger.debug(`Пользователь ${user.username} (${user.id}) создал ${games} игр на сумму ${sum.toFixed(2)}$`)

        return true
    }

    async joinGame(user: UserEntity, items: InventoryEntity[], sum: number, gameId: number) {
        const gameIndex = this.games.findIndex(x => x.id === gameId)

        if (gameIndex === -1 || this.games[gameIndex].status !== Coinflip.WAIT) {
            throw 'Данная комната уже занята'
        }

        const game = this.games[gameIndex]

        if (game.blue_id === user.id || game.green_id === user.id) {
            throw 'Нельзя подключиться к своей комнате'
        }

        const bank = game.blue_sum === null ? game.green_sum : game.blue_sum
        const min = bank - (bank * (this.configService.config.coinflip_difference_price / 100))
        const max = bank + (bank * (this.configService.config.coinflip_difference_price / 100))

        if ((sum < min) || (sum > max)) {
            throw `В данную комнату можно зайти с суммой в диапазоне от ${min.toFixed(2)}$ до ${max.toFixed(2)}$`
        }

        const itemsData = items.map((item) => {
            return item.item
        })

        if (game.green_id === null) {
            game.green_id = user.id
            game.green_sum = sum
            game.green_items = JSON.stringify(itemsData)
            game.green_user = user
        } else if (game.blue_id === null) {
            game.blue_id = user.id
            game.blue_sum = sum
            game.blue_items = JSON.stringify(itemsData)
            game.blue_user = user
        }

        game.status = Coinflip.TIMER

        this.games[gameIndex] = await this.saveGame(this.games[gameIndex])

        this.logger.debug(`Пользователь ${user.username} (${user.id}) подключился к игре #${gameId}`)

        await this.startTimer(gameId)

        this.updateSocketGames()

        return true
    }

    async getGames(): Promise<any> {
        const games = await this.coinflipRepository.find({
            relations: ['blue_user', 'green_user', 'winner'],
            where: {
                status: Not(Coinflip.END)
            },
            order: {
                id: 'DESC'
            }
        })

        return Promise.all(games.map(async (game) => {
            return await this.parseItemInGame(game)
        }))
    }

    async getAllCountGames(): Promise<number> {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async startTimer(gameId: number) {
        this.logger.debug(`Старт таймера в игре #${gameId}`)

        let timeToStart = 3

        const gameIndex = this.games.findIndex(x => x.id === gameId)

        this.games[gameIndex].timeToStart = timeToStart

        const timer = setInterval(() => {
            if (timeToStart.toFixed(2) === '0.00') {
                this.games[gameIndex].status = Coinflip.START
                this.games[gameIndex].timeToStart = 0

                this.saveGame(this.games[gameIndex])

                this.startGame(gameId)

                clearInterval(timer)
            }

            this.games[gameIndex].timeToStart = timeToStart

            timeToStart -= 1
        }, 1000)
    }

    async startGame(gameId: number) {
        this.logger.debug(`Старт определения победителя в игре #${gameId}`)

        let rouletteTime = 5

        const gameIndex = this.games.findIndex(x => x.id === gameId)

        this.games[gameIndex].rouletteTime = rouletteTime

        await this.getWinner(gameId)

        const time = setInterval(() => {
            if (rouletteTime.toFixed(2) === '0.00') {
                this.games[gameIndex].rouletteTime = 0.00.toFixed(2)
                this.games[gameIndex].status = Coinflip.PRE_END

                this.saveGame(this.games[gameIndex])

                if (this.games[gameIndex].win_side === 'blue') {
                    this.notifyWin(this.games[gameIndex].blue_id)
                } else {
                    this.notifyWin(this.games[gameIndex].green_id)
                }

                this.updateSocketGames()

                setTimeout(() => {
                    this.games[gameIndex].status = Coinflip.END

                    this.saveGame(this.games[gameIndex])

                    this.updateSocketGames()

                    setTimeout(() => {
                        this.logger.debug(`Игра #${gameId} удалена из списка активных`)

                        this.games.splice(gameIndex, 1)

                        this.updateSocketGames()
                    }, 20000)
                }, 3000)

                this.giveItem(gameId)

                clearInterval(time)
            }

            this.games[gameIndex].rouletteTime = rouletteTime.toFixed(2)

            rouletteTime -= 0.1
        }, 100)
    }

    async notifyWin(userId: number) {
        this.appGateway.server.emit('coinflipWinner', userId)
    }

    async getWinner(gameId: number) {
        const gameIndex = this.games.findIndex(x => x.id === gameId)

        const game = this.games[gameIndex]

        let winner

        if (game.win_side === 'blue') {
            winner = game.blue_user
        } else {
            winner = game.green_user
        }

        const win = (game.blue_sum + game.green_sum) - ((game.blue_sum + game.green_sum) * (this.configService.config.coinflip_commission / 100))
        const profit = (game.blue_sum + game.green_sum) * (this.configService.config.coinflip_commission / 100)

        this.games[gameIndex].win = win
        this.games[gameIndex].winner_id = winner.id
        this.games[gameIndex].winner = winner
        this.games[gameIndex].profit = profit

        this.saveGame(this.games[gameIndex])

        this.updateSocketGames()

        this.logger.debug(`В игре #${gameId} победил ${winner.username} (${winner.id}) и выиграл ${win.toFixed(2)}$`)
    }

    async giveItem(gameId: number) {
        const gameIndex = this.games.findIndex(x => x.id === gameId)
        const game = this.games[gameIndex]

        const win = (game.blue_sum + game.green_sum) - ((game.blue_sum + game.green_sum) * (this.configService.config.coinflip_commission / 100))
        const winItem = await this.itemService.findBySum(win)
        const extBalance = win - winItem.price

        let winner

        if (game.win_side === 'blue') {
            winner = game.blue_user
        } else {
            winner = game.green_user
        }

        if (extBalance > 0) {
            winner.balance += extBalance

            this.userService.update(winner)
        }

        this.games[gameIndex].win = win
        this.games[gameIndex].win_item = JSON.stringify(winItem)

        this.saveGame(this.games[gameIndex])

        this.inventoryService.create({
            user_id: winner.id,
            item_id: winItem.id,
            price: winItem.price
        })
    }

    async startTimers() {
        for (const game of this.games) {
            if (game.status === Coinflip.TIMER) {
                this.startTimer(game.id)
            }

            if (game.status === Coinflip.START) {
                this.startGame(game.id)
            }
        }
    }

    async saveGame(game: any): Promise<CoinflipEntity> {
        if (game.green_items !== null && typeof game.green_items === "object") {
            game.green_items = JSON.stringify(game.green_items)
        }

        if (game.blue_items !== null && typeof game.blue_items === "object") {
            game.blue_items = JSON.stringify(game.blue_items)
        }

        return await this.parseItemInGame(await this.coinflipRepository.save(game))
    }

    async parseItemInGame(game: CoinflipEntity): Promise<CoinflipEntity> {
        if (game.blue_items !== null && typeof game.blue_items !== "object") {
            game.blue_items = JSON.parse(game.blue_items)
        }

        if (game.green_items !== null && typeof game.green_items !== "object") {
            game.green_items = JSON.parse(game.green_items)
        }

        return game
    }

    async parseItemsInCreateGames(items: InventoryEntity[], games: number): Promise<any> {
        let createItems = []

        if (games === 1) {
            createItems = [items]
        } else {
            let max = items.length - games + 1
            let d = 0
            for (let i = 0; i < items.length; i++) {
                if (typeof createItems[d] !== 'undefined' && createItems[d].length >= max) {
                    d += 1
                    max = 1
                }
                if (typeof createItems[d] === 'undefined') {
                    createItems[d] = []
                }
                if (createItems[d].length < max) {
                    createItems[d].push(items[i])
                }
            }
        }

        return createItems
    }

    async getGamesByUserId(userId: number, data): Promise<CoinflipEntity[]> {
        const queryBuilder = this.coinflipRepository.createQueryBuilder('bet')
        queryBuilder.innerJoinAndSelect("bet.blue_user", "blue_user")
        queryBuilder.innerJoinAndSelect("bet.green_user", "green_user")
        queryBuilder.innerJoinAndSelect("bet.winner", "winner")
        queryBuilder.orderBy(`bet.${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `bet.blue_id = ${userId} OR bet.green_id = ${userId}`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountGamesByUserId(userId: number) {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`blue_id = ${userId} OR green_id = ${userId}`)
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getProfitGames() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const d = new Date(),
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1),
            week = new Date(d.setDate(diff))

        week.setHours(0, 0, 0, 0)

        const date = new Date(),
            month = new Date(date.getFullYear(), date.getMonth(), 1)

        month.setHours(0, 0, 0, 0)

        return {
            daily: await this.getProfitGamesByDate(today),
            weekly: await this.getProfitGamesByDate(week),
            monthly: await this.getProfitGamesByDate(month),
            all: await this.getProfitGamesByDate(new Date(1))
        }
    }

    async getProfitGamesByDate(date: Date): Promise<number> {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('SUM(profit)', 'cnt')
            .where(`updated_at >= :date`, {date})
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getCountGames() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const d = new Date(),
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1),
            week = new Date(d.setDate(diff))

        week.setHours(0, 0, 0, 0)

        const date = new Date(),
            month = new Date(date.getFullYear(), date.getMonth(), 1)

        month.setHours(0, 0, 0, 0)

        return {
            daily: await this.getCountGamesByDate(today),
            weekly: await this.getCountGamesByDate(week),
            monthly: await this.getCountGamesByDate(month),
            all: await this.getCountGamesByDate(new Date(1))
        }
    }

    async getCountGamesByDate(date: Date): Promise<number> {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`updated_at >= :date`, {date})
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async updateSocketGames() {
        this.appGateway.server.emit('coinflipGetGames', {
            games: this.games.map((game) => {
                const bank = game.blue_sum === null ? game.green_sum : game.blue_sum
                const min = bank - (bank * (this.configService.config.coinflip_difference_price / 100))

                if (game.blue_items !== null && typeof game.blue_items !== "object") {
                    game.blue_items = JSON.parse(game.blue_items)
                }

                if (game.green_items !== null && typeof game.green_items !== "object") {
                    game.green_items = JSON.parse(game.green_items)
                }

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
            allActiveGames: this.games.length,
            allGames: this.allGames
        })
    }

    async getSumBlueBets() {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('SUM(blue_sum)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getSumGreenBets() {
        const sum = await this.coinflipRepository.createQueryBuilder()
            .select('SUM(green_sum)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getHistoryByUserId(userId: number) {
        const queryBuilder = this.coinflipRepository.createQueryBuilder('bet')
        queryBuilder.innerJoinAndSelect("bet.blue_user", "blue_user")
        queryBuilder.innerJoinAndSelect("bet.green_user", "green_user")
        queryBuilder.innerJoinAndSelect("bet.winner", "winner")
        queryBuilder.orderBy('bet.id', 'DESC')
        queryBuilder.where(
            `(bet.blue_id = ${userId} OR bet.green_id = ${userId}) AND status = ${Coinflip.END}`
        )
        queryBuilder.limit(30)

        const games = await queryBuilder.getMany()

        return games.map(game => {
            const random = JSON.parse(game.random)

            return {
                id: game.id,
                blue_user: {
                    username: game.blue_user.username,
                    avatar: game.blue_user.avatar,
                    steamId: game.blue_user.steamId
                },
                green_user: {
                    username: game.green_user.username,
                    avatar: game.green_user.avatar,
                    steamId: game.green_user.steamId
                },
                blue_sum: game.blue_sum,
                green_sum: game.green_sum,
                win_side: game.win_side,
                win: game.win,
                signature: game.signature,
                random: random.random
            }
        })
    }
}
