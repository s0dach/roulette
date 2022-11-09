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

@Entity('api_logs')
export class ApiLogEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: null })
    user_id: number

    @Column({ default: null })
    url: string

    @Column({ default: null })
    ip: string

    @Column({ default: null })
    status_code: string

    @Column({
        type: "text",
        default: null
    })
    req: string

    @Column({
        type: "text",
        default: null
    })
    res: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @ManyToOne(() => UserEntity, { cascade: true, onDelete: "CASCADE", primary: true})
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: UserEntity
}
