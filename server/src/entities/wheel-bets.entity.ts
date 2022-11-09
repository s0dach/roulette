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
import {WheelEntity} from "./wheel.entity"

@Entity('wheel_bets')
export class WheelBetsEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    wheel_id: number

    @Column()
    color: string

    @Column('json')
    items: string

    @Column()
    items_length: number

    @Column('double', {precision: 255, scale: 2})
    sum: number

    @Column('double', {precision: 255, scale: 2, default: 0.00})
    win: number

    @Column('json', {nullable: true})
    win_item: string

    @Column('boolean', { default: false })
    is_fake: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity

    @ManyToOne(() => WheelEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'wheel_id', referencedColumnName: 'id'})
    wheel: WheelEntity
}