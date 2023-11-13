import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { response } from "./response";
import { param_type } from "./param_type";

@Entity()
export class response_param {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    response_id: number;
    @ManyToOne(type => response)
    @JoinColumn({ name: "response_id" })
    response: response;

    @Index()
    @Column({ nullable: true })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: true, type: "varchar", length: 30 })
    param_name: string;
}