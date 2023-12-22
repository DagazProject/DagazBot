import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { action } from "./action";
import { common_context } from "./common_context";

@Entity()
export class command_queue {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    context_id: number;
    @ManyToOne(type => common_context)
    @JoinColumn({ name: "context_id" })
    context: common_context;

    @Index()
    @Column({ nullable: false })
    action_id: number;
    @ManyToOne(type => action)
    @JoinColumn({ name: "action_id" })
    action: action;

    @Column({ nullable: true, type: "text" })
    data: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}