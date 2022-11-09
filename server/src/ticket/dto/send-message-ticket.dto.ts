import {IsNotEmpty, Length} from "class-validator"

export class SendMessageTicketDto {
    @IsNotEmpty()
    id: number

    @IsNotEmpty({
        message: 'Напишите проблему'
    })
    @Length(4, 999999, {
        message: 'Мин. кол-во символов в проблеме: 4'
    })
    message: string
}
