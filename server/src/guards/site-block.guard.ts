import {Injectable, CanActivate, ExecutionContext, HttpException} from '@nestjs/common'
import {Observable} from "rxjs"
import {ConfigService} from "../config/config.service"

@Injectable()
export class SiteBlockGuard implements CanActivate {
    constructor(
        private configService: ConfigService
    ) {
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const { originalUrl } = context.switchToHttp().getRequest()

        if (originalUrl.indexOf('admin') > -1 || originalUrl === '/api/user/profile') {
            return true
        }

        if (this.configService.config.stop_site) {
            throw new HttpException(this.configService.config.stop_site_msg, 400)
        }

        if (originalUrl.indexOf('crash') > -1 && this.configService.config.stop_crash) {
            throw new HttpException(this.configService.config.stop_crash_msg, 400)
        }

        if (originalUrl.indexOf('coinflip') > -1 && this.configService.config.stop_coinflip) {
            throw new HttpException(this.configService.config.stop_coinflip_msg, 400)
        }

        if (originalUrl.indexOf('wheel') > -1 && this.configService.config.stop_wheel) {
            throw new HttpException(this.configService.config.stop_wheel_msg, 400)
        }

        return true
    }
}
