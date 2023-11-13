import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { request } from "./request";
import { param_type } from "./param_type";

@Entity()
export class request_param {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    request_id: number;
    @ManyToOne(type => request)
    @JoinColumn({ name: "request_id" })
    request: request;

    @Index()
    @Column({ nullable: false })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: true, type: "varchar", length: 30 })
    param_name: string;
}