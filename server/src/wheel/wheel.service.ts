import {Injectable, Logger} from '@nestjs/common'
import {Repository} from "typeorm"
import {InjectRepository} from "@nestjs/typeorm"
import {WheelEntity} from "../entities/wheel.entity"
import {WheelBetsEntity} from "../entities/wheel-bets.entity"
import {WHEEL_END, WHEEL_START_ROLL, WHEEL_START_TIMER} from "../constants/wheel"
import {LoggerConstants} from "../constants/logger"
import {reset, shuffle} from '../utils'
import randomInt from "random-int"
import {AppGateway} from "../app.gateway"
import {UserEntity} from "../entities/user.entity"
import {ItemService} from "../item/item.service"
import {InventoryService} from "../inventory/inventory.service"
import {UserService} from "../user/user.service"
import {ConfigService} from "../config/config.service"

@Injectable()
export class WheelService {
    public game: WheelEntity
    public bets: any
    public disableBets: boolean
    public history: any
    public time: number
    public ms: number
    public lastRotate: number

    constructor(
        @InjectRepository(WheelEntity)
        private wheelRepository: Repository<WheelEntity>,
        @InjectRepository(WheelBetsEntity)
        private wheelBetRepository: Repository<WheelBetsEntity>,
        private logger: Logger,
        private appGateway: AppGateway,
        private inventoryService: InventoryService,
        private itemService: ItemService,
        private userService: UserService,
        private configService: ConfigService
    ) {
        this.bets = []
        this.history = []
        this.disableBets = false
    }

    async onApplicationBootstrap() {
        this.game = await this.getGame()
        this.bets = await this.getBets()
        this.history = await this.getHistory()
        this.lastRotate = await this.getLastRotate()

        if (this.game.status === WHEEL_START_TIMER) {
            this.startTimer()
        }

        if (this.game.status === WHEEL_START_ROLL) {
            this.startRoll()
        }
    }

    async startTimer() {
        if (this.configService.config.stop_wheel || this.configService.config.stop_site) {
            setTimeout(() => {
                this.startTimer()
            }, 5000)
        } else {
            this.logger.debug('Старт таймера')

            this.time = 25

            this.appGateway.server.emit('wheelStartTimer', {
                success: true
            })

            const timerToStart = setInterval(async () => {
                if (LoggerConstants.showWheelTimeToStart) this.logger.debug(`До старта: ${this.time.toFixed(2)} сек.`)

                if (this.time.toFixed(2) === '1.00') {
                    this.logger.debug(`Ставки закрыты`)
                    this.disableBets = true

                    this.game.color = await this.generateColor()
                    this.game.status = WHEEL_START_ROLL
                    await this.wheelRepository.save(this.game)
                }

                if (this.time <= 0) {
                    this.time = 0.00
                    this.startRoll()

                    clearInterval(timerToStart)

                    return
                }

                this.time -= 0.1
            }, 100)
        }
    }

    async startRoll() {
        this.logger.debug('Старт колеса')

        const box = await this.getPosition(this.game.color)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const rotate = ((Math.floor(this.lastRotate / 360) * 360) + 360) + (360 * 2) + box[0]

        this.lastRotate = rotate

        this.game.rotate = rotate
        await this.wheelRepository.save(this.game)

        this.ms = 9

        this.appGateway.server.emit('wheelStartRoll', {
            rotate,
            ms: this.ms
        })

        const ngTimer = setInterval(() => {
            this.ms -= 1

            if (this.ms === 0) {
                clearInterval(ngTimer)
            }
        }, 1000)

        setTimeout(async () => {
            this.game.status = WHEEL_END
            await this.wheelRepository.save(this.game)

            this.setWinner(this.game)

            this.game = await this.newGame()
            this.history = await this.getHistory()
            this.bets = await this.getBets()

            this.appGateway.server.emit('wheelNewGame', {
                rotate,
                history: this.history
            })

            this.startTimer()
        }, 11000)
    }

