import { Entity, Column, PrimaryColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { request } from "./request";

@Entity()
export class action_type {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;

    @Index()
    @Column({ nullable: true })
    request_id: number;
    @ManyToOne(type => request)
    @JoinColumn({ name: "request_id" })
    request: request;
}