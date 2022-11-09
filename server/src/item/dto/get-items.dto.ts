import {IsNotEmpty} from "class-validator"

export class GetItemsDto {
    @IsNotEmpty()
    readonly page: number

    @IsNotEmpty()
    readonly sort: string

    readonly market_hash_name: string

    readonly min_price: number

    readonly max_price: number

    readonly selectedPrice: number
}
