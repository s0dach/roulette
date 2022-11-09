import { Injectable } from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {TicketEntity} from "../entities/ticket.entity"
import {Repository} from "typeorm"
import {UserEntity} from "../entities/user.entity"
import datef from 'datef'

@Injectable()
export class TicketService {
    constructor(
        @InjectRepository(TicketEntity)
        private ticketRepository: Repository<TicketEntity>
    ) {
    }

    async createTicket(user: UserEntity, subject: string, message: string): Promise<TicketEntity> {
        const messages = [
            {
                message,
                type: 'user',
                created_at: datef('HH:mm dd.MM.YYYY', new Date())
            }
        ]

        return await this.ticketRepository.save(
            this.ticketRepository.create({
                user_id: user.id,
                subject: subject,
                messages: JSON.stringify(messages)
            })
        )
    }

    async getTicketsByUserId(userId: number, limit = 10): Promise<TicketEntity[]> {
        return await this.ticketRepository.find({
            where: {
                user_id: userId
            },
            order: {
                is_closed: 'ASC',
                created_at: 'DESC'
            },
            take: limit
        })
    }

    async getOpenedTicketsByUserId(userId: number): Promise<number> {
        const sum = await this.ticketRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`user_id = ${userId} AND is_closed = 0`)
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getTicketById(id: number): Promise<TicketEntity> {
        return await this.ticketRepository.findOne({
            relations: ['user'],
            where: {
                id: id
            }
        })
    }

    async addMessageToTicket(ticket: TicketEntity, message: any): Promise<TicketEntity> {
        const messages = JSON.parse(ticket.messages)

        messages.push(message)

        if (message.type === 'admin') {
            ticket.last_message_is_admin = true
        } else {
            ticket.last_message_is_admin = false
        }

        ticket.messages = JSON.stringify(messages)

        return await this.ticketRepository.save(ticket)
    }

    async getTickets(data): Promise<TicketEntity[]> {
        const queryBuilder = this.ticketRepository.createQueryBuilder('ticket')
        queryBuilder.leftJoinAndSelect("ticket.user", "user")
        queryBuilder.orderBy(`ticket.${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `ticket.subject LIKE '%${data.searchValue}%' OR ticket.user_id LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountTickets(): Promise<number> {
        const sum = await this.ticketRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async updateTicket(ticket: TicketEntity): Promise<TicketEntity> {
        return await this.ticketRepository.save(ticket)
    }
}
