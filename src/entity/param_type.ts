import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class param_type {
    @PrimaryColumn()
    id: number;

    @Column({ nullable: false, type: "varchar", length: 100 })    
    name: string;

    @Column({ nullable: false, default: false })
    is_hidden: boolean;
}