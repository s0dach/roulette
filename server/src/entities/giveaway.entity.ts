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

@Entity('giveaways')
export class GiveawayEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    item_id: number

    @Column({ default: 0 })
    users: number

    @Column({ default: null })
    winner_id: number

    @Column()
    end_time: Date

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity,{ cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'winner_id', referencedColumnName: 'id'})
    winner: UserEntity

    @ManyToOne(() => ItemEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'item_id', referencedColumnName: 'id'})
    item: ItemEntity
}
