import { Entity, Column, PrimaryColumn, Unique } from "typeorm";

@Entity()
export class param_type {
    @PrimaryColumn()
    id: number;

    @Unique(["name"])
    @Column({ nullable: false, type: "varchar", length: 100 })    
    name: string;

    @Column({ nullable: false, default: false })
    is_hidden: boolean;
}