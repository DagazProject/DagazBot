import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";

@Entity()
export class quest_param {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    quest_id: number;
    @ManyToOne(type => quest)
    @JoinColumn({ name: "quest_id" })
    quest: quest;
    
    @Column({ nullable: false,  type: "text" })
    name: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}