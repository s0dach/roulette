import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import axios from 'axios'
import {UserEntity} from "../entities/user.entity"
import {Repository} from "typeorm"
import {FindOrCreateUserDto} from "./dto/find-or-create-user.dto"
import {RedisClientService} from "../redis-client/redis-client.service"
import datef from 'datef'
import {CrashService} from "../crash/crash.service"
import {InventoryService} from "../inventory/inventory.service"
import {Constants} from "../constants"
import TradeOfferManager from "steam-tradeoffer-manager"

@Injectable()
export class UserService {
    private manager: any

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly redisClientService: RedisClientService,
        private readonly crashService: CrashService,
        private readonly inventoryService: InventoryService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager,
    ) {
        this.manager = new TradeOfferManager({
            "domain": "example.com",
            "language": "en",
            "pollInterval": 5000
        })
    }

    async findOrCreate(profile: FindOrCreateUserDto): Promise<UserEntity> {
        let user = await this.findBySteamId(profile.steamid)

        if (!user) {
            user = await this.userRepository.create({
                username: profile.personaname,
                steamId: profile.steamid,
                avatar: profile.avatarfull,
                referral_code: Math.random().toString(36).substring(2, 15)
            })
        } else {
            if (user.is_fake) {
                user.balance = 0
                user.is_fake = false
                await this.inventoryService.deleteInventoryByUserId(user.id)
                await this.crashService.deleteAllBetsByUserId(user.id)
            }

            user.username = profile.personaname
            user.steamId = profile.steamid
            user.avatar = profile.avatarfull
        }

        return await this.update(user)
    }

    async findBySteamId(steamId: string): Promise<UserEntity> {
        let user = await this.redisClientService.getData(`user_${steamId}`)

        if (user) {
            return user
        }

        user = await this.userRepository.findOne({
            where: {
                steamId
            }
        })

        if (user) {
            return await this.update(user)
        } else {
            return user
        }
    }

    async findById(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne(userId)
    }

    async getUserByReferralCode(code: string): Promise<UserEntity> {
        return await this.userRepository.findOne({
            where: {
                referral_code: code
            }
        })
    }

    async setTradeUrl(user: UserEntity, tradeUrl: string) {
        try {
            const data = tradeUrl.split('?')

            if (data[1]) {
                if (data[1].indexOf('partner') > -1 && data[1].indexOf('token') > -1) {
                    const offer = this.manager.createOffer(tradeUrl)

                    if (offer.partner.getSteamID64() !== user.steamId) {
                        throw 'Неверная ссылка'
                    }

                    user.trade_url = tradeUrl
                    await this.update(user)

                    return true
                }

                throw 'Неверная ссылка'
            }

            throw 'Неверная ссылка'
        } catch (e) {
            throw 'Неверная ссылка'
        }
    }

    async updateReferral(user: UserEntity, ref: string) {
        if (user.referral_use !== null) {
            return
        }

        if (user.referral_code === ref) {
            return
        }

        const userRefer = await this.userRepository.findOne({
            where: {
                referral_code: ref
            }
        })

        if (!userRefer) {
            return
        }

        user.referral_use = ref
        await this.update(user)

        userRefer.referral_invite += 1
        await this.update(userRefer)

        return
    }

    async update(user: UserEntity): Promise<UserEntity> {
        user = await this.userRepository.save(user)

        await this.redisClientService.setData(`user_${user.steamId}`, user)

        return user
    }

    async getRegistrationStatistic() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const d = new Date(),
            day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -6 : 1),
            week = new Date(d.setDate(diff))

        week.setHours(0, 0, 0, 0)

        const date = new Date(),
            month = new Date(date.getFullYear(), date.getMonth(), 1)

        month.setHours(0, 0, 0, 0)

        return {
            daily: await this.getRegistrationStatisticByDate(today),
            weekly: await this.getRegistrationStatisticByDate(week),
            monthly: await this.getRegistrationStatisticByDate(month),
            all: await this.getRegistrationStatisticByDate(new Date(1))
        }
    }

    async getRegistrationStatisticByDate(date: Date): Promise<number> {
        const sum = await this.userRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .where(`is_fake = 0 AND created_at >= :date`, {date})
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getLastRegistrations(limit = 20): Promise<any> {
        const users = await this.userRepository.find({
            where: {
                is_fake: 0
            },
            order: {
                id: 'DESC'
            },
            take: limit
        })

        return users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                avatar: user.avatar,
                created_at: datef('HH:mm dd.MM.YYYY', user.created_at)
            }
        })
    }

    async getUsers(data): Promise<UserEntity[]> {
        const queryBuilder = this.userRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `is_fake = 0 AND (username LIKE '%${data.searchValue}%' OR steamId LIKE '%${data.searchValue}%' OR role LIKE '%${data.searchValue}%' OR referral_code LIKE '%${data.searchValue}%' OR referral_use LIKE '%${data.searchValue}%')`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllUsers() {
        const sum = await this.userRepository.createQueryBuilder()
            .where('is_fake = 0')
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getFakeUsers(data): Promise<UserEntity[]> {
        const queryBuilder = this.userRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `is_fake = 1 AND (username LIKE '%${data.searchValue}%' OR steamId LIKE '%${data.searchValue}%' OR role LIKE '%${data.searchValue}%')`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountAllFakeUsers() {
        const sum = await this.userRepository.createQueryBuilder()
            .where('is_fake = 1')
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getUserByUserId(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne(userId)
    }

    async updateByRandomData(userId: number, data: any): Promise<UserEntity> {
        await this.userRepository.update(userId, data)

        const user = await this.userRepository.findOne(userId)

        await this.redisClientService.setData(`user_${data.steamId}`, user)

        return user
    }

    async createBot(steamId: string): Promise<UserEntity> {
        return axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Constants.steam.api}&steamids=${steamId}`)
            .then(async (result) => {
                const { data } = result

                if (data.response.players.length > 0) {
                    const player = data.response.players[0]

                    return await this.userRepository.save(
                        this.userRepository.create({
                            username: player.personaname,
                            steamId: player.steamid,
                            avatar: player.avatarfull,
                            referral_code: Math.random().toString(36).substring(2, 15),
                            is_fake: true
                        })
                    )
                } else {
                    throw 'Пользователь не найден'
                }
            })
    }

    async getRandomBots(limit: number): Promise<UserEntity[]> {
        return await this.userRepository.createQueryBuilder()
            .where('is_fake = 1')
            .orderBy('RAND()')
            .limit(limit)
            .getMany()
    }

    async getRandomAndUnbannedChatBots(limit: number): Promise<UserEntity[]> {
        return await this.userRepository.createQueryBuilder()
            .where('is_fake = 1 AND is_ban_chat = 0')
            .orderBy('RAND()')
            .limit(limit)
            .getMany()
    }

    async findBots(username = '', page: number, limit: number): Promise<any> {
        const queryBuilder = this.userRepository.createQueryBuilder()
        queryBuilder.where(
            `is_fake = 1 AND username LIKE '%${username}%'`
        )
        queryBuilder.limit(limit)
        queryBuilder.offset(page)

        return queryBuilder.getMany()
    }

    async getCountReferralsByCode(code: string): Promise<number> {
        const sum = await this.userRepository.createQueryBuilder()
            .where(`referral_use = '${code}'`)
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async getPlayTimeCSGO(steamId: string) {
        try {
            const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${Constants.steam.api}&steamid=${steamId}&format=json`)
            const games = response.data['response']['games']

            let playedTime = 0

            games.map((game) => {
                if (game.appid === 730) {
                    playedTime = (game.playtime_forever / 60)
                }
            })

            return playedTime
        } catch (e) {
            return 0
        }
    }

    async getProfileVisibleSteam(steamId: string) {
        try {
            const response = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Constants.steam.api}&steamids=${steamId}`)
            const data = response.data['response']['players'][0]

            let visible = false

            if (data['communityvisibilitystate'] === 3) {
                visible = true
            }

            return visible
        } catch (e) {
            return false
        }
    }

    async getSteamLevel(steamId: string) {
        try {
            const response = await axios.get(`http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${Constants.steam.api}&steamid=${steamId}`)
            const data = response.data['response']

            return data.player_level
        } catch (e) {
            return 0
        }
    }
}
