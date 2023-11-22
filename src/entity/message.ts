import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { users } from "./users";

@Entity()
export class message {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Index()
    @Column({ nullable: false })
    user_id: number;
    @ManyToOne(type => users)
    @JoinColumn({ name: "user_id" })
    user: users;

    @Index()
    @Column({ nullable: true })
    send_to: number;
    @ManyToOne(type => users)
    @JoinColumn({ name: "send_to" })
    send: users;

    @Index()
    @Column({ nullable: true })
    reply_for: number;
    @ManyToOne(type => message)
    @JoinColumn({ name: "reply_for" })
    reply: message;

    @Column({ type: "varchar", length: 5 })
    locale: string;

    @Column({ type: "bigint", nullable: false })
    message_id: number;

    @Column({default: () => "now()", nullable: false})
    event_time: Date;

    @Index()
    @Column({default: () => "now()", nullable: true})
    scheduled: Date;

    @Column({ type: "text", nullable: false})
    data: string;
}