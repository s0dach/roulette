import { Injectable } from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {PaymentEntity} from "../entities/payment.entity"
import {Repository} from "typeorm"
import {ConfigService} from "../config/config.service"
import {UserService} from "../user/user.service"
import {UserEntity} from "../entities/user.entity"
import crypto from 'crypto-js'
import {Utils} from "../utils"
import crypto_old from "crypto"
import axios from 'axios'
import datef from 'datef'

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(PaymentEntity)
        private paymentsRepository: Repository<PaymentEntity>,
        private configService: ConfigService,
        private userService: UserService,
        private utils: Utils
    ) {
    }

    async createPayment(user: UserEntity, sum: number, method: string) {
        if (method === 'skinsback') {
            return await this.createPaymentSkinsBack(user)
        }

        if (sum < this.configService.config.min_payment) {
            throw `Минимальная сумма пополнения - ${this.configService.config.min_payment}$.`
        }

        if (sum > this.configService.config.max_payment) {
            throw `Максимальная сумма пополнения - ${this.configService.config.max_payment}$.`
        }

        const payment = await this.paymentsRepository.save(
            this.paymentsRepository.create({
                sum,
                user_id: user.id
            })
        )

        sum = parseFloat((sum * this.configService.config.dollar_rate).toFixed(2))

        const sign =
            crypto.SHA256(`${payment.id}{up}RUB{up}Оплата{up}${sum}{up}${this.configService.config.unitpay_secret_key}`)

        return {
            url: `https://unitpay.money/pay/${this.configService.config.unitpay_public_key}/card?account=${payment.id}&desc=Оплата&sum=${sum}&currency=RUB&signature=${sign}&detectDevice=1`,
        }
    }

    async createPaymentSkinsBack(user: UserEntity) {
        const payment = await this.paymentsRepository.save(
            this.paymentsRepository.create({
                user_id: user.id
            })
        )

        const data = {
            shopid: this.configService.config.skins_back_id,
            order_id: payment.id,
            steam_id: user.steamId,
            trade_token: user.trade_url.split('token=')[1],
            currency: 'usd',
            method: 'create',
            sign: undefined

        }

        data.sign = await this.generateSignature(data)

        try {
            const req = await axios.post('https://skinsback.com/api.php', data)
            const response = req.data

            if (response.status === 'error') {
                throw 'Произошла ошибка при оформлении пополнения'
            }

            return {
                url: response.url
            }
        } catch (e) {
            throw 'Произошла ошибка при оформлении пополнения'
        }
    }

    async callbackPayment(query: any) {
        if (query.method.toLowerCase() === 'check') {
            return {
                result: {
                    message: 'OK'
                }
            }
        }

        if (query.method.toLowerCase() === 'pay') {
            const payment = await this.paymentsRepository.findOne({
                where: {
                    id: query.params['account'],
                    status: 0
                }
            })

            if (!payment) {
                return {
                    error: {
                        message: 'Payment not found'
                    }
                }
            }

            const params = await this.utils.ksort(query.params)

            const array = []

            for (const property in params) {
                if (property != 'signature') {
                    array.push(params[property])
                }
            }

            const sign = crypto.SHA256(`${query.method}{up}${array.join('{up}')}{up}${this.configService.config.unitpay_secret_key}`).toString()

            if (sign !== query.params['signature']) {
                return {
                    error: {
                        message: 'Error sign'
                    }
                }
            }

            const user = await this.userService.findById(payment.user_id)

            if (!user) {
                return {
                    error: {
                        message: 'User not found'
                    }
                }
            }

            payment.status = 1
            await this.paymentsRepository.save(payment)

            user.balance += payment.sum
            user.payment += payment.sum
            await this.userService.update(user)

            if (user.referral_use !== null) {
                const referralUser = await this.userService.getUserByReferralCode(user.referral_use)

                if (referralUser) {
                    const bonus = payment.sum * (this.configService.config.percent_referral / 100)

                    referralUser.balance += bonus
                    referralUser.referral_sum += bonus
                    await this.userService.update(referralUser)
                }
            }

            return {
                result: {
                    message: 'OK'
                }
            }
        }
    }

    async callbackSkinsbackPayment(body: any) {
        if (body.status !== 'success') {
            throw 'Payment not ok'
        }

        const payment = await this.paymentsRepository.findOne({
            where: {
                id: body.order_id,
                status: 0
            }
        })

        if (!payment) {
            throw 'Payment not found'
        }

        const user = await this.userService.findById(payment.user_id)

        if (!user) {
            throw 'User not found'
        }

        payment.status = 1
        payment.sum = parseFloat(body.amount)
        payment.method = 'SkinsBack'
        await this.paymentsRepository.save(payment)

        user.balance += parseFloat(body.amount)
        user.payment += parseFloat(body.amount)
        await this.userService.update(user)

        if (user.referral_use !== null) {
            const referralUser = await this.userService.getUserByReferralCode(user.referral_use)

            if (referralUser) {
                const bonus = parseFloat(body.amount) * (this.configService.config.percent_referral / 100)

                referralUser.balance += bonus
                referralUser.referral_sum += bonus
                await this.userService.update(referralUser)
            }
        }

        return {
            result: {
                message: 'OK'
            }
        }
    }

    async getPaymentStatistic() {
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
            daily: await this.getPaymentStatisticByDate(today),
            weekly: await this.getPaymentStatisticByDate(week),
            monthly: await this.getPaymentStatisticByDate(month),
            all: await this.getPaymentStatisticByDate(new Date(1))
        }
    }

    async getPaymentStatisticByDate(date: Date): Promise<number> {
        const sum = await this.paymentsRepository.createQueryBuilder('withdraw')
            .select('SUM(sum)', 'sum')
            .where(`status = 1 AND created_at >= :date`, {date})
            .getRawOne()

        return sum.sum === null ? 0.00 : sum.sum.toFixed(2)
    }

    async getPayments(data): Promise<PaymentEntity[]> {
        const queryBuilder = this.paymentsRepository.createQueryBuilder('payment')
        queryBuilder.innerJoinAndSelect("payment.user", "user")
        queryBuilder.orderBy(`payment.${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `payment.status = 1 AND (payment.user_id LIKE '%${data.searchValue}%' OR payment.sum LIKE '%${data.searchValue}%')`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllPayments() {
        const sum = await this.paymentsRepository.createQueryBuilder()
            .where('status = 1')
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getPaymentSumByUserId(userId: number) {
        const sum = await this.paymentsRepository.createQueryBuilder()
            .where(`status = 1 AND user_id = ${userId}`)
            .select('SUM(sum)', 'sum')
            .getRawOne()

        return sum.sum === null ? 0 : sum.sum
    }

    async getPaymentsByUserId(userId: number): Promise<PaymentEntity[]> {
        return await this.paymentsRepository.find({
            where: {
                user_id: userId,
                status: 1
            }
        })
    }

    async getLastPayments(limit = 20) {
        const payments = await this.paymentsRepository.find({
            relations: ['user'],
            where: {
                status: 1
            },
            order: {
                id: 'DESC'
            },
            take: limit
        })

        return payments.map((payment) => {
            return {
                id: payment.id,
                user_id: payment.user.id,
                username: payment.user.username,
                avatar: payment.user.avatar,
                sum: payment.sum,
                created_at: datef('HH:mm dd.MM.YYYY', payment.user.created_at)
            }
        })
    }

    async generateSignature(params) {
        let paramsString = ''

        Object.keys(params).sort().forEach((key) => {
            if (key === 'sign') return
            if (typeof params[key] === 'object') return
            paramsString += `${key}:${params[key]};`
        })

        paramsString = crypto_old.createHmac('sha1', this.configService.config.skins_back_secret_key).update(paramsString).digest('hex')
        return paramsString
    }
}
