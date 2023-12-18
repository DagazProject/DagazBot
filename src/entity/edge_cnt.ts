import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { edge } from "./edge";
import { quest_context } from "./quest_context";

@Entity()
export class edge_cnt {
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
    context_id: number;
    @ManyToOne(type => quest_context)
    @JoinColumn({ name: "context_id" })
    context: quest_context;

    @Column({ nullable: false,  type: "integer", default: 0 })
    max_cnt: number;
}