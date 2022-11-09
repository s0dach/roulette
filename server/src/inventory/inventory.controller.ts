import {
    Body,
    Controller,
    Req,
    HttpException,
    Post,
    UseGuards,
    Inject,
    CACHE_MANAGER,
    Get,
    forwardRef
} from '@nestjs/common'
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {BuyItemDto} from "./dto/buy-item.dto"
import {InventoryService} from "./inventory.service"
import {ItemService} from "../item/item.service"
import {UserService} from "../user/user.service"
import {InventoryEntity} from "../entities/inventory.entity"
import {WithdrawItemDto} from "./dto/withdraw-item-dto"
import {ConfigService} from "../config/config.service"
import {CrashService} from "../crash/crash.service"

@Controller('inventory')
export class InventoryController {
    constructor(
        private readonly inventoryService: InventoryService,
        private readonly itemService: ItemService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        private userService: UserService,
        private configService: ConfigService,
        @Inject(forwardRef(() => CrashService))
        private crashService: CrashService
    ) {

    }

    @UseGuards(JwtAuthGuard)
    @Post('/buy')
    async buy(@Body() data: BuyItemDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`buy_item_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`buy_item_${req.user.id}`, 1, 3)

        const bets = await this.crashService.getCountBetsByUserId(req.user.id)

        if (bets === 0) {
            throw new HttpException(`Для вывода Вам нужно сделать 1 ставку`, 400)
        }

        const myIds = data.my
        const ids = data.ids

        const buyItems = []
        const myItems = []

        let myPrice = 0.00
        let buyPrice = 0.00

        if (ids.length === 0) {
            throw new HttpException(`Вы не выбрали предметы`, 400)
        }

        for (const id of ids) {
            const item = await this.itemService.findById(id)

            if (!item) {
                throw new HttpException(`Одного из предметов нет в магазине`, 400)
            }

            buyItems.push(item)
            buyPrice += item.price
        }

        for (const id of myIds) {
            const inventory = await this.inventoryService.findById(id)

            if (!inventory || inventory.user_id !== req.user.id) {
                throw new HttpException(`Одного из предметов нет в инвентаре`, 400)
            }

            myItems.push(inventory.item)
            myPrice += inventory.item.price
        }

        const extBalance = (buyPrice - myPrice)

        if (extBalance > 0 && (req.user.balance < extBalance)) {
            throw new HttpException(`Не достаточно средств на балансе`, 400)
        }

        if (extBalance === 0 && (req.user.balance < buyPrice)) {
            throw new HttpException(`Не достаточно средств на балансе`, 400)
        }

        for (const id of myIds) {
            await this.inventoryService.delete(id)
        }

        for (const buyItem of buyItems) {
            await this.inventoryService.create({
                user_id: req.user.id,
                item_id: buyItem.id,
                price: buyItem.price
            })
        }

        const user = await this.userService.findById(req.user.id)

        user.balance = (user.balance - extBalance)
        await this.userService.update(user)

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async get(@Req() req): Promise<InventoryEntity[]> {
        return await this.inventoryService.findAllByUserId(req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/withdraw')
    async withdrawItem(@Body() data: WithdrawItemDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`withdraw_item_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`withdraw_item_${req.user.id}`, 1, 10)

        const inventoryItem = await this.inventoryService.findById(data.id)

        if (!inventoryItem || inventoryItem.user_id !== req.user.id) {
            throw new HttpException(`Данного предмета нет в инвентаре`, 400)
        }

        if (req.user.trade_url === null) {
            throw new HttpException(`Введите ссылку на обмен`, 400)
        }

        if (req.user.is_ban_withdraw) {
            throw new HttpException(`Вывод не доступен`, 400)
        }

        if (this.configService.config.ban_withdraw_all) {
            throw new HttpException(`Вывод не доступен`, 400)
        }

        if (this.configService.config.ban_withdraw_new_users
        && new Date(req.user.created_at) >= new Date(this.configService.config.ban_withdraw_new_users_date)) {
            throw new HttpException(`Вывод не доступен`, 400)
        }

        if (req.user.max_enable_withdraw < inventoryItem.price) {
            const sum = (inventoryItem.price - req.user.max_enable_withdraw) * (100 / this.configService.config.add_coef_withdraw)

            throw new HttpException(`Для вывода этого предмета Вам нужно поставить ${sum.toFixed(2)}$`, 400)
        }

        try {
            await this.inventoryService.withdrawItem(req.user, inventoryItem)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
