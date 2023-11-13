import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { server } from "./server";
import { option_type } from "./option_type";

@Entity()
export class server_option {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => option_type)
    @JoinColumn({ name: "type_id" })
    type: option_type;

    @Index()
    @Column({ nullable: false })
    server_id: number;
    @ManyToOne(type => server)
    @JoinColumn({ name: "server_id" })
    server: server;

    @Column({ nullable: false,  type: "text" })
    value: string;
}