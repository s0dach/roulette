import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity('bot_messages')
export class BotMessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    message: string

    @Column({ default: 1 })
    is_paused: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}