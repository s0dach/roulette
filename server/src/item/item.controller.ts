import {CacheInterceptor, Controller, Get, Query, Req, UseGuards, UseInterceptors} from '@nestjs/common'
import {ItemService} from "./item.service"
import {GetItemsDto} from "./dto/get-items.dto"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"

@Controller('item')
@UseInterceptors(CacheInterceptor)
export class ItemController {
    constructor(
        private itemService: ItemService
    ) {
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    async getItems(@Query() data: GetItemsDto, @Req() req) {
        const { page, sort, market_hash_name, min_price, max_price, selectedPrice } = data

        return await this.itemService.getItems(page, sort, market_hash_name, min_price, max_price, selectedPrice, req.user)
    }
}
