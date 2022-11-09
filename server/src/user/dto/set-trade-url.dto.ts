import {IsNotEmpty, IsString} from "class-validator"

export class SetTradeUrlDto {
    @IsNotEmpty()
    @IsString()
    trade_url: string
}