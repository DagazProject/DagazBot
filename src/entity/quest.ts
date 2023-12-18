import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { account } from "./account";

@Entity()
export class quest {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    account_id: number;
    @ManyToOne(type => account)
    @JoinColumn({ name: "account_id" })
    account: account;

    @Column({ nullable: true,  type: "text" })
    en: string;

    @Column({ nullable: true,  type: "text" })
    ru: string;

    @Column({ nullable: true,  type: "integer" })
    def_cnt: number;
}