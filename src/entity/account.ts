import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { server } from "./server";
import { users } from "./users";
import { common_context } from "./common_context";

@Entity()
export class account {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    user_id: number;
    @ManyToOne(type => users)
    @JoinColumn({ name: "user_id" })
    user: users;

    @Index()
    @Column({ nullable: false })
    server_id: number;
    @ManyToOne(type => server)
    @JoinColumn({ name: "server_id" })
    server: server;

    @Index()
    @Column({ nullable: true })
    context_id: number;
    @ManyToOne(type => common_context)
    @JoinColumn({ name: "context_id" })
    context: common_context;

    @Column({default: () => "now()", nullable: false})
    created: Date;

    @Column({ nullable: true })
    deleted: Date;
}