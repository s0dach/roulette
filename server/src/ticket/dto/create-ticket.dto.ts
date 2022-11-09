import {IsNotEmpty, Length} from "class-validator-multi-lang"

export class CreateTicketDto {
    @IsNotEmpty({
        message: 'Напишите название тикета'
    })
    @Length(3, 300, {
        message: 'Мин. кол-во символов в в названии тикета: 3'
    })
    subject: string

    @IsNotEmpty({
        message: 'Напишите проблему'
    })
    @Length(4, 999999, {
        message: 'Мин. кол-во символов в проблеме: 4'
    })
    message: string
}
