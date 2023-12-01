import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { request } from "./request";
import { action } from "./action";

@Entity()
export class response {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    request_id: number;
    @ManyToOne(type => request)
    @JoinColumn({ name: "request_id" })
    request: request;

    @Column({ nullable: false, type: "integer" })
    result_code: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;

    @Index()
    @Column({ nullable: true })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;
}