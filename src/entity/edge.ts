import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";
import { node } from "./node";

@Entity()
export class edge {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    quest_id: number;
    @ManyToOne(type => quest)
    @JoinColumn({ name: "quest_id" })
    quest: quest;

    @Index()
    @Column({ nullable: false })
    from_id: number;
    @ManyToOne(type => node)
    @JoinColumn({ name: "from_id" })
    from: node;

    @Index()
    @Column({ nullable: false })
    to_id: number;
    @ManyToOne(type => node)
    @JoinColumn({ name: "to_id" })
    to: node;

    @Column({ nullable: true,  type: "text" })
    en: string;

    @Column({ nullable: true,  type: "text" })
    ru: string;

    @Column({ nullable: true,  type: "varchar", length: 100 })
    rule: string;

    @Column({ nullable: true,  type: "integer" })
    max_cnt: number;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}