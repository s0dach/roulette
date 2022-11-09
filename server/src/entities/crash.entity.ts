import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity('crash')
export class CrashEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    multiplier: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    bank: number

    @Column('int', { default: 0 })
    users: number

    @Column('int', { default: 0 })
    skins: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    profit: number

    @Column('int', { default: 0 })
    status: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}