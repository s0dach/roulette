import {IsNotEmpty} from "class-validator"

export class FindOrCreateUserDto {
    @IsNotEmpty()
    readonly steamid: string

    @IsNotEmpty()
    readonly personaname: string

    @IsNotEmpty()
    readonly avatarfull: string
}
