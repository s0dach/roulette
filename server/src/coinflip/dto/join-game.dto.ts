import {IsNotEmpty} from "class-validator"

export class JoinGameDto {
    @IsNotEmpty()
    ids: number[]

    @IsNotEmpty()
    game_id: number
}