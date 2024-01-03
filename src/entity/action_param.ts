import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { action } from "./action";
import { param_type } from "./param_type";

@Entity()
export class action_param {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    type: param_type;

    @Column({ nullable: false,  type: "integer" })
    value: number;
}