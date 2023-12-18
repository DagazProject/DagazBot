import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";

@Entity()
export class quest_subs {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    quest_id: number;
    @ManyToOne(type => quest)
    @JoinColumn({ name: "quest_id" })
    quest: quest;

    @Column({ nullable: false,  type: "varchar", length: 100 })
    from_str: string;

    @Column({ nullable: false,  type: "varchar", length: 100 })
    to_str: string;
}