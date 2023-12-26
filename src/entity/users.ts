import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, Unique } from "typeorm";
import { common_context } from "./common_context";

@Entity()
export class users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false,  type: "boolean", default: false })
    is_admin: boolean;

    @Column({ type: "bigint", nullable: true })
    user_id: number;

    @Index()
    @Column({ nullable: true })
    context_id: number;
    @ManyToOne(type => common_context)
    @JoinColumn({ name: "context_id" })
    context: common_context;

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
}