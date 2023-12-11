import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { request } from "./request";
import { dbproc } from "./dbproc";

@Entity()
export class job {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;
    
    @Index()
    @Column({ nullable: false })
    request_id: number;
    @ManyToOne(type => request)
    @JoinColumn({ name: "request_id" })
    request: request;

    @Index()
    @Column({ nullable: false })
    proc_id: number;
    @ManyToOne(type => dbproc)
    @JoinColumn({ name: "proc_id" })
    proc: dbproc;
}