    async setWinner(game: WheelEntity) {
        const multipliers = {
            black: 2,
            red: 3,
            blue: 5,
            green: 50
        }

        const bets = await this.wheelBetRepository.find({
            relations: ['user'],
            where: {
                wheel_id: game.id,
                color: game.color
            }
        })

        const lose = await this.wheelBetRepository.createQueryBuilder()
            .where(`wheel_id = ${this.game.id} AND color <> '${game.color}'`)
            .select('SUM(sum)', 'cnt')
            .getRawOne()

        const loseSum = lose.cnt === null ? 0 : lose.cnt

        let winSum = 0

        bets.map(async (bet) => {
            const win = bet.sum * multipliers[game.color]

            winSum += (win - bet.sum)

            const winItem = await this.itemService.findBySum(win)
            const extBalance = win - winItem.price

            if (extBalance > 0) {
                bet.user.balance += extBalance

                this.userService.update(bet.user)
            }

            this.inventoryService.create({
                user_id: bet.user.id,
                item_id: winItem.id,
                price: winItem.price
            })

            bet.win_item = JSON.stringify(winItem)
            bet.win = win
            await this.wheelBetRepository.save(bet)
        })

        game.profit = loseSum - winSum
        this.wheelRepository.save(game)

        this.configService.config.profit_wheel += (((loseSum) * ((100 - this.configService.config.bank_percent_wheel) / 100)))
        this.configService.config.bank_wheel += ((loseSum * (this.configService.config.bank_percent_wheel) / 100) - winSum)

        this.configService.saveConfig(this.configService.config)
    }
    
    async addBet(user: UserEntity, items: any, sum: number, color: string) {
        const existBets = await this.wheelBetRepository.find({
            where: {
                wheel_id: this.game.id,
                user_id: user.id
            }
        })
        
        if (existBets.length === 2) {
            if (existBets[0].color !== color && existBets[1].color !== color) {
                throw 'Можно поставить только на 2 цвета'
            }
        }

        items = items.map((item) => {
            return item.item
        })

        const bet = await this.wheelBetRepository.create({
            user_id: user.id,
            wheel_id: this.game.id,
            items: JSON.stringify(items),
            items_length: items.length,
            sum,
            color
        })

        await this.wheelBetRepository.save(bet)

        this.game.bank += sum
        await this.wheelRepository.save(this.game)

        this.bets = await this.getBets()

        this.appGateway.server.emit('wheelNewBets', this.bets)

        this.logger.debug(`Новая ставка от пользователя ${user.username} (${user.steamId}) на сумму ${sum.toFixed(2)}$. Цвет: ${color}`)

        return true
    }

    async getLastRotate() {
        const lastGame = await this.wheelRepository.findOne({
            where: {
                status: WHEEL_END
            },
            order: {
                id: 'DESC'
            }
        })
        let lastRotate = 0

        if (lastGame) {
            lastRotate = lastGame.rotate
        }

        return lastRotate
    }

    async generateColor() {
        let color = []

        for (let i = 0; i < 40.9; i++) color.push('black')
        for (let i = 0; i < 32; i++) color.push('red')
        for (let i = 0; i < 27; i++) color.push('blue')
        for (let i = 0; i < 0.1; i++) color.push('green')

        color = shuffle(color)

        let winColor = color[randomInt(0, color.length - 1)]

        const bank = await this.getPriceByGameId(this.game.id)

        if (bank > this.configService.config.bank_wheel) {
            const multipliers = {
                black: 2,
                red: 3,
                blue: 5,
                green: 50
            }

            const prices = {
                black: await this.getPriceByColor(this.game.id, 'black'),
                red: await this.getPriceByColor(this.game.id, 'red'),
                blue: await this.getPriceByColor(this.game.id, 'blue'),
                green: await this.getPriceByColor(this.game.id, 'green')
            }

            let pricesList = []
            const colors = ['black', 'red', 'blue']

            colors.map((color) => {
                pricesList.push({
                    color,
                    value: prices[color] * multipliers[color]
                })
            })

            pricesList = shuffle(pricesList)

            pricesList.sort((a, b) => {
                return a['value'] - b['value']
            })

            winColor = reset(pricesList)['color']
        }

        return winColor
    }

    async getPosition(color) {
        const list = [
            [0, 'green', 50],
            [6.5, 'blue', 5],
            [60.3, 'blue', 5],
            [73.7, 'blue', 5],
            [126.9, 'blue', 5],
            [140.2, 'blue', 5],
            [219.5, 'blue', 5],
            [232.7, 'blue', 5],
            [285.9, 'blue', 5],
            [299.3, 'blue', 5],
            [352.9, 'blue', 5],
            [19.7, 'red', 3],
            [32.9, 'red', 3],
            [46.3, 'red', 3],
            [86.5, 'red', 3],
            [99.7, 'red', 3],
            [113.2, 'red', 3],
            [153.1, 'red', 3],
            [166.4, 'red', 3],
            [179.8, 'red', 3],
            [193.1, 'red', 3],
            [206.3, 'red', 3],
            [246.4, 'red', 3],
            [259.7, 'red', 3],
            [273.1, 'red', 3],
            [313, 'red', 3],
            [326.4, 'red', 3],
            [339.7, 'red', 3],
            [13.1, 'black', 2],
            [26.4, 'black', 2],
            [39.6, 'black', 2],
            [53.1, 'black', 2],
            [66.3, 'black', 2],
            [79.7, 'black', 2],
            [93.1, 'black', 2],
            [119.7, 'black', 2],
            [133.1, 'black', 2],
            [146.3, 'black', 2],
            [159.7, 'black', 2],
            [172.9, 'black', 2],
            [186.3, 'black', 2],
            [199.7, 'black', 2],
            [212.9, 'black', 2],
            [226.3, 'black', 2],
            [239.7, 'black', 2],
            [252.9, 'black', 2],
            [266.3, 'black', 2],
            [279.7, 'black', 2],
            [292.9, 'black', 2],
            [306.3, 'black', 2],
            [319.7, 'black', 2],
            [332.9, 'black', 2],
            [346.3, 'black', 2]
        ]

        let filter = list.filter(box => box[1] == color)
        filter = shuffle(filter)

        const c = filter[randomInt(0, filter.length - 1)]
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        c[0] = c[0] - 4

        return c
    }

