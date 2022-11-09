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

@Entity('coinflips')
export class CoinflipEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('int', { nullable: true })
    blue_id: number

    @Column('int', { nullable: true })
    green_id: number

    @Column('json', { nullable: true })
    blue_items: string

    @Column('json', { nullable: true })
    green_items: string

    @Column('double', { precision: 255, scale: 2, nullable: true })
    blue_sum: number

    @Column('double', { precision: 255, scale: 2, nullable: true })
    green_sum: number

    @Column('int', { nullable: true })
    winner_id: number

    @Column('double', { precision: 255, scale: 2, nullable: true })
    win: number

    @Column('json', { nullable: true })
    win_item: string

    @Column()
    win_side: string

    @Column('text')
    signature: string

    @Column('json')
    random: string

    @Column('int', { default: 0 })
    status: number

    @Column('double', { precision: 255, scale: 2, nullable: true })
    profit: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'blue_id', referencedColumnName: 'id'})
    blue_user: UserEntity

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'green_id', referencedColumnName: 'id'})
    green_user: UserEntity

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'winner_id', referencedColumnName: 'id'})
    winner: UserEntity
}