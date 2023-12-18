import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { edge } from "./edge";
import { quest_param } from "./quest_param";

@Entity()
export class edge_param {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    edge_id: number;
    @ManyToOne(type => edge)
    @JoinColumn({ name: "edge_id" })
    edge: edge;

    @Index()
    @Column({ nullable: false })
    param_id: number;
    @ManyToOne(type => quest_param)
    @JoinColumn({ name: "param_id" })
    param: quest_param;

    @Column({ nullable: true,  type: "varchar", length: 100 })
    rule: string;
}