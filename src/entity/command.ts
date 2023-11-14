import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { action } from "./action";

@Entity()
export class command {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Column({ nullable: true, type: "varchar", length: 100 })
    name: string;
}