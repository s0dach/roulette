import { Injectable } from '@nestjs/common'
import date from 'date-and-time'
import {RedisClientService} from "../redis-client/redis-client.service"
import {UserEntity} from "../entities/user.entity"
import {InjectRepository} from "@nestjs/typeorm"
import {BotMessageEntity} from "../entities/bot-message.entity"
import {Repository} from "typeorm"
import randomInt from "random-int"
import {ConfigService} from "../config/config.service"
import {UserService} from "../user/user.service"
import {AppGateway} from "../app.gateway"

@Injectable()
export class ChatService {
    public chat: any

    constructor(
        private redisClientService: RedisClientService,
        @InjectRepository(BotMessageEntity)
        private botMessageRepository: Repository<BotMessageEntity>,
        private configService: ConfigService,
        private userService: UserService,
        private appGateway: AppGateway
    ) {
    }

    async onApplicationBootstrap() {
        this.chat = await this.getMessages()

        this.sendFakeMessages()
    }

    async getMessages() {
        const data = await this.redisClientService.lrange('chat', 0, -1)
        const messages = []
        let i = 0

        for (const chat of data.reverse()) {
            if (i === 20) break

            messages.unshift(JSON.parse(chat))
            i += 1
        }

        return messages
    }

    async addMessage(user: UserEntity, message: string) {
        const msg = {
            id: Math.random().toString(36).substring(2, 15)
                + Math.random().toString(36).substring(2, 15),
            user: {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                steamId: user.steamId,
                role: user.role
            },
            message: message,
            date: date.format(new Date(), 'HH:mm:ss')
        }

        this.redisClientService.rpush('chat', msg)
        this.chat.push(msg)

        this.appGateway.server.emit('chatNewMessage', msg)

        if (this.chat.length > 20) {
            this.chat.splice(0, 1)
        }
    }

    async deleteMessage(id: string) {
        for (const message of this.chat) {
            if (message.id === id) {
                await this.redisClientService.lrem('chat', -1, message)

                const index = this.chat.findIndex(x => x.id === id)

                if (index > -1) {
                    this.chat.splice(index, 1)

                    this.appGateway.server.emit('chatDeleteMessage', id)
                }

                return true
            }
        }

        throw 'Сообщение не найдено'
    }

    async clearChat() {
        this.redisClientService.delData('chat')

        this.appGateway.server.emit('chatClear')
    }

    async getFakeMessages(data): Promise<BotMessageEntity[]> {
        const queryBuilder = this.botMessageRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `message LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllFakeMessages() {
        const sum = await this.botMessageRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async createFakeMessage(message): Promise<BotMessageEntity> {
        return await this.botMessageRepository.save(
            this.botMessageRepository.create({
                message
            })
        )
    }

    async deleteFakeMessage(id) {
        return await this.botMessageRepository.delete(id)
    }

    async sendFakeMessages() {
        if (Number(this.configService.config.bots_fake_message_max_sec) === 0) {
            setTimeout(() => {
                return this.sendFakeMessages()
            }, 30000)
        } else {
            setTimeout(async () => {
                const bot = await this.userService.getRandomAndUnbannedChatBots(1)

                const fakeMessage = await this.botMessageRepository.createQueryBuilder()
                    .where('is_paused = 0')
                    .orderBy('RAND()')
                    .getOne()

                if (typeof bot[0] !== 'undefined' && fakeMessage) {
                    await this.addMessage(bot[0], fakeMessage.message)
                }

                return this.sendFakeMessages()
            }, randomInt(Number(this.configService.config.bots_fake_message_min_sec), Number(this.configService.config.bots_fake_message_max_sec)) * 1000)
        }
    }

    async sendBotMessage(botId: number, message: string) {
        const bot = await this.userService.getUserByUserId(botId)

        if (!bot || !bot.is_fake) {
            throw 'Бот не найден'
        }

        await this.addMessage(bot, message)
    }

    async pauseMessage(id: number, isPaused: number) {
        return await this.botMessageRepository.update(id, {
            is_paused: isPaused
        })
    }
}
