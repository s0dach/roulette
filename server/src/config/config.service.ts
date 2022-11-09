import { Injectable } from '@nestjs/common'
import {ConfigEntity} from "../entities/config.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {Repository} from "typeorm"
import randomInt from "random-int"

@Injectable()
export class ConfigService {
    public config: ConfigEntity
    public fakeOnline: number

    constructor(
        @InjectRepository(ConfigEntity)
        private configRepository: Repository<ConfigEntity>
    ) {
        this.getConfig()
            .then((config) => {
                this.config = config
            })

        this.fakeOnline = 0
    }

    async getConfig(): Promise<ConfigEntity> {
        let config = await this.configRepository.findOne(1)

        if (!config) {
            config = await this.configRepository.save(
                this.configRepository.create()
            )
        }

        return config
    }

    async onApplicationBootstrap() {
        setInterval(() => {
            this.fakeOnline = randomInt(15, 25)
        }, 60000)
    }

    async saveConfig(data: any) {
        if (Number(data.ban_withdraw_new_users) === 1 && Number(this.config.ban_withdraw_new_users) === 0) {
            data.ban_withdraw_new_users_date = new Date()
        } else {
            data.ban_withdraw_new_users_date = this.config.ban_withdraw_new_users_date
        }

        data.stop_site = Number(data.stop_site)
        data.stop_crash = Number(data.stop_crash)
        data.stop_coinflip = Number(data.stop_coinflip)
        data.stop_wheel = Number(data.stop_wheel)
        data.profit = Number(data.profit)
        data.bank = Number(data.bank)
        data.bank_percent = Number(data.bank_percent)
        data.profit_wheel = Number(data.profit_wheel)
        data.bank_wheel = Number(data.bank_wheel)
        data.bank_percent_wheel = Number(data.bank_percent_wheel)

        this.config = await this.configRepository.save(data)

        return true
    }
}
