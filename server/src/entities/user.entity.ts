import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity('users')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    steamId: string

    @Column()
    avatar: string

    @Column('varchar', { default: null })
    trade_url: string

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    balance: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    payment: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    inventory: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    withdraw: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    max_enable_withdraw: number

    @Column('boolean', { default: false })
    is_ban_chat: boolean

    @Column('boolean', { default: false })
    is_ban_withdraw: boolean

    @Column('varchar', { default: 'user' })
    role: string

    @Column()
    referral_code: string

    @Column({ default: null })
    referral_use: string

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    referral_invite: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    referral_sum: number

    @Column('boolean', { default: false })
    is_fake: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
