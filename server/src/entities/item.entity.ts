import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity('items')
export class ItemEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: null })
    market_hash_name: string

    @Column('longtext', { default: null })
    icon_url: string

    @Column({ default: null })
    exterior: string

    @Column({ default: null })
    rarity: string

    @Column({ default: null })
    color: string

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    price: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}