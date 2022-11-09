import {Body, Controller, Get, Param, Post, Query, UseGuards} from "@nestjs/common"
import {GiveawayService} from "../giveaway/giveaway.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {AdminOrModeratorGuard} from "../guards/admin-or-moderator.guard"
import {Utils} from "../utils"

@Controller('admin/giveaways')
export class AdminGiveawaysController {
    constructor(
        private giveawayService: GiveawayService,
        private utils: Utils
    ) {
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get()
    async getGiveaways(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const giveaways = await this.giveawayService.getGiveaways(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const giveawaysAll = await this.giveawayService.getCountAllGiveaways()

        return {
            draw,
            data: giveaways,
            recordsTotal: giveawaysAll,
            recordsFiltered: giveawaysAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('/:id/del')
    async deleteGiveaway(@Param('id') id): Promise<any> {
        await this.giveawayService.deleteGiveaway(id)

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get('/:id/getUsers')
    async getUsers(@Param('id') id): Promise<any> {
        return await this.giveawayService.getBetsInGiveawayId(id)
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('/deleteUser/:id')
    async deleteUser(@Param('id') id): Promise<any> {
        const giveawayBet = await this.giveawayService.getBetInId(id)

        await this.giveawayService.deleteUser(id)

        giveawayBet.giveaway.users -= 1
        await this.giveawayService.updateGiveaway(giveawayBet.giveaway)

        if (this.giveawayService.giveaway && this.giveawayService.giveaway.id === giveawayBet.giveaway.id) {
            this.giveawayService.giveaway = await this.giveawayService.getGiveawayById(giveawayBet.giveaway_id)
        }

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('create')
    async createGiveaway(@Body() body): Promise<any> {
        await this.giveawayService.createGiveaway(body)

        if (!this.giveawayService.giveaway) {
            this.giveawayService.giveaway = await this.giveawayService.getActiveGiveaway()
        }

        return {
            success: true
        }
    }
}