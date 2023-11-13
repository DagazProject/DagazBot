import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { server_type } from "./server_type";

@Entity()
export class server {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => server_type)
    @JoinColumn({ name: "type_id" })
    type: server_type;

    @Column({ nullable: true, type: "text" })
    url: string;

    @Column({ nullable: true, type: "text" })
    api: string;
}