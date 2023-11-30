import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { dbproc } from "./dbproc";
import { param_type } from "./param_type";

@Entity()
export class db_param {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    proc_id: number;
    @ManyToOne(type => dbproc)
    @JoinColumn({ name: "proc_id" })
    proc: dbproc;

    @Index()
    @Column({ nullable: true })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: true, type: "varchar", length: 30 })
    value: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}