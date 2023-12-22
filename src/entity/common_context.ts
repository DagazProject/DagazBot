import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { action } from "./action";
import { param_type } from "./param_type";

@Entity()
export class common_context {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Index()
    @Column({ nullable: true })
    wait_for: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "wait_for" })
    wait: param_type;

    @Index()
    @Column({ nullable: true })
    scheduled: Date;

    @Column({ type: "bigint", nullable: true })
    delete_message: number;

    @Column({default: () => "now()", nullable: false})
    updated: Date;
}