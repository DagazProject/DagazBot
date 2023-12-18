import { Entity, Column, Unique, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class node_image {
    @PrimaryGeneratedColumn()
    id: number;

    @Unique(["name"])
    @Column({ nullable: false, type: "varchar", length: 1000 })    
    filename: string;
}