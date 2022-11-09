import {Body, CACHE_MANAGER, Controller, Get, HttpException, Inject, Param, Post, Req, UseGuards} from '@nestjs/common'
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {CreateTicketDto} from "./dto/create-ticket.dto"
import {TicketService} from "./ticket.service"
import {SendMessageTicketDto} from "./dto/send-message-ticket.dto"
import datef from 'datef'
import {ConfigService} from "../config/config.service"

@Controller('ticket')
export class TicketController {
    constructor(
        private ticketService: TicketService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
        private configService: ConfigService
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async createTicket(@Body() data: CreateTicketDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`create_ticket_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`create_ticket_${req.user.id}`, 1, { ttl: this.configService.config.ticket_time_out })

        const openedTickets = await this.ticketService.getOpenedTicketsByUserId(req.user.id)

        if (openedTickets >= this.configService.config.ticket_limit) {
            throw new HttpException('У Вас есть незакрытые тикеты', 400)
        }

        try {
            await this.ticketService.createTicket(req.user, data.subject, data.message)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/tickets')
    async getUserTickets(@Req() req): Promise<any> {
        const tickets = await this.ticketService.getTicketsByUserId(req.user.id)

        return tickets.map((ticket) => {
            return {
                id: ticket.id,
                subject: ticket.subject,
                is_closed: ticket.is_closed,
                created_at: ticket.created_at
            }
        })
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getTicket(@Param('id') id, @Req() req): Promise<any> {
        const ticket = await this.ticketService.getTicketById(id)

        if (!ticket || ticket.user_id !== req.user.id) {
            throw new HttpException('Тикет не найден', 400)
        }

        return {
            id: ticket.id,
            subject: ticket.subject,
            messages: JSON.parse(ticket.messages),
            is_closed: ticket.is_closed,
            created_at: ticket.created_at,
            user: {
                username: ticket.user.username,
                avatar: ticket.user.avatar
            }
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/sendMessage')
    async sendMessage(@Body() data: SendMessageTicketDto, @Req() req): Promise<any> {
        const ticket = await this.ticketService.getTicketById(data.id)

        if (!ticket || ticket.user_id !== req.user.id) {
            throw new HttpException('Тикет не найден', 400)
        }

        if (ticket.is_closed) {
            throw new HttpException('Тикет закрыт', 400)
        }

        await this.ticketService.addMessageToTicket(ticket, {
            message: data.message,
            type: 'user',
            created_at: datef('HH:mm dd.MM.YYYY', new Date())
        })

        return {
            success: true
        }
    }
}
