import {Body, Controller, Get, HttpException, Param, Post, Query, UseGuards} from '@nestjs/common'
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {AdminOrModeratorGuard} from "../guards/admin-or-moderator.guard"
import {InventoryService} from "../inventory/inventory.service"
import {UserService} from "../user/user.service"
import {CrashService} from "../crash/crash.service"
import {ItemService} from "../item/item.service"
import {CoinflipService} from "../coinflip/coinflip.service"
import {GiveawayService} from "../giveaway/giveaway.service"
import {TicketService} from "../ticket/ticket.service"
import {Utils} from "../utils"
import {ChatService} from "../chat/chat.service"
import {PaymentService} from "../payment/payment.service"
import {PromocodeService} from "../promocode/promocode.service"
import {WheelService} from "../wheel/wheel.service"

@Controller('admin')
export class AdminController {
    constructor(
        private inventoryService: InventoryService,
        private userService: UserService,
        private crashService: CrashService,
        private itemService: ItemService,
        private coinFlipService: CoinflipService,
        private giveawayService: GiveawayService,
        private ticketService: TicketService,
        private chatService: ChatService,
        private utils: Utils,
        private paymentService: PaymentService,
        private promocodeService: PromocodeService,
        private wheelService: WheelService
    ) {
    }
    
    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('statistic')
    async getStatistic(): Promise<any> {
        return {
            statistic: {
                payments: await this.paymentService.getPaymentStatistic(),
                profit: await this.crashService.getProfit(),
                withdraws: await this.inventoryService.getWithdrawStatistic(),
                users: await this.userService.getRegistrationStatistic(),
                usersRegistrations: await this.userService.getLastRegistrations(),
                lastWithdraws: await this.inventoryService.getLastWithdraws(),
                lastPayments: await this.paymentService.getLastPayments(),
                profits: await this.coinFlipService.getProfitGames(),
                coinflips: await this.coinFlipService.getCountGames(),
                coinflip_profit: await this.coinFlipService.getProfitGames()
            }
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('users')
    async getUsers(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const users = await this.userService.getUsers(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const usersAll = await this.userService.getCountAllUsers()

        return {
            draw,
            data: users,
            recordsTotal: usersAll,
            recordsFiltered: usersAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('bots')
    async getFakeUsers(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const users = await this.userService.getFakeUsers(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const usersAll = await this.userService.getCountAllFakeUsers()

        return {
            draw,
            data: users,
            recordsTotal: usersAll,
            recordsFiltered: usersAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('bots/sendMessage')
    async sendMessage(@Body() body): Promise<any> {
        const { bot_id, message } = body

        try {
            await this.chatService.sendBotMessage(Number(bot_id), message)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('bots/messages')
    async getFakeMessages(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const users = await this.chatService.getFakeMessages(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const usersAll = await this.chatService.getCountAllFakeMessages()

        return {
            draw,
            data: users,
            recordsTotal: usersAll,
            recordsFiltered: usersAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('bots/messages/create')
    async createBotMessage(@Body() body): Promise<any> {
        const { message } = body

        try {
            await this.chatService.createFakeMessage(message)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('bots/messages/pause')
    async pauseMessages(@Body() body): Promise<any> {
        const { id, is_paused } = body

        try {
            await this.chatService.pauseMessage(id, is_paused)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('bots/messages/delete')
    async deleteBotMessage(@Body() body): Promise<any> {
        const { id } = body

        try {
            await this.chatService.deleteFakeMessage(id)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('bots/create')
    async createBot(@Body() body): Promise<any> {
        const { steamId } = body

        try {
            await this.userService.createBot(steamId)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('user/:id')
    async getUser(@Param('id') id): Promise<any> {
        const user = await this.userService.getUserByUserId(id)

        if (!user) {
            throw new HttpException('Пользователь не найден', 400)
        }

        const inventory = await this.inventoryService.findAllByUserId(user.id)
        let inventorySum = 0

        inventory.map((item) => {
            inventorySum += item.price
        })

        const info = {
            profit: await this.crashService.getProfitByUserId(user.id),
            inventory,
            inventorySum,
            withdraws: await this.inventoryService.getWithdrawsByUserId(user.id),
            giveaways: await this.giveawayService.getBetsInUserId(user.id),
            tickets: await this.ticketService.getTicketsByUserId(user.id),
            payments: await this.paymentService.getPaymentSumByUserId(user.id),
            paymentsArr: await this.paymentService.getPaymentsByUserId(user.id),
            promocodes: await this.promocodeService.getPromocodesByUserId(user.id)
        }

        return {
            user,
            info
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('user/:id')
    async saveUser(@Param('id') id, @Body() body): Promise<any> {
        const user = await this.userService.getUserByUserId(id)

        if (!user) {
            throw new HttpException('Пользователь не найден', 400)
        }

        await this.userService.updateByRandomData(user.id, body.user)

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('user/inventory/del/:id')
    async deleteInventoryItem(@Param('id') id): Promise<any> {
        await this.inventoryService.delete(id)

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('user/:id/getBets')
    async getUserBets(@Param('id') id, @Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const bets = await this.crashService.getBetsByUserId(id,
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const betsAll = await this.crashService.getCountBetsByUserId(id)

        return {
            draw,
            data: bets,
            recordsTotal: betsAll,
            recordsFiltered: betsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('user/:id/getWheelBets')
    async getWheelBets(@Param('id') id, @Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const bets = await this.wheelService.getBetsByUserId(id,
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const betsAll = await this.wheelService.getCountBetsByUserId(id)

        return {
            draw,
            data: bets,
            recordsTotal: betsAll,
            recordsFiltered: betsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('user/:id/getCoinFlipBets')
    async getCoinFlipBets(@Param('id') id, @Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const bets = await this.coinFlipService.getGamesByUserId(id,
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const betsAll = await this.coinFlipService.getCountGamesByUserId(id)

        return {
            draw,
            data: bets,
            recordsTotal: betsAll,
            recordsFiltered: betsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('findBots')
    async findBots(@Query() query): Promise<any> {
        const { search, page } = query

        let bots = await this.userService.findBots(search, page, 20)

        bots = bots.map((bot) => {
            return {
                id: bot.id,
                text: `${bot.username}`
            }
        })

        let more = true

        if (bots.length < 20) {
            more = false
        }

        return {
            results: bots,
            more
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('findItemsInInventory')
    async findItemsInInventory(@Query() query): Promise<any> {
        const { search, page } = query

        let items = await this.itemService.findItemsInInventory(search, page, 20)

        items = items.map((item) => {
            return {
                id: item.id,
                text: `${item.market_hash_name} (${item.price.toFixed(2)}$)`
            }
        })

        return {
            results: items,
            more: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('addItemToInventory')
    async addItemToInventory(@Body() body): Promise<any> {
        const { id, item_id } = body

        const user = await this.userService.getUserByUserId(id)

        if (!user) {
            throw new HttpException('Пользователь не найден', 400)
        }

        const item = await this.itemService.findById(item_id)

        if (!item) {
            throw new HttpException('Предмет не найден', 400)
        }

        await this.inventoryService.create({
            user_id: user.id,
            item_id: item.id,
            price: item.price
        })

        const inventory = await this.inventoryService.findAllByUserId(user.id)
        let inventorySum = 0

        inventory.map((item) => {
            inventorySum += item.price
        })

        return {
            inventory,
            inventorySum
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('payments')
    async getPayments(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const payments = await this.paymentService.getPayments(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const paymentsAll = await this.paymentService.getCountAllPayments()

        return {
            draw,
            data: payments,
            recordsTotal: paymentsAll,
            recordsFiltered: paymentsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('promocodes')
    async getPromocodes(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        let promocodes = await this.promocodeService.getPromocodes(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const promocodesAll = await this.promocodeService.getCountAllPromocodes()

        promocodes = await Promise.all(promocodes.map(async (promocode: any) => {
            promocode.used = Number(await this.promocodeService.getCountUsedPromoByName(promocode.id))

            return promocode
        }))

        return {
            draw,
            data: promocodes,
            recordsTotal: promocodesAll,
            recordsFiltered: promocodesAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('promocodes/create')
    async createPromocode(@Body() body): Promise<any> {
        try {
            await this.promocodeService.createPromocode(body.item)

            return true
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('promocodes/:id/del')
    async promocodeDelete(@Param('id') id): Promise<any> {
        try {
            await this.promocodeService.deletePromocode(id)

            return true
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }
}
