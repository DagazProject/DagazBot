import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";
import { action } from "./action";

@Entity()
export class quest_grant {
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
    grantor_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "grantor_id" })
    grantor: action;

    @Index()
    @Column({ nullable: true })
    grant_to: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "grant_to" })
    grantto: action;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}