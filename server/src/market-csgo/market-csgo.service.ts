import { Injectable } from '@nestjs/common'
import axios from 'axios'
import {Constants} from "../constants"
import {ItemEntity} from "../entities/item.entity"
import {UserEntity} from "../entities/user.entity"

@Injectable()
export class MarketCsgoService {
    async getPrices(): Promise<any> {
        return new Promise((res, rej) => {
            axios.get(`https://market.csgo.com/api/v2/prices/RUB.json`)
                .then((data) => {
                   const result = data.data

                   if (result.success) {
                       return res(result.items)
                   }

                   return rej('Произошла ошибка при получении цен')
                })
                .catch((e) => {
                    return rej(e.message)
                })
        })
    }

    async searchItemByHashName(item: ItemEntity): Promise<any> {
        return new Promise((res, rej) => {
            axios.get(`https://market.csgo.com/api/v2/search-item-by-hash-name?key=${Constants.market_csgo.api}`
            + `&hash_name=${encodeURI(item.market_hash_name)}`)
                .then((data) => {
                    const result = data.data

                    if (!result.success) {
                        return rej('Предмет не найден в магазине')
                    }

                    if (typeof result.data[0] === 'undefined') {
                        return rej('Предмет не найден в магазине')
                    }

                    return res(result.data[0])
                })
                .catch((e) => {
                    return rej(e.message)
                })
        })
    }

    async buyItem(item: any, user: UserEntity): Promise<any> {
        return new Promise((res, rej) => {
            const partner = user.trade_url.split('partner=')[1].split('&')[0]
            const token = user.trade_url.split('token=')[1]
            const customId = Math.random().toString(36).substring(2, 15)

            axios.get(`https://market.csgo.com/api/v2/buy-for?key=${Constants.market_csgo.api}`
                + `&hash_name=${encodeURI(item.market_hash_name)}&price=${item.price}&partner=${partner}&token=${token}&custom_id=${customId}`)
                .then((data) => {
                    const result = data.data

                    if (!result.success) {
                        if (typeof result.error !== 'undefined') {
                            return rej(result.error)
                        } else {
                            return rej('Ошибка покупки предмета')
                        }
                    }

                    return res({
                        custom_id: customId
                    })
                })
                .catch((e) => {
                    return rej(e.message)
                })
        })
    }

    async getTradeByCustomIds(customIds: any): Promise<any> {
        return new Promise((res) => {
            let customIdList = ''

            for (const customId of customIds) {
                customIdList += `&custom_id[]=${customId}`
            }

            axios.get(`https://market.csgo.com/api/v2/get-list-buy-info-by-custom-id?key=${Constants.market_csgo.api}${customIdList}`)
                .then((data) => {
                    const result = data.data

                    if (!result.success) {
                        return res([])
                    }

                    return res(result.data)
                })
                .catch(() => {
                    return res([])
                })
        })
    }
}
