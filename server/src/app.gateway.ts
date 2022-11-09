import {WebSocketGateway, WebSocketServer} from '@nestjs/websockets'
import {Server, Socket} from "socket.io"
import {Constants} from "./constants"
import {ConfigService} from "./config/config.service"

@WebSocketGateway({ origin: Constants.frontend_url })
export class AppGateway {
    @WebSocketServer()
    server: Server
    realUsers: any

    constructor(
        private configService: ConfigService
    ) {
        this.realUsers = {}
    }

    handleDisconnect(client: Socket) {
        if (typeof this.realUsers[client.request.connection.remoteAddress] !== 'undefined') {
            delete this.realUsers[client.request.connection.remoteAddress]
        }

        this.updateOnline()
    }

    handleConnection(client: Socket) {
        if (typeof this.realUsers[client.request.connection.remoteAddress] === 'undefined') {
            this.realUsers[client.request.connection.remoteAddress] = 1
        }

        this.updateOnline()
    }

    updateOnline() {
        this.server.emit('online', Object.keys(this.realUsers).length + this.configService.fakeOnline)
    }
}
