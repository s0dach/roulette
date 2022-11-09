import {
    BaseEntity, Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import {UserEntity} from "./user.entity"

@Entity('tickets')
export class TicketEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column({
        type: "text"
    })
    subject: string

    @Column({
        type: "json"
    })
    messages: string

    @Column({ default: false })
    last_message_is_admin: boolean

    @Column({ default: false })
    is_closed: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity
}
