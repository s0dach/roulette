import {
    Body,
    CACHE_MANAGER,
    Controller,
    forwardRef,
    Get,
    HttpException,
    Inject,
    Post,
    Req,
    UseGuards
} from '@nestjs/common'
import {WheelService} from "./wheel.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {InventoryService} from "../inventory/inventory.service"
import {WHEEL_START_TIMER} from "../constants/wheel"

@Controller('wheel')
export class WheelController {
    constructor(
        private wheelService: WheelService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        @Inject(forwardRef(() => InventoryService))
        private readonly inventoryService: InventoryService
    ) {
    }
    
    @Get('')
    async getWheel() {
        return {
            game: {
                status: this.wheelService.game.status,
                rotate: this.wheelService.game.rotate,
                lastRotate: this.wheelService.lastRotate,
                time: this.wheelService.time,
                ms: this.wheelService.ms
            },
            history: this.wheelService.history,
            bets: this.wheelService.bets
        }
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('/setBet')
    async setBet(@Body() body, @Req() req) {
        if (typeof await this.cacheManager.get(`add_bet_wheel_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`add_bet_wheel_${req.user.id}`, 1, 5)

        if (this.wheelService.game.status !== WHEEL_START_TIMER || this.wheelService.disableBets) {
            throw new HttpException(`Игра уже началась`, 400)
        }

        const { ids, color } = body

        if (ids.length === 0) {
            throw new HttpException(`Вы не выбрали предметы`, 400)
        }

        if (color !== 'black' && color !== 'red' && color !== 'blue' && color !== 'green') {
            throw new HttpException(`Вы не выбрали цвет`, 400)
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
            await this.wheelService.addBet(req.user, myItems, myPrice, color)

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
