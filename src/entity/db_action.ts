import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { db_result } from "./db_result";

@Entity()
export class db_action {
    @PrimaryColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    result_id: number;
    @ManyToOne(type => db_result)
    @JoinColumn({ name: "result_id" })
    result: db_result;

    @Column({ nullable: false, type: "varchar", length: 30 })
    result_value: string;

    @Column({ nullable: false, type: "integer" })
    order_num: number;
}