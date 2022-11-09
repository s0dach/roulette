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
import {GiveawayEntity} from "./giveaway.entity"

@Entity('giveaway_bets')
export class GiveawayBetEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    giveaway_id: number

    @Column({ default: false })
    is_winner: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity

    @ManyToOne(() => GiveawayEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'giveaway_id', referencedColumnName: 'id'})
    giveaway: GiveawayEntity
}
