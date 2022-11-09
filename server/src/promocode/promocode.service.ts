import {CACHE_MANAGER, HttpException, Inject, Injectable} from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {PromocodeEntity} from "../entities/promocode.entity"
import {Repository} from "typeorm"
import {PromocodeUseEntity} from "../entities/promocode-use.entity"
import {UserEntity} from "../entities/user.entity"
import {UserService} from "../user/user.service"
import {PaymentService} from "../payment/payment.service"
import {ConfigService} from "../config/config.service"

@Injectable()
export class PromocodeService {
    constructor(
        @InjectRepository(PromocodeEntity)
        private promocodeRepository: Repository<PromocodeEntity>,
        @InjectRepository(PromocodeUseEntity)
        private promocodeUseRepository: Repository<PromocodeUseEntity>,
        private userService: UserService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        private paymentService: PaymentService,
        private configService: ConfigService
    ) {}
    
    async usePromocode(user: UserEntity, code: string): Promise<any> {
        if (typeof await this.cacheManager.get(`use_promo_${user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`use_promo_${user.id}`, 1, 10)

        if (await this.paymentService.getPaymentSumByUserId(user.id) < this.configService.config.min_payment_to_promocode) {
            throw `Для использования промокода Вы должны пополнить баланс на ${this.configService.config.min_payment_to_promocode.toFixed(2)}$`
        }

        if (!await this.userService.getProfileVisibleSteam(user.steamId)) {
            throw 'Для использования промокода у Вас должен быть публичный профиль STEAM'
        }

        if (await this.userService.getSteamLevel(user.steamId) < 2) {
            throw 'Для использования промокода у Вас должен быть 2 уровень STEAM или выше'
        }

        if (await this.userService.getPlayTimeCSGO(user.steamId) < 30) {
            throw 'Для использования промокода у Вас должно быть как минимум 30 часов в CS:GO'
        }

        const promocode = await this.promocodeRepository.findOne({
            where: {
                name: code
            }
        })

        if (!promocode) {
            throw 'Промокод не найден'
        }

        if (promocode.end_time !== null && promocode.end_time < new Date()) {
            throw 'Промокод закончился'
        }

        const usedPromocode = await this.getCountUsedPromoByName(promocode.id)

        if (promocode.max !== null && Number(usedPromocode) >= promocode.max) {
            throw 'Промокод закончился'
        }

        const userUsedPromocode = await this.promocodeUseRepository.findOne({
            where: {
                promo_id: promocode.id,
                user_id: user.id
            }
        })

        if (userUsedPromocode) {
            throw 'Вы уже активировали этот промокод'
        }

        await this.promocodeUseRepository.save(
            await this.promocodeUseRepository.create({
                user_id: user.id,
                promo_id: promocode.id
            })
        )

        user.balance += promocode.sum
        await this.userService.update(user)

        return {
            sum: promocode.sum
        }
    }

    async getCountUsedPromoByName(promoId: number) {
        const usedPromocode = await this.promocodeUseRepository.createQueryBuilder()
            .where(`promo_id = ${promoId}`)
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return usedPromocode.cnt === null ? 0 : usedPromocode.cnt
    }

    async getPromocodes(data): Promise<any> {
        const queryBuilder = this.promocodeRepository.createQueryBuilder('')
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `name LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllPromocodes() {
        const sum = await this.promocodeRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async createPromocode(promocode: any) {
        return await this.promocodeRepository.save(
            this.promocodeRepository.create({
                name: promocode.name,
                sum: promocode.sum,
                max: promocode.max,
                end_time: promocode.end_time
            })
        )
    }

    async deletePromocode(promocodeId: number) {
        return await this.promocodeRepository.delete(promocodeId)
    }

    async getPromocodesByUserId(userId: number) {
        return await this.promocodeUseRepository.find({
            relations: ['promo'],
            where: {
                user_id: userId
            }
        })
    }
}
