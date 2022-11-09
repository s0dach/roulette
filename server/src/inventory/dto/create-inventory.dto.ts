import {IsNotEmpty} from "class-validator"

export class CreateInventoryDto {
    @IsNotEmpty()
    user_id: number

    @IsNotEmpty()
    item_id: number

    @IsNotEmpty()
    price: number
}