    async getProfit() {
        const sum = await this.wheelRepository.createQueryBuilder()
            .select('SUM(profit)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getGame(): Promise<WheelEntity> {
        let game = await this.wheelRepository.findOne({
            order: {
                id: 'DESC'
            }
        })

        if (!game || game.status === WHEEL_END) {
            game = await this.newGame()
        }

        this.logger.setContext(`Колесо #${game.id}`)

        return game
    }

    async newGame(): Promise<WheelEntity> {
        const game = await this.wheelRepository.create()

        this.disableBets = false

        return await this.wheelRepository.save(game)
    }

    async getBets(): Promise<any> {
        const bets = {}

        bets['black'] = {
            users: await this.getCountBetsByColor(this.game.id, 'black'),
            price: await this.getPriceByColor(this.game.id, 'black'),
            bets: await this.getBetsByColor(this.game.id, 'black')
        }

        bets['red'] = {
            users: await this.getCountBetsByColor(this.game.id, 'red'),
            price: await this.getPriceByColor(this.game.id, 'red'),
            bets: await this.getBetsByColor(this.game.id, 'red')
        }

        bets['blue'] = {
            users: await this.getCountBetsByColor(this.game.id, 'blue'),
            price: await this.getPriceByColor(this.game.id, 'blue'),
            bets: await this.getBetsByColor(this.game.id, 'blue')
        }

        bets['green'] = {
            users: await this.getCountBetsByColor(this.game.id, 'green'),
            price: await this.getPriceByColor(this.game.id, 'green'),
            bets: await this.getBetsByColor(this.game.id, 'green')
        }

        return bets
    }

    async getPriceByColor(gameId: number, color: string) {
        const sum = await this.wheelBetRepository.createQueryBuilder()
            .where(`wheel_id = ${gameId} AND color = '${color}'`)
            .select('SUM(sum)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getPriceByGameId(gameId: number) {
        const sum = await this.wheelBetRepository.createQueryBuilder()
            .where(`wheel_id = ${gameId}`)
            .select('SUM(sum)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getCountBetsByColor(gameId: number, color: string) {
        const sum = await this.wheelBetRepository.createQueryBuilder()
            .where(`wheel_id = ${gameId} AND color = '${color}'`)
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getBetsByColor(gameId: number, color: string) {
        const bets = await this.wheelBetRepository.find({
            relations: ['user'],
            where: {
                wheel_id: gameId,
                color
            },
            order: {
                sum: 'DESC'
            }
        })

        return bets.map((bet) => {
            return {
                user: {
                    username: bet.user.username,
                    avatar: bet.user.avatar
                },
                sum: bet.sum
            }
        })
    }

    async getHistory(): Promise<any> {
        const games = await this.wheelRepository.find({
            where: {
                status: WHEEL_END
            },
            order: {
                id: 'DESC'
            },
            take: 12
        })

        const colors = []

        games.map((game) => {
            colors.push(game.color)
        })

        return colors
    }

    async getHistoryByUserId(userId: number): Promise<any> {
        const bets = await this.wheelBetRepository.find({
            where: {
                user_id: userId
            },
            order: {
                id: 'DESC'
            },
            take: 30
        })

        return bets.map(bet => {
            return {
                gameid: bet.wheel_id,
                items: JSON.parse(bet.items),
                bet: bet.sum,
                win: bet.win,
                win_item: typeof bet.win_item === 'undefined' ? null : JSON.parse(bet.win_item),
                created_at: bet.created_at
            }
        })
    }

    async getBetsByUserId(userId: number, data): Promise<WheelBetsEntity[]> {
        const queryBuilder = this.wheelBetRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `user_id = ${userId}`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountBetsByUserId(userId: number) {
        const sum = await this.wheelBetRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`user_id = ${userId}`)
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }
}
