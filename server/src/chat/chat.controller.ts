import {Body, CACHE_MANAGER, Controller, Get, HttpException, Inject, Param, Post, Req, UseGuards} from '@nestjs/common'
import {ChatService} from "./chat.service"
import {JwtAuthGuard} from "../auth/jwt-auth.guard"
import {SendMessageDto} from "./dto/send-message.dto"
import {Utils} from "../utils"
import {UserService} from "../user/user.service"
import {AdminOrModeratorGuard} from "../guards/admin-or-moderator.guard"

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private utils: Utils,
        private userService: UserService,
        @Inject(CACHE_MANAGER)
        private cacheManager,
    ) {
    }

    @Get('/')
    async getMessages(): Promise<any> {
        return this.chatService.chat
    }

    @UseGuards(JwtAuthGuard)
    @Post('/send')
    async sendMessage(@Body() data: SendMessageDto, @Req() req): Promise<any> {
        if (typeof await this.cacheManager.get(`add_message_${req.user.id}`) !== 'undefined') {
            throw new HttpException('Не так часто', 400)
        }

        this.cacheManager.set(`add_message_${req.user.id}`, 1, 3)

        let { msg } = data

        if (req.user.is_ban_chat) {
            throw new HttpException('Вы заблокированы в чате', 400)
        }

        if (msg.length < 3) {
            throw new HttpException('Минимальное кол-во символов: 3', 400)
        }

        if (msg.length > 100) {
            throw new HttpException('Максимальное кол-во символов: 100', 400)
        }

        if (await this.utils.validURL(msg)) {
            throw new HttpException('Ссылки запрещены', 400)
        }

        if ((req.user.role === 'admin' || req.user.role === 'moderator') && msg === '/clear') {
            await this.chatService.clearChat()
            this.chatService.chat = []

            return {
                success: true
            }
        }

        msg = await this.utils.removeTags(msg)

        await this.chatService.addMessage(req.user, msg)

        return {
            success: true
        }
    }

    @UseGuards(JwtAuthGuard, AdminOrModeratorGuard)
    @Post('/delete/:id')
    async deleteMessage(@Param('id') id): Promise<any> {
        try {
            await this.chatService.deleteMessage(id)

            return {
                success: true
            }
        } catch (e) {
            throw new HttpException(e, 400)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/ban/:steamId')
    async banUserFromChat(@Param('steamId') steamId): Promise<any> {
        const user = await this.userService.findBySteamId(steamId)

        if (!user) {
            throw new HttpException('Пользователь не найден', 400)
        }

        if (user.is_ban_chat) {
            throw new HttpException('Пользователь уже заблокирован в чате', 400)
        }

        user.is_ban_chat = true
        await this.userService.update(user)

        return {
            success: true
        }
    }
}
