import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Unique } from "typeorm";
import { action } from "./action";
import { param_type } from "./param_type";
import { message } from "./message";

@Entity()
export class users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false,  type: "boolean", default: false })
    is_admin: boolean;

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
    @Unique(["username"])
    @Column({ nullable: false,  type: "varchar", length: 100 })
    username: string;

    @Column({ type: "varchar", length: 100 })
    firstname: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    lastname: string;

    @Column({ type: "bigint", nullable: false })
    chat_id: number;

    @Column({default: () => "now()", nullable: false})
    created: Date;

    @Column({default: () => "now()", nullable: false})
    updated: Date;

    @Index()
    @Column({ nullable: true })
    scheduled: Date;
}