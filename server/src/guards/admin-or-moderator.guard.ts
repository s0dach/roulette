import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import {Observable} from "rxjs"

@Injectable()
export class AdminOrModeratorGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()

        return req.user.role === 'admin' || req.user.role === 'moderator'
    }
}
