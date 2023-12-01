import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { script } from "./script";
import { param_type } from "./param_type";

@Entity()
export class script_param {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    script_id: number;
    @ManyToOne(type => script)
    @JoinColumn({ name: "script_id" })
    script: script;

    @Index()
    @Column({ nullable: true })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}