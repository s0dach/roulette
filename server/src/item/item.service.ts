import {HttpService, Injectable, Logger} from '@nestjs/common'
import {InjectRepository} from "@nestjs/typeorm"
import {LessThanOrEqual, Like, Raw, Repository} from "typeorm"
import {ItemEntity} from "../entities/item.entity"
import {MarketCsgoService} from "../market-csgo/market-csgo.service"
import {Constants} from "../constants"
import {Cron, CronExpression} from "@nestjs/schedule"
import {ConfigService} from "../config/config.service"
import {
    makeLimiterFromLimiters,
    makeLimiterWorkPerSecond,
    makeLimiterWorkPerTime,
    RateLimitQueue,
} from "../utils/limiter"
import {UserEntity} from "../entities/user.entity"

@Injectable()
export class ItemService {
    public plannedUpdatePrices: boolean

    protected readonly itemLoaderQueue = new RateLimitQueue(makeLimiterFromLimiters([
        makeLimiterWorkPerSecond(1),
        makeLimiterWorkPerTime(5, 1000 * 60),
        makeLimiterWorkPerTime(15, 1000 * 60 * 5),
    ]))

    constructor(
        private marketCsgoService: MarketCsgoService,
        @InjectRepository(ItemEntity)
        private itemRepository: Repository<ItemEntity>,
        private logger: Logger,
        private configService: ConfigService,
        private httpService: HttpService
    ) {
        this.logger.setContext('Предметы')

        this.plannedUpdatePrices = false
    }

    async onApplicationBootstrap() {
        this.logger.debug('Проверка наличия предметов в базе данных')

        this.checkItems()
    }

    async checkItems() {
        const itemsCount = await this.itemRepository.count()

        if (itemsCount === 0) {
            this.logger.debug('Предметов нет в базе данных, идет обновление...')

            this.loadItems()

            return true
        }

        this.logger.debug('Предметы найдены в базе данных')

        return true
    }

    async loadItems() {
        try {
            const prices = await this.marketCsgoService.getPrices()

            for await (const marketItem of this.generatorSteamMarketItems()) {
                try {
                    const priceIndex = prices.findIndex(x => x.market_hash_name === marketItem.hash_name)

                    if (priceIndex > -1) {
                        let price

                        if (prices[priceIndex].volume > 10) {
                            price = prices[priceIndex].price / this.configService.config.dollar_rate
                        } else {
                            price = marketItem.sell_price / 100
                        }

                        const item = marketItem.asset_description

                        if (item.icon_url_large === null) {
                            continue
                        }

                        if (price < Constants.min_item_price) {
                            continue
                        }

                        const exterior = ''
                        const rarity = item.type

                        await this.itemRepository.save(
                            this.itemRepository.create({
                                market_hash_name: item.market_hash_name,
                                icon_url: item.icon_url_large === '' ? item.icon_url : item.icon_url_large,
                                exterior: exterior,
                                rarity: rarity,
                                color: item.name_color,
                                price
                            })
                        )
                    }
                } catch (e) {
                    this.logger.error(`Ошибка сохранения предмета: ${e.message}`)
                }
            }

            this.logger.debug('Предметы загружены')
        } catch (e) {
            this.logger.error(`Произошла ошибка при получении предметов. Причина: ${e}`)
        }
    }

    public async loadItemsPage(page = 0, perPage = 1000) {
        perPage = Math.min(100, perPage)

        const {data} = await this.httpService.get(
            `https://steamcommunity.com/market/search/render`,
            {
                params: {
                    query: '',
                    start: page * perPage,
                    count: perPage,
                    search_descriptions: 0,
                    norender: 1,
                    sort_column: 'quantity',
                    sort_dir: 'desc',
                    appid: 730,
                },
            },
        ).toPromise()

        return data
    }

    public async* generatorSteamMarketItems(startPage = 0) {
        let currentPage = startPage
        const loaderBreakRule = (page) =>
            page.start >= page.total_count ||
            page.results.some(i => i.sell_listings < Constants.min_item_price)

        while (true) {
            const page = await this.itemLoaderQueue.add(() => this.loadItemsPage(currentPage))

            for (const item of page.results)
                if (item.sell_listings > Constants.min_item_price)
                    yield item

            if (loaderBreakRule(page)) break
            currentPage++
        }
    }

    async getItems(page: number, sort: any, market_hash_name: string, min_price: any, max_price: any, selectedPrice: number, user: UserEntity): Promise<ItemEntity[]> {
        if (min_price === '') {
            min_price = 0
        }

        if (max_price === '') {
            max_price = (Number(selectedPrice) + Number(user.balance))
        }

        const skip = (page - 1) * this.configService.config.showItemsInShop

        return await this.itemRepository.find({
            where: {
                market_hash_name: Like(`%${market_hash_name}%`),
                price: Raw(alias => `${alias} >= ${min_price} AND ${alias} <= ${max_price}`)
            },
            order: {
                price: sort
            },
            take: this.configService.config.showItemsInShop,
            skip,
        })
    }

    async findById(itemId: number): Promise<ItemEntity> {
        return await this.itemRepository.findOne(itemId)
    }

    async findBySum(sum: number): Promise<ItemEntity> {
        return await this.itemRepository.findOne({
            where: {
                price: LessThanOrEqual(sum)
            },
            order: {
                price: 'DESC'
            }
        })
    }

    async findByRandomSum(min: number, max: number): Promise<ItemEntity> {
        return await this.itemRepository.createQueryBuilder()
            .where(`price >= ${min} AND price <= ${max}`)
            .orderBy('RAND()')
            .getOne()
    }

    async findItemsInInventory(marketHashName = '', page: number, limit: number): Promise<any> {
        const queryBuilder = this.itemRepository.createQueryBuilder()
        queryBuilder.where(
            `market_hash_name LIKE '%${marketHashName}%'`
        )
        queryBuilder.limit(limit)
        queryBuilder.offset(page)

        return queryBuilder.getMany()
    }

    async getAllItems(data): Promise<any> {
        const queryBuilder = this.itemRepository.createQueryBuilder()
        queryBuilder.orderBy(`${data.columnName}`, data.columnSortOrder.toUpperCase())
        queryBuilder.where(
            `market_hash_name LIKE '%${data.searchValue}%'`
        )
        queryBuilder.limit(data.length)
        queryBuilder.offset(data.row)

        return queryBuilder.getMany()
    }

    async getCountItems(): Promise<number> {
        const sum = await this.itemRepository.createQueryBuilder()
            .select('COUNT(id)', 'cnt')
            .getRawOne()

        return sum.cnt === null ? 0 : sum.cnt
    }

    async saveItem(item: ItemEntity): Promise<ItemEntity> {
        return await this.itemRepository.save(item)
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async updatePrices() {
        this.logger.debug('Запуск обновления цен на предметы')

        const items = await this.itemRepository.find()
        const prices = await this.marketCsgoService.getPrices()

        for (const item of items) {
            const priceIndex = prices.findIndex(x => x.market_hash_name === item.market_hash_name)

            if (priceIndex > -1 && prices[priceIndex].volume > 10) {
                const price = prices[priceIndex].price / this.configService.config.dollar_rate

                if (price < Constants.min_item_price) {
                    continue
                }

                item.price = price

                await this.itemRepository.save(item)
            }
        }

        this.logger.debug('Обновление цен завершено')
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async planeUpdatePrices() {
        if (this.plannedUpdatePrices) {
            this.plannedUpdatePrices = false

            await this.updatePrices()
        }
    }
}
