import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { edge } from "./edge";

@Entity()
export class edge_info {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    edge_id: number;
    @ManyToOne(type => edge)
    @JoinColumn({ name: "edge_id" })
    edge: edge;

    @Column({ nullable: true,  type: "text" })
    en: string;

    @Column({ nullable: true,  type: "text" })
    ru: string;
}