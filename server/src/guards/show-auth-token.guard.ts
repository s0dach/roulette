import {Injectable, CanActivate, ExecutionContext, Logger} from '@nestjs/common'
import {Observable} from "rxjs"
import {InjectRepository} from "@nestjs/typeorm"
import {ApiLogEntity} from "../entities/api-log.entity"
import {Repository} from "typeorm"
import {LoggerConstants} from "../constants/logger"

@Injectable()
export class ShowAuthTokenGuard implements CanActivate {
    private readonly logger = new Logger('HTTP')

    constructor(
        @InjectRepository(ApiLogEntity)
        private apiLogRepository: Repository<ApiLogEntity>
    ) {
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const { user, headers, originalUrl } = context.switchToHttp().getRequest()

        if (LoggerConstants.showGetUserRequests && originalUrl === '/api/user/profile') {
            const userId = typeof user === "undefined" ? null : user.id

            if (typeof headers['authorization'] !== 'undefined') {
                this.logger.log(`${originalUrl}. Токен авторизации: ${headers['authorization']}. UserID: ${userId}`)
            } else {
                this.logger.log(`${originalUrl}. Токен авторизации не найден`)
            }
        }

        return true
    }
}