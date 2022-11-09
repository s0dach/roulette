import {Controller, Get, HttpException, Param, Post, Query, UseGuards} from "@nestjs/common"
import {InventoryService} from "../inventory/inventory.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {AdminOrModeratorGuard} from "../guards/admin-or-moderator.guard"
import {Utils} from "../utils"

@Controller('admin/withdraws')
export class AdminWithdrawsController {
    constructor(
        private inventoryService: InventoryService,
        private utils: Utils
    ) {
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Get()
    async getWithdraws(@Query() query): Promise<any> {
        const { draw, row, length, columnName, columnSortOrder, searchValue } = await this.utils.parseDataTableQuery(query)

        const withdraws = await this.inventoryService.getWithdraws(
            {
                columnName,
                columnSortOrder,
                searchValue,
                row,
                length
            })

        const withdrawsAll = await this.inventoryService.getCountWithdraws()

        return {
            draw,
            data: withdraws,
            recordsTotal: withdrawsAll,
            recordsFiltered: withdrawsAll
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post(':id/return')
    async returnWithdraw(@Param('id') id) {
        const withdraw = await this.inventoryService.getWithdrawByUserId(id)

        if (!withdraw || withdraw.status !== 0) {
            throw new HttpException('Вывод не найден или уже отправлен', 400)
        }

        withdraw.status = 2
        withdraw.error_msg = 'Отменен администратором'
        await this.inventoryService.saveWithdraw(withdraw)

        await this.inventoryService.create({
            user_id: withdraw.user_id,
            item_id: withdraw.item_id,
            price: withdraw.item.price
        })

        return {
            success: true
        }
    }
}