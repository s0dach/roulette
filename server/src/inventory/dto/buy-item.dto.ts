import {IsNotEmpty} from "class-validator"

export class BuyItemDto {
    @IsNotEmpty()
    readonly my: number[]

    @IsNotEmpty()
    readonly ids: number[]
}
