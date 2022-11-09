import {IsNotEmpty} from "class-validator"

export class CreateGameDto {
    @IsNotEmpty()
    ids: number[]

    @IsNotEmpty()
    side: string

    @IsNotEmpty()
    games: number
}