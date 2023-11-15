import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Unique } from "typeorm";
import { action } from "./action";

@Entity()
export class users {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

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

    @Column({ type: "varchar", length: 5 })
    locale: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;

    @Column({default: () => "now()", nullable: false})
    updated: Date;
}