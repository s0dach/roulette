import {forwardRef, Inject, Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import randomInt from "random-int"
import randomFloat from "random-float"
import {CrashEntity} from "../entities/crash.entity"
import {Crash} from "../constants/crash"
import {CrashBetEntity} from "../entities/crash-bet.entity"
import {UserEntity} from "../entities/user.entity"
import {ItemService} from "../item/item.service"
import {UserService} from "../user/user.service"
import {InventoryService} from "../inventory/inventory.service"
import {LoggerConstants} from "../constants/logger"
import {ConfigService} from "../config/config.service"
import {AppGateway} from "../app.gateway"

@Injectable()
export class CrashService {
    public game: CrashEntity
    public time: number
    public status: string
    public disableBets: boolean
    public bets: any
    public autoMultipliers: any
    public withdraws: any
    public now: any
    public graph: any
    public history: any
    public i: any

    constructor(
        @InjectRepository(CrashEntity)
        private readonly crashRepository: Repository<CrashEntity>,
        @InjectRepository(CrashBetEntity)
        private readonly crashBetRepository: Repository<CrashBetEntity>,
        private readonly itemService: ItemService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => InventoryService))
        private readonly inventoryService: InventoryService,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly appGateway: AppGateway
    ) {
        this.disableBets = false
        this.status = 'timer'
        this.bets = []
        this.autoMultipliers = []
        this.withdraws = []
        this.i = 0
        this.now = 1.00
        this.graph = {
            a: 0,
            b: 0,
            c: 0,
            c_m: 0,
            circle: 0,
            circle_m: 0,
            multipliers: [4.00, 3.00, 2.00, 1.00],
        }
        this.history = []
    }

    async onApplicationBootstrap() {
        this.time = this.configService.config.crash_time_to_start
        this.game = await this.getGame()

        await this.loadBets()

        if (this.game.status === Crash.START_TIMER) {
            this.startTimer()
        }

        if (this.game.status === Crash.START_CRASH) {
            this.startCrash()
        }

        this.history = await this.getHistory()
    }

    async startTimer() {
        if (this.configService.config.stop_crash || this.configService.config.stop_site) {
            setTimeout(() => {
                this.startTimer()
            }, 5000)
        } else {
            this.logger.debug('Старт таймера')

            this.appGateway.server.emit('crashStartTimer', {
                graph: this.graph
            })

            this.status = 'timer'
            this.time = this.configService.config.crash_time_to_start

            this.addBotBets()

            const timerToStart = setInterval(async () => {
                if (LoggerConstants.showCrashTimeToStart) this.logger.debug(`До старта: ${this.time.toFixed(2)} сек.`)

                if (this.time.toFixed(2) === '1.00') {
                    this.logger.debug(`Ставки закрыты`)
                    this.disableBets = true

                    this.game.multiplier = await this.generateMultiplier()
                    await this.crashRepository.save(this.game)
                }

                if (this.time.toFixed(2) === '0.00') {
                    this.startCrash()

                    clearInterval(timerToStart)

                    return
                }

                this.time -= 0.1
            }, 100)
        }
    }

    async addBotBets() {
        if (Number(this.configService.config.bots_max) === 0) {
            return
        }

        const randomNumberUsers = randomInt(Number(this.configService.config.bots_min), Number(this.configService.config.bots_max))

        if (randomNumberUsers === 0) {
            return
        }

        const bots = await this.userService.getRandomBots(randomNumberUsers)

        for (const bot of bots) {
            if (this.time <= 1.00 || this.game.status > 0) {
                continue
            }

            if (typeof this.bets[bot.steamId] !== 'undefined') {
                continue
            }

            const itemsRandomCount = randomInt(
                Number(this.configService.config.bots_min_items_in_bet), Number(this.configService.config.bots_max_items_in_bet)
            )

            if (itemsRandomCount === 0) {
                continue
            }

            const items = []
            let priceMax = randomFloat(parseFloat(this.configService.config.bots_min_bet), parseFloat(this.configService.config.bots_max_bet)),
                price = 0

            for (let i = 0; i < itemsRandomCount; i += 1) {
                if (priceMax > parseFloat(this.configService.config.bots_min_bet)) {
                    const item = await this.itemService.findByRandomSum(parseFloat(this.configService.config.bots_min_bet), priceMax)

                    if (item && ((item.price + price) <= parseFloat(this.configService.config.bots_max_bet))) {
                        items.push(item)
                        price += item.price
                        priceMax -= item.price
                    }
                }
            }

            setTimeout(async () => {
                const multiplier = randomFloat(1.01, 3.00)

                const bet = await this.crashBetRepository.create({
                    user_id: bot.id,
                    crash_id: this.game.id,
                    items: JSON.stringify(items),
                    items_length: items.length,
                    sum: price,
                    auto_withdraw: multiplier
                })

                if (!this.configService.config.bots_is_real) {
                    bet.is_fake = true
                }

                await this.crashBetRepository.save(bet)

                this.bets[bot.steamId] = await this.crashBetRepository.findOne({
                    relations: ['user'],
                    where: {
                        id: bet.id
                    }
                })

                this.game.bank += price
                this.game.skins += items.length
                this.game.users = await this.countUsersBets(this.bets)

                await this.crashRepository.save(this.game)

                if (typeof this.autoMultipliers[multiplier.toFixed(2)] === 'undefined') {
                    this.autoMultipliers[multiplier.toFixed(2)] = []
                }

                this.autoMultipliers[multiplier.toFixed(2)].push(bot.steamId)

                this.updateBets()

                this.logger.debug(`Новая фейк ставка от бота ${bot.username} (${bot.steamId}) на сумму ${price.toFixed(2)}$. Авто-вывод: ${multiplier.toFixed(2)}x`)
            }, randomInt(1, 4) * 1000)
        }
    }

    async startCrash() {
        this.logger.debug(`Старт игры до ${this.game.multiplier.toFixed(2)}x`)

        this.appGateway.server.emit('crashStart')

        this.status = 'crash'
        this.disableBets = false
        this.updateStatus(Crash.START_CRASH)

        let now_old = -1

        this.i = 0
        this.now = 1.00

        const timerGame = setInterval(async() => {
            this.i += 1
            this.now = parseFloat(String(Math.pow(Math.E, 0.00006 * this.i * 1000 / 20)))

            if (now_old.toFixed(2) !== this.now.toFixed(2)) {
                now_old = this.now

                if (this.now >= this.game.multiplier) {
                    clearInterval(timerGame)

                    this.logger.debug(`Игра окончена`)

                    this.status = 'crashed'
                    await this.updateStatus(Crash.END)
                    await this.crashBets()

                    this.appGateway.server.emit('crashEnd', {
                        multiplier: this.game.multiplier
                    })

                    setTimeout(async () => {
                        this.history = await this.getHistory()

                        this.game = await this.getGame()
                        this.now = 1.00
                        this.i = 0

                        this.graph = {
                            a: 0,
                            b: 0,
                            c: 0,
                            c_m: 0,
                            circle: 0,
                            circle_m: 0,
                            multipliers: [4.00, 3.00, 2.00, 1.00]
                        }

                        this.startTimer()
                    }, 3000)
                } else {
                    await this.generateGraph()

                    for (const [key] of Object.entries(this.autoMultipliers)) {
                        if (parseFloat(key) <= this.now) {
                            if (typeof this.autoMultipliers[key] !== 'undefined') {
                                this.withdrawAuto(key, this.autoMultipliers[key])
                            }
                        }
                    }

                    if (LoggerConstants.showCrashMultiplierPerTick) this.logger.debug(`Текущий коэффициент: ${this.now.toFixed(2)}x`)
                }
            }
        }, 50)
    }

    async crashBets() {
        let win = 0.00
        let fullWin = 0.00
        let lose = 0.00

        for (const steamId of Object.keys(this.bets)) {
            const bet = this.bets[steamId]

            if (this.bets[steamId].status === Crash.BET_IN_GAME) {
                this.bets[steamId].status = Crash.BET_LOSE
            }
            
            if (!this.bets[steamId].is_fake && this.bets[steamId].user.role !== 'youtuber') {
                if (this.bets[steamId].status === Crash.BET_WIN) {
                    win += (bet.win - bet.sum)
                    fullWin += bet.win
                }

                if (this.bets[steamId].status === Crash.BET_LOSE) {
                    lose += bet.sum
                }
            }
        }

        await this.crashBetRepository.createQueryBuilder()
            .where(`crash_id = ${this.game.id} AND status = ${Crash.BET_IN_GAME}`)
            .update({
                status: Crash.BET_LOSE
            })
            .execute()

        this.updateBets()

        this.game.profit = lose - win

        this.configService.config.profit += (((lose) * ((100 - this.configService.config.bank_percent) / 100)))
        this.configService.config.bank += ((lose * (this.configService.config.bank_percent) / 100) - fullWin)

        await this.configService.saveConfig(this.configService.config)

        await this.crashRepository.save(this.game)
    }

    async updateBets() {
        this.appGateway.server.emit('crashUpdateBets', {
            bets: Object.keys(this.bets).map((i) => {
                const bet = this.bets[i]

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
            }),
            skins: this.game.skins,
            members: this.game.users
        })
    }

    async getHistory(): Promise<any> {
        return await this.crashRepository.find({
            where: {
                status: Crash.END
            },
            order: {
                id: 'DESC',
            },
            take: 10
        })
    }

    async addBet(user: UserEntity, items: any, sum: number, multiplier: number): Promise<any> {
        if (typeof this.bets[user.steamId] !== 'undefined') {
            throw 'Вы уже сделали ставку в этой игре'
        }

        if (items.length > this.configService.config.crash_max_items_in_bet) {
            throw `Максимальное кол-во предметов в ставке: ${this.configService.config.crash_max_items_in_bet}`
        }

        items = items.map((item) => {
            return item.item
        })

        const bet = await this.crashBetRepository.create({
            user_id: user.id,
            crash_id: this.game.id,
            items: JSON.stringify(items),
            items_length: items.length,
            sum,
            auto_withdraw: multiplier
        })

        await this.crashBetRepository.save(bet)

        this.bets[user.steamId] = await this.crashBetRepository.findOne({
            relations: ['user'],
            where: {
                id: bet.id
            }
        })

        this.game.bank += sum
        this.game.skins += items.length
        this.game.users = await this.countUsersBets(this.bets)
        await this.crashRepository.save(this.game)

        user.max_enable_withdraw += sum * (this.configService.config.add_coef_withdraw / 100)
        await this.userService.update(user)

        if (typeof this.autoMultipliers[multiplier.toFixed(2)] === 'undefined') {
            this.autoMultipliers[multiplier.toFixed(2)] = []
        }

        this.autoMultipliers[multiplier.toFixed(2)].push(user.steamId)

        this.updateBets()

        this.logger.debug(`Новая ставка от пользователя ${user.username} (${user.steamId}) на сумму ${sum.toFixed(2)}$. Авто-вывод: ${multiplier}x`)

        return true
    }

    async withdrawAuto(multiplier: string, users: any) {
        if (typeof this.withdraws[multiplier] === 'undefined') {
            this.withdraws[multiplier] = 1

            delete this.autoMultipliers[multiplier]

            for (const steamId of users) {
                try {
                    this.withdrawBet(steamId, parseFloat(multiplier))
                    // eslint-disable-next-line no-empty
                } catch (e) {

                }
            }
        }
    }

    async withdrawBet(steamId: string, multiplier: number) {
        if ((this.game.status !== Crash.START_CRASH) || this.now <= 1.00) {
            throw 'Игра еще не началась или закончилась'
        }

        if (typeof this.bets[steamId] === 'undefined') {
            throw 'У Вас нет активной ставки'
        }

        const bet: CrashBetEntity = this.bets[steamId]

        if (bet.status !== Crash.BET_IN_GAME) {
            throw 'Вы уже вывели ставку'
        }

        const user = await this.userService.findBySteamId(steamId)

        const win = bet.sum * multiplier
        const winItem = await this.itemService.findBySum(win)
        const extBalance = win - winItem.price

        bet.status = Crash.BET_WIN
        bet.win = win
        bet.multiplier = multiplier
        bet.win_item = JSON.stringify(winItem)

        await this.crashBetRepository.save(bet)

        const bdBet = await this.crashBetRepository.findOne({
            relations: ['user'],
            where: {
                id: bet.id
            }
        })

        this.bets[user.steamId] = bdBet

        if (extBalance > 0) {
            user.balance += extBalance

            this.userService.update(user)
        }

        this.inventoryService.create({
            user_id: user.id,
            item_id: winItem.id,
            price: winItem.price
        })

        this.appGateway.server.emit('crashUpdateBet', {
            bet: {
                id: bdBet.id,
                user: {
                    id: bdBet.user.id,
                    username: bdBet.user.username,
                    steamid: bdBet.user.steamId
                },
                sum: bdBet.sum,
                multiplier: bdBet.multiplier,
                win: bdBet.win,
                status: bdBet.status,
                items: JSON.parse(bdBet.items),
                winItem: typeof bdBet.win_item === 'undefined' ? null : JSON.parse(bdBet.win_item),
                created_at: bdBet.created_at
            }
        })

        this.updateBets()

        this.logger.debug(`Пользователь ${user.username} (${user.steamId}) вывел ${win.toFixed(2)}$, коэффициент: ${multiplier.toFixed(2)}x`)

        return true
    }

    async loadBets() {
        const bets = await this.crashBetRepository.find({
            relations: ['user'],
            where: {
                crash_id: this.game.id
            }
        })

        bets.map((bet) => {
            this.bets[bet.user.steamId] = bet

            if (bet.status === Crash.BET_IN_GAME) {
                if (typeof this.autoMultipliers[bet.auto_withdraw.toFixed(2)] === 'undefined') {
                    this.autoMultipliers[bet.auto_withdraw.toFixed(2)] = []
                }

                this.autoMultipliers[bet.auto_withdraw.toFixed(2)].push(bet.user.steamId)
            }
        })
    }

    async getHistoryGameById(gameId: number): Promise<any> {
        const game = await this.crashRepository.findOne(gameId)

        if (!game) {
            throw 'Игра не найдена'
        }

        const bets = await this.crashBetRepository.find({
            relations: ['user'],
            where: {
                crash_id: gameId
            }
        })

        return {
            game: {
                id: game.id,
                skins: game.skins,
                members: game.users,
                multiplier: game.multiplier
            },
            bets: Object.keys(bets).map((i) => {
                const bet = bets[i]

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

    async getGame(): Promise<CrashEntity> {
        let game = await this.crashRepository.findOne({
            order: {
                id: 'DESC'
            }
        })

        if (!game || game.status === Crash.END) {
            game = await this.newGame()
        }

        this.logger.setContext(`Краш #${game.id}`)

        return game
    }

    async newGame(): Promise<CrashEntity> {
        const game = await this.crashRepository.create()

        this.bets = []
        this.autoMultipliers = []
        this.withdraws = []

        return await this.crashRepository.save(game)
    }

    async updateStatus(status: number) {
        this.game.status = status

        this.crashRepository.save(this.game)
    }

    async generateMultiplier(): Promise<number> {
        let bank = 0.00

        for (const id of Object.keys(this.bets)) {
            const bet = this.bets[id]

            if (!bet.is_fake && bet.user.role !== 'youtuber') {
                bank += bet.sum
            }
        }

        let multiplier

        if (bank > this.configService.config.bank) {
            multiplier = 1.00
        } else if (bank > 0) {
            const winSum = randomFloat(0, this.configService.config.bank)

            let max = (bank + winSum) / bank

            if (max < 1) {
                max += 1
            }

            if (max >= 100.00) {
                max = 99.99
            }

            multiplier = randomFloat(1.00, max)
        } else {
            multiplier = randomFloat(1.00, 2.5)
        }

        return multiplier
    }

    async getProfit(): Promise<number> {
        return this.configService.config.profit
    }

    async getProfitByUserId(userId: number): Promise<number> {
        const queryBuilder = await this.crashBetRepository.createQueryBuilder()
            .select('SUM(sum) AS bet, SUM(win) AS win')
            .where(`user_id = ${userId}`)
            .getRawOne()

        const bet = queryBuilder.bet === null ? 0 : queryBuilder.bet
        const win = queryBuilder.win === null ? 0 : queryBuilder.win

        return win - bet
    }

    async getBetsByUserId(userId: number, data): Promise<CrashBetEntity[]> {
        const queryBuilder = this.crashBetRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `user_id = ${userId} AND (crash_id LIKE '%${data.searchValue}%' OR multiplier LIKE '%${data.searchValue}%' OR auto_withdraw LIKE '%${data.searchValue}%'`
            + ` OR win LIKE '%${data.searchValue}%')`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getAllBetsByUserId(userId: number): Promise<CrashBetEntity[]> {
        return await this.crashBetRepository.find({
            where: {
                user_id: userId
            },
            order: {
                id: 'DESC'
            },
            take: 30
        })
    }

    async getCountBetsByUserId(userId: number) {
        const sum = await this.crashBetRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`user_id = ${userId}`)
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async deleteAllBetsByUserId(userId: number) {
        return await this.crashBetRepository.delete({
            user_id: userId
        })
    }

    async generateGraph() {
        /** Формула расчета на примере
         * (55.016 / 13500 * 50) = 0.2037629625
         */

        if (this.graph.circle < 143.281) {
            if (this.now > 3) {
                this.graph.circle += 0.53067037
            } else {
                this.graph.circle += 0.477603333
            }
        }

        if (this.graph.a < 55.016) {
            if (this.now > 3) {
                this.graph.a += 0.2037629625 // 13500
            } else {
                this.graph.a += 0.1833866665 // 15000
            }
        }

        if (this.graph.b < 128.370666667) {
            if (this.now > 3) {
                this.graph.b += 0.4754469135
            } else {
                this.graph.b += 0.427902222
            }
        }

        if (this.graph.c < 143) {
            if (this.now > 3) {
                this.graph.c += 0.5296296295
            } else {
                this.graph.c += 0.4766666665
            }
        }

        if (this.graph.c_m < 156.476666621) {
            if (this.now > 3) {
                this.graph.c_m += 0.5588452375 // 14000
            } else {
                this.graph.c_m += 0.4766666665
            }
        }

        if (this.graph.circle_m < 143.281) {
            if (this.now > 3) {
                this.graph.circle_m += 0.511717857 // 14000
            } else {
                this.graph.circle_m += 0.447753125 // 16000
            }
        }

        if (this.now > this.graph.multipliers[0]) {
            this.graph.multipliers.pop()
            this.graph.multipliers.unshift(parseFloat(this.now.toFixed(0)) + 2)
        }
    }

    async countUsersBets(bets: any): Promise<number> {
        const existsBets = {}
        let users = 0

        for (const id of Object.keys(bets)) {
            if (typeof existsBets[id] === 'undefined') {
                existsBets[id] = bets[id]
                users += 1
            }
        }

        return users
    }

    async getCountWinBetsByUserId(userId: number): Promise<number> {
        const sum = await this.crashBetRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`user_id = ${userId} AND status = 1`)
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }
}
