import { Entity, Column, PrimaryColumn, Unique } from "typeorm";

@Entity()
export class node_type {
    @PrimaryColumn()
    id: number;

    @Unique(["name"])
    @Column({ nullable: false, type: "varchar", length: 100 })    
    name: string;
}