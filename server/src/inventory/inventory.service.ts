import {forwardRef, Inject, Injectable} from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {InventoryEntity} from "../entities/inventory.entity"
import {Raw, Repository} from "typeorm"
import {CreateInventoryDto} from "./dto/create-inventory.dto"
import {RedisClientService} from "../redis-client/redis-client.service"
import {UserEntity} from "../entities/user.entity"
import {MarketCsgoService} from "../market-csgo/market-csgo.service"
import {WithdrawEntity} from "../entities/withdraw.entity"
import {Cron, CronExpression} from "@nestjs/schedule"
import datef from 'datef'
import {UserService} from "../user/user.service"
import {ConfigService} from "../config/config.service"

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(InventoryEntity)
        private readonly inventoryRepository: Repository<InventoryEntity>,
        private readonly redisClientService: RedisClientService,
        private readonly marketCsgoService: MarketCsgoService,
        @InjectRepository(WithdrawEntity)
        private readonly withdrawRepository: Repository<WithdrawEntity>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {

    }

    async findById(inventoryId: number): Promise<InventoryEntity> {
        return await this.inventoryRepository.findOne({
            relations: ['user', 'item'],
            where: {
                id: inventoryId,
                status: 0
            }
        })
    }

    async delete(inventoryId: number) {
        const inventoryItem = await this.inventoryRepository.findOne(inventoryId)
        const user = await this.userService.findById(inventoryItem.user_id)

        user.inventory -= inventoryItem.price
        await this.userService.update(user)

        await this.inventoryRepository.delete(inventoryId)

        await this.redisClientService.delData(`inventory_${inventoryItem.user_id}`)

        await this.findAllByUserId(inventoryItem.user_id)
    }

    async create(inventoryDto: CreateInventoryDto): Promise<InventoryEntity> {
        let inventoryItem = this.inventoryRepository.create({
            item_id: inventoryDto.item_id,
            user_id: inventoryDto.user_id,
            price: inventoryDto.price
        })

        inventoryItem = await this.inventoryRepository.save(inventoryItem)

        await this.redisClientService.delData(`inventory_${inventoryDto.user_id}`)

        await this.findAllByUserId(inventoryDto.user_id)

        const user = await this.userService.findById(inventoryDto.user_id)

        user.inventory += inventoryItem.price
        await this.userService.update(user)

        if (user.is_fake) {
            await this.clearInventory(user)
        }

        return inventoryItem
    }

    async findAllByUserId(userId: number): Promise<InventoryEntity[]> {
        let inventory = await this.redisClientService.getData(`inventory_${userId}`)

        if (inventory) {
            return inventory
        } else {
            inventory = await this.inventoryRepository.find({
                relations: ['item'],
                where: {
                    user_id: userId,
                    status: 0
                }
            })

            await this.redisClientService.setData(`inventory_${userId}`, inventory)

            return inventory
        }
    }

    async withdrawItem(user: UserEntity, inventoryItem: InventoryEntity) {
        const withdraw = await this.withdrawRepository.save(
            this.withdrawRepository.create({
                user_id: user.id,
                item_id: inventoryItem.item_id
            })
        )

        try {
            inventoryItem.status = 1
            await this.updateItem(inventoryItem, user)

            const marketItem = await this.marketCsgoService.searchItemByHashName(inventoryItem.item)

            const price = (marketItem.price / 100) / this.configService.config.dollar_rate
            withdraw.price = price

            if ((inventoryItem.item.price * this.configService.config.max_buy_percent) < price) {
                throw 'Завышенный ценник на покупку'
            }

            const buyItem = await this.marketCsgoService.buyItem(marketItem, user)

            withdraw.custom_id = buyItem.custom_id
            await this.withdrawRepository.save(withdraw)

            await this.delete(inventoryItem.id)

            return true
        } catch (e) {
            withdraw.status = 2
            withdraw.error_msg = e
            await this.withdrawRepository.save(withdraw)

            inventoryItem.status = 0
            await this.updateItem(inventoryItem, user)
            
            throw 'Предмет не найден в магазине'
        }
    }

    async updateItem(inventoryItem: InventoryEntity, user: UserEntity) {
        await this.inventoryRepository.save(inventoryItem)

        await this.redisClientService.delData(`inventory_${user.id}`)

        await this.findAllByUserId(user.id)
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async getStatusMarket() {
        const withdraws = await this.withdrawRepository.find({
            where: {
                status: 0,
                custom_id: Raw(alias => `${alias} IS NOT NULL`)
            }
        })

        const customIds = []

        for (const withdraw of withdraws) {
            customIds.push(withdraw.custom_id)
        }

        const trades = await this.marketCsgoService.getTradeByCustomIds(customIds)

        for (const customId in trades) {
            const trade = trades[customId]
            const withdraw = await this.withdrawRepository.findOne({
                relations: ['item', 'user'],
                where: {
                    custom_id: customId
                }
            })

            if (withdraw) {
                if (trade.stage === '2') {
                    withdraw.status = 1
                    await this.withdrawRepository.save(withdraw)

                    withdraw.user.withdraw += withdraw.price
                    await this.userService.update(withdraw.user)
                }
                if (trade.stage === '5') {
                    withdraw.status = 2
                    withdraw.error_msg = 'Отменен/не отправлен'
                    await this.withdrawRepository.save(withdraw)

                    await this.create({
                        user_id: withdraw.user_id,
                        item_id: withdraw.item_id,
                        price: withdraw.item.price
                    })
                }
            }
        }
    }

    async getWithdrawStatistic() {
        const today = new Date()
        today.setHours(0,0,0,0)

        const d = new Date(),
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6:1),
            week = new Date(d.setDate(diff))

        week.setHours(0,0,0,0)

        const date = new Date(),
            month = new Date(date.getFullYear(), date.getMonth(), 1)

        month.setHours(0,0,0,0)

        return {
            daily: await this.getWithdrawStatisticByDate(today),
            weekly: await this.getWithdrawStatisticByDate(week),
            monthly: await this.getWithdrawStatisticByDate(month),
            all: await this.getWithdrawStatisticByDate(new Date(1))
        }
    }

    async getWithdrawStatisticByDate(date: Date): Promise<number> {
        const sum = await this.withdrawRepository.createQueryBuilder('withdraw')
            .select('SUM(price)', 'sum')
            .where(`status = 1 AND created_at >= :date`, {date})
            .getRawOne()

        return sum.sum === null ? 0.00 : sum.sum.toFixed(2)
    }

    async getLastWithdraws(limit = 20): Promise<any> {
        const withdraws = await this.withdrawRepository.find({
            relations: ['user', 'item'],
            where: {
                status: 1
            },
            order: {
                id: 'DESC'
            },
            take: limit
        })

        return withdraws.map((withdraw) => {
            return {
                id: withdraw.id,
                user: {
                    id: withdraw.user.id,
                    username: withdraw.user.username,
                    avatar: withdraw.user.avatar
                },
                item: {
                    id: withdraw.item.id,
                    market_hash_name: withdraw.item.market_hash_name
                },
                created_at: datef('HH:mm dd.MM.YYYY', withdraw.created_at)
            }
        })
    }

    async getWithdrawsByUserId(userId: number): Promise<any> {
        return await this.withdrawRepository.find({
            relations: ['item'],
            where: {
                user_id: userId
            },
            order: {
                id: 'DESC'
            }
        })
    }

    async getWithdrawByUserId(id: number): Promise<WithdrawEntity> {
        return await this.withdrawRepository.findOne({
            relations: ['item'],
            where: {
                id: id
            }
        })
    }

    async getWithdraws(data): Promise<WithdrawEntity[]> {
        const queryBuilder = this.withdrawRepository.createQueryBuilder('withdraw')
        queryBuilder.leftJoinAndSelect("withdraw.user", "user")
        queryBuilder.leftJoinAndSelect("withdraw.item", "item")
        queryBuilder.orderBy(`withdraw.${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `withdraw.user_id LIKE '%${data.searchValue}%' OR withdraw.item_id LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountWithdraws(): Promise<number> {
        const sum = await this.withdrawRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async saveWithdraw(withdraw: WithdrawEntity): Promise<WithdrawEntity> {
        return await this.withdrawRepository.save(withdraw)
    }

    async deleteInventoryByUserId(userId: number) {
        await this.redisClientService.delData(`inventory_${userId}`)

        return await this.inventoryRepository.delete({
            user_id: userId
        })
    }

    async clearInventory(user: UserEntity) {
        const sum = await this.inventoryRepository.createQueryBuilder()
            .where(`user_id = ${user.id}`)
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        const inventory = sum.cnt === null ? 0 : sum.cnt

        if (inventory > 50) {
            await this.deleteInventoryByUserId(user.id)
        }
    }
}
