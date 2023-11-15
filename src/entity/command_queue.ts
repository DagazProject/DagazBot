import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { users } from "./users";
import { action } from "./action";

@Entity()
export class command_queue {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    user_id: number;
    @ManyToOne(type => users)
    @JoinColumn({ name: "user_id" })
    user: users;

    @Index()
    @Column({ nullable: false })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}