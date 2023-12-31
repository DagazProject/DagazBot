import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { server } from "./server";
import { action_type } from "./action_type";

@Entity()
export class request {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    actiontype_id: number;
    @ManyToOne(type => action_type)
    @JoinColumn({ name: "actiontype_id" })
    actiontype: action_type;

    @Index()
    @Column({ nullable: false })
    server_id: number;
    @ManyToOne(type => server)
    @JoinColumn({ name: "server_id" })
    server: server;
    
    @Column({ nullable: false, type: "varchar", length: 10 })
    request_type: string;

    @Column({ nullable: false, type: "varchar", length: 100 })
    url: string;
}