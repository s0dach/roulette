import {IsNotEmpty} from "class-validator"

export class AddBetDto {
    @IsNotEmpty()
    ids: number[]

    @IsNotEmpty()
    multiplier: number
}