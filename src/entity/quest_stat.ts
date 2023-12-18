import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { quest } from "./quest";
import { account } from "./account";

@Entity()
export class quest_stat {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    account_id: number;
    @ManyToOne(type => account)
    @JoinColumn({ name: "account_id" })
    account: account;

    @Index()
    @Column({ nullable: false })
    quest_id: number;
    @ManyToOne(type => quest)
    @JoinColumn({ name: "quest_id" })
    quest: quest;

    @Column({ nullable: false,  type: "integer", default: 0 })
    all: number;

    @Column({ nullable: false,  type: "integer", default: 0 })
    win: number;

    @Column({ nullable: false,  type: "integer", default: 0 })
    bonus: number;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}