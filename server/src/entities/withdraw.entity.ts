import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import {UserEntity} from "./user.entity"
import {ItemEntity} from "./item.entity"

@Entity('withdraws')
export class WithdrawEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    item_id: number

    @Column('double', {precision: 255, scale: 2, default: 0.00})
    price: number

    @Column({ default: null })
    custom_id: string

    @Column({ default: 0 })
    status: number

    @Column('text', { default: null })
    error_msg: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity

    @ManyToOne(() => ItemEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'item_id', referencedColumnName: 'id'})
    item: ItemEntity
}