import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { server } from "./server";
import { users } from "./users";
import { action } from "./action";

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
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Column({default: () => "now()", nullable: false})
    created: Date;

    @Column({ nullable: true })
    deleted: Date;
}