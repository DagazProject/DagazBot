import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { param_type } from "./param_type";
import { command_queue } from "./command_queue";

@Entity()
export class command_param {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    command_id: number;
    @ManyToOne(type => command_queue)
    @JoinColumn({ name: "command_id" })
    command: command_queue;

    @Index()
    @Column({ nullable: false })
    paramtype_id: number;
    @ManyToOne(type => param_type)
    @JoinColumn({ name: "paramtype_id" })
    paramtype: param_type;

    @Column({ nullable: false,  type: "text" })
    value: string;
}