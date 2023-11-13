import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class server_type {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: false, type: "varchar", length: 100 })
    name: string;
}