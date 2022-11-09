import {Injectable, Logger} from '@nestjs/common'
import {Raw, Repository} from "typeorm"
import {GiveawayEntity} from "../entities/giveaway.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {GiveawayBetEntity} from "../entities/giveaway-bet.entity"
import {UserEntity} from "../entities/user.entity"
import {Cron, CronExpression} from "@nestjs/schedule"
import {InventoryService} from "../inventory/inventory.service"
import datef from 'datef'

@Injectable()
export class GiveawayService {
    public giveaway: GiveawayEntity
    public lastGiveaways: GiveawayEntity[]

    constructor(
        @InjectRepository(GiveawayEntity)
        private giveawayRepository: Repository<GiveawayEntity>,
        @InjectRepository(GiveawayBetEntity)
        private giveawayBetRepository: Repository<GiveawayBetEntity>,
        private inventoryService: InventoryService,
        private logger: Logger
    ) {

    }

    async onApplicationBootstrap() {
        this.giveaway = await this.getActiveGiveaway()
        this.lastGiveaways = await this.getLastGiveaways()
    }

    async joinGiveaway(user: UserEntity) {
        if (await this.findBetByUserIdAndGiveawayId(user.id, this.giveaway.id)) {
            throw 'Вы уже участвуете в розыгрыше'
        }
        
        this.giveaway.users += 1
        await this.giveawayRepository.save(this.giveaway)

        await this.giveawayBetRepository.save(
            this.giveawayBetRepository.create({
                user_id: user.id,
                giveaway_id: this.giveaway.id
            })
        )

        this.logger.debug(`Пользователь ${user.username} (${user.steamId}) присоединился к розыгрышу`)

        return true
    }

    async getActiveGiveaway(): Promise<GiveawayEntity> {
        const giveaway = await this.giveawayRepository.findOne({
            relations: ['item'],
            where: {
                winner_id:  Raw(alias => `${alias} IS NULL`)
            },
            order: {
                id: 'ASC'
            }
        })

        if (giveaway) {
            this.logger.setContext(`Розыгрыш #${giveaway.id}`)

            this.logger.debug(`Разыгрывается ${giveaway.item.market_hash_name} (${giveaway.item.price.toFixed(2)}$).`
             + ` Пользователей: ${giveaway.users}. Дата окончания: ${datef('HH:mm dd.MM.YYYY', giveaway.end_time)}`)
        }

        return giveaway ?? null
    }

    async getGiveawayById(giveawayId: number): Promise<GiveawayEntity> {
        return await this.giveawayRepository.findOne({
            relations: ['item'],
            where: {
                id: giveawayId
            },
            order: {
                id: 'ASC'
            }
        })
    }

    async getLastGiveaways(): Promise<GiveawayEntity[]> {
        return await this.giveawayRepository.find({
            relations: ['item', 'winner'],
            where: {
                winner_id:  Raw(alias => `${alias} IS NOT NULL`)
            },
            order: {
                id: 'DESC'
            }
        })
    }
    
    async findBetByUserIdAndGiveawayId(userId: number, giveawayId: number): Promise<GiveawayBetEntity> {
        return await this.giveawayBetRepository.findOne({
            where: {
                user_id: userId,
                giveaway_id: giveawayId
            }
        })
    }

    async setWinner(giveawayId: number) {
        const giveaway = await this.giveawayRepository.findOne({
            relations: ['item'],
            where: {
                id: giveawayId
            }
        })

        const randomBet = await this.giveawayBetRepository.createQueryBuilder('bet')
            .innerJoinAndSelect("bet.user", "user")
            .orderBy('RAND()')
            .limit(1)
            .execute()

        const winnerBet = randomBet[0]

        giveaway.winner_id = winnerBet.bet_user_id
        await this.giveawayRepository.save(giveaway)

        await this.giveawayBetRepository.update(winnerBet.bet_id, {
            is_winner: true
        })

        await this.inventoryService.create({
            user_id: winnerBet.bet_user_id,
            item_id: giveaway.item.id,
            price: giveaway.item.price
        })

        this.logger.debug(`Победил пользователь ${winnerBet.user_username} (${winnerBet.user_steamId})`)

        this.giveaway = await this.getActiveGiveaway()
        this.lastGiveaways = await this.getLastGiveaways()

        return true
    }

    async getBetsInUserId(userId: number): Promise<GiveawayBetEntity[]> {
        return await this.giveawayBetRepository.find({
            relations: ['giveaway'],
            where: {
                user_id: userId
            }
        })
    }

    async getBetInId(id: number): Promise<GiveawayBetEntity> {
        return await this.giveawayBetRepository.findOne({
            relations: ['giveaway'],
            where: {
                id: id
            }
        })
    }

    async getBetsInGiveawayId(giveawayId: number): Promise<GiveawayBetEntity[]> {
        return await this.giveawayBetRepository.find({
            relations: ['giveaway', 'user'],
            where: {
                giveaway_id: giveawayId
            }
        })
    }

    async deleteUser(betId: number) {
        return await this.giveawayBetRepository.delete(betId)
    }

    async getGiveaways(data): Promise<GiveawayEntity[]> {
        const queryBuilder = this.giveawayRepository.createQueryBuilder('giveaway')
        queryBuilder.leftJoinAndSelect("giveaway.winner", "winner")
        queryBuilder.leftJoinAndSelect("giveaway.item", "item")
        queryBuilder.orderBy(`giveaway.${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `giveaway.id LIKE '%${data.searchValue}%' OR giveaway.item_id LIKE '%${data.searchValue}%' OR giveaway.winner_id LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllGiveaways() {
        const sum = await this.giveawayRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async deleteGiveaway(giveawayId: number) {
        return await this.giveawayRepository.delete(giveawayId)
    }

    async createGiveaway(data): Promise<GiveawayEntity> {
        return await this.giveawayRepository.save(
            this.giveawayRepository.create({
                item_id: data.item_id,
                end_time: data.end_time
            })
        )
    }

    async updateGiveaway(giveaway: GiveawayEntity): Promise<GiveawayEntity> {
        return await this.giveawayRepository.save(giveaway)
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async cronWinner() {
        if (this.giveaway && (new Date(this.giveaway.end_time) < new Date()) && this.giveaway.winner_id === null) {
            if (this.giveaway.users === 0) {
                this.giveaway.end_time = new Date(new Date().getTime() + 5 * 60000)
                this.giveaway = await this.giveawayRepository.save(this.giveaway)

                return
            }

            this.setWinner(this.giveaway.id)
        }
    }
}
