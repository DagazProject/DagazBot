import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { users } from "./users";
import { server } from "./server";
import { watch_type } from "./watch_type";

@Entity()
export class watch {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => watch_type)
    @JoinColumn({ name: "type_id" })
    type: watch_type;

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
    parent_id: number;
    @ManyToOne(type => watch)
    @JoinColumn({ name: "parent_id" })
    parent: watch;

    @Column({ nullable: false, type: "varchar", length: 100 })
    value: string;
}