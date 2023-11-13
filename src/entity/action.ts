import { Entity, Column, Index, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { action_type } from "./action_type";
import { script } from "./script";
import { param_type } from "./param_type";

@Entity()
export class action {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => action_type)
    @JoinColumn({ name: "type_id" })
    type: action_type;

    @Index()
    @Column({ nullable: false })
    script_id: number;
    @ManyToOne(type => script)
    @JoinColumn({ name: "script_id" })
    script: script;

    @Index()
    @Column({ nullable: true })
    parent_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "parent_id" })
    parent: action;

    @Index()
    @Column({ nullable: true })
    follow_to: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "follow_to" })
    follow: action;

    @Index()
    @Column({ nullable: true })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: true,  type: "text" })
    message: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}