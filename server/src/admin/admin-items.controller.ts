import {Body, Controller, Get, Param, Post, Query, UseGuards} from "@nestjs/common"
import {ItemService} from "../item/item.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {AdminOrModeratorGuard} from "../guards/admin-or-moderator.guard"
import {Utils} from "../utils"

@Controller('admin/items')
export class AdminItemsController {
    constructor(
        private itemService: ItemService,
        private utils: Utils
    ) {
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get()
    async getItems(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const items = await this.itemService.getAllItems(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const itemsAll = await this.itemService.getCountItems()

        return {
            draw,
            data: items,
            recordsTotal: itemsAll,
            recordsFiltered: itemsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get(':id')
    async getItem(@Param('id') id): Promise<any> {
        return await this.itemService.findById(id)
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post(':id/save')
    async saveItem(@Param('id') id, @Body() body): Promise<any> {
        const item = await this.itemService.findById(id)
        item.price = body.price

        return await this.itemService.saveItem(item)
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('prices/refresh')
    async refreshPrices(): Promise<any> {
        this.itemService.plannedUpdatePrices = true

        return {
            success: true
        }
    }
}