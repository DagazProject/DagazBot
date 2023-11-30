import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { param_type } from "./param_type";
import { users } from "./users";
import { account } from "./account";

@Entity()
export class user_param {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    type_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "type_id" })
    type: param_type;

    @Index()
    @Column({ nullable: true })
    user_id: number;
    @ManyToOne(type => users)
    @JoinColumn({ name: "user_id" })
    user: users;

    @Index()
    @Column({ nullable: true })
    account_id: number;
    @ManyToOne(type => account)
    @JoinColumn({ name: "account_id" })
    account: account;

    @Column({ nullable: false,  type: "text" })
    value: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}