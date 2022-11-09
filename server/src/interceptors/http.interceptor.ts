import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common'
import {Observable, throwError} from 'rxjs'
import {catchError, map} from 'rxjs/operators'
import {LoggerConstants} from "../constants/logger"
import {InjectRepository} from "@nestjs/typeorm"
import {ApiLogEntity} from "../entities/api-log.entity"
import {Repository} from "typeorm"

@Injectable()
export class HttpInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP')

    constructor(
        @InjectRepository(ApiLogEntity)
        private apiLogRepository: Repository<ApiLogEntity>
    ) {

    }

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const {user, ip, originalUrl, body, query, headers} = context.switchToHttp().getRequest()
        const {statusCode} = context.switchToHttp().getResponse()

        let req = null

        if (Object.keys(body).length === 0 && Object.keys(query).length > 0) {
            req = query
        } else if (Object.keys(body).length > 0 && Object.keys(query).length === 0) {
            req = body
        }

        return next.handle().pipe(
            map(data => {
                this.saveRequest(user, originalUrl, ip, statusCode, headers, req, data)
                return data
            }),
            catchError(err => {
                this.saveRequest(user, originalUrl, ip, statusCode, headers, req, err.message)
                return throwError(err)
            }),
        )
    }

    async saveRequest(user, url, ip, statusCode, headers, req, res) {
        const checkExistsUrl = LoggerConstants.saveAndShowRequestsUrls.some((element) => {
            return url.indexOf(element) > -1
        })

        if (!checkExistsUrl) {
            return
        }

        if (LoggerConstants.showApiRequests) {
            this.logger.log(
                `${url} ${statusCode} ${ip}`
            )
        }

        if (LoggerConstants.saveApiRequestsInDB) {
            const userId = typeof user === 'undefined' ? null : user.id

            await this.apiLogRepository.save(
                this.apiLogRepository.create({
                    user_id: userId,
                    url,
                    ip,
                    status_code: statusCode,
                    req: JSON.stringify(req),
                    res: JSON.stringify(res)
                })
            )
        }
    }
}
