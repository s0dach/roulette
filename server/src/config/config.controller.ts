import {Controller, Get} from '@nestjs/common'
import {ConfigService} from "./config.service"

@Controller('config')
export class ConfigController {
    constructor(private configService: ConfigService) {}

    @Get('')
    async getConfig(): Promise<any> {
        return {
            vk_question_url: this.configService.config.vk_question_url,
            vk_group: this.configService.config.vk_group,
            percent_referral: this.configService.config.percent_referral
        }
    }
}
