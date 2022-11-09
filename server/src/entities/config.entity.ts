import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity('configs')
export class ConfigEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('double',{ default: 73.37 })
    dollar_rate: number

    @Column({ default: 20 })
    showItemsInShop: number

    @Column('double', { default: 1.5 })
    max_buy_percent: number

    @Column('double', { default: 10 })
    coinflip_commission: number

    @Column('double', { default: 15 })
    coinflip_difference_price: number

    @Column('double', { default: 9 })
    crash_time_to_start: number

    @Column({ default: 10 })
    crash_max_items_in_bet: number

    @Column({ default: 1 })
    ticket_limit: number

    @Column('double', { default: 60 })
    ticket_time_out: number

    @Column({ default: 0 })
    ban_withdraw_all: number

    @Column({ default: 0 })
    ban_withdraw_new_users: number

    @Column({ default: null })
    ban_withdraw_new_users_date: Date

    @Column({ default: 0 })
    stop_site: number

    @Column({ default: 0 })
    stop_crash: number

    @Column({ default: 0 })
    stop_coinflip: number

    @Column({ default: 0 })
    stop_wheel: number

    @Column({ default: null })
    stop_site_msg: string

    @Column({ default: null })
    stop_crash_msg: string

    @Column({ default: null })
    stop_coinflip_msg: string

    @Column({ default: null })
    stop_wheel_msg: string

    @Column({ default: 0 })
    bots_min: number

    @Column({ default: 0 })
    bots_max: number

    @Column('double', { default: 0.00 })
    bots_min_bet: string

    @Column('double', { default: 0.00 })
    bots_max_bet: string

    @Column({ default: 0 })
    bots_min_items_in_bet: number

    @Column({ default: 0 })
    bots_max_items_in_bet: number

    @Column({ default: 0 })
    bots_is_real: number

    @Column({ default: 0 })
    bots_fake_message_min_sec: number

    @Column({ default: 0 })
    bots_fake_message_max_sec: number

    @Column('double',{ default: 0.00 })
    profit: number

    @Column('double',{ default: 0.00 })
    bank: number

    @Column('double',{ default: 25 })
    bank_percent: number

    @Column('double',{ default: 0.00 })
    profit_wheel: number

    @Column('double',{ default: 0.00 })
    bank_wheel: number

    @Column('double',{ default: 25 })
    bank_percent_wheel: number

    @Column('double',{ default: 0.5 })
    min_payment: number

    @Column('double',{ default: 15000 })
    max_payment: number

    @Column('double', { default: 3 })
    percent_referral: number

    @Column({ default: null })
    unitpay_public_key: string

    @Column({ default: null })
    unitpay_secret_key: string

    @Column({ default: null })
    skins_back_id: string

    @Column({ default: null })
    skins_back_secret_key: string

    @Column({ default: null })
    vk_question_url: string

    @Column({ default: null })
    vk_group: string

    @Column('double', { default: 50 })
    add_coef_withdraw: number

    @Column('double', { default: 0.25 })
    min_payment_to_promocode: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}