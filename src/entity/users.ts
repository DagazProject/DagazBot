import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
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

    @Column({ nullable: false,  type: "varchar", length: 100 })
    username: string;

    @Column({ type: "varchar", length: 100 })
    firstname: string;

    @Column({ type: "varchar", length: 5 })
    locale: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;

    @Column({default: () => "now()", nullable: false})
    updated: Date;
}