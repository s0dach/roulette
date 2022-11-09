import {IsNotEmpty, IsNumber} from "class-validator"

export class WithdrawItemDto {
    @IsNotEmpty()
    @IsNumber()
    id: number
}