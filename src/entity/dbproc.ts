import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { action_type } from "./action_type";

@Entity()
export class dbproc {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    actiontype_id: number;
    @ManyToOne(type => action_type)
    @JoinColumn({ name: "actiontype_id" })
    actiontype: action_type;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;
}