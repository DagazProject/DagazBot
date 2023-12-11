import { Column, Entity, Index, JoinColumn, ManyToOne,  PrimaryGeneratedColumn } from "typeorm";
import { job } from "./job";
import { server } from "./server";

@Entity()
export class job_data {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    job_id: number;
    @ManyToOne(type => job)
    @JoinColumn({ name: "job_id" })
    job: job;

    @Index()
    @Column({ nullable: false })
    server_id: number;
    @ManyToOne(type => server)
    @JoinColumn({ name: "server_id" })
    server: server;

    @Column({ nullable: false, type: "integer" })
    result_code: number;

    @Column({ nullable: true, type: "json" })
    data: string;

    @Column({default: () => "now()", nullable: false})
    created: Date;
}