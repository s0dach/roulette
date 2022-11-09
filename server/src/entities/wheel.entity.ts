import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"

@Entity('wheels')
export class WheelEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    bank: number

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    profit: number

    @Column({ default: null })
    color: string

    @Column('double', { precision: 255, scale: 2, default: 0.00 })
    rotate: number

    @Column('int', { default: 0 })
    status: number

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}