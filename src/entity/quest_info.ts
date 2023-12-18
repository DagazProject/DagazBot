import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";
import { info_type } from "./info_type";

@Entity()
export class quest_info {
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
    type_id: number;
    @ManyToOne(type => info_type)
    @JoinColumn({ name: "type_id" })
    types: info_type;

    @Column({ nullable: true,  type: "text" })
    en: string;

    @Column({ nullable: true,  type: "text" })
    ru: string;
}