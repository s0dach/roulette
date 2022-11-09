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
import {CrashEntity} from "./crash.entity"

@Entity('crash_bets')
export class CrashBetEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    crash_id: number

    @Column('json')
    items: string

    @Column()
    items_length: number

    @Column('double', {precision: 255, scale: 2})
    sum: number

    @Column('double', {precision: 255, scale: 2, default: 0.00})
    multiplier: number

    @Column('double', {precision: 255, scale: 2})
    auto_withdraw: number

    @Column('double', {precision: 255, scale: 2, default: 0.00})
    win: number

    @Column('json', {nullable: true})
    win_item: string

    @Column('boolean', { default: false })
    is_fake: boolean

    @Column('int', { default: 0 })
    status: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity

    @ManyToOne(() => CrashEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'crash_id', referencedColumnName: 'id'})
    crash: CrashEntity
}