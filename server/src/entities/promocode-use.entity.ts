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
import {PromocodeEntity} from "./promocode.entity"

@Entity('promocode_uses')
export class PromocodeUseEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    promo_id: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity

    @ManyToOne(() => PromocodeEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'promo_id', referencedColumnName: 'id'})
    promo: PromocodeEntity